import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AssetType, Asset, AssetTypeUtils } from "../asset.model";
import { AssetsService } from "../assets.service";
import { Subscription } from 'rxjs';

@Component({
  selector: "app-asset-detail",
  templateUrl: "./asset-detail.page.html",
  styleUrls: ["./asset-detail.page.scss"],
})
export class AssetDetailPage implements OnInit, OnDestroy {
  assetType: AssetType;
  userAssetsForTypeSub: Subscription;
  userAssetsForType: Asset[];
  totalAmountForType: number;
  currentDate: Date;

  constructor(
    private activatedRoute: ActivatedRoute,
    private assetsService: AssetsService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      let assetSlug = paramMap.get("assetSlug");
      this.assetType = AssetTypeUtils.getItemFromSlug(assetSlug);
      console.log("here");
      console.log(this.assetType);
      if (this.assetType) {
        this.userAssetsForTypeSub = this.assetsService
          .getUserAssetsForAssetType(this.assetType)
          .subscribe((userassetsForType) => {
            this.userAssetsForType = userassetsForType;
            this.totalAmountForType = 0;
            this.userAssetsForType.forEach(userAsset => {
              this.totalAmountForType += userAsset.amountForAsset;
            });
            this.currentDate = new Date();
          });
      }
    });
  }

  

  ngOnDestroy() {
    if (this.userAssetsForTypeSub) {
      this.userAssetsForTypeSub.unsubscribe();
    }
  }
}
