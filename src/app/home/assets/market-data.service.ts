import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { AssetType } from "./asset.model";
import { of } from "rxjs";

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
  //type: AssetType;
  //price: number;
  //isin: string;
  equity: {
    id: string;
    symbol: string;
    isin: string;
  };
  mutualfund: {
    id: string;
    mstarId: string;
    isin: string;
  };
}

export interface PriceData {
  key: string;
  nav: number;
  //todo convert this to date
  navDate: string;
  //isin: string;
}

@Injectable({
  providedIn: "root",
})
export class MarketDataService {
  constructor(private http: HttpClient) {}

  getData(searchString: string, assetType: AssetType) {
    let searchURL: string;
    let assetTypeSearch: string;

    if (assetType === AssetType.Equity) {
      //   searchURL = `https://indiawealth.in/api/v1/explore/stocks/?type=all&sortKey=mCap&sortOrder=desc&offset=0&limit=20&category=all&searchFor=${searchString}`;
      assetTypeSearch = "Equities";
    } else if (assetType === AssetType.MutualFunds) {
      assetTypeSearch = "MutualFunds";
      //searchURL = `https://indiawealth.in/api/v1/funds/getList/?offset=0&limit=20&fundname=${searchString}`;
    } else {
      return;
    }

    // backend add isin number and price fetch
    //searchURL = `http://backend-env.eba-n6hdgzkz.us-east-2.elasticbeanstalk.com/api/finance/autocomplete?searchKey=${searchString}`;

    searchURL = `https://limitless-ridge-19843.herokuapp.com/api/finance/autocomplete?searchKey=${searchString}&assetType=${assetTypeSearch}`;
    return this.http.get(searchURL).pipe(
      map((data) => {
        if (!data.hasOwnProperty("data")) {
          return [];
        }

        let autoCompleteData: AutoCompleteData[] = [];
        data["data"].forEach((d) => {
          if (assetType === AssetType.Equity) {
            autoCompleteData.push({
              name: d["name"],
              equity: { id: d["id"], symbol: d["symbol"], isin: d["isin"] },
              mutualfund: null,
            });
          } else if (assetType === AssetType.MutualFunds) {
            autoCompleteData.push({
              name: d["name"],
              mutualfund: { id: d["id"], mstarId: d["mstarId"], isin: d["isin"] },
              equity: null,
            });
          }
        })
        
        // // if (assetType === AssetType.Equity) {
        // //   let stocks: AutoCompleteStock[] = data["data"];
        // //   autoCompleteData = stocks.map((stock) => {
        // //     return { name: stock.name, price: stock.price, isin: stock.isin };
        // //   });
        // // } else if (assetType === AssetType.MutualFunds) {
        // //   let mutualfunds: AutoCompleteMF[] = data["data"];
        // //   autoCompleteData = mutualfunds.map((mf) => {
        // //     return { name: mf.name, price: mf.nav, isin: null };
        // //   });
        // // }
        // if (data.hasOwnProperty("autcomplete")) {
        //   data["autcomplete"].forEach((d) => {
        //     autoCompleteData.push({ name: d.name, type: d.type === "S" ? AssetType.Equity : AssetType.MutualFunds });
        //   });
        // }
        return autoCompleteData;
      })
    );
  }

  getPrice(keys: string[], assetType: AssetType) {
    let searchURL: string;
    let assetSearchKey: string;
    if (assetType == AssetType.Equity) {
      assetSearchKey = "Equities"
    }
    else if (assetType == AssetType.MutualFunds) {
      assetSearchKey = "MutualFunds"
    } else {
      return of([]);
    }
    if (keys.length === 0) {
      return of([]);
    }
    searchURL = `https://limitless-ridge-19843.herokuapp.com/api/finance/price?keys=${keys.join(',')}&assetType=${assetSearchKey}`;
    return this.http.get(searchURL).pipe(
      map((data) => {
        let priceData: PriceData[] = [];
        if (data.hasOwnProperty("data")) {
          data["data"].forEach((d) => {
            priceData.push({ key: d.key, nav: d.nav, navDate: d.navDate });
          });
        }
        return priceData;
      })
    );
  }
}
