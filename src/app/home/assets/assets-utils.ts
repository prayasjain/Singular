import { LoadingController } from "@ionic/angular";
import { GoalsService } from "../goals/goals.service";
import { take, switchMap } from "rxjs/operators";
import { AssetsService } from "./assets.service";
import { Router } from "@angular/router";
import { Injectable, ElementRef } from "@angular/core";
import { Observable, zip } from "rxjs";
import { SmsService } from 'src/app/sms/sms.service';
import { PdfService } from 'src/app/pdf/pdf.service';
import { MutualFunds, Equity } from './asset.model';

@Injectable({
  providedIn: "root",
})
export class AssetsUtils {
  constructor(
    private assetsService: AssetsService,
    private goalsService: GoalsService,
    private smsService: SmsService,
    private pdfService: PdfService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  deleteAsset(assetId: string) {
    this.loadingCtrl.create({ message: "Deleting your Asset..." }).then((loadingEl) => {
      loadingEl.present();
      this.deleteAssetObservable(assetId).subscribe(() => {
        loadingEl.dismiss();
        this.router.navigateByUrl("/home/tabs/assets");
      });
    });
  }

  deleteAssets(assetIds: string[]) {
    this.loadingCtrl.create({ message: "Deleting your Assets..." }).then((loadingEl) => {
      loadingEl.present();
      zip(...assetIds.map((assetId) => this.deleteAssetObservable(assetId))).subscribe(() => {
        console.log("coming here??");
        loadingEl.dismiss();
        //this.router.navigateByUrl("/home/tabs/assets");
      });
    });
  }

  private deleteAssetObservable(assetId: string): Observable<any> {
    return this.goalsService.deleteContributionsOfAsset(assetId).pipe(
      take(1),
      switchMap(() => {
        return this.assetsService.deleteAsset(assetId);
      })
    );
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

  onCAMSPicked(event: Event, camsFilePicker: ElementRef) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    this.loadingCtrl.create({ message: "Updating your Mutual Funds" }).then((loadingEl) => {
      reader.onload = () => {
        camsFilePicker.nativeElement.value = ""; //reset the input
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

  onNSDLPicked(event: Event, nsdlFilepicker: ElementRef) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    this.loadingCtrl.create({ message: "Updating your Equities Funds" }).then((loadingEl) => {
      reader.onload = () => {
        nsdlFilepicker.nativeElement.value = ""; //reset the input
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
