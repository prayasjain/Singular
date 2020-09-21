import { Component, ViewChild, OnInit } from "@angular/core";
import { StateService } from "./state.service";
import { CurrencyService } from './currency/currency.service';
import { ExportAssetsComponent } from '../export-assets/export-assets/export-assets.component';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit {
  user: firebase.User;
  authSub: Subscription;
  
  @ViewChild(ExportAssetsComponent, { static: true }) exportAssetComponent: ExportAssetsComponent;

  constructor(public stateService: StateService, public currencyService: CurrencyService, private authService: AuthService) {}
  
  ngOnInit() {
    this.authSub = this.authService.authInfo.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });
  }
  
  async setCurrency(currency) {
    this.currencyService.setCurrency(currency);
  }
  exportAssets() {
    this.exportAssetComponent.exportAssets();
  }
  onLogout() {
    this.authService.logout();
  }
}