import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { AssetType } from "./asset.model";

export interface AutoCompleteStock {
  category: string;
  change: number;
  companyCode: number;
  exchange: string;
  id: number;
  isin: string;
  mCap: number;
  mfSector: string;
  name: string;
  price: number;
  priceDiff: number;
  sector: string;
  symbol: string;
  volume: number;
}
export interface AutoCompleteMF {
  CashPer: number;
  DebtPer: number;
  EquityPer: number;
  //InvestNow: null
  OthersPer: number;
  //SipDetails: null
  aum: number;
  bearishReturns: { fiveYear: number; oneYear: number; threeYear: number };
  category: string;
  categoryId: number;
  category_group: string;
  expenseRatio: number;
  fundType: string;
  id: number;
  inceptionDate: string;
  isDividend: boolean;
  isFmp: boolean;
  isFmpOpen: boolean;
  lumpsumAllowed: boolean;
  lumpsumMinimum: number;
  //lumpsumMultiplier: null;
  mstarId: string;
  name: string;
  nav: number;
  planType: string;
  projectedReturns: { fiveYear: number; threeYear: number; oneYear: number };
  //rating: null;
  returns: { oneYear: number; threeYear: number; fiveYear: number };
  risk: string;
  scores: { fmScore: number; returnScore: number; riskScore: number; score: number; tagReturn: string; tagRisk: string };
  sipAllowed: boolean;
  //sipMinimum: null
  //sipMultiplier: null
  tagIRSensitivity: string;
  takeCheque: boolean;
  tenure: number;
}

export interface AutoCompleteData {
  name: string;
  price: number;
  isin: string;
}

@Injectable({
  providedIn: "root",
})
export class MarketDataService {
  constructor(private http: HttpClient) {}

  getData(searchString: string, assetType: AssetType) {
    let searchURL: string;
    if (assetType === AssetType.Equity) {
      searchURL = `https://indiawealth.in/api/v1/explore/stocks/?type=all&sortKey=mCap&sortOrder=desc&offset=0&limit=20&category=all&searchFor=${searchString}`;
    } else if (assetType === AssetType.MutualFunds) {
      searchURL = `https://indiawealth.in/api/v1/funds/getList/?offset=0&limit=20&fundname=${searchString}`;
    } else {
      return;
    }
    return this.http.get(searchURL).pipe(
      map((data) => {
        let autoCompleteData: AutoCompleteData[] = [];
        if (assetType === AssetType.Equity) {
          let stocks: AutoCompleteStock[] = data["data"];
          autoCompleteData = stocks.map((stock) => {
            return { name: stock.name, price: stock.price, isin: stock.isin };
          });
        } else if (assetType === AssetType.MutualFunds) {
          let mutualfunds: AutoCompleteMF[] = data["data"];
          autoCompleteData = mutualfunds.map((mf) => {
            return { name: mf.name, price: mf.nav, isin: null };
          });
        }
        return autoCompleteData;
      })
    );
  }
}
