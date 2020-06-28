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

  constructor(public currencyService: CurrencyService) { }

  ngOnInit() {
  }

}
