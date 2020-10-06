import { Injectable } from "@angular/core";
import * as moment from 'moment';

import {
  Debt,
  DebtType,
  Loan,
  CreditCard,
} from "./debt.model";
import { BehaviorSubject, of, Observable, zip } from "rxjs";
import { take, tap, map, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "src/app/auth/auth.service";
import { Constants } from 'src/app/config/constants';

@Injectable({
  providedIn: "root",
})
export class DebtService {
  private _userDebts = new BehaviorSubject<Debt[]>([]);
  private initializedDebts: boolean = false;
  constructor(private http: HttpClient, private authService: AuthService) { }

  get userDebts(): Observable<Debt[]> {
    if (!this.initializedDebts) {
      this.fetchUserDebts()
        .pipe(take(1))
        .subscribe(() => {
          this.initializedDebts = true;
        });
    }
    return this._userDebts.asObservable();
  }

  fetchUserDebts() {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        return this.http.get(`https://moneyapp-63c7a.firebaseio.com/${auth.uid}-debts.json?auth=${token}`);
      }),
      map((resData) => {
        const debts = [];
        
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            let data = resData[key] as any;
            let debtType = data.debtType;
            let debtTypeCC = debtType.toLowerCase().replace(" ", "");// debtType.charAt(0).toLowerCase() + debtType.slice(1).replace(" ", "");
            let debt: Debt;
            switch (debtType) {
              case DebtType.Loan: {
                debt = new Debt(key, Loan.toObject(data[debtTypeCC]));
                break;
              }
              case DebtType.CreditCard: {
                debt = new Debt(key, CreditCard.toObject(data[debtTypeCC]));
                break;
              }
            }
            debt.userId = data.userId;
            debts.push(debt);
          }
        }
        this._userDebts.next(debts);
        return debts;
      }),
      
      tap((debts) => {
        this._userDebts.next(debts);
      })
    );
  }

  

  getUserDebtsForDebtType(debtType: DebtType) {
    return this.userDebts.pipe(
      map((userDebts) => {
        return userDebts.filter((userDebt) => userDebt.debtType === debtType);
      })
    );
  }

  addUserDebt(userDebt: Debt) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        userDebt.userId = auth.uid;
        return this.http.post<{ name: string }>(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-debts.json?auth=${token}`,
          { ...userDebt, id: null }
        );
      }),
      take(1),
      switchMap((resData) => {
        userDebt.id = resData.name;
        return this.userDebts;
      }),
      take(1),
      map((userDebts) => {
        this._userDebts.next(userDebts.concat(userDebt));
        return userDebt;
      })
    );
  }

  // this is strictly to update asset (no new asset is added or deleted)
  updateUserDebts(newDebts: Debt[]) {
    let auth;
    let authToken;
    let updatedUserDebts;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        authToken = token;
        return this.userDebts;
      }),
      take(1),
      switchMap((userDebts) => {
        if (!userDebts || userDebts.length <= 0) {
          return this.fetchUserDebts();
        }
        return of(userDebts);
      }),
      // mapping the old asset to the new value provided
      map((userDebts) => {
        let updatedDebts = userDebts.map((debt) => newDebts.find((a) => a.id === debt.id) || debt);
        updatedUserDebts = updatedDebts;
        return newDebts;
      }),
      switchMap((debts) => {
        let observableList = debts.map((debt) => {
          return this.http.put(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-debts/${debt.id}.json?auth=${authToken}`,
            { ...debt, id: null }
          );
        });
        if (observableList.length === 0) {
          return of([]);
        }
        return zip(...observableList);
      }),
      tap(() => {
        this._userDebts.next(updatedUserDebts);
      })
    );
  }

  deleteDebt(debtId: string) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        return this.http.delete(`https://moneyapp-63c7a.firebaseio.com/${auth.uid}-debts/${debtId}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.userDebts;
      }),

      take(1),
      switchMap((userDebts) => {
        if (!userDebts || userDebts.length <= 0) {
          return this.fetchUserDebts();
        }
        return of(userDebts);
      }),
      take(1),
      tap((userDebts) => {
        this._userDebts.next(userDebts.filter((a) => a.id !== debtId));
      })
    );
  }
}
