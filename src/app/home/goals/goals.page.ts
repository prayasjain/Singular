import { Component, OnInit, OnDestroy } from "@angular/core";
import { GoalsService } from "./goals.service";
import { Goal, Contribution } from "./goal.model";
import { Subscription, Observable, of, zip, pipe } from "rxjs";
import { Asset } from "../assets/asset.model";
import { AssetsService } from "../assets/assets.service";
import { mergeMap, tap, take, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from '../currency/currency.service';

@Component({
  selector: "app-goals",
  templateUrl: "./goals.page.html",
  styleUrls: ["./goals.page.scss"],
})
export class GoalsPage implements OnInit, OnDestroy {
  user: firebase.User;
  userGoals: Goal[];
  userGoalsSub: Subscription;

  userGoalsContributions: Contribution[];
  userGoalsContributionsSub: Subscription;

  userAssets: Asset[];
  userAssetsSub: Subscription;

  // map from goal id to amount allocated for it.
  goalCompletionMap: Map<string, number> = new Map();

  // map from asset to its valuation at the given date;
  assetValueDate: Date;
  assetValueMap: Map<string, number> = new Map();

  allocatedAmount: number = 0;

  isLoading: boolean = false;

  private initGoal: boolean = false;
  private initAsset: boolean = false;
  private initContributions: boolean = false;

  constructor(
    private goalsService: GoalsService,
    private assetsService: AssetsService,
    private authService: AuthService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.userAssetsSub = this.authService.authInfo
      .pipe(
        take(1),
        switchMap((user) => {
          this.user = user;
          return this.assetsService.userAssets;
        })
      )
      .subscribe((userAssets) => {
        this.userAssets = userAssets;
        this.initAsset = true;
        this.assetValueDate = new Date();
        this.assetValueMap.clear();
        let list = userAssets.map((userAsset) =>
          userAsset.getAmountForAsset(this.assetValueDate).pipe(
            take(1),
            tap((amount) => {
              this.assetValueMap.set(userAsset.id, amount);
            })
          )
        );
        zip(...list).subscribe((vals) => {
          this.updateGoalCompletion();
        });
      });
    this.userGoalsSub = this.goalsService.userGoals.subscribe((usergoals) => {
      this.userGoals = usergoals;
      this.initGoal = true;
      this.updateGoalCompletion();
    });
    this.userGoalsContributionsSub = this.goalsService.userGoalsContributions.subscribe(
      (userGoalsContributions) => {
        this.userGoalsContributions = userGoalsContributions;
        this.initContributions = true;
        this.updateGoalCompletion();
      }
    );
  }

  updateGoalCompletion() {
    if (!this.initAsset || !this.initGoal || !this.initContributions) {
      return;
    }
    this.goalCompletionMap.clear();

    this.allocatedAmount = 0;
    this.userGoalsContributions.forEach((userGoalsContribution) => {
      let existingContribution =
        this.goalCompletionMap.get(userGoalsContribution.goalId) || 0;
      let assetValue =
        this.assetValueMap.get(userGoalsContribution.assetId) || 0;
      let currentContribution =
        assetValue * userGoalsContribution.percentageContribution || 0;
      this.allocatedAmount +=
        userGoalsContribution.percentageContribution *
        this.assetValueMap.get(userGoalsContribution.assetId);
      this.goalCompletionMap.set(
        userGoalsContribution.goalId,
        existingContribution + currentContribution
      );
    });
    this.isLoading = false;
  }

  ngOnDestroy() {
    if (this.userGoalsSub) {
      this.userGoalsSub.unsubscribe();
    }
    if (this.userGoalsContributionsSub) {
      this.userGoalsContributionsSub.unsubscribe();
    }
    if (this.userAssetsSub) {
      this.userAssetsSub.unsubscribe();
    }
  }

  // ionViewWillEnter() {
  //   this.isLoading = true;
  //   this.assetsService
  //     .fetchUserAssets()
  //     .pipe(
  //       switchMap(() => {
  //         return this.goalsService.fetchUserGoals();
  //       }),
  //       switchMap(() => {
  //         return this.goalsService.fetchUserGoalsContributions();
  //       })
  //     )
  //     .subscribe((data) => {
  //       this.isLoading = false;
  //     });
  // }
}
