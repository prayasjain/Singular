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

  constructor(
    public currencyService: CurrencyService,
    private goalsService: GoalsService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

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
