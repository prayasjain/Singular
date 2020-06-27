import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { BehaviorSubject, from } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CurrencyService {
  constructor() {}

  private _currency = new BehaviorSubject<string>("INR");

  get currency() {
    return this._currency.asObservable();
  }

  setCurrency(newCurrency: string) {
    this.storeCurrencyData(newCurrency);
    this._currency.next(newCurrency);
  }

  private storeCurrencyData(currency: string) {
    const data = JSON.stringify({
      currency: currency,
    });
    Plugins.Storage.set({ key: "currencyData", value: data });
  }

  fetchCurrency() {
    return from(Plugins.Storage.get({ key: "currencyData" })).pipe(
      map((currencyData) => {
        if (!currencyData || !currencyData.value) {
          return;
        }
        let newCurrency = (JSON.parse(currencyData.value) as {
          currency: string;
        }).currency;
        this._currency.next(newCurrency);
        return newCurrency;
      })
    );
  }

  getLocaleForCurrency(currency: string) {
    if (currency === "INR") {
      return "en-IN";
    }
    return "en-US";
  }
}
