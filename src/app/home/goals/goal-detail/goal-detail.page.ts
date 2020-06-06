import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Goal, Contribution } from "../goal.model";
import { ActivatedRoute } from "@angular/router";
import { GoalsService } from "../goals.service";
import { Subscription, zip } from "rxjs";
import { map, take, switchMap, tap } from "rxjs/operators";
import { AssetsService } from "../../assets/assets.service";
import { Asset } from "../../assets/asset.model";
import { NgModel, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { EditGoalComponent } from "../edit-goal/edit-goal.component";

@Component({
  selector: "app-goal-detail",
  templateUrl: "./goal-detail.page.html",
  styleUrls: ["./goal-detail.page.scss"],
})
export class GoalDetailPage implements OnInit, OnDestroy {
  goal: Goal;
  goalSub: Subscription;
  //contributions to the goal
  contributions: Contribution[];
  assets: Asset[] = [];
  remainingAssets: Asset[] = [];
  // map from asset id to contribution amount at the given date
  assetContributionMap: Map<string, number> = new Map();
  // map from remaining asset ids to their asset values
  remainingAssetValueMap: Map<string, number> = new Map();
  assetValueDate: Date;
  finishPerc: number = 0;
  selectedAsset;
  @ViewChild("f", { static: true }) form: NgForm;

  constructor(
    private activatedRoute: ActivatedRoute,
    private goalsService: GoalsService,
    private assetsService: AssetsService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      let goalId = paramMap.get("goalId");
      if (!goalId) {
        return;
      }
      this.goalSub = this.goalsService.userGoals
        .pipe(
          map((goals) => goals.find((goal) => goal.id === goalId)),
          switchMap((goal) => {
            this.goal = goal;
            return this.goalsService.getUserGoalsContributionforGoal(
              this.goal.id
            );
          }),
          switchMap((contributions) => {
            this.contributions = contributions;
            return this.assetsService.userAssets; // returns all the assets
          }),
          switchMap((userAssets) => {
            this.assetValueDate = new Date();
            // we separate the user assets into assets (contributing to goal), and remaining assets
            this.divideAssetsToContributingAndRemaining(userAssets);
            // assign values of the remaining asset to value map
            return this.setRemainingAssetValueMap();
          }),
          switchMap(() => {
            // set the asset contribution map which is contribution of each asset to the goal
            return this.setAssetContributionMap();
          })
        )
        .subscribe(() => {
          this.setFinishPercentage();
        });
    });
  }

  divideAssetsToContributingAndRemaining(userAssets: Asset[]) {
    this.assets = [];
    this.remainingAssets = [...userAssets];
    this.contributions.forEach((contribution) => {
      let userAsset = userAssets.find(
        (userAsset) => contribution.assetId === userAsset.id
      );
      if (userAsset) {
        this.assets.push(userAsset);
        this.remainingAssets = this.remainingAssets.filter(
          (obj) => obj !== userAsset
        );
      }
    });
  }

  setRemainingAssetValueMap() {
    this.remainingAssetValueMap.clear();
    let observableList = this.remainingAssets.map((asset) =>
      asset.getAmountForAsset(this.assetValueDate).pipe(
        take(1),
        tap((assetValue) => {
          this.remainingAssetValueMap.set(asset.id, assetValue);
        })
      )
    );
    return zip(...observableList);
  }

  setAssetContributionMap() {
    this.assetContributionMap = new Map();
    let observableList = this.contributions.map((contribution) => {
      return this.assets
        .find((asset) => asset.id === contribution.assetId)
        .getAmountForAsset(this.assetValueDate)
        .pipe(
          take(1),
          tap((assetValue) => {
            this.assetContributionMap.set(
              contribution.assetId,
              assetValue * contribution.percentageContribution
            );
          })
        );
    });
    return zip(...observableList);
  }

  setFinishPercentage() {
    this.finishPerc =
      Array.from(this.assetContributionMap.values()).reduce(
        (a, b) => a + b,
        0
      ) / this.goal.amountReqd;
  }

  onSubmit() {
    this.goalsService
      .addUserGoalsContribution(
        new Contribution(
          Math.random().toString(),
          this.form.value["asset"],
          this.goal.id,
          +this.form.value["percentage"] / 100
        )
      )
      .subscribe((res) => {
        this.form.reset();
      });
  }

  get remainingAssetPercentage() {
    if (this.remainingAssets && this.selectedAsset) {
      return this.remainingAssets.find((a) => a.id === this.selectedAsset)
        .percentUnallocated;
    }
  }

  onEditGoal() {
    this.modalCtrl
      .create({
        component: EditGoalComponent,
        componentProps: {
          goal: this.goal,
          contributions: this.contributions,
          assets: this.assets,
          remainingAssets: this.remainingAssets,
          assetContributionMap: this.assetContributionMap,
          remainingAssetValueMap: this.remainingAssetValueMap,
        },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((modalData) => {
        if (modalData.role === "confirm") {
          let getIdFunc = (a) => a.id;
          if (
            this.areSameArrays(
              modalData.data.contributingAssets,
              this.assets,
              getIdFunc
            ) &&
            this.areSameArrays(
              modalData.data.nonContributingAssets,
              this.remainingAssets,
              getIdFunc
            ) &&
            this.areSameArrays(
              modalData.data.contributions,
              this.contributions,
              getIdFunc
            )
          ) {
            console.log("same");
            return;
          }
          // update the assets.
          this.assetsService.updateUserAssets(
            modalData.data.contributingAssets.concat(
              modalData.data.nonContributingAssets
            )
          ).pipe(take(1), switchMap((userAssets) => {
            // update the contributions
            return this.goalsService.updateContributions(modalData.data.contributions, this.goal.id);
          })).subscribe(() => {
            console.log("done");

          });
          
        }
      });
  }

  // can pass function which maps later to id
  areSameArrays(arr1: any[], arr2: any[], func) {
    let a: any[] = arr1.map(func).sort();
    let b: any[] = arr2.map(func).sort();
    let isEqual: boolean = true;
    a.forEach((x, i) => isEqual && x === b[i]);
    return isEqual;
  }

  onDeleteGoal() {
    this.goalsService.deleteGoal(this.goal.id).subscribe(() => {
      this.router.navigateByUrl("/home/tabs/goals");
    });
  }

  ngOnDestroy() {
    if (this.goalSub) {
      this.goalSub.unsubscribe();
    }
  }
}
