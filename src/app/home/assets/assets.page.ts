import { Component, OnInit, OnDestroy } from "@angular/core";
import { AssetsService } from "./assets.service";
import { Asset, AssetType, AssetTypeUtils } from "./asset.model";
import { Subscription, zip } from "rxjs";
import { take, tap, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";

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
  user: firebase.User;
  userAssets: Asset[] = [];
  assetsSub: Subscription;
  assetGroups: AssetGroup[] = [];
  totalAmount: number;
  currentDate: Date;
  totalAmountByAssetType = new Map();
  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.currentDate = new Date();
    this.loadingCtrl
      .create({ message: "Fetching Your Assets..." })
      .then((loadingEl) => {
        loadingEl.present();
        this.assetsSub = this.authService.authInfo
          .pipe(
            take(1),
            switchMap((user) => {
              this.user = user;
              return this.assetsService.userAssets;
            }),
            switchMap((userAssets) => {
              this.userAssets = userAssets;
              this.totalAmountByAssetType.clear();
              let observableList = this.userAssets.map((userAsset) =>
                userAsset.getAmountForAsset(this.currentDate).pipe(
                  take(1),
                  tap((assetValue) => {
                    this.totalAmountByAssetType.set(
                      userAsset.assetType,
                      (this.totalAmountByAssetType.get(userAsset.assetType) ||
                        0) + assetValue
                    );
                  })
                )
              );
              return zip(...observableList);
            })
          )
          .subscribe(() => {
            this.getAmountByGroup();
            this.totalAmount = 0;
            this.assetGroups.forEach((assetGroup) => {
              this.totalAmount += assetGroup.amount;
            });
            loadingEl.dismiss();
          }, (error) => {
            loadingEl.dismiss();
          });
      });
  }

  getAmountByGroup() {
    this.assetGroups = [];
    this.totalAmountByAssetType.forEach((amount, assetType) => {
      let assetGroup: AssetGroup = {
        assetType: assetType,
        amount: amount,
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
