import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from "@angular/core";
import { AssetsPage } from "src/app/home/assets/assets.page";
import { GoalsPage } from "src/app/home/goals/goals.page";
import { CurrencyService } from "src/app/home/currency/currency.service";
import { Constants } from "src/app/config/constants";
import { Router } from "@angular/router";
import { AssetTypeUtils, AssetType } from 'src/app/home/assets/asset.model';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardPage implements OnInit {
  constants = Constants;
  assetTypes = AssetType;
  @ViewChild(AssetsPage, { static: true }) assetsgroup: AssetsPage;
  @ViewChild(GoalsPage, { static: true }) goalPage: GoalsPage;

  constructor(public currencyService: CurrencyService, private router: Router) {}

  ngOnInit() {}

  assetTypeUtils = AssetTypeUtils;

  getTotal(value: number) {
    return `out of ${value}`;
  }
}
