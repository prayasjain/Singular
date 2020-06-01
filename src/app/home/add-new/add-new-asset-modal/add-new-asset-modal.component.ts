import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AssetType } from '../../assets/asset.model';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-add-new-asset-modal',
  templateUrl: './add-new-asset-modal.component.html',
  styleUrls: ['./add-new-asset-modal.component.scss'],
})
export class AddNewAssetModalComponent implements OnInit {
  @Input() assetType: AssetType;
  @ViewChild("f", { static: true }) form: NgForm;

  // The following two are only for the html file
  ASSET_TYPES = Object.keys(AssetType);
  AssetType = AssetType; // this is used specifically for angular html component

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
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
