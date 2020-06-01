import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import {
  
  Asset,
  AssetType,
  SavingsAccount,
  AssetTypeUtils,
} from "../assets/asset.model";
import { AssetsService } from "../assets/assets.service";
import { Router } from "@angular/router";
import { Goal } from "../goals/goal.model";
import { GoalsService } from "../goals/goals.service";
import { AddNewAssetModalComponent } from "./add-new-asset-modal/add-new-asset-modal.component";
import { AddNewGoalModalComponent } from "./add-new-goal-modal/add-new-goal-modal.component";

@Component({
  selector: "app-add-new",
  templateUrl: "./add-new.component.html",
  styleUrls: ["./add-new.component.scss"],
})
export class AddNewComponent implements OnInit {
  @Input() assetType: AssetType;
  @Input() isAsset: boolean = false;
  @Input() isGoal: boolean = false;
  @Input() isCashflow: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private assetsService: AssetsService,
    private goalsService: GoalsService,
    private router: Router
  ) {}

  ngOnInit() {}

  clickItem() {
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
            //   AssetType[resultData.data.assetType],
            let newAsset = new Asset(
              Math.random().toString(),
              new SavingsAccount(resultData.data.name, resultData.data.accountDetails, resultData.data.amount),
              1
            );
            this.assetsService.addUserAsset(newAsset).subscribe((res) => {
              this.router.navigate([
                "/home/tabs/assets/asset-detail/",
                AssetTypeUtils.slug(newAsset.assetType),
              ]);
            });
          }
        });
    }

    if (this.isGoal) {
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
            let newGoal = new Goal(
              Math.random().toString(),
              resultData.data.name,
              resultData.data.amount,
              new Date()
            );
            this.goalsService.addUserGoal(newGoal).subscribe((res) => {
              this.router.navigate([
                "/home/tabs/goals/goal-detail/",
                newGoal.id,
              ]);
            });
          }
        });
    }
  }
}
