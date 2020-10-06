import {PDFJSON, Utils} from './utils'
import { MutualFunds } from '../home/assets/asset.model';

export class CAMS1Parser {
  public static parseCAMSFormat(jsonData: PDFJSON[]): MutualFunds[] {
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

  public static getFundName(jsonData: PDFJSON[], endIndex: number): string {
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
    let code = fundName.split('-')[0].trim();
    if (code.length < 5) {
      let splits = fundName.split('-');
      fundName = splits.slice(1, splits.length).join('-');
    }
    return fundName;
  }

  public static getFundPricePerUnitAndDate(
    jsonData: PDFJSON[],
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
            .split(",")
            .join(""),
          date: Utils.getDateFromString(split[0]),
          index: j,
        };
      }
      j = j + 1;
    }
  }

  public static getFundQty(
    jsonData: PDFJSON[],
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
          qty: +split[split.length - 1].trim().split(",").join(""),
          index: j,
        };
      }
      j = j + 1;
    }
  }

  public static getFolioNo(
    jsonData: PDFJSON[],
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
        return {
          folioNo: split[split.length - 1].split("/")[0].trim(),
          index: j,
        };
      }
      j = j + 1;
    }
  }
}
