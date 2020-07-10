import { Injectable } from "@angular/core";
import * as pdfjsLib from "pdfjs-dist";
import * as PDFJS from "pdfjs-dist/build/pdf";
import { AlertController } from "@ionic/angular";
import { MutualFunds, Asset, AssetType } from "../home/assets/asset.model";
import { AssetsService } from "../home/assets/assets.service";
import { take, switchMap } from "rxjs/operators";
import { Observable, of, zip } from "rxjs";
import { CAMS1Parser } from "./cams1Parser";
import { CAMS2Parser } from "./cams2Parser";
import { CAMSJSON } from "./utils";

@Injectable({
  providedIn: "root",
})
export class PdfService {
  constructor(
    private alertCtrl: AlertController,
    private assetsService: AssetsService
  ) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${
      (PDFJS as any).version
    }/pdf.worker.min.js`;
  }

  public async readPdf(data): Promise<any> {
    // docs https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html
    const getDoc = pdfjsLib.getDocument({ data: data }); // json property password: password to input pass word directly

    getDoc.onPassword = async (callback, reason) => {
      //reason : 1 is first time, 2 is incorrect password
      let passwordData = await this.getPassword(reason !== 1);
      if (passwordData.role === "cancel" || passwordData.role === "backdrop") {
        return;
      } else {
        callback(passwordData.data.values.password);
      }
    };
    const pdf = await getDoc.promise;

    const countPromises = []; // collecting all page promises
    for (let i = 1; i <= pdf._pdfInfo.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      countPromises.push(...textContent.items);
      //countPromises.push(textContent.items.map((s) => s.str).join("<>"));
    }

    const pageContents = await Promise.all(countPromises);
    //return JSON.stringify(pageContents);
    return pageContents;
  }

  async getPassword(incorrect: boolean) {
    let alert = await this.alertCtrl.create({
      header: incorrect ? "Incorrect! Try Again" : "Enter Password",
      inputs: [
        {
          name: "password",
          placeholder: "Password",
          type: "password",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (data) => {},
        },
        {
          text: "Enter",
          handler: (data) => {},
        },
      ],
    });
    alert.present();
    return alert.onDidDismiss();
  }

  parseCAMSStatement(jsonData: CAMSJSON[]): MutualFunds[] {
    let camsFormat: number = this.getCAMSFormat(jsonData);
    if (!camsFormat) {
      return;
    }
    if (camsFormat === 1) {
      return CAMS1Parser.parseCAMSFormat(jsonData);
    }
    if (camsFormat === 2) {
      return CAMS2Parser.parseCAMSFormat(jsonData);
    }
  }

  getCAMSFormat(jsonData: CAMSJSON[]): number {
    let oldIdentifier: CAMSJSON = jsonData.find(
      (data) =>
        data.height === 17.19 &&
        data.str.trim() === "Consolidated Account Statement"
    );
    if (oldIdentifier) {
      return 1;
    }
    let newIdentifier: CAMSJSON = jsonData.find(
      (data) =>
        data.height === 16 &&
        data.str.trim() === "Mutual Fund Consolidated Account Statement"
    );
    if (newIdentifier) {
      return 2;
    }
    return 0;
  }

  saveMutualFunds(mutualFunds) {
    return this.assetsService.userAssets.pipe(
      take(1),
      switchMap((userAssets) => {
        let observableList: Observable<any>[] = [];
        mutualFunds.forEach((newFund) => {
          let updatedAsset = this.findOldMutualFund(userAssets, newFund);
          if (updatedAsset) {
            // just update the amount of the current value, units
            updatedAsset.mutualFunds.currentValue = newFund.currentValue;
            updatedAsset.mutualFunds.units = newFund.units;
            observableList.push(
              this.assetsService.updateUserAssets([updatedAsset])
            );
          } else {
            observableList.push(
              this.assetsService.addUserAsset(
                new Asset(Math.random().toString(), newFund, 1)
              )
            );
          }
        });
        return observableList.length === 0
          ? of([])
          : zip(...observableList).pipe(
              switchMap(() => {
                return this.assetsService.fetchUserAssets();
              })
            );
      })
    );
  }

  findOldMutualFund(userAssets: Asset[], mutualFund: MutualFunds) {
    for (let oldAccount of userAssets) {
      if (oldAccount.assetType !== AssetType.MutualFunds) {
        continue;
      }
      let oldFolioNo: string = oldAccount.mutualFunds.folioNo;
      let newFolioNo: string = mutualFund.folioNo;
      if (!oldFolioNo || !newFolioNo) {
        continue;
      }
      if (
        oldFolioNo.trim().split(" ").join("") ===
        newFolioNo.trim().split(" ").join("")
      ) {
        return oldAccount;
      }
    }
  }
}
