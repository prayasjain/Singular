import { Component, OnDestroy, ViewChild, ElementRef } from "@angular/core";

import {
  Platform,
  LoadingController,
  ActionSheetController,
} from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AuthService } from "./auth/auth.service";
import { take } from "rxjs/operators";
import { SmsService } from "./sms/sms.service";
import { CurrencyService } from "./home/currency/currency.service";
import { Subscription } from "rxjs";
import { PdfService } from "./pdf/pdf.service";
import { MutualFunds, Equity } from "./home/assets/asset.model";
import { ExportAssetsComponent } from './export-assets/export-assets/export-assets.component';

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnDestroy {
  user: firebase.User;
  mobileApp: boolean = false;
  @ViewChild("camsFilePicker", { static: false }) camsFilePicker: ElementRef;
  @ViewChild("nsdlFilePicker", { static: false }) nsdlFilepicker: ElementRef;
  @ViewChild(ExportAssetsComponent, { static: true }) exportAssetComponent: ExportAssetsComponent;


  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private smsService: SmsService,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private pdfService: PdfService,
    public currencyService: CurrencyService
  ) {
    this.initializeApp();
  }

  authSub: Subscription;

  exportAssets() {
    this.exportAssetComponent.exportAssets();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.mobileApp = !this.platform.is("desktop");
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
            handler: () => { },
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

  onCAMSPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    this.loadingCtrl
      .create({ message: "Updating your Mutual Funds" })
      .then((loadingEl) => {
        reader.onload = () => {
          this.camsFilePicker.nativeElement.value = ""; //reset the input
          this.pdfService
            .readPdf(reader.result)
            .then((data) => {
              loadingEl.present();
              let mutualFunds: MutualFunds[] = this.pdfService.parseCAMSStatement(
                data
              );
              if (!mutualFunds || mutualFunds.length == 0) {
                loadingEl.dismiss();
                return;
              }
              this.pdfService.saveMutualFunds(mutualFunds).subscribe(
                (data) => {
                  loadingEl.dismiss();
                },
                (err) => {
                  console.log(err);
                  loadingEl.dismiss();
                }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        };
        reader.readAsArrayBuffer(file);
      });
  }

  onNSDLPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    this.loadingCtrl
      .create({ message: "Updating your Equities Funds" })
      .then((loadingEl) => {
        reader.onload = () => {
          this.nsdlFilepicker.nativeElement.value = ""; //reset the input
          this.pdfService
            .readPdf(reader.result)
            .then((data) => {
              loadingEl.present();
              let equities: Equity[] = this.pdfService.parseNSDLStatement(
                data
              );
              if (!equities || equities.length == 0) {
                loadingEl.dismiss();
                return;
              }
              this.pdfService.saveEquities(equities).subscribe(
                (data) => {
                  loadingEl.dismiss();
                },
                (err) => {
                  console.log(err);
                  loadingEl.dismiss();
                }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        };
        reader.readAsArrayBuffer(file);
      });
  }

  ngOnDestroy() {
    if (!this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
