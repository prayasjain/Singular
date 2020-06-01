import { Injectable } from "@angular/core";
import { Asset, AssetType, SavingsAccount, Deposits, MutualFunds, Equity, Cash } from "./asset.model";
import { BehaviorSubject } from "rxjs";
import { take, tap, map, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  private _userAssets = new BehaviorSubject<Asset[]>([
    new Asset("1", new SavingsAccount("Name1", "Details1", 1000), 0.8),
    new Asset("2", new SavingsAccount("Name2", "Details2", 2000), 0.7),

    new Asset("3", new Deposits("Name3", "Details3", 3000, new Date()), 0.8),
    new Asset("4", new Deposits("Name4", "Details4", 4000, new Date()), 0.6),

    new Asset("5", new MutualFunds("Name5", 5, 1000), 1),
    new Asset("6", new MutualFunds("Name6", 5, 1100), 1),

    new Asset("7", new Equity("Name7", 5, 1100), 1),
    new Asset("8", new Equity("Name8", 5, 1200), 1),

    new Asset("9", new Cash("Name9", 4500), 1),
    new Asset("10", new Cash("Name10", 4200), 1)
  ]);

  constructor() {}

  get userAssets() {
    return this._userAssets.asObservable();
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
    return this.userAssets.pipe(take(1), tap(userAssets => {
      let index: number = userAssets.findIndex(asset => asset.id === assetId);
      if (index !== -1) {
        let updatedAsset = userAssets[index];
        updatedAsset.percentUnallocated -= percentageIncrease;
        userAssets[index] = updatedAsset;
        this._userAssets.next(userAssets);
      }
    }))
  }

  addUserAsset(userAsset: Asset) {
    return this.userAssets.pipe(
      take(1),
      tap((userAssets) => {
        this._userAssets.next(userAssets.concat(userAsset));
      })
    );
  }
}
