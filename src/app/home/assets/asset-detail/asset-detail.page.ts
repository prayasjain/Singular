import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AssetType, Asset, AssetTypeUtils } from "../asset.model";
import { AssetsService } from "../assets.service";
import { Subscription, zip } from "rxjs";
import { switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from '../../currency/currency.service';

@Component({
  selector: "app-asset-detail",
  templateUrl: "./asset-detail.page.html",
  styleUrls: ["./asset-detail.page.scss"],
})
export class AssetDetailPage implements OnInit, OnDestroy {
  user: firebase.User;
  assetType: AssetType;
  userAssetsForTypeSub: Subscription;
  userAssetsForType: Asset[];
  totalAmountForType: number;
  currentDate: Date;
  assetValueMap = new Map();

  constructor(
    private activatedRoute: ActivatedRoute,
    private assetsService: AssetsService,
    private authService: AuthService,
    public currencyService: CurrencyService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      let assetSlug = paramMap.get("assetSlug");
    
      this.assetType = AssetTypeUtils.getItemFromSlug(assetSlug);      
  
      this.currentDate = new Date();
      if (this.assetType) {
        this.userAssetsForTypeSub = this.authService.authInfo
          .pipe(
            take(1),
            switchMap((user) => {
              this.user = user;
              return this.assetsService.getUserAssetsForAssetType(
                this.assetType
              );
            }),
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
          .subscribe();
      }
    });
  }

  // ionViewWillEnter() {
  //   this.loadingCtrl
  //     .create({ message: "Fetching Your Assets..." })
  //     .then((loadingEl) => {
  //       loadingEl.present();
  //       this.assetsService.fetchUserAssets().subscribe((data) => {
  //         loadingEl.dismiss();
  //       });
  //     });
  // }

  ngOnDestroy() {
    if (this.userAssetsForTypeSub) {
      this.userAssetsForTypeSub.unsubscribe();
    }
  }
}
