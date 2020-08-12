import { Component, OnInit, Input } from "@angular/core";
import { CurrencyService } from "../../currency/currency.service";
import { GoalsService } from "../goals.service";
import { LoadingController } from "@ionic/angular";
@Component({
  selector: "app-goal",
  templateUrl: "./goal.component.html",
  styleUrls: ["./goal.component.scss"],
})
export class GoalComponent implements OnInit {
  @Input() itemColor: string;
  @Input() title: string;
  @Input() value: number;
  @Input() itemLink: string;
  @Input() id: string;
  @Input() amtRqd: number;

  // these are some pre-defined number for the use case of test(), which controls the sliding item
  hc: number = 65;
  wc: number = 80;
  height: number = 65;
  width: number = 80;

  constructor(
    public currencyService: CurrencyService,
    private goalsService: GoalsService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  // controls the sliding option of ion-item-sliding and provide some responsive sliding effect
  slideRatio(event) {
    // numbers used inside are for controling the size of buttons on the basis of sliding ratio
    if (event.detail.ratio > 0.3 && event.detail.ratio < 0.5) {
      this.height = this.hc + 41.6 * event.detail.ratio;
      this.width = this.wc + 11.33 * event.detail.ratio;
    }
    if (event.detail.ratio < 0.3) {
      this.height = 65;
      this.width = 80;
    }
  }

  cancel() {
    document.querySelector("ion-item-sliding").closeOpened();
  }

  delete() {
    this.loadingCtrl.create({ message: "Deleting your Goal..." }).then((loadingEl) => {
      loadingEl.present();
      this.goalsService.deleteGoal(this.id).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }
}
