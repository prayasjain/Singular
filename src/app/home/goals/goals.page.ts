import { Component, OnInit, OnDestroy } from "@angular/core";
import { GoalsService } from "./goals.service";
import { Goal, Contribution } from "./goal.model";
import { Subscription } from "rxjs";
import { Asset } from "../assets/asset.model";
import { AssetsService } from "../assets/assets.service";

@Component({
  selector: "app-goals",
  templateUrl: "./goals.page.html",
  styleUrls: ["./goals.page.scss"],
})
export class GoalsPage implements OnInit, OnDestroy {
  userGoals: Goal[];
  userGoalsSub: Subscription;
  userGoalsContributions: Contribution[];
  userGoalsContributionsSub: Subscription;
  userAssets: Asset[];
  userAssetsSub: Subscription;
  // map from goal id to amount allocated for it.
  goalCompletionMap: Map<string, number> = new Map();

  constructor(
    private goalsService: GoalsService,
    private assetsService: AssetsService
  ) {}

  ngOnInit() {
    this.userAssetsSub = this.assetsService.userAssets.subscribe(
      (userAssets) => {
        this.userAssets = userAssets;
        this.updateGoalCompletion();
      }
    );
    this.userGoalsSub = this.goalsService.userGoals.subscribe((usergoals) => {
      this.userGoals = usergoals;
      this.updateGoalCompletion();
    });
    this.userGoalsContributionsSub = this.goalsService.userGoalsContributions.subscribe(
      (userGoalsContributions) => {
        this.userGoalsContributions = userGoalsContributions;
        this.updateGoalCompletion();
      }
    );
  }

  updateGoalCompletion() {
    if (!this.userGoals || !this.userGoalsContributions || !this.userAssets) {
      return;
    }
    this.goalCompletionMap.clear(); 
    this.userGoalsContributions.forEach((userGoalsContribution) => {
      let existingContribution =
        this.goalCompletionMap.get(userGoalsContribution.goalId) || 0;
      let currentContribution = this.userAssets.find(
        (userAsset) => userAsset.id === userGoalsContribution.assetId
      ).amountForAsset * userGoalsContribution.percentageContribution || 0;
      this.goalCompletionMap.set(
        userGoalsContribution.goalId,
        existingContribution + currentContribution
      );
    });
    console.log(this.goalCompletionMap);
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
}
