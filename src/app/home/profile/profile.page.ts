import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { take } from "rxjs/operators";
import { ActionSheetController, Platform } from "@ionic/angular";
import { CurrencyService } from '../currency/currency.service';
import { ExportAssetsComponent } from 'src/app/export-assets/export-assets/export-assets.component';
import { AssetsUtils } from '../assets/assets-utils';

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
    private actionSheetCtrl: ActionSheetController,
    public currencyService: CurrencyService,
    private assetsUtils: AssetsUtils
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
    this.assetsUtils.readAccountFromSMS();
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
    this.assetsUtils.onCAMSPicked(event, this.camsFilePicker);
  }

  onNSDLPicked(event: Event) {
    this.assetsUtils.onNSDLPicked(event, this.nsdlFilepicker);
  }
}
