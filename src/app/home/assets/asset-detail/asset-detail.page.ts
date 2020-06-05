import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AssetType, Asset, AssetTypeUtils } from "../asset.model";
import { AssetsService } from "../assets.service";
import { Subscription, zip } from "rxjs";
import { switchMap, take, tap } from "rxjs/operators";

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
  assetValueMap = new Map();

  constructor(
    private activatedRoute: ActivatedRoute,
    private assetsService: AssetsService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      let assetSlug = paramMap.get("assetSlug");
      this.assetType = AssetTypeUtils.getItemFromSlug(assetSlug);
      console.log(this.assetType);
      this.currentDate = new Date();
      if (this.assetType) {
        this.userAssetsForTypeSub = this.assetsService
          .getUserAssetsForAssetType(this.assetType)
          .pipe(
            switchMap((userAssets) => {
              this.userAssetsForType = userAssets;
              this.totalAmountForType = 0;
              this.assetValueMap.clear();
              return zip(
                ...userAssets.map((userAsset) =>
                  userAsset.getAmountForAsset(this.currentDate).pipe(
                    take(1),
                    tap((assetValue) => {
                      this.assetValueMap.set(userAsset.id, assetValue);
                      this.totalAmountForType += assetValue;
                    })
                  )
                )
              );
            })
          )
          .subscribe(() => {});
      }
    });
  }

  ngOnDestroy() {
    if (this.userAssetsForTypeSub) {
      this.userAssetsForTypeSub.unsubscribe();
    }
  }
}
