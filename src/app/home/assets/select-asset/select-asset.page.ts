import { Component, OnInit, ViewChild } from "@angular/core";
import { AssetType, AssetTypeUtils } from "../asset.model";
import { Constants } from "src/app/config/constants";
import { AddType } from '../../state.service';
import { AddNewComponent } from '../../add-new/add-new.component';

@Component({
  selector: "app-select-asset",
  templateUrl: "./select-asset.page.html",
  styleUrls: ["./select-asset.page.scss"],
})
export class SelectAssetPage implements OnInit {
  assetTypes = AssetType;
  assetTypeUtils = AssetTypeUtils;
  assetTypeKeys = Object.keys(AssetType);
  addType: AddType = AddType.Asset;
  selectedAssetType: AssetType = AssetType.Others;
  constants = Constants;
  @ViewChild(AddNewComponent, { static: true }) addNewBtn: AddNewComponent;

  constructor() {}

  ngOnInit() {}
  addAsset(assetType: AssetType) {
    this.selectedAssetType = assetType;
    this.addNewBtn.clickItem();
    
  }
}
