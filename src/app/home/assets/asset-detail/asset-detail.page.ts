import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AssetType, Asset, AssetTypeUtils } from "../asset.model";
import { AssetsService } from "../assets.service";
import { Subscription, zip } from "rxjs";
import { switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from "../../currency/currency.service";
import { StateService, AddType } from "../../state.service";

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

  chartOptions = {
    responsive: true,
    scales: {
      xAxes: [
        {
          gridLines: {
            display: true,
          },
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };

  chartData = [
    { data: [330, 600, 260, 700], label: "Account A" },
    { data: [120, 455, 100, 340], label: "Account B" },
    { data: [45, 67, 800, 500], label: "Account C" },
  ];
  chartLabels = ["January", "February", "Mars", "April"];
  newDataPoint(dataArr = [100, 100, 100], label) {
    this.chartData.forEach((dataset, index) => {
      this.chartData[index] = Object.assign({}, this.chartData[index], {
        data: [...this.chartData[index].data, dataArr[index]],
      });
    });
    this.chartLabels = [...this.chartLabels, label];
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private assetsService: AssetsService,
    private authService: AuthService,
    public currencyService: CurrencyService,
    private loadingCtrl: LoadingController,
    private stateService: StateService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      let assetSlug = paramMap.get("assetSlug");
      this.assetType = AssetTypeUtils.getItemFromSlug(assetSlug);
      this.stateService.updateAssetType(this.assetType);
      this.currentDate = new Date();
      if (this.assetType) {
        this.userAssetsForTypeSub = this.authService.authInfo
          .pipe(
            take(1),
            switchMap((user) => {
              this.user = user;
              return this.assetsService.getUserAssetsForAssetType(this.assetType);
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
                      this.totalAmountForType += Number(assetValue);
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

  ionViewWillEnter() {
    this.stateService.updateAddType(AddType.Asset);
  }

  ngOnDestroy() {
    if (this.userAssetsForTypeSub) {
      this.userAssetsForTypeSub.unsubscribe();
    }
  }
}
