import { Component, OnInit, OnDestroy } from "@angular/core";
import { Goal, Contribution } from "../goal.model";
import { ActivatedRoute } from "@angular/router";
import { GoalsService } from "../goals.service";
import { Subscription } from "rxjs";
import { map, take, switchMap } from "rxjs/operators";
import { AssetsService } from "../../assets/assets.service";
import { Asset } from "../../assets/asset.model";

@Component({
  selector: "app-goal-detail",
  templateUrl: "./goal-detail.page.html",
  styleUrls: ["./goal-detail.page.scss"],
})
export class GoalDetailPage implements OnInit, OnDestroy {
  goal: Goal;
  goalSub: Subscription;
  contributions: Contribution[];
  assets: Asset[] = [];
  // map from asset id to contribution amount
  assetContributionMap: Map<string, number> = new Map();
  finishPerc: number = 0.7;

  constructor(
    private activatedRoute: ActivatedRoute,
    private goalsService: GoalsService,
    private assetsService: AssetsService
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
            return this.assetsService.userAssets;
          })
        )
        .subscribe((userAssets) => {
          this.assetContributionMap = new Map();
          this.assets = [];
          this.contributions.forEach((contribution) => {
            let userAsset = userAssets.find(
              (userAsset) => contribution.assetId === userAsset.id
            );
            if (userAsset) {
              this.assets.push(userAsset);
              this.assetContributionMap.set(
                userAsset.id,
                userAsset.amount * contribution.percentageContribution
              );
            }
          });
          this.setFinishPercentage();
        });
    });
  }

  setFinishPercentage() {
    this.finishPerc =
      Array.from(this.assetContributionMap.values()).reduce((a, b) => a + b) /
      this.goal.amountReqd;
  }

  ngOnDestroy() {
    if (this.goalSub) {
      this.goalSub.unsubscribe();
    }
  }
}
