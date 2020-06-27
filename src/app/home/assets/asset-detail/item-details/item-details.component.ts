import { Component, OnInit, Input } from '@angular/core';
import { CurrencyService } from 'src/app/home/currency/currency.service';
import { take, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-assets-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
})
export class ItemDetailsComponent implements OnInit {

  @Input() title: string;
  @Input() content: string;
  @Input() value: number;
//  @Input() imgUrl: string;
  @Input() id: string;

  currency: string;
  currencyLocale: string;

  constructor(private currencyService: CurrencyService) { }

  ngOnInit() {
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
