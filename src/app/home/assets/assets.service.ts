import { Injectable } from "@angular/core";
import { Asset, AssetType, AssetTypeLayout } from "./asset.model";
import { BehaviorSubject } from "rxjs";
import { take, tap, map, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  private _userAssets = new BehaviorSubject<Asset[]>([
    new Asset("1", "Name1", "Details1", 1000, AssetType.SavingsAccount, 0.8),
    new Asset("2", "Name2", "Details2", 2000, AssetType.SavingsAccount, 0.7),
    new Asset("3", "Name3", "Details3", 3000, AssetType.Deposits, 0.8),
    new Asset("4", "Name4", "Details4", 4000, AssetType.Deposits, 0.6),
    new Asset("5", "Name5", "Details5", 5000, AssetType.MutualFunds, 1),
    new Asset("6", "Name6", "Details6", 6000, AssetType.MutualFunds, 1),
    new Asset("7", "Name7", "Details7", 7000, AssetType.Equity, 1),
    new Asset("8", "Name8", "Details8", 8000, AssetType.Equity, 1),
    new Asset("9", "Name9", "Details9", 9000, AssetType.Cash, 1),
    new Asset("10", "Name10", "Details10", 10000, AssetType.Cash, 1),
  ]);

  constructor() {}

  get userAssets() {
    return this._userAssets.asObservable();
  }

  getUserAssetsForAssetType(assetType: AssetTypeLayout) {
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
        updatedAsset.percent_unallocated -= percentageIncrease;
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
