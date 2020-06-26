import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AssetsService } from "../assets.service";
import { AssetType, Asset } from "../asset.model";
import { switchMap, take } from "rxjs/operators";
import { GoalsService } from "../../goals/goals.service";
import { ModalController, LoadingController } from "@ionic/angular";
import { AddNewAssetModalComponent } from "../../add-new/add-new-asset-modal/add-new-asset-modal.component";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-asset-item-page",
  templateUrl: "./asset-item-page.page.html",
  styleUrls: ["./asset-item-page.page.scss"],
})
export class AssetItemPagePage implements OnInit {
  user: firebase.User;
  asset: Asset;
  assetValue: number = 0;
  date: Date;

  // The following two are only for the html file
  AssetType = AssetType; // this is used specifically for angular html component

  constructor(
    private activatedRoute: ActivatedRoute,
    private assetsService: AssetsService,
    private router: Router,
    private goalsService: GoalsService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.date = new Date();
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      let itemId = paramMap.get("itemId");
      this.authService.authInfo
        .pipe(
          take(1),
          switchMap((user) => {
            this.user = user;
            return this.assetsService.userAssets;
          }),
          take(1),
          switchMap((assets) => {
            this.asset = assets.find((a) => a.id === itemId);
            if (this.asset) {
              return this.asset.getAmountForAsset(this.date);
            }
            this.router.navigateByUrl("/home/tabs/assets");
          }),
          take(1)
        )
        .subscribe((value) => {
          this.assetValue = value;
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
  //       });
  //     });
  // }

  onEditAsset() {
    this.loadingCtrl
      .create({ message: "Saving Your Data..." })
      .then((loadingEl) => {
        this.modalCtrl
          .create({
            component: AddNewAssetModalComponent,
            componentProps: {
              asset: this.asset,
              assetValue: this.assetValue,
              assetType: this.asset.assetType,
            },
          })
          .then((modalEl) => {
            modalEl.present();
            return modalEl.onDidDismiss();
          })
          .then((modalData) => {
            if (modalData.role === "confirm") {
              loadingEl.present();
              let newAsset = modalData.data.asset;
              return this.assetsService
                .updateUserAssets([newAsset])
                .toPromise();
            }
          })
          .then((updatedAssets) => {
            loadingEl.dismiss();
            this.router.navigateByUrl("/home/tabs/assets");
          });
      });
  }

  onDeleteAsset() {
    this.loadingCtrl
      .create({ message: "Deleting your Asset..." })
      .then((loadingEl) => {
        loadingEl.present();
        this.goalsService
          .deleteContributionsOfAsset(this.asset.id)
          .pipe(
            take(1),
            switchMap(() => {
              return this.assetsService.deleteAsset(this.asset.id);
            })
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.router.navigateByUrl("/home/tabs/assets");
          });
      });
  }

  //TODO Refactor, dates are changed
  get accountNumber() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.SavingsAccount) {
      return this.asset.savingsAccount.accountNumber;
    }

    if (this.asset.assetType === AssetType.Deposits) {
      return this.asset.deposits.depositNumber;
    }
  }

  get interestRate() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.SavingsAccount) {
      return this.asset.savingsAccount.interestRate;
    }

    if (this.asset.assetType === AssetType.Deposits) {
      return this.asset.deposits.interestRate;
    }
  }
  
  get maturityDate() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Deposits && this.asset.deposits.maturityDate) {
      return new Intl.DateTimeFormat('en-GB').format(this.asset.deposits.maturityDate);
    }
  }

  get depositDate() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Deposits && this.asset.deposits.depositDate) {
      return new Intl.DateTimeFormat('en-GB').format(this.asset.deposits.depositDate);
    }
  }

  get units() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Equity) {
      return this.asset.equity.units;
    }
    if (this.asset.assetType === AssetType.MutualFunds) {
      return this.asset.mutualFunds.units;
    }
  }

  get price() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Equity) {
      return this.asset.equity.price;
    }
    if (this.asset.assetType === AssetType.MutualFunds) {
      return this.asset.mutualFunds.price;
    }
  }

  get currentValue() {
    if (!this.asset) {
      return;
    }
    if (this.asset.assetType === AssetType.Equity) {
      return this.asset.equity.currentValue;
    }
    if (this.asset.assetType === AssetType.MutualFunds) {
      return this.asset.mutualFunds.currentValue;
    }
  }
}
