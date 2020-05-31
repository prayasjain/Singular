import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { AddNewModalComponent } from "./add-new-modal/add-new-modal.component";
import { AssetTypeLayout, Asset, AssetType } from "../assets/asset.model";
import { AssetsService } from "../assets/assets.service";
import { Router } from "@angular/router";
import { Goal } from "../goals/goal.model";
import { GoalsService } from '../goals/goals.service';

@Component({
  selector: "app-add-new",
  templateUrl: "./add-new.component.html",
  styleUrls: ["./add-new.component.scss"],
})
export class AddNewComponent implements OnInit {
  @Input() assetType: AssetTypeLayout;
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
    this.modalCtrl
      .create({
        component: AddNewModalComponent,
        componentProps: {
          assetType: this.assetType,
          isAsset: this.isAsset,
          isGoal: this.isGoal,
          isCashflow: this.isCashflow,
        },
      })
      .then((modalEl) => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then((resultData) => {
        if (resultData.role === "confirm") {
          if (this.isAsset) {
            let newAsset = new Asset(
              Math.random().toString(),
              resultData.data.name,
              resultData.data.accountDetails,
              resultData.data.amount,
              AssetType[resultData.data.assetType],
              1
            );
            this.assetsService.addUserAsset(newAsset).subscribe((res) => {
              this.router.navigate([
                "/home/tabs/assets/asset-detail/",
                newAsset.assetType.typeNameSlug,
              ]);
            });
          } else if (this.isGoal) {
            let newGoal = new Goal(
              Math.random().toString(),
              resultData.data.name,
              resultData.data.amount,
              new Date()
            );
            this.goalsService.addUserGoal(newGoal).subscribe(res => {
              this.router.navigate([
                "/home/tabs/goals/goal-detail/",
                newGoal.id,
              ])
            })
          }
        }
      });
  }
}
