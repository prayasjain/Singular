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
  Gold,
  PPF,
  EPF,
  RealEstate,
} from "./asset.model";
import { BehaviorSubject, of, Observable, zip } from "rxjs";
import { take, tap, map, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "src/app/auth/auth.service";
import { MarketDataService } from "./market-data.service";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  private _userAssets = new BehaviorSubject<Asset[]>([]);
  private _assetHistory = new BehaviorSubject<any[]>([]);
  private initializedAssets: boolean = false;
  private initializedAssetHistory: boolean = false;
  constructor(private http: HttpClient, private authService: AuthService, private marketDataService: MarketDataService) {}

  get userAssets(): Observable<Asset[]> {
    if (!this.initializedAssets) {
      this.fetchUserAssets()
        .pipe(take(1))
        .subscribe(() => {
          this.initializedAssets = true;
        });
    }
    return this._userAssets.asObservable();
  }

  get assetHistory() {
    if (!this.initializedAssetHistory) {
      this.fetchAssetHistory()
        .pipe(take(1))
        .subscribe(() => {
          this.initializedAssetHistory = true;
        });
    }
    return this._assetHistory.asObservable();
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
      switchMap((token) => {
        return this.http.get(`https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets.json?auth=${token}`);
      }),
      map((resData) => {
        const assets = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            let data = resData[key] as any;
            let assetType = data.assetType;
            let assetTypeCC = assetType.charAt(0).toLowerCase() + assetType.slice(1).replace(" ", "");
            let asset: Asset;
            switch (assetType) {
              case AssetType.SavingsAccount: {
                asset = new Asset(key, SavingsAccount.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.Deposits: {
                asset = new Asset(key, Deposits.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.MutualFunds: {
                asset = new Asset(key, MutualFunds.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.Equity: {
                asset = new Asset(key, Equity.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.Cash: {
                asset = new Asset(key, Cash.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.Gold: {
                asset = new Asset(key, Gold.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.PPF: {
                asset = new Asset(key, PPF.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.EPF: {
                asset = new Asset(key, EPF.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.RealEstate: {
                asset = new Asset(key, RealEstate.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
              case AssetType.Others: {
                asset = new Asset(key, Others.toObject(data[assetTypeCC]), data.percentUnallocated);
                break;
              }
            }
            asset.userId = data.userId;
            assets.push(asset);
          }
        }
        this._userAssets.next(assets);
        return assets;
      }),
      // this is commented out because our price is updated hourly
      // directly at backend
      //switchMap((assets) => this.updateAssetsPrice(assets)),
      tap((assets) => {
        this._userAssets.next(assets);
      })
    );
  }

  fetchAssetHistory() {
    let auth;
    return this.authService.authInfo.pipe(
      take(1),
      switchMap((authInfo) => {
        auth = authInfo;
        return authInfo.getIdToken();
      }),
      take(1),
      switchMap((token) => {
        return this.http.get(`https://moneyapp-63c7a.firebaseio.com/${auth.uid}-history.json?auth=${token}`);
      }),
      map((resData) => {
        const history = [];
        for (const date in resData) {
          if (resData.hasOwnProperty(date)) {
            let data = resData[date] as any;
            const assetIdAndNav = [];
            for (const assetId in data) {
              if (data.hasOwnProperty(assetId)) {
                assetIdAndNav.push({
                  assetId: assetId,
                  nav: data[assetId],
                });
              }
            }
            history.push({
              date: new Date(date),
              assets: assetIdAndNav,
            });
          }
        }
        return history;
      }),
      tap((history) => {
        this._assetHistory.next(history);
      })
    );
  }

  getAssetHistory(filterType: string, assetType: AssetType, assetId: string) {
    const assetToTypeMap = new Map<string, AssetType>();
    return this.userAssets.pipe(
      switchMap((assets) => {
        if (!assets || assets.length === 0) {
          return of([]);
        }
        assets.forEach((asset) => {
          assetToTypeMap.set(asset.id, asset.assetType);
        });
        return this.assetHistory;
      }),
      map((assetHistory) => {
        let output = [];
        if (filterType === "all") {
          assetHistory.forEach((history) => {
            if (history.assets.length > 0) {
              let totalNav: number = 0;
              history.assets.forEach((asset) => (totalNav += Number(asset.nav)));
              output.push({
                date: history.date,
                nav: totalNav,
              });
            }
          });
        } else if (filterType === "assetType") {
          assetHistory.forEach((history) => {
            let assetsForType = history.assets.filter((asset) => assetToTypeMap.get(asset.assetId) === assetType);
            if (assetsForType.length > 0) {
              let totalNav: number = 0;
              assetsForType.forEach((asset) => (totalNav += Number(asset.nav)));
              output.push({
                date: history.date,
                nav: totalNav,
              });
            }
          });
        } else if (filterType === "assetId") {
          assetHistory.forEach((history) => {
            let assetsForId = history.assets.find((asset) => asset.assetId === assetId);
            if (assetsForId) {
              output.push({
                date: history.date,
                nav: Number(assetsForId.nav),
              });
            }
          });
        }
        return output;
      })
    );
  }

  updateAssetsPrice(assets: Asset[]): Observable<Asset[]> {
    let equityKeys: string[] = [];
    let mfKeys: string[] = [];
    assets.forEach((asset) => {
      if (asset.assetType === AssetType.Equity && asset.equity.isin) {
        equityKeys.push(asset.equity.isin);
      }
      if (asset.assetType === AssetType.MutualFunds && asset.mutualFunds.mstarId) {
        mfKeys.push(asset.mutualFunds.mstarId);
      }
    });
    return zip(
      this.marketDataService.getPrice(equityKeys, AssetType.Equity).pipe(
        switchMap((priceData) => {
          let updatedAssets: Asset[] = [];
          if (priceData) {
            priceData.forEach((price) => {
              assets
                .filter((asset) => asset.assetType === AssetType.Equity && asset.equity.isin === price.key)
                .forEach((asset) => {
                  if (asset.equity.currentValue && price.nav && Math.abs(asset.equity.currentValue - price.nav) > 1) {
                    updatedAssets.push(asset);
                  }
                  asset.equity.currentValue = price.nav;
                });
            });
          }
          return updatedAssets.length > 0 ? this.updateUserAssets(updatedAssets) : of([]);
        })
      ),
      this.marketDataService.getPrice(mfKeys, AssetType.MutualFunds).pipe(
        switchMap((priceData) => {
          let updatedAssets: Asset[] = [];
          if (priceData) {
            priceData.forEach((price) => {
              assets
                .filter((asset) => asset.assetType === AssetType.MutualFunds && asset.mutualFunds.mstarId === price.key)
                .forEach((asset) => {
                  if (
                    asset.mutualFunds.currentValue &&
                    price.nav &&
                    Math.abs(asset.mutualFunds.currentValue - price.nav) > 1
                  ) {
                    updatedAssets.push(asset);
                  }
                  asset.mutualFunds.currentValue = price.nav;
                });
            });
          }
          return updatedAssets.length > 0 ? this.updateUserAssets(updatedAssets) : of([]);
        })
      )
    ).pipe(map(() => assets));
  }

  getUserAssetsForAssetType(assetType: AssetType) {
    return this.userAssets.pipe(
      map((userAssets) => {
        return userAssets.filter((userAsset) => userAsset.assetType === assetType);
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
      switchMap((userAssets) => {
        let index: number = userAssets.findIndex((asset) => asset.id === assetId);
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
      map((userAssets) => {
        this._userAssets.next(userAssets.concat(userAsset));
        return userAsset;
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
        let updatedAssets = userAssets.map((asset) => newAssets.find((a) => a.id === asset.id) || asset);
        updatedUserAssets = updatedAssets;
        return newAssets;
      }),
      switchMap((assets) => {
        let observableList = assets.map((asset) => {
          return this.http.put(
            `https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets/${asset.id}.json?auth=${authToken}`,
            { ...asset, id: null }
          );
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
        return this.http.delete(`https://moneyapp-63c7a.firebaseio.com/${auth.uid}-assets/${assetId}.json?auth=${token}`);
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
