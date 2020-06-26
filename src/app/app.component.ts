import { Component } from "@angular/core";

import { Platform, LoadingController } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AuthService } from "./auth/auth.service";
import { take } from "rxjs/operators";
import { SmsService } from "./sms/sms.service";
import { SavingsAccount } from "./home/assets/asset.model";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  user: firebase.User;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private smsService: SmsService,
    private loadingCtrl: LoadingController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.authService.authInfo.pipe(take(1)).subscribe((user) => {
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
}
