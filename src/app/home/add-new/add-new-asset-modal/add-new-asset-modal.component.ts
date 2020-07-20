import { Component, OnInit, Input, ViewChild } from "@angular/core";
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
import { MarketDataService } from '../../assets/market-data.service';
import { SearchPopoverComponent } from './search-popover/search-popover.component';
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

  maxMaturityDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + 10)
  ).toISOString();

  // The following two are only for the html file
  ASSET_TYPES = Object.keys(AssetType);
  AssetType = AssetType; // this is used specifically for angular html component

  isNameFocus: boolean = false;

  constructor(private modalCtrl: ModalController, public marketDataService: MarketDataService) {
  }

  ngOnInit() {    
  }

  onSubmit() {    
    if (this.form.invalid) {
      return;
    }
    if (this.form.pristine) {
      this.modalCtrl.dismiss(null, "cancel");
      return;
    }
    let assetType: AssetType = this.form.value["asset-type"];
    let asset: Asset;
    let percentUnAlloc: number = this.asset ? this.asset.percentUnallocated : 1;
    let assetId: string = this.asset ? this.asset.id : Math.random().toString();

    if ((assetType as AssetType) === (AssetType.SavingsAccount as AssetType)) {
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
        new SavingsAccount(
          this.form.value["name"],
          +this.form.value["amount"],
          accountDetails,
          new Date(),
          interestRate
        ),
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
      asset = new Asset(
        assetId,
        new MutualFunds(
          this.form.value["name"],
          +this.form.value["units"],
          +this.form.value["price"],
          currentVal,
          folioNo
        ),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Equity) {
      let currentVal;
      let isin;
      if (this.form.value["isin"]) {
        isin = this.form.value["isin"];
      }
      if (this.form.value["current-value"]) {
        currentVal = +this.form.value["current-value"];
      }
      asset = new Asset(
        assetId,
        new Equity(
          this.form.value["name"],
          +this.form.value["units"],
          +this.form.value["price"],
          currentVal,
          isin
        ),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Cash) {
      asset = new Asset(
        assetId,
        new Cash(this.form.value["name"], +this.form.value["amount"]),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.PPF) {
      let date;
      if (this.form.value["date"]) {
        date = new Date(this.form.value["date"]);
      }
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new PPF(this.form.value["name"], date, +this.form.value['price'], +this.form.value['currentValue'],
        lastEvaluationDate),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Gold) {
      let date;
      if (this.form.value["date"]) {
        date = new Date(this.form.value["date"]);
      }
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new Gold(this.form.value["name"], date, +this.form.value['price'], +this.form.value['currentValue'],
        lastEvaluationDate),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.RealEstate) {
      let date;
      if (this.form.value["date"]) {
        date = new Date(this.form.value["date"]);
      }
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new RealEstate(this.form.value["name"], date, +this.form.value['price'], +this.form.value['currentValue'],
        lastEvaluationDate),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.EPF) {
      let date;
      if (this.form.value["date"]) {
        date = new Date(this.form.value["date"]);
      }
      let lastEvaluationDate;
      if (this.form.value["lastEvaluationDate"]) {
        lastEvaluationDate = new Date(this.form.value["lastEvaluationDate"]);
      }
      asset = new Asset(
        assetId,
        new EPF(this.form.value["name"], date, +this.form.value['price'], +this.form.value['currentValue'],
        lastEvaluationDate),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Others) {
      asset = new Asset(
        assetId,
        new Others(this.form.value["name"], +this.form.value["amount"]),
        percentUnAlloc
      );
    }
    this.modalCtrl.dismiss(
      {
        asset: asset,
      },
      "confirm"
    );
  }

  onSearchClick(event, assetType) {
    this.modalCtrl.create({component:SearchPopoverComponent, componentProps: {assetType: assetType}})
      .then(popover => {
        popover.present();
        return popover.onDidDismiss();
      }).then(response => {
        if (response.role !== "confirm") {
          return;
        }
        if (response.data) {
          if (this.asset) {
            if (assetType === AssetType.Equity) {
              this.asset.equity.stockName = response.data.name;
              this.asset.equity.currentValue = response.data.price;
              this.asset.equity.isin = response.data.isin;
            } else if (assetType === AssetType.MutualFunds) {
              this.asset.mutualFunds.fundName = response.data.name;
              this.asset.mutualFunds.currentValue = response.data.price;
            }
          } else {
            if (assetType === AssetType.Equity) {
              let tempEquity = new Equity(response.data.name, undefined, undefined, response.data.price, response.data.isin)
              this.asset = new Asset(Math.random().toString(), tempEquity ,1);
            } else if (assetType === AssetType.MutualFunds) {
              let tempMF = new MutualFunds(response.data.name, undefined, undefined, response.data.price, undefined);
              this.asset = new Asset(Math.random().toString(), tempMF ,1);
            }
            
          }
        }
      })
  }

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }

}
