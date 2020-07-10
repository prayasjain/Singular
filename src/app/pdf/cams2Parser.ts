import { PDFJSON, Utils } from "./utils";
import { MutualFunds } from "../home/assets/asset.model";

export class CAMS2Parser {
  public static parseCAMSFormat(jsonData: PDFJSON[]): MutualFunds[] {
    let mutualFunds: MutualFunds[] = [];
    let tableHeadingIndex: number = jsonData.findIndex((data) =>
      data.str.trim().startsWith("Summary of Transacted Folios as on")
    );
    if (tableHeadingIndex === -1) {
      return;
    }
    let statementData = jsonData[tableHeadingIndex].str.trim().split(" ");
    let statementDate = Utils.getDateFromString(
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

    let endingIndex = jsonData.findIndex(
      (data) => data.str.trim() === "Grand Total"
    );
    endingIndex = endingIndex === -1 ? jsonData.length : endingIndex;
    return this.extractMutualFunds(
      jsonData,
      headings,
      headingsData.index + 1,
      endingIndex
    );
  }

  public static getCAMSFormat2Headings(
    jsonData: PDFJSON[],
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

  public static extractMutualFunds(
    jsonData: PDFJSON[],
    headings: string[],
    startIndex: number,
    endIndex: number
  ): MutualFunds[] {
    let unitIndex: number;
    let nameIndex: number;
    let costPriceIndex: number; // this is total
    let currentPriceIndex: number; // this is per unit

    let folioPosition = headings.findIndex((h) => h === "folio no");
    unitIndex = headings.findIndex((h) => h === "closing units");
    nameIndex = headings.findIndex((h) => h === "scheme name");
    costPriceIndex = headings.findIndex((h) => h === "cost value");
    currentPriceIndex = headings.findIndex((h) => h === "nav");
    if (
      folioPosition === -1 ||
      unitIndex === -1 ||
      nameIndex === -1 ||
      costPriceIndex === -1 ||
      currentPriceIndex === -1
    ) {
      return;
    }
    unitIndex = unitIndex - folioPosition;
    nameIndex = nameIndex - folioPosition;
    costPriceIndex = costPriceIndex - folioPosition;
    currentPriceIndex = currentPriceIndex - folioPosition;

    let maxIndex: number = Math.max(
      0,
      unitIndex,
      nameIndex,
      costPriceIndex,
      currentPriceIndex
    );

    let mutualFunds: MutualFunds[] = [];

    for (let i = startIndex; i < endIndex - maxIndex; i++) {
      let data = jsonData[i];
      if (data.height !== 6 || !Utils.isValidFolio(data.str)) {
        continue;
      }
      let folioNo: string = data.str.trim();
      let schemeNameAndExtra = this.getSchemeName(jsonData, i, nameIndex);
      let schemeName: string = schemeNameAndExtra?.schemeName;
      let schemeExtra: number = schemeNameAndExtra? schemeNameAndExtra.schemeExtraFields : 0;
      let units: number = +jsonData[i + unitIndex + schemeExtra].str
        .trim()
        .split(",")
        .join("");
      let costPrice: number =
        +jsonData[i + costPriceIndex + schemeExtra].str
          .trim()
          .split(",")
          .join("") / units;
      let currentPrice: number = +jsonData[
        i + currentPriceIndex + schemeExtra
      ].str
        .trim()
        .split(",")
        .join("");

      if (
        folioNo &&
        schemeName &&
        !isNaN(units) &&
        !isNaN(costPrice) &&
        !isNaN(currentPrice)
      ) {
        mutualFunds.push(
          new MutualFunds(schemeName, units, costPrice, currentPrice, folioNo)
        );
        i = i + maxIndex;
      }
    }
    return mutualFunds;
  }

  public static getSchemeName(
    jsonData: PDFJSON[],
    folioIndex: number,
    nameOffset
  ): { schemeName: string; schemeExtraFields: number } {
    let start: number = folioIndex + nameOffset;
    let schemeName: string = "";
    while (start < jsonData.length && !Utils.validNumber(jsonData[start].str)) {
      schemeName = schemeName + jsonData[start].str;
      start += 1;
    }
    if (schemeName !== "") {
      return {
        schemeName: schemeName,
        schemeExtraFields: start - folioIndex - nameOffset - 1,
      };
    }
  }
}
