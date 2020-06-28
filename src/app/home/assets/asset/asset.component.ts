import { Component, OnInit, Input } from "@angular/core";
import { CurrencyService } from "../../currency/currency.service";
import { take, switchMap } from "rxjs/operators";

@Component({
  selector: "app-asset",
  templateUrl: "./asset.component.html",
  styleUrls: ["./asset.component.scss"],
})
export class AssetComponent implements OnInit {
  @Input() itemColor: string;
  @Input() title: string;
  @Input() value: number;
  @Input() itemLink: string;
  constructor(public currencyService: CurrencyService) {}

  ngOnInit() {
    if (!this.itemColor) {
      this.itemColor = "tertiary";
    }
  }
}
