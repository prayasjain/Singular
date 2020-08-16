import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { take } from "rxjs/operators";
import { LoadingController, ActionSheetController, Platform } from "@ionic/angular";
import { PdfService } from '../../pdf/pdf.service';
import { CurrencyService } from '../currency/currency.service';
import { Equity, MutualFunds } from '../assets/asset.model';
import { SmsService } from 'src/app/sms/sms.service';
import { ExportAssetsComponent } from 'src/app/export-assets/export-assets/export-assets.component';

@Component({
  selector: "app-profile",
  templateUrl: "./profile.page.html",
  styleUrls: ["./profile.page.scss"],
})
export class ProfilePage implements OnInit {
  user: firebase.User;
  authSub: Subscription;
  mobileApp: boolean = false;

  @ViewChild("camsFilePicker", { static: false }) camsFilePicker: ElementRef;
  @ViewChild("nsdlFilePicker", { static: false }) nsdlFilepicker: ElementRef;
  @ViewChild(ExportAssetsComponent, { static: true }) exportAssetComponent: ExportAssetsComponent;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private actionSheetCtrl: ActionSheetController,
    private pdfService: PdfService,
    public currencyService: CurrencyService,
    private smsService: SmsService
  ) {
    this.loadData();
  }

  ngOnInit() {}

  loadData() {
    this.authSub = this.authService.authInfo.pipe(take(1)).subscribe((user) => {
      this.user = user;
      this.mobileApp = !this.platform.is("desktop");
    });
  }

  onLogout() {
    this.authService.logout();
  }

  exportAssets() {
    this.exportAssetComponent.exportAssets();
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

    this.loadingCtrl.create({ message: "Updating your Mutual Funds" }).then((loadingEl) => {
      reader.onload = () => {
        this.camsFilePicker.nativeElement.value = ""; //reset the input
        this.pdfService
          .readPdf(reader.result)
          .then((data) => {
            loadingEl.present();
            let mutualFunds: MutualFunds[] = this.pdfService.parseCAMSStatement(data);
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

    this.loadingCtrl.create({ message: "Updating your Equities Funds" }).then((loadingEl) => {
      reader.onload = () => {
        this.nsdlFilepicker.nativeElement.value = ""; //reset the input
        this.pdfService
          .readPdf(reader.result)
          .then((data) => {
            loadingEl.present();
            let equities: Equity[] = this.pdfService.parseNSDLStatement(data);
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
}
