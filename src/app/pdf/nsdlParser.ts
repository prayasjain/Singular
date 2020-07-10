import { PDFJSON, Utils } from "./utils";
import { Equity } from "../home/assets/asset.model";

export class NSDLParser {
  public static parseNSDLStatement(jsonData: PDFJSON[]): Equity[] {
    let headingIndex = jsonData.findIndex(
      (data) => data.height === 18 && data.str.trim() === "Equities (E)"
    );
    if (headingIndex === -1) {
      return;
    }
    let holdingsDate: Date = this.getHoldingsDate(jsonData);
    if (!holdingsDate) {
      return;
    }
    let headings = this.getNSDLFormatHeadings(jsonData, headingIndex + 1);
    if (!headings || headings.headings.length !== 6) {
      return;
    }

    let startIndex = headings.index + 1
    let endingIndex = startIndex + jsonData.slice(startIndex).findIndex(
      (data) => data.str.trim() === "Sub Total" && data.height === 10
    );
    endingIndex = endingIndex === -1 ? jsonData.length : endingIndex;
    return this.extractEquities(
      jsonData,
      headings.headings,
      startIndex,
      endingIndex
    );

  }

  public static getHoldingsDate(jsonData: PDFJSON[]) : Date {
    let holdingsHeadingIndex = jsonData.findIndex(
      (data) => data.height === 18 && data.str.trim() === "Holdings"
    );
    if (holdingsHeadingIndex === -1) {
      return;
    }
    let i = holdingsHeadingIndex + 1;
    while(i < jsonData.length) {
      if (jsonData[i].height === 7 && jsonData[i].str.trim().startsWith('as on')) {
        let splits = jsonData[i].str.trim().split(" ");
        let date : Date = Utils.getDateFromString(splits[splits.length - 1]);
        if (date) {
          return date;
        }
      }
      i = i + 1;
    }
  }

  public static getNSDLFormatHeadings(
    jsonData: PDFJSON[],
    startIndex: number
  ): { headings: string[]; index: number } {
    let headings: string[] = [];
    let index = startIndex;
    let expectedHeadings: string[] = [
      "isin",
      "stock symbol",
      "company name",
      "face value",
      "shares",
      "price in",
    ];
    for (let i = startIndex; i < jsonData.length; i++) {
      let str = jsonData[i].str.trim().toLowerCase();
      let match = expectedHeadings.find((heading) => str === heading);
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

  public static extractEquities(jsonData: PDFJSON[], headings: string[], startIndex: number, endIndex: number) : Equity[] {
    let unitIndex: number;
    let nameIndex: number;
    let priceIndex: number; // this is per unit

    let isinPosition = headings.findIndex((h) => h === "isin");
    unitIndex = headings.findIndex((h) => h === "shares");
    nameIndex = headings.findIndex((h) => h === "company name");
    priceIndex = headings.findIndex((h) => h === "price in");
    if (
      isinPosition === -1 ||
      unitIndex === -1 ||
      nameIndex === -1 ||
      priceIndex === -1
    ) {
      return;
    }
    unitIndex = unitIndex - isinPosition;
    nameIndex = nameIndex - isinPosition;
    priceIndex = priceIndex - isinPosition;

    let maxIndex: number = Math.max(
      0,
      unitIndex,
      nameIndex,
      priceIndex
    );

    let equities: Equity[] = [];
    for (let i = startIndex; i < endIndex - maxIndex; i++) {
      let data = jsonData[i];
      if (data.height !== 7 || !Utils.isValidISIN(data.str)) {
        continue;
      }
      let isinNo: string = data.str.trim();
      
      let companyNameAndExtra = this.getCompanyName(jsonData, i, nameIndex);
      let companyName: string = companyNameAndExtra?.companyName;
      let nameExtra: number = companyNameAndExtra? companyNameAndExtra.extraFields : 0;
      let units: number = +jsonData[i + unitIndex + nameExtra].str
        .trim()
        .split(",")
        .join("");
      let price: number =
        +jsonData[i + priceIndex + nameExtra].str
          .trim()
          .split(",")
          .join("");
      if (
        isinNo &&
        companyName &&
        !isNaN(units) &&
        !isNaN(price)
      ) {
        equities.push(
          new Equity(companyName, units, price, undefined, isinNo)
        );
        i = i + maxIndex;
      }
    }
    return equities;
  }

  public static getCompanyName(
    jsonData: PDFJSON[],
    isinIndex: number,
    nameOffset
  ): { companyName: string; extraFields: number } {
    let start: number = isinIndex + nameOffset;
    let companyName: string = "";
    while (start < jsonData.length && !Utils.validNumber(jsonData[start].str) && !Utils.isValidISIN(jsonData[start].str)) {
      companyName = companyName + jsonData[start].str;
      start += 1;
    }
    if (companyName !== "") {
      return {
        companyName: companyName,
        extraFields: start - isinIndex - nameOffset - 1,
      };
    }
  }
}
