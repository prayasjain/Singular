import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Goal, Contribution } from "../goal.model";
import { ActivatedRoute } from "@angular/router";
import { GoalsService } from "../goals.service";
import { Subscription } from "rxjs";
import { map, take, switchMap } from "rxjs/operators";
import { AssetsService } from "../../assets/assets.service";
import { Asset } from "../../assets/asset.model";
import { ModalController } from "@ionic/angular";
import { ContributionModalComponent } from "../contribution-modal/contribution-modal.component";
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
  // map from asset id to contribution amount
  assetContributionMap: Map<string, number> = new Map();
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
            return this.assetsService.userAssets;
          })
        )
        .subscribe((userAssets) => {
          this.assetContributionMap = new Map();
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
              this.assetContributionMap.set(
                userAsset.id,
                userAsset.amount * contribution.percentageContribution
              );
            }
          });
          this.setFinishPercentage();
          console.log(this.remainingAssets);
        });
    });
  }

  setFinishPercentage() {
    this.finishPerc =
      Array.from(this.assetContributionMap.values()).reduce(
        (a, b) => a + b,
        0
      ) / this.goal.amountReqd;
  }

  updateContribution() {
    this.modalCtrl
      .create({
        component: ContributionModalComponent,
        componentProps: {},
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resData) => {
        if (resData.role === "confirm") {
        }
      });
  }

  onSubmit() {
    console.log(this.form.value["percentage"]);
    console.log(this.form.value["asset"]);
    this.goalsService.addUserGoalsContribution(
      new Contribution(
        Math.random().toString(),
        this.form.value["asset"],
        this.goal.id,
        +this.form.value["percentage"]/100
      )
    ).subscribe(res => {
      this.form.reset();
      console.log("done");
    });
  }

  get remainingAssetPercentage() {
    if (this.remainingAssets && this.selectedAsset) {
      return this.remainingAssets.find((a) => a.id === this.selectedAsset)
        .percent_unallocated;
    }
  }

  ngOnDestroy() {
    if (this.goalSub) {
      this.goalSub.unsubscribe();
    }
  }
}
