import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import {
  AssetType,
  Asset,
  SavingsAccount,
  Deposits,
  MutualFunds,
  Equity,
  Cash,
  Gold,
  RealEstate,
  EPF,
  PPF,
  Others,
} from "../../assets/asset.model";
import { NgForm } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { MarketDataService, PriceData, AutoCompleteData } from "../../assets/market-data.service";
import { SearchPopoverComponent } from "./search-popover/search-popover.component";
import { AssetsUtils } from '../../assets/assets-utils';
@Component({
  selector: "app-add-new-asset-modal",
  templateUrl: "./add-new-asset-modal.component.html",
  styleUrls: ["./add-new-asset-modal.component.scss"],
})
export class AddNewAssetModalComponent implements OnInit {
  @Input() assetType: AssetType;
  @Input() asset: Asset;
  @Input() assetValue: number;
  @ViewChild("f", { static: true }) form: NgForm;

  maxMaturityDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString();

  // The following two are only for the html file
  ASSET_TYPES = Object.keys(AssetType);
  AssetType = AssetType; // this is used specifically for angular html component

  isNameFocus: boolean = false;

  @ViewChild("camsFilePicker", { static: false }) camsFilePicker: ElementRef;
  @ViewChild("nsdlFilePicker", { static: false }) nsdlFilepicker: ElementRef;

  constructor(private modalCtrl: ModalController, public marketDataService: MarketDataService, private assetsUtils: AssetsUtils) {}

  ngOnInit() {}

  async onSubmit() {
    if (this.form.invalid) {
      return;
    }
    if (this.form.pristine) {
      this.modalCtrl.dismiss(null, "cancel");
      return;
    }
    let assetType: AssetType = this.assetType//this.form.value["asset-type"];
    let asset: Asset;
    let percentUnAlloc: number = this.asset ? this.asset.percentUnallocated : 1;
    let assetId: string = this.asset ? this.asset.id : Math.random().toString();

    if (assetType === AssetType.SavingsAccount) {
      let interestRate;
      if (this.form.value["interest-rate"]) {
        interestRate = this.form.value["interest-rate"] / 100;
      }
      let accountDetails;
      if (this.form.value["account-details"]) {
        accountDetails = this.form.value["account-details"];
      }

      asset = new Asset(
        assetId,
        new SavingsAccount(this.form.value["name"], +this.form.value["amount"], accountDetails, new Date(), interestRate),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Deposits) {
      let interestRate;
      if (this.form.value["interest-rate"]) {
        interestRate = this.form.value["interest-rate"] / 100;
      }
      let maturityDate;
      if (this.form.value["maturity-date"]) {
        maturityDate = new Date(this.form.value["maturity-date"]);
      }
      let depositDate;
      if (this.form.value["deposit-date"]) {
        depositDate = new Date(this.form.value["deposit-date"]);
      }
      let accountDetails;
      if (this.form.value["account-details"]) {
        accountDetails = this.form.value["account-details"];
      }
      asset = new Asset(
        assetId,
        new Deposits(
          this.form.value["name"],
          +this.form.value["amount"],
          accountDetails,
          depositDate,
          maturityDate,
          interestRate
        ),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.MutualFunds) {
      let currentVal;
      if (this.form.value["current-value"]) {
        currentVal = +this.form.value["current-value"];
      }
      let folioNo;
      if (this.form.value["folio-no"]) {
        folioNo = this.form.value["folio-no"];
      }
      let mstarId;
      if (this.form.value["name"].length > 3) {
        let autoCompleteData : AutoCompleteData[] = await this.marketDataService.getData(this.form.value["name"].trim().toLowerCase(), assetType).toPromise();
        if (autoCompleteData.length === 1) {
          mstarId = autoCompleteData[0].mutualfund.mstarId;
        }
      }
      asset = new Asset(
        assetId,
        new MutualFunds(this.form.value["name"], +this.form.value["units"], +this.form.value["price"], currentVal, folioNo, mstarId),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Equity) {
      let currentVal;
      let isin;
      if (this.form.value["isin"]) {
        isin = this.form.value["isin"];
      } else if (this.form.value["name"].length > 3){
        let autoCompleteData : AutoCompleteData[] = await this.marketDataService.getData(this.form.value["name"].trim().toLowerCase(), assetType).toPromise();
        if (autoCompleteData.length === 1) {
          isin = autoCompleteData[0].equity.isin;
        }
      }
      if (this.form.value["current-value"]) {
        currentVal = +this.form.value["current-value"];
      }
      asset = new Asset(
        assetId,
        new Equity(this.form.value["name"], +this.form.value["units"], +this.form.value["price"], currentVal, isin),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Cash) {
      asset = new Asset(assetId, new Cash(this.form.value["name"], +this.form.value["amount"]), percentUnAlloc);
    }
    if (assetType === AssetType.PPF) {
      let date;
      let currentVal;
      if (this.form.value["currentValue"]) {
        currentVal = +this.form.value["currentValue"];
      }
      if (this.form.value["date"]) {
        date = new Date(this.form.value["date"]);
      }
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new PPF(this.form.value["name"], date, +this.form.value["price"], currentVal, lastEvaluationDate),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Gold) {
      let date;
      let currentVal;
      if (this.form.value["currentValue"]) {
        currentVal = +this.form.value["currentValue"];
      }
      if (this.form.value["date"]) {
        date = new Date(this.form.value["date"]);
      }
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new Gold(
          this.form.value["name"],
          date,
          +this.form.value["price"],
          currentVal,
          lastEvaluationDate,
          this.form.value["units"]
        ),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.RealEstate) {
      let date;
      let currentVal;
      if (this.form.value["currentValue"]) {
        currentVal = +this.form.value["currentValue"];
      }
      if (this.form.value["date"]) {
        date = new Date(this.form.value["date"]);
      }
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new RealEstate(this.form.value["name"], date, +this.form.value["price"], currentVal, lastEvaluationDate),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.EPF) {
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new EPF(this.form.value["name"], +this.form.value["price"], lastEvaluationDate, this.form.value["uanNumber"]),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Others) {
      asset = new Asset(assetId, new Others(this.form.value["name"], +this.form.value["amount"]), percentUnAlloc);
    }
    this.modalCtrl.dismiss(
      {
        asset: asset,
      },
      "confirm"
    );
  }

  onSearchClick(event, assetType) {
    this.modalCtrl
      .create({ component: SearchPopoverComponent, componentProps: { assetType: assetType } })
      .then((popover) => {
        popover.present();
        return popover.onDidDismiss();
      })
      .then((response) => {
        if (response.role !== "confirm") {
          return;
        }
        if (!response.data) {
          return;
        }
        let priceSearchKey = this.getPriceSearchKey(this.assetType, response.data);
        let currentValue: number;
        this.marketDataService.getPrice([priceSearchKey], this.assetType).toPromise().then((priceData: PriceData[]) => {
          if (priceData && priceData.length === 1) {
            currentValue = priceData[0].nav;
          }
          if (this.asset) {
            if (this.assetType === AssetType.Equity) {
              this.asset.equity.stockName = response.data.name;
              this.asset.equity.isin = response.data.equity.isin;
              this.asset.equity.isin = response.data.isin;
              this.asset.equity.currentValue = currentValue;
            } else if (assetType === AssetType.MutualFunds) {
              this.asset.mutualFunds.fundName = response.data.name;
              this.asset.mutualFunds.currentValue = currentValue;
            }
          } else {
            if (this.assetType === AssetType.Equity) {
              let tempEquity = new Equity(response.data.name, undefined, undefined, currentValue, response.data.equity.isin);
              this.asset = new Asset(Math.random().toString(), tempEquity, 1);
            } else if (assetType === AssetType.MutualFunds) {
              let tempMF = new MutualFunds(response.data.name, undefined, undefined, currentValue, undefined, response.data.mutualfund.mstarId);
              this.asset = new Asset(Math.random().toString(), tempMF, 1);
            }
          }
        })
      });
  }

  getPriceSearchKey(assetType, data) : string {
    if (assetType == AssetType.Equity) {
      return data.equity.isin;
    }
    if (assetType == AssetType.MutualFunds) {
      return data.mutualfund.mstarId;
    }
  }

  getAutoUploadText(assetType: AssetType) {
    if (assetType === AssetType.SavingsAccount) {
      return "Read my SMS"
    }
    if (assetType === AssetType.Equity) {
      return "Upload NSDL Statement"
    }
    if (assetType === AssetType.MutualFunds) {
      return "Upload CAS/CAMS Statement"
    }
  }

  autoUploadAsset(assetType: AssetType) {
    if (assetType === AssetType.SavingsAccount) {
      this.assetsUtils.readAccountFromSMS();
    }
  }

  onCAMSPicked(event: Event) {
    this.assetsUtils.onCAMSPicked(event, this.camsFilePicker);
  }

  onNSDLPicked(event: Event) {
    this.assetsUtils.onNSDLPicked(event, this.nsdlFilepicker);
  }

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }
}
