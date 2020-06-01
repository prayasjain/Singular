import { Component, OnInit, OnDestroy } from "@angular/core";
import { AssetsService } from "./assets.service";
import { Asset, AssetType, AssetTypeUtils } from "./asset.model";
import { Subscription } from "rxjs";

interface AssetGroup {
  assetType: AssetType;
  amount: number;
}

@Component({
  selector: "app-assets",
  templateUrl: "./assets.page.html",
  styleUrls: ["./assets.page.scss"],
})
export class AssetsPage implements OnInit, OnDestroy {
  userAssets: Asset[] = [];
  assetsSub: Subscription;
  assetGroups: AssetGroup[] = [];
  totalAmount: number;
  currentDate: Date;

  constructor(private assetsService: AssetsService) {}

  ngOnInit() {
    this.assetsSub = this.assetsService.userAssets.subscribe((userAssets) => {
      this.userAssets = userAssets;
      this.getAmountByGroup();
      this.totalAmount = 0;
      this.assetGroups.forEach(assetGroup => {
        this.totalAmount += assetGroup.amount;
      });
      this.currentDate = new Date();
    });
  }

  getAmountByGroup() {
    let totalAmountByAssetType = new Map();
    this.userAssets.forEach((userAsset) => {
      totalAmountByAssetType.set(
        userAsset.assetType,
        (totalAmountByAssetType.get(userAsset.assetType) || 0) + userAsset.amountForAsset);
    });
    this.assetGroups = [];
    totalAmountByAssetType.forEach((amount, assetType) => {
      let assetGroup: AssetGroup = {
        assetType: assetType,
        amount: amount
      };
      this.assetGroups.push(assetGroup);
    });
  }

  getSlug(assetType: AssetType) {
    return AssetTypeUtils.slug(assetType);
  }

  ngOnDestroy() {
    if (this.assetsSub) {
      this.assetsSub.unsubscribe();
    }
  }
}
