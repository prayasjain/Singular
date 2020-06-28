import { Component, OnInit, Input } from "@angular/core";
import { ModalController, LoadingController } from "@ionic/angular";
import {
  Asset,
  AssetType,
  SavingsAccount,
  AssetTypeUtils,
} from "../assets/asset.model";
import { AssetsService } from "../assets/assets.service";
import { Router } from "@angular/router";
import { Goal, Contribution } from "../goals/goal.model";
import { GoalsService } from "../goals/goals.service";
import { AddNewAssetModalComponent } from "./add-new-asset-modal/add-new-asset-modal.component";
import { AddNewGoalModalComponent } from "./add-new-goal-modal/add-new-goal-modal.component";
import { EditGoalComponent } from "../goals/edit-goal/edit-goal.component";
import { take, switchMap, tap } from "rxjs/operators";
import { zip, of } from "rxjs";

@Component({
  selector: "app-add-new",
  templateUrl: "./add-new.component.html",
  styleUrls: ["./add-new.component.scss"],
})
export class AddNewComponent implements OnInit {
  @Input() assetType: AssetType;
  @Input() isAsset: boolean = false;
  @Input() isGoal: boolean = false;

  date: Date;

  constructor(
    private modalCtrl: ModalController,
    private assetsService: AssetsService,
    private goalsService: GoalsService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  clickItem() {
    this.date = new Date();
    this.saveData().then(() => {});
  }

  async saveData() {
    if (this.isAsset) {
      let asset: Asset = await this.saveAsset();
      if (asset) {
        this.router.navigate([
          "/home/tabs/assets/asset-detail/",
          AssetTypeUtils.slug(asset.assetType),
        ]);
      }
    } else if (this.isGoal) {
      let goal: Goal = await this.saveGoal();
      await this.saveContributions(goal);
      if (goal) {
        this.router.navigate(["/home/tabs/goals/goal-detail/", goal.id]);
      }
    }
  }

  async saveAsset(): Promise<Asset> {
    let loadingEl = await this.loadingCtrl.create({
      message: "Saving Your Data...",
    });
    let modalEl = await this.modalCtrl.create({
      component: AddNewAssetModalComponent,
      componentProps: {
        assetType: this.assetType,
      },
    });
    modalEl.present();
    let resultData = await modalEl.onDidDismiss();
    if (resultData.role === "confirm" && resultData.data.asset) {
      loadingEl.present();
      let asset: Asset = await this.assetsService
        .addUserAsset(resultData.data.asset)
        .toPromise();
      loadingEl.dismiss();
      return asset;
    }
  }

  async saveGoal(): Promise<Goal> {
    let loadingEl = await this.loadingCtrl.create({
      message: "Saving Your Data...",
    });
    let modalEl = await this.modalCtrl.create({
      component: AddNewGoalModalComponent,
      componentProps: {},
    });
    modalEl.present();
    let resultData = await modalEl.onDidDismiss();
    if (resultData.role !== "confirm") {
      return;
    }
    loadingEl.present();
    let newGoal = await this.goalsService
      .addUserGoal(
        new Goal(
          Math.random().toString(),
          resultData.data.name,
          resultData.data.amount,
          this.date
        )
      )
      .toPromise();
    loadingEl.dismiss();
    return newGoal;
  }

  async saveContributions(newGoal: Goal): Promise<Contribution[]> {
    let loadingEl = await this.loadingCtrl.create({
      message: "Saving Your Data...",
    });
    console.log("hhhh11");
    let assets: Asset[] = await this.assetsService.userAssets.pipe(take(1)).toPromise();
    console.log("hhhh");
    let assetValueMap: Map<string, number> = await this.getAssetValueMap(assets);

    if (!assets || assets.length === 0) {
      return;
    }
    let contributionModalEl = await this.modalCtrl.create({
      component: EditGoalComponent,
      componentProps: {
        goal: newGoal,
        contributions: [],
        assets: [],
        remainingAssets: assets,
        assetContributionMap: [],
        remainingAssetValueMap: assetValueMap,
      },
    });
    contributionModalEl.present();
    let contributionsData = await contributionModalEl.onDidDismiss();
    if (contributionsData.role !== "confirm") {
      return;
    }
    loadingEl.present();
    let contributions: Contribution[] = await this.assetsService
      .updateUserAssets(
        contributionsData.data.contributingAssets.concat(
          contributionsData.data.nonContributingAssets
        )
      )
      .pipe(
        take(1),
        switchMap(() => {
          // update the contributions
          let contributions: Contribution[] =
            contributionsData.data.contributions;
          contributions.forEach((c) => (c.goalId = newGoal.id));
          return this.goalsService.updateContributions(
            contributions,
            newGoal.id
          );
        })
      )
      .toPromise();
    loadingEl.dismiss();
    return contributions;
  }

  async getAssetValueMap(assets: Asset[]) {

    console.log("here?");
    let assetValueMap: Map<string, number> = new Map();
    await this.assetsService.userAssets
      .pipe(
        take(1),
        switchMap((userAssets) => {
          assets.concat(userAssets);
          let observableList = userAssets.map((a) =>
            a.getAmountForAsset(this.date).pipe(
              take(1),
              tap((assetValue) => {
                assetValueMap.set(a.id, assetValue);
              })
            )
          );
          if (observableList.length === 0) {
            return of([]);
          }
          return zip(...observableList);
        })
      )
      .toPromise();
    return assetValueMap;
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
}
