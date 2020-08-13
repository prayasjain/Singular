import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Goal, Contribution } from "../goal.model";
import { ActivatedRoute } from "@angular/router";
import { GoalsService } from "../goals.service";
import { Subscription, zip, of } from "rxjs";
import { map, take, switchMap, tap } from "rxjs/operators";
import { AssetsService } from "../../assets/assets.service";
import { Asset } from "../../assets/asset.model";
import { NgModel, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { EditGoalComponent } from "../edit-goal/edit-goal.component";
import { AuthService } from "src/app/auth/auth.service";
import { CurrencyService } from "../../currency/currency.service";
import { StateService, AddType } from "../../state.service";

@Component({
  selector: "app-goal-detail",
  templateUrl: "./goal-detail.page.html",
  styleUrls: ["./goal-detail.page.scss"],
})
export class GoalDetailPage implements OnInit, OnDestroy {
  user: firebase.User;
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

  isLoading: boolean = false;
  goalId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private goalsService: GoalsService,
    private assetsService: AssetsService,
    private router: Router,
    private modalCtrl: ModalController,
    private authService: AuthService,
    public currencyService: CurrencyService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.goalSub = this.activatedRoute.paramMap
      .pipe(
        switchMap((paramMap) => {
          this.goalId = paramMap.get("goalId");
          if (!this.goalId) {
            return;
          }
          return this.authService.authInfo;
        }),
        switchMap((user) => {
          this.user = user;
          return this.goalsService.userGoals;
        }),
        map((goals) => {
          return goals.find((goal) => goal.id === this.goalId);
        }),
        switchMap((goal) => {
          this.goal = goal;
          if (this.goal) {
            return this.goalsService.getUserGoalsContributionforGoal(this.goal.id);
          } else {
            return of([]);
          }
        }),
        switchMap((contributions) => {
          this.contributions = contributions;
          if (this.contributions) {
            return this.assetsService.userAssets; // returns all the assets
          } else {
            return of([]);
          }
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
      .subscribe(
        () => {
          this.setFinishPercentage();
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  divideAssetsToContributingAndRemaining(userAssets: Asset[]) {
    this.assets = [];
    this.remainingAssets = [...userAssets];
    this.contributions.forEach((contribution) => {
      let userAsset = userAssets.find((userAsset) => contribution.assetId === userAsset.id);
      if (userAsset) {
        this.assets.push(userAsset);
        this.remainingAssets = this.remainingAssets.filter((obj) => obj !== userAsset);
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
    if (observableList.length === 0) {
      return of([]);
    }
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
            this.assetContributionMap.set(contribution.assetId, assetValue * contribution.percentageContribution);
          })
        );
    });
    if (observableList.length === 0) {
      return of([]);
    }
    return zip(...observableList);
  }

  setFinishPercentage() {
    if (this.goal) {
      this.finishPerc = Array.from(this.assetContributionMap.values()).reduce((a, b) => a + b, 0) / this.goal.amountReqd;
    }
  }

  get remainingAssetPercentage() {
    if (this.remainingAssets && this.selectedAsset) {
      return this.remainingAssets.find((a) => a.id === this.selectedAsset).percentUnallocated;
    }
  }

  onEditGoal() {
    let oldContributions: Contribution[] = [];
    this.contributions.forEach((c) => oldContributions.push(Contribution.deepCopy(c)));
    this.modalCtrl
      .create({
        component: EditGoalComponent,
        componentProps: {
          goal: this.goal,
          contributions: [...this.contributions],
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
          this.isLoading = true;
          if (!this.changeInContributionArray(modalData.data.contributions, oldContributions)) {
            this.isLoading = false;
            return;
          }
          // update the assets.
          console.log(modalData.data.contributingAssets)
          console.log(modalData.data.nonContributingAssets)
          this.assetsService
            .updateUserAssets(modalData.data.contributingAssets.concat(modalData.data.nonContributingAssets))
            .pipe(
              take(1),
              switchMap((userAssets) => {
                // update the contributions
                return this.goalsService.updateContributions(modalData.data.contributions, this.goal.id);
              })
            )
            .subscribe((data) => {
              this.isLoading = false;
            });
        }
      });
  }

  isSameContribution(a: Contribution, b: Contribution) {
    return (
      a.id === b.id &&
      a.assetId === b.assetId &&
      a.goalId === b.goalId &&
      Math.abs(a.percentageContribution - b.percentageContribution) < 0.000001
    );
  }

  changeInContributionArray(contributions: Contribution[], oldContributions: Contribution[]) {
    if (contributions.length !== oldContributions.length) {
      return true;
    }
    oldContributions = oldContributions.sort();
    let newContributions = [...contributions].sort();
    let flag = false;
    oldContributions.forEach((contribution, index) => {
      if (!this.isSameContribution(contribution, newContributions[index])) {
        flag = true;
        return true;
      }
    });
    return flag;
  }

  onDeleteGoal() {
    this.isLoading = true;
    this.goalsService.deleteGoal(this.goal.id).subscribe(() => {
      this.isLoading = false;
      this.router.navigateByUrl("/home/tabs/goals");
    });
  }

  ngOnDestroy() {
    if (this.goalSub) {
      this.goalSub.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.stateService.updateAddType(AddType.Goal);
  }
}
