import { Component, OnDestroy } from "@angular/core";

import {
  Platform,
  LoadingController,
  ActionSheetController,
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AuthService } from "./auth/auth.service";
import { take, switchMap } from "rxjs/operators";
import { SmsService } from "./sms/sms.service";
import { CurrencyService } from "./home/currency/currency.service";
import { Subscription } from 'rxjs';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnDestroy{
  user: firebase.User;
  displaySMSRead: boolean = false;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private smsService: SmsService,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    public currencyService: CurrencyService
  ) {
    this.initializeApp();
  }

  authSub: Subscription;

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.displaySMSRead = !this.platform.is("desktop");
    });

    this.authSub = this.authService.authInfo.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });
  }

  onLogout() {
    this.authService.logout();
  }

  readAccountFromSMS() {
    this.loadingCtrl
      .create({ message: "Updating your Savings Account" })
      .then((loadingEl) => {
        loadingEl.present();
        this.smsService.convertSMSToAccount().then((savingsAccounts) => {
          if (!savingsAccounts || savingsAccounts.length == 0) {
            loadingEl.dismiss();
            return;
          }
          this.smsService.saveSavingsAccounts(savingsAccounts).subscribe(
            (data) => {
              loadingEl.dismiss();
            },
            (err) => {
              console.log(err);
              loadingEl.dismiss();
            }
          );
        });
      });
  }

  async changeCurrency() {
    let pickedCurrency;
    this.actionSheetCtrl
      .create({
        header: "Choose Your Currency",
        buttons: [
          {
            text: "INR",
            handler: () => {
              pickedCurrency = "INR";
            },
          },
          {
            text: "USD",
            handler: () => {
              pickedCurrency = "USD";
            },
          },
          {
            text: "SGD",
            handler: () => {
              pickedCurrency = "SGD";
            },
          },
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {},
          },
        ],
      })
      .then((actionSheetEl) => {
        actionSheetEl.present();
        return actionSheetEl.onDidDismiss();
      })
      .then((data) => {
        if (data.role === "cancel" || data.role === "backdrop") {
          return;
        }
        this.currencyService.setCurrency(pickedCurrency);
      });
  }

  ngOnDestroy() {
    if (!this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
