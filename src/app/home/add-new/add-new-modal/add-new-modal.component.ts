import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { AssetTypeLayout, AssetType } from "../../assets/asset.model";
import { NgForm } from "@angular/forms";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-add-new-modal",
  templateUrl: "./add-new-modal.component.html",
  styleUrls: ["./add-new-modal.component.scss"],
})
export class AddNewModalComponent implements OnInit {
  @Input() assetType: AssetTypeLayout;
  @Input() isAsset: boolean = false;
  @Input() isGoal: boolean = false;
  @Input() isCashflow: boolean = false;
  @ViewChild("f", { static: true }) form: NgForm;
  title: string = "Item";

  ASSET_TYPES = Object.keys(AssetType);
  AssetType = AssetType; // this is used specifically for angular html component

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (this.isAsset) {
      this.title = "Asset";
    }
    if (this.isGoal) {
      this.title = "Goal";
    }
    if (this.isCashflow) {
      this.title = "Cashflow";
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    this.modalCtrl.dismiss(
      {
        name: this.form.value["name"],
        assetType: this.form.value["asset-type"],
        accountDetails: this.form.value["account-details"],
        amount: this.form.value["amount"],
      },
      "confirm"
    );
  }

  onClose() {
    this.modalCtrl.dismiss(null, "cancel");
  }
}
