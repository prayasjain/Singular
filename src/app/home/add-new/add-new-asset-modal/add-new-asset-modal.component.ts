import { Component, OnInit, Input, ViewChild } from "@angular/core";
import {
  AssetType,
  Asset,
  SavingsAccount,
  Deposits,
  MutualFunds,
  Equity,
  Cash,
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
    let assetType: AssetType = this.form.value["asset-type"];
    let asset: Asset;
    if (assetType as AssetType === AssetType.SavingsAccount as AssetType) {
      let interestRate;
      if (this.form.value["interest-rate"]) {
        interestRate = this.form.value["interest-rate"]/100;
      }
      asset = new Asset(
        Math.random().toString(),
        new SavingsAccount(
          this.form.value["name"],
          this.form.value["account-details"],
          +this.form.value["amount"],
          interestRate
        ),
        1
      );
    }
    if (assetType === AssetType.Deposits) {
      let interestRate;
      if (this.form.value["interest-rate"]) {
        interestRate = this.form.value["interest-rate"]/100;
      }
      asset = new Asset(
        Math.random().toString(),
        new Deposits(
          this.form.value["name"],
          this.form.value["account-details"],
          +this.form.value["amount"],
          new Date(this.form.value["deposit-date"]),
          new Date(this.form.value["maturity-date"]),
          interestRate
        ),
        1
      );
    }
    if (assetType === AssetType.MutualFunds) {
      let currentVal;
      if (this.form.value["current-value"]) {
        currentVal = +this.form.value["current-value"];
      }
      asset = new Asset(
        Math.random().toString(),
        new MutualFunds(
          this.form.value["name"],
          +this.form.value["units"],
          +this.form.value["price"],
          currentVal
        ),
        1
      );
    }
    if (assetType === AssetType.Equity) {
      let currentVal;
      if (this.form.value["current-value"]) {
        currentVal = +this.form.value["current-value"];
      }
      asset = new Asset(
        Math.random().toString(),
        new Equity(
          this.form.value["name"],
          +this.form.value["units"],
          +this.form.value["price"],
          currentVal
        ),
        1
      );
    }
    if (assetType === AssetType.Cash) {
      asset = new Asset(
        Math.random().toString(),
        new Cash(this.form.value["name"], +this.form.value["amount"]),
        1
      );
    }
    this.modalCtrl.dismiss(
      {
        asset: asset
      },
      "confirm"
    );
  }

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }
}
