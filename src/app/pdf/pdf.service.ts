import { Injectable } from "@angular/core";
import * as pdfjsLib from "pdfjs-dist";
import * as PDFJS from "pdfjs-dist/build/pdf";
import * as moment from "moment";
import { AlertController } from "@ionic/angular";
import { MutualFunds, Asset, AssetType } from "../home/assets/asset.model";
import { AssetsService } from "../home/assets/assets.service";
import { take, switchMap } from "rxjs/operators";
import { Observable, of, zip } from "rxjs";

interface CAMSJSON {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

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
      return this.parseCAMSFormat1(jsonData);
    }
    if (camsFormat === 2) {
      return this.parseCAMSFormat2(jsonData);
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

  parseCAMSFormat1(jsonData: CAMSJSON[]): MutualFunds[] {
    let mutualFunds: MutualFunds[] = [];
    for (let i = 0; i < jsonData.length; i++) {
      let data = jsonData[i];
      if (!data.str.trim().startsWith("Registrar")) {
        continue;
      }
      // mutual fund name is just before this
      let fundName: string = this.getFundName(jsonData, i - 1);
      if (fundName === "") {
        continue;
      }

      let fundPricePerUnitAndDate = this.getFundPricePerUnitAndDate(
        jsonData,
        i + 1
      );
      let j = Math.max(i, fundPricePerUnitAndDate?.index);
      let fundPricePerUnit: number = fundPricePerUnitAndDate?.pricePerUnit;
      let fundPricePerUnitDate: Date = fundPricePerUnitAndDate?.date; // unused

      let fundQtyAndIndex = this.getFundQty(jsonData, i + 1);
      let fundQty: number = fundQtyAndIndex?.qty;
      j = Math.max(j, fundQtyAndIndex?.index);

      let folioNoAndIndex = this.getFolioNo(jsonData, i + 1);
      let folioNo = folioNoAndIndex?.folioNo;
      j = Math.max(j, folioNoAndIndex?.index);

      if (
        fundName !== "" &&
        !Number.isNaN(fundPricePerUnit) &&
        !Number.isNaN(fundQty) &&
        folioNo &&
        fundPricePerUnitDate !== undefined
      ) {
        i = j;
        mutualFunds.push(
          new MutualFunds(
            fundName,
            fundQty,
            fundPricePerUnit,
            undefined,
            folioNo
          )
        );
      }
    }
    return mutualFunds;
  }

  getFundName(jsonData: CAMSJSON[], endIndex: number): string {
    let fundName: string = "";
    let j = endIndex;
    while (
      j >= 0 &&
      jsonData[j].height === 7.162 &&
      jsonData[j].fontName === "TrebuchetMS"
    ) {
      fundName = jsonData[j].str + fundName;
      j = j - 1;
    }
    return fundName;
  }

  getFundPricePerUnitAndDate(
    jsonData: CAMSJSON[],
    startIndex: number
  ): { pricePerUnit: number; date: Date; index: number } {
    let j = startIndex;
    while (j < jsonData.length) {
      if (
        jsonData[j].height === 6.685 &&
        jsonData[j].fontName === "TrebuchetMS" &&
        jsonData[j].str.trim().startsWith("NAV on")
      ) {
        let split: string[] = jsonData[j].str
          .substr("NAV on".length)
          .trim()
          .split(":");
        let priceAndCurrency = split[split.length - 1].trim().split(" ");
      
        return {
          pricePerUnit: +priceAndCurrency[priceAndCurrency.length - 1]
            .trim()
            .split(',').join(""),
          date: this.getDateFromString(split[0]),
          index: j,
        };
      }
      j = j + 1;
    }
  }

  getFundQty(
    jsonData: CAMSJSON[],
    startIndex: number
  ): { qty: number; index: number } {
    let j = startIndex;
    while (j < jsonData.length) {
      if (
        jsonData[j].height === 6.685 &&
        jsonData[j].fontName === "TrebuchetMS" &&
        jsonData[j].str.trim().startsWith("Closing Unit Balance")
      ) {
        let split: string[] = jsonData[j].str.split(":");
        return {
          qty: +split[split.length - 1].trim().split(',').join(""),
          index: j,
        };
      }
      j = j + 1;
    }
  }

  getFolioNo(
    jsonData: CAMSJSON[],
    startIndex: number
  ): { folioNo: string; index: number } {
    let j = startIndex;
    while (j < jsonData.length) {
      if (
        jsonData[j].height === 7.64 &&
        jsonData[j].fontName === "TrebuchetMS" &&
        jsonData[j].str.trim().startsWith("Folio No")
      ) {
        let split: string[] = jsonData[j].str.split(":");
        return { folioNo: split[split.length - 1].trim(), index: j };
      }
      j = j + 1;
    }
  }

  parseCAMSFormat2(jsonData: CAMSJSON[]): MutualFunds[] {
    let mutualFunds: MutualFunds[] = [];
    let tableHeadingIndex: number = jsonData.findIndex((data) =>
      data.str.trim().startsWith("Summary of Transacted Folios as on")
    );
    if (tableHeadingIndex === -1) {
      return;
    }
    let statementData = jsonData[tableHeadingIndex].str.trim().split(" ");
    let statementDate = this.getDateFromString(
      statementData[statementData.length - 1]
    );
    if (!statementDate) {
      return;
    }

    let headingsData = this.getCAMSFormat2Headings(
      jsonData,
      tableHeadingIndex + 1
    );
    let headings = headingsData.headings;

    // we will index all the data around folio number -> a number without any decimals
    for (let i = headingsData.index + 1; i < jsonData.length; i++) {
      let data = jsonData[i];

      if (data.str.trim().startsWith("")) {
        // mutual fund name is just before this
        let fundName: string = "";
        let j = i - 1;
        while (
          j >= 0 &&
          jsonData[j].height === 7.162 &&
          jsonData[j].fontName === "TrebuchetMS"
        ) {
          fundName = jsonData[j].str + fundName;
          j = j - 1;
        }
        if (fundName === "") {
          continue;
        }
        j = i + 1;
        let fundPricePerUnit: number;
        let fundPricePerUnitDate: Date; // unused
        while (j < jsonData.length) {
          if (
            jsonData[j].height === 6.685 &&
            jsonData[j].fontName === "TrebuchetMS" &&
            jsonData[j].str.trim().startsWith("NAV on")
          ) {
            let split: string[] = jsonData[j].str
              .substr("NAV on".length)
              .split(' ').join("")
              .split(":");
            if (moment(split[0].trim(), "DD-MMM-yyyy").isValid()) {
              fundPricePerUnitDate = moment(
                split[0].trim(),
                "DD-MMM-yyyy"
              ).toDate();
            }
            let priceAndCurrency = split[split.length - 1].trim().split(" ");
            fundPricePerUnit = +priceAndCurrency[priceAndCurrency.length - 1]
              .trim()
              .split(',').join("");
            break;
          }
          j = j + 1;
        }
        j = i + 1;
        let fundQty: number;
        while (j < jsonData.length) {
          if (
            jsonData[j].height === 6.685 &&
            jsonData[j].fontName === "TrebuchetMS" &&
            jsonData[j].str.trim().startsWith("Closing Unit Balance")
          ) {
            let split: string[] = jsonData[j].str.split(":");
            fundQty = +split[split.length - 1].trim().split(',').join("");
            break;
          }
          j = j + 1;
        }
        if (
          fundName !== "" &&
          !Number.isNaN(fundPricePerUnit) &&
          !Number.isNaN(fundQty) &&
          fundPricePerUnitDate !== undefined
        ) {
          i = j;
          mutualFunds.push(
            new MutualFunds(fundName, fundQty, fundPricePerUnit)
          );
        }
      }
    }
    return mutualFunds;
  }

  getCAMSFormat2Headings(
    jsonData: CAMSJSON[],
    startIndex: number
  ): { headings: string[]; index: number } {
    let headings: string[] = [];
    let index = startIndex;
    let expectedHeadings: string[] = [
      "folio no",
      "scheme name",
      "closing units",
      "nav",
      "valuation",
      "cost value",
    ];
    for (let i = startIndex; i < jsonData.length; i++) {
      let str = jsonData[i].str.trim().toLowerCase();
      let match = expectedHeadings.find((heading) => heading === str);
      if (!match) {
        continue;
      }
      headings.push(match);
      if (headings.length === expectedHeadings.length) {
        index = i;
        break;
      }
    }
    return { headings: headings, index: index };
  }

  getDateFromString(rawData: string): Date {
    if (!moment(rawData.trim(), "DD-MMM-yyyy").isValid()) {
      return;
    }
    return moment(rawData.trim(), "DD-MMM-yyyy").toDate();
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
