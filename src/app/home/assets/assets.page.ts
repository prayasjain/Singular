import { Component, OnInit, OnDestroy } from "@angular/core";
import { AssetsService } from "./assets.service";
import { Asset, AssetType, AssetTypeUtils } from "./asset.model";
import { Subscription, zip, of } from "rxjs";
import { take, tap, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from '../currency/currency.service';

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
    private loadingCtrl: LoadingController,
    public currencyService: CurrencyService
  ) { }

  OTHERS = AssetType.Others;

  colorNo = 0;

  ngOnInit() {
    this.currentDate = new Date();
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
          this.assetGroups = [];

          this.totalAmount = 0;
          let observableList = this.userAssets.map((userAsset) =>
            userAsset.getAmountForAsset(this.currentDate).pipe(
              take(1),
              tap((assetValue) => {
                this.totalAmountByAssetType.set(
                  userAsset.assetType,
                  (this.totalAmountByAssetType.get(userAsset.assetType) || 0) +
                  assetValue
                );
              })
            )
          );
          if (observableList.length === 0) {
            return of([]);
          }
          return zip(...observableList);
        })
      )
      .subscribe(() => {
        this.getAmountByGroup();
        this.assetGroups.forEach((assetGroup) => {
          this.totalAmount += assetGroup.amount;
        });
      });
  }

  // ionViewWillEnter() {
  //   this.loadingCtrl
  //     .create({ message: "Fetching Your Assets..." })
  //     .then((loadingEl) => {
  //       loadingEl.present();
  //       this.assetsService.fetchUserAssets().subscribe((data) => {
  //         loadingEl.dismiss();
  //       }, (error) => {
  //         console.log(error);
  //         loadingEl.dismiss();
  //       });
  //     });
  // }

  getAmountByGroup() {
    this.totalAmountByAssetType.forEach((amount, assetType) => {
      let assetGroup: AssetGroup = {
        assetType: assetType,
        amount: amount
      };
      this.assetGroups.push(assetGroup);
    });
    this.assetGroups.sort();
  }

  getSlug(assetType: AssetType) {
    return AssetTypeUtils.slug(assetType);
  }

  color(chars: string) {

    if (chars === AssetType.SavingsAccount) {
      return "tertiary";
    }
    if (chars === AssetType.Deposits) {
      return "tertiary";
    }
    if (chars === AssetType.MutualFunds) {
      return "primary";
    }
    if (chars === AssetType.Equity) {
      return "secondary";
    }
    if (chars === AssetType.Cash) {
      return "secondary";
    }
    if (chars === AssetType.Others) {
      return "primary";
    }
    return "primary";
  }

  ngOnDestroy() {
    if (this.assetsSub) {
      this.assetsSub.unsubscribe();
    }
  }
}
