import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { AddNewModalComponent } from "./add-new-modal/add-new-modal.component";
import { AssetTypeLayout, Asset, AssetType } from "../assets/asset.model";
import { AssetsService } from "../assets/assets.service";
import { Router } from '@angular/router';

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
            );
            this.assetsService.addUserAsset(newAsset).subscribe(res => {
              this.router.navigate(["/home/tabs/assets/asset-detail/", newAsset.assetType.typeNameSlug])
            });
          }
        }
      });
  }
}
