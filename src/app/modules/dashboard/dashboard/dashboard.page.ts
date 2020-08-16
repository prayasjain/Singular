import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { AssetsPage } from 'src/app/home/assets/assets.page';
import { GoalsPage } from 'src/app/home/goals/goals.page';
import { CurrencyService } from 'src/app/home/currency/currency.service';
import { Constants } from 'src/app/config/constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardPage  implements OnInit {
  constants = Constants;
  @ViewChild(AssetsPage, { static: true }) assetsgroup: AssetsPage;
  @ViewChild(GoalsPage, { static: true }) goalPage: GoalsPage;

  constructor(public currencyService: CurrencyService) { }

  ngOnInit() {
  }

  getTotal(value: number) {
    return `out of ${value}`;
  }
}
