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

  currency: string;
  currencyLocale: string;
  constructor(private currencyService: CurrencyService) {}

  ngOnInit() {
    if (!this.itemColor) {
      this.itemColor = "tertiary";
    }
    this.currencyService
      .fetchCurrency()
      .pipe(
        take(1),
        switchMap(() => this.currencyService.currency)
      )
      .subscribe((currency) => {
        this.currency = currency;
        this.currencyLocale = this.currencyService.getLocaleForCurrency(
          this.currency
        );
      });
  }
}
