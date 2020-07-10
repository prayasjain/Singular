import * as moment from "moment";

export class Utils {
  public static getDateFromString(rawData: string): Date {
    if (!moment(rawData.trim(), "DD-MMM-yyyy").isValid()) {
      return;
    }
    return moment(rawData.trim(), "DD-MMM-yyyy").toDate();
  }

  public static validNumber(str: string): boolean {
    return !isNaN(+str.trim().split(',').join(''));
  }

  public static isValidFolio(str: string) : boolean{
    let data = str.trim();
    if (isNaN(+data)) {
      return false;
    }
    if (data.includes(',') || data.includes('.')) {
      return false;
    }
    return true;
  }
}

export interface CAMSJSON {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}
