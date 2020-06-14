import { Injectable } from "@angular/core";
import {
  Asset,
  AssetType,
  SavingsAccount,
  Deposits,
  MutualFunds,
  Equity,
  Cash,
  Others,
} from "./asset.model";
import { BehaviorSubject, of, Observable, zip } from "rxjs";
import { take, tap, map, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "src/app/auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  private _userAssets = new BehaviorSubject<Asset[]>([]);
  private initializedAssets: boolean = false;
  constructor(private http: HttpClient, private authService: AuthService) {}

  get userAssets(): Observable<Asset[]> {
    if (!this.initializedAssets) {
      this.fetchUserAssets().pipe(take(1)).subscribe(() => {
        this.initializedAssets = true;
      });
    }
    return this._userAssets.asObservable();
  }

  fetchUserAssets() {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();     
      }),
      take(1),
      switchMap(token => {
        return this.http.get(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets.json?auth=${token}`
        );
      }),
      map((resData) => {
        const assets = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            let data = resData[key] as any;
            let assetType = data.assetType;
            let assetTypeCC =
              (assetType.charAt(0).toLowerCase() + assetType.slice(1).replace(" ", ""));
            let asset: Asset;
            switch (assetType) {
              case AssetType.SavingsAccount: {
                asset = new Asset(
                  key,
                  SavingsAccount.toObject(data[assetTypeCC]),
                  data.percentUnallocated
                );
                break;
              }
              case AssetType.Deposits: {
                asset = new Asset(
                  key,
                  Deposits.toObject(data[assetTypeCC]),
                  data.percentUnallocated
                );
                break;
              }
              case AssetType.MutualFunds: {
                asset = new Asset(
                  key,
                  MutualFunds.toObject(data[assetTypeCC]),
                  data.percentUnallocated
                );
                break;
              }
              case AssetType.Equity: {
                asset = new Asset(
                  key,
                  Equity.toObject(data[assetTypeCC]),
                  data.percentUnallocated
                );
                break;
              }
              case AssetType.Cash: {
                asset = new Asset(
                  key,
                  Cash.toObject(data[assetTypeCC]),
                  data.percentUnallocated
                );
                break;
              }
              case AssetType.Others: {
                asset = new Asset(
                  key,
                  Others.toObject(data[assetTypeCC]),
                  data.percentUnallocated
                );
                break;
              }
            }
            asset.userId = data.userId;
            assets.push(asset);
          }
        }
        return assets;
      }),
      tap((assets) => {
        this._userAssets.next(assets);
      })
    );
  }

  getUserAssetsForAssetType(assetType: AssetType) {
    return this._userAssets.asObservable().pipe(
      map((userAssets) => {
        return userAssets.filter(
          (userAsset) => userAsset.assetType === assetType
        );
      })
    );
  }

  updateAssetAllocation(assetId: string, percentageIncrease: number) {
    let auth: firebase.User;
    let authToken;
    let userAssetsUpdated: Asset[];
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();     
      }),
      take(1),
      switchMap(token => {
        authToken = token;
        return this.userAssets;
      }),
      take(1),
      switchMap((userAssets) => {
        if (!userAssets || userAssets.length <= 0) {
          return this.fetchUserAssets();
        }
        return of(userAssets);
      }),
      switchMap((userAssets) => {
        let index: number = userAssets.findIndex(
          (asset) => asset.id === assetId
        );
        if (index !== -1) {
          let updatedAsset = userAssets[index];
          updatedAsset.percentUnallocated -= percentageIncrease;
          userAssets[index] = updatedAsset;
          userAssetsUpdated = userAssets;
          
          return this.http.put(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets/${assetId}.json?auth=${authToken}`,
            { ...updatedAsset, id: null }
          );
        }
      }),
      tap(() => {
        this._userAssets.next(userAssetsUpdated);
      })
    );
  }

  addUserAsset(userAsset: Asset) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();     
      }),
      take(1),
      switchMap((token) => {
        userAsset.userId = auth.uid;
        return this.http.post<{ name: string }>(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets.json?auth=${token}`,
          { ...userAsset, id: null }
        );
      }),
      take(1),
      switchMap((resData) => {
        userAsset.id = resData.name;
        return this.userAssets;
      }),
      take(1),
      tap((userAssets) => {
        this._userAssets.next(userAssets.concat(userAsset));
      })
    );
  }

  // this is strictly to update asset (no new asset is added or deleted)
  updateUserAssets(newAssets: Asset[]) {
    let auth;
    let authToken;
    let updatedUserAssets;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();     
      }),
      take(1),
      switchMap((token) => {
        authToken = token;
        return this.userAssets;
      }),
      take(1),
      switchMap((userAssets) => {
        if (!userAssets || userAssets.length <= 0) {
          return this.fetchUserAssets();
        }
        return of(userAssets);
      }),
      // mapping the old asset to the new value provided
      map((userAssets) => {
        let updatedAssets = userAssets.map(
          (asset) => newAssets.find((a) => a.id === asset.id) || asset
        );
        updatedUserAssets = updatedAssets;
        return newAssets;
      }),
      switchMap((assets) => {
        let observableList = assets.map((asset) => {
          return this.http
            .put(
              `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets/${asset.id}.json?auth=${authToken}`,
              { ...asset, id: null }
            )
        });
        if (observableList.length === 0) {
          return of([]);
        }
        return zip(...observableList);
      }),
      tap(() => {
        this._userAssets.next(updatedUserAssets);
      })
    );
  }

  deleteAsset(assetId: string) {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();     
      }),
      take(1),
      switchMap((token) => {
        return this.http.delete(
          `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets/${assetId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.userAssets;
      }),

      take(1),
      switchMap((userAssets) => {
        if (!userAssets || userAssets.length <= 0) {
          return this.fetchUserAssets();
        }
        return of(userAssets);
      }),
      take(1),
      tap((userAssets) => {
        this._userAssets.next(userAssets.filter((a) => a.id !== assetId));
      })
    );
  }
}
