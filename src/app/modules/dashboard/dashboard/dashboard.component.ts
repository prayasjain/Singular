import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AssetsPage } from 'src/app/home/assets/assets.page';
import { AssetsService } from 'src/app/home/assets/assets.service';
import { AuthService } from 'src/app/auth/auth.service';
import { LoadingController } from '@ionic/angular';
import { CurrencyService } from 'src/app/home/currency/currency.service';
import { MarketDataService } from 'src/app/home/assets/market-data.service';
import { Asset, AssetType } from 'src/app/home/assets/asset.model';
import { Subscription, zip, of } from 'rxjs';
import { take, switchMap, tap } from 'rxjs/operators';
import { GoalsPage } from 'src/app/home/goals/goals.page';
import { GoalsService } from 'src/app/home/goals/goals.service';


interface AssetGroup {
  assetType: AssetType;
  amount: number;
  // id included to identify eash list item seprately
  id: number;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(AssetsPage, { static: true }) assetsgroup: AssetsPage;
  @ViewChild(GoalsPage, { static: true }) goalPage: GoalsPage;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}
