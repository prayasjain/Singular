import { Component, OnInit, Input, ViewChild } from "@angular/core";
import {
  AssetType,
  Asset,
  SavingsAccount,
  Deposits,
  MutualFunds,
  Equity,
  Cash,
  Others,
} from "../../assets/asset.model";
import { NgForm } from "@angular/forms";
import { ModalController } from "@ionic/angular";

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

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

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
      asset = new Asset(
        assetId,
        new MutualFunds(
          this.form.value["name"],
          +this.form.value["units"],
          +this.form.value["price"],
          currentVal
        ),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Equity) {
      let currentVal;
      if (this.form.value["current-value"]) {
        currentVal = +this.form.value["current-value"];
      }
      asset = new Asset(
        assetId,
        new Equity(
          this.form.value["name"],
          +this.form.value["units"],
          +this.form.value["price"],
          currentVal
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

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }

  get accountNumber() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.SavingsAccount) {
      return this.asset.savingsAccount.accountNumber;
    }

    if (this.asset.assetType === AssetType.Deposits) {
      return this.asset.deposits.depositNumber;
    }
  }

  get interestRate() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.SavingsAccount) {
      return this.asset.savingsAccount.interestRate;
    }

    if (this.asset.assetType === AssetType.Deposits) {
      return this.asset.deposits.interestRate;
    }
  }

  get maturityDate() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Deposits) {
      return this.asset.deposits.maturityDate.toISOString();
    }
  }

  get depositDate() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Deposits) {
      return this.asset.deposits.depositDate.toISOString();
    }
  }

  get units() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Equity) {
      return this.asset.equity.units;
    }
    if (this.asset.assetType === AssetType.MutualFunds) {
      return this.asset.mutualFunds.units;
    }
  }

  get price() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Equity) {
      return this.asset.equity.price;
    }
    if (this.asset.assetType === AssetType.MutualFunds) {
      return this.asset.mutualFunds.price;
    }
  }

  get currentValue() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Equity) {
      return this.asset.equity.currentValue;
    }
    if (this.asset.assetType === AssetType.MutualFunds) {
      return this.asset.mutualFunds.currentValue;
    }
  }
}
