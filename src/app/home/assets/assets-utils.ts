import { LoadingController } from "@ionic/angular";
import { GoalsService } from "../goals/goals.service";
import { take, switchMap } from "rxjs/operators";
import { AssetsService } from "./assets.service";
import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable, zip } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AssetsUtils {
  constructor(
    private assetsService: AssetsService,
    private goalsService: GoalsService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  deleteAsset(assetId: string) {
    this.loadingCtrl.create({ message: "Deleting your Asset..." }).then((loadingEl) => {
      loadingEl.present();
      this.deleteAssetObservable(assetId).subscribe(() => {
        loadingEl.dismiss();
        this.router.navigateByUrl("/home/tabs/assets");
      });
    });
  }

  deleteAssets(assetIds: string[]) {
    this.loadingCtrl.create({ message: "Deleting your Assets..." }).then((loadingEl) => {
      loadingEl.present();
      zip(...assetIds.map((assetId) => this.deleteAssetObservable(assetId))).subscribe(() => {
        console.log("coming here??");
        loadingEl.dismiss();
        //this.router.navigateByUrl("/home/tabs/assets");
      });
    });
  }

  private deleteAssetObservable(assetId: string): Observable<any> {
    return this.goalsService.deleteContributionsOfAsset(assetId).pipe(
      take(1),
      switchMap(() => {
        return this.assetsService.deleteAsset(assetId);
      })
    );
  }
}
