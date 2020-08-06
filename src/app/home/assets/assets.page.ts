import { Component, OnInit, OnDestroy } from "@angular/core";
import { AssetsService } from "./assets.service";
import { Asset, AssetType, AssetTypeUtils } from "./asset.model";
import { Subscription, zip, of } from "rxjs";
import { take, tap, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from "../currency/currency.service";
import { MarketDataService, PriceData } from "./market-data.service";

interface AssetGroup {
  assetType: AssetType;
  amount: number;
  // id included to identify eash list item seprately
  id: number;
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
  //  aid is added to provide a specific id to track each list item individualy and pass this data further for more control on any list item
  aid = 0;
  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    public currencyService: CurrencyService,
    private marketDataService: MarketDataService
  ) { }

  OTHERS = AssetType.Others;

  colorNo = 0;

  // this is a timed operation. whenever we fetch prices we wait for 60 mins to update it again.
  // fetchPriceData: boolean = true;

  ngOnInit() {
    this.currentDate = new Date();
    this.assetsSub = this.authService.authInfo
      .pipe(
        take(1),
        switchMap((user) => {
          this.user = user;
          return this.assetsService.userAssets;
        }),
        // todo move this to firebase
        switchMap((userAssets) => {
          this.userAssets = userAssets;
          // if (this.fetchPriceData) {
          // todo also do mutual funds
          let priceIdentifiers: string[] = [];
          userAssets.forEach((asset) => {
            if (asset.assetType === AssetType.Equity && asset.equity.isin) {
              priceIdentifiers.push(asset.equity.isin);
            }
          });
          // if (priceIdentifiers.length > 0) {
          //   this.fetchPriceData = false;
          //   setTimeout(() => {
          //     this.fetchPriceData = true;
          //   }, 86400000 / 60);
          // }

          return this.marketDataService.getPrice(priceIdentifiers);
          // } else {
          //   return of([]);
          // }
        }),
        switchMap((prices) => {
          let priceMap = new Map();
          prices.forEach((p) => priceMap.set(p.identifier, p));
          this.userAssets.forEach((asset) => {
            if (asset.assetType === AssetType.Equity && asset.equity.isin && priceMap.has(asset.equity.isin)) {
              asset.equity.currentValue = +priceMap.get(asset.equity.isin).price;
            }
          });
          this.totalAmountByAssetType.clear();
          this.assetGroups = [];

          this.totalAmount = 0;
          let observableList = this.userAssets.map((userAsset) =>
            userAsset.getAmountForAsset(this.currentDate).pipe(
              take(1),
              tap((assetValue) => {
                this.totalAmountByAssetType.set(
                  userAsset.assetType,
                  (this.totalAmountByAssetType.get(userAsset.assetType) || 0) + Number(assetValue)
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
          this.totalAmount += Number(assetGroup.amount);
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
        amount: amount,
        // id is defined as aid
        id: this.aid
      };
      this.assetGroups.push(assetGroup);
      // increments the aid by 1
      ++this.aid;
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
      // reset the aid
      this.aid = 0;
      this.assetsSub.unsubscribe();
    }
  }
}
