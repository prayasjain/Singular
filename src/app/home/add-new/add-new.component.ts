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

  constructor(
    private modalCtrl: ModalController,
    private assetsService: AssetsService,
    private goalsService: GoalsService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  clickItem() {
    this.loadingCtrl
      .create({ message: "Saving Your Data..." })
      .then((loadingEl) => {
        if (this.isAsset) {
          this.modalCtrl
            .create({
              component: AddNewAssetModalComponent,
              componentProps: {
                assetType: this.assetType,
              },
            })
            .then((modalEl) => {
              modalEl.present();
              return modalEl.onDidDismiss();
            })
            .then((resultData) => {
              if (resultData.role === "confirm") {
                loadingEl.present();
                if (resultData.data.asset) {
                  this.assetsService
                    .addUserAsset(resultData.data.asset)
                    .subscribe((res) => {
                      loadingEl.dismiss();
                      this.router.navigate([
                        "/home/tabs/assets/asset-detail/",
                        AssetTypeUtils.slug(resultData.data.asset.assetType),
                      ]);
                    });
                }
              }
            });
        }

        if (this.isGoal) {
          let date = new Date();
          let newGoal;
          let assets: Asset[];
          let assetValueMap: Map<string, number> = new Map();
          let redirectMethod = (data) => {
            if (data) {
              loadingEl.dismiss();
              return this.router.navigate([
                "/home/tabs/goals/goal-detail/",
                newGoal.id,
              ]);
            }
            this.router.navigate(["/home/tabs/goals"]);
          };

          let noAssets: boolean = false;
          this.modalCtrl
            .create({
              component: AddNewGoalModalComponent,
              componentProps: {},
            })
            .then((modalEl) => {
              modalEl.present();
              return modalEl.onDidDismiss();
            })
            .then((resultData) => {
              if (resultData.role === "confirm") {
                newGoal = new Goal(
                  Math.random().toString(),
                  resultData.data.name,
                  resultData.data.amount,
                  date
                );
                return this.goalsService.addUserGoal(newGoal).toPromise();
                
              }
            })
            .then(data => {
              return this.assetsService.userAssets
              .pipe(
                take(1),
                switchMap((userAssets) => {
                  assets = userAssets;
                  let observableList = assets.map((a) =>
                    a.getAmountForAsset(date).pipe(
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
            })
            .then((data) => {
              if (data) {
                if (!assets || assets.length === 0) {
                  noAssets = true;
                }
                return this.modalCtrl.create({
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
              }
            })
            .then((modalEl) => {
              if (modalEl && !noAssets) {
                modalEl.present();
                return modalEl.onDidDismiss();
              }
            })
            .then((modalData) => {
              if (noAssets) {
                redirectMethod(modalData);
                return;
              } else if (modalData && modalData.role === "confirm") {
                loadingEl.present();
                return this.assetsService
                  .updateUserAssets(
                    modalData.data.contributingAssets.concat(
                      modalData.data.nonContributingAssets
                    )
                  )
                  .pipe(
                    take(1),
                    switchMap((userAssets) => {
                      return this.goalsService.addUserGoal(newGoal);
                    }),
                    take(1),
                    switchMap((goal) => {
                      // update the contributions
                      let contributions: Contribution[] =
                        modalData.data.contributions;
                      contributions.forEach((c) => (c.goalId = goal.id));
                      return this.goalsService.updateContributions(
                        contributions,
                        goal.id
                      );
                    })
                  )
                  .subscribe(redirectMethod);
              }
            });
        }
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
}
