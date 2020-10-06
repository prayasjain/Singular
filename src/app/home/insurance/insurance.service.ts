import { Injectable } from "@angular/core";
import * as moment from 'moment';

import {
  Insurance,
  InsuranceType,
  LifeInsurance
} from "./insurance.model";
import { BehaviorSubject, of, Observable, zip } from "rxjs";
import { take, tap, map, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "src/app/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class InsuranceService {
  private _userInsurances = new BehaviorSubject<Insurance[]>([]);
  private initializedInsurances: boolean = false;
  constructor(private http: HttpClient, private authService: AuthService) { }

  get userInsurances(): Observable<Insurance[]> {
    if (!this.initializedInsurances) {
      this.fetchUserInsurances()
        .pipe(take(1))
        .subscribe(() => {
          this.initializedInsurances = true;
        });
    }
    return this._userInsurances.asObservable();
  }

  fetchUserInsurances() {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        return this.http.get(`https://moneyapp-63c7a.firebaseio.com/${auth.uid}-insurances.json?auth=${token}`);
      }),
      map((resData) => {
        const insurances = [];
        
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            let data = resData[key] as any;
            let insuranceType = data.insuranceType;
            let insuranceTypeCC = insuranceType.toLowerCase().replace(" ", "");// insuranceType.charAt(0).toLowerCase() + insuranceType.slice(1).replace(" ", "");
            let insurance: Insurance;
            switch (insuranceType) {
              case InsuranceType.LifeInsurance: {
                insurance = new Insurance(key, LifeInsurance.toObject(data[insuranceTypeCC]));
                break;
              }
            }
            insurance.userId = data.userId;
            insurances.push(insurance);
          }
        }
        this._userInsurances.next(insurances);
        return insurances;
      }),
      
      tap((insurances) => {
        this._userInsurances.next(insurances);
      })
    );
  }

  

  getUserInsurancesForInsuranceType(insuranceType: InsuranceType) {
    return this.userInsurances.pipe(
      map((userInsurances) => {
        return userInsurances.filter((userInsurance) => userInsurance.insuranceType === insuranceType);
      })
    );
  }

  addUserInsurance(userInsurance: Insurance) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        userInsurance.userId = auth.uid;
        return this.http.post<{ name: string }>(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-insurances.json?auth=${token}`,
          { ...userInsurance, id: null }
        );
      }),
      take(1),
      switchMap((resData) => {
        userInsurance.id = resData.name;
        return this.userInsurances;
      }),
      take(1),
      map((userInsurances) => {
        this._userInsurances.next(userInsurances.concat(userInsurance));
        return userInsurance;
      })
    );
  }

  // this is strictly to update asset (no new asset is added or deleted)
  updateUserInsurances(newInsurances: Insurance[]) {
    let auth;
    let authToken;
    let updatedUserInsurances;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        authToken = token;
        return this.userInsurances;
      }),
      take(1),
      switchMap((userInsurances) => {
        if (!userInsurances || userInsurances.length <= 0) {
          return this.fetchUserInsurances();
        }
        return of(userInsurances);
      }),
      // mapping the old asset to the new value provided
      map((userInsurances) => {
        let updatedInsurances = userInsurances.map((insurance) => newInsurances.find((a) => a.id === insurance.id) || insurance);
        updatedUserInsurances = updatedInsurances;
        return newInsurances;
      }),
      switchMap((insurances) => {
        let observableList = insurances.map((insurance) => {
          return this.http.put(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-insurances/${insurance.id}.json?auth=${authToken}`,
            { ...insurance, id: null }
          );
        });
        if (observableList.length === 0) {
          return of([]);
        }
        return zip(...observableList);
      }),
      tap(() => {
        this._userInsurances.next(updatedUserInsurances);
      })
    );
  }

  deleteInsurance(insuranceId: string) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        return this.http.delete(`https://moneyapp-63c7a.firebaseio.com/${auth.uid}-insurances/${insuranceId}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.userInsurances;
      }),

      take(1),
      switchMap((userInsurances) => {
        if (!userInsurances || userInsurances.length <= 0) {
          return this.fetchUserInsurances();
        }
        return of(userInsurances);
      }),
      take(1),
      tap((userInsurances) => {
        this._userInsurances.next(userInsurances.filter((a) => a.id !== insuranceId));
      })
    );
  }
}