import { Component, OnInit } from '@angular/core';
import { Asset, AssetType } from 'src/app/home/assets/asset.model';
import { Subscription, zip, of } from 'rxjs';
import { AssetsService } from 'src/app/home/assets/assets.service';
import { AuthService } from 'src/app/auth/auth.service';
import { take, tap, switchMap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { groupBy } from 'lodash';
import { Constants } from 'src/app/config/constants';
import * as moment from 'moment';


interface AssetGroup {
  assetType: AssetType;
  amount: number;
}

@Component({
  selector: 'app-export-assets',
  templateUrl: './export-assets.component.html',
  styleUrls: ['./export-assets.component.scss'],
})
export class ExportAssetsComponent implements OnInit {
  user: firebase.User;
  userAssets: Asset[] = [];
  assetsSub: Subscription;
  assetGroups: AssetGroup[] = [];
  totalAmount: number;
  currentDate: Date;
  totalAmountByAssetType = new Map();

  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
  ) { }

  ngOnInit() { }


  exportAssets() {
    this.currentDate = new Date();
    this.assetsSub = this.authService.authInfo
      .pipe(
        take(1),
        switchMap((user) => {
          this.user = user;
          return this.assetsService.userAssets;
        })
      )
      .subscribe((userAssets) => {
        userAssets.map((data) => {
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units && ((data.assetType === 'Equity') || 
          (data.assetType === 'Mutual Funds') || (data.assetType === 'Gold'))) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Profit/Loss'] =
            (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units
              *  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price).toFixed(2);
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date = moment(
              data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date).format('MM-DD-YYYY');
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositDate) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositDate = moment(
              data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositDate).format('MM-DD-YYYY');
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].maturityDate) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].maturityDate = moment(
              data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].maturityDate).format('MM-DD-YYYY');
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].lastEvaluationDate) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].lastEvaluationDate = moment(
              data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].lastEvaluationDate).format('MM-DD-YYYY');
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].currentValue) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Current Value'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].currentValue;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].currentValue;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].folioNo) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Folio Number'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].folioNo;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].folioNo;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].fundName) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Mutual Fund Name'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].fundName;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].fundName;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units && (data.assetType === 'Gold')) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Total Qty(gms)'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units && (data.assetType === 'Equity')) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Quantity'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].units;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Price'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].accountNumber) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Account Number/Details'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].accountNumber;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].accountNumber;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].amount) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Amount'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].amount;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].amount;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].interestRate) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Interest Rate (p. a)'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].interestRate;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].interestRate;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositDate) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Deposit Date'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositDate;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositDate;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Date'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date &&  ((data.assetType === 'Gold')
           || (data.assetType === 'Real Estate'))) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Buy Date'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].date;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositNumber) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Account Number/Details'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositNumber;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].depositNumber;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].maturityDate) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Maturity Date'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].maturityDate;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].maturityDate;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].lastEvaluationDate) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Last Evaluation Date'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].lastEvaluationDate;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].lastEvaluationDate;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].name) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Name'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].name;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].name;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].bankName) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Account Name'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].bankName;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].bankName;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price && (data.assetType === 'Gold')
            ) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Amount Invested'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price &&  (data.assetType === 'Real Estate')) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Buy Price'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].stockName) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Stock Name'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].stockName;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].stockName;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].isin) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['ISIN Number'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].isin;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].isin;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Buy Price'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price &&  (data.assetType === 'Real Estate')) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Buy Price'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
          }
          if (data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price &&  (data.assetType === 'Real Estate')) {
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]]['Buy Price'] =
            data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
            delete  data[Constants.EXCEL_SHEET_HEADERS[data.assetType]].price;
          }
        });
        this.userAssets = groupBy(userAssets, 'assetType');
        const sheetnames = Object.keys(this.userAssets);
        let blob;
        const wb = { SheetNames: sheetnames, Sheets: {} };
        for (const sheet of sheetnames) {
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.prepareTable(this.userAssets[sheet],
            Constants.EXCEL_SHEET_HEADERS[sheet]));
          wb.Sheets[sheet] = ws;
        }
        blob = new Blob([(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }))], {
          type: 'application/octet-stream'
        });

        saveAs(blob, 'test.xlsx');

      });
  }

  prepareTable(sheetdata, key) {
    return sheetdata.map(i => {
      return i[key];
    });

  }
}


