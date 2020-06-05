import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Goal, Contribution } from "../goal.model";
import { ActivatedRoute } from "@angular/router";
import { GoalsService } from "../goals.service";
import { Subscription, zip } from "rxjs";
import { map, take, switchMap, tap } from "rxjs/operators";
import { AssetsService } from "../../assets/assets.service";
import { Asset } from "../../assets/asset.model";
import { ModalController } from "@ionic/angular";
import { NgModel, NgForm } from "@angular/forms";

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
  remainingAssets: Asset[] = [];
  // map from asset id to contribution amount at the given date
  assetContributionMap: Map<string, number> = new Map();
  assetValueDate: Date;
  finishPerc: number = 0;
  selectedAsset;
  @ViewChild("f", { static: true }) form: NgForm;

  constructor(
    private activatedRoute: ActivatedRoute,
    private goalsService: GoalsService,
    private assetsService: AssetsService,
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
          switchMap(userAssets => {
            this.assetValueDate = new Date();
            // we separate the user assets into assets (contributing to goal), and remaining assets
            this.divideAssetsToContributingAndRemaining(userAssets);
            // set the asset contribution map which is contribution of each asset to the goal
            return this.setAssetContributionMap();
            
          })
        )
        .subscribe(() => {
          this.setFinishPercentage();
          console.log(this.remainingAssets);
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

  setAssetContributionMap() {
    this.assetContributionMap = new Map();
    let observableList = this.contributions.map(contribution => {
      return this.assets.find(asset => asset.id === contribution.assetId)
        .getAmountForAsset(this.assetValueDate)
        .pipe(take(1), tap(assetValue => {
          this.assetContributionMap.set(
            contribution.assetId,
            assetValue * contribution.percentageContribution
          );
        }));
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
    console.log(this.form.value["percentage"]);
    console.log(this.form.value["asset"]);
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
        console.log("done");
      });
  }

  get remainingAssetPercentage() {
    if (this.remainingAssets && this.selectedAsset) {
      return this.remainingAssets.find((a) => a.id === this.selectedAsset)
        .percentUnallocated;
    }
  }

  ngOnDestroy() {
    if (this.goalSub) {
      this.goalSub.unsubscribe();
    }
  }
}
