import { Injectable } from "@angular/core";
import { Asset, AssetType, AssetTypeLayout } from "./asset.model";
import { BehaviorSubject } from "rxjs";
import { take, tap, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  private _userAssets = new BehaviorSubject<Asset[]>([
    new Asset("1", "Name1","Details1", 1000, AssetType.SavingsAccount),
    new Asset("2", "Name2","Details2", 2000, AssetType.SavingsAccount),
    new Asset("3", "Name3","Details3", 3000, AssetType.Deposits),
    new Asset("4", "Name4","Details4", 4000, AssetType.Deposits),
    new Asset("5", "Name5","Details5", 5000, AssetType.MutualFunds),
    new Asset("6", "Name6","Details6", 6000, AssetType.MutualFunds),
    new Asset("7", "Name7","Details7", 7000, AssetType.Equity),
    new Asset("8", "Name8","Details8", 8000, AssetType.Equity),
    new Asset("9", "Name9","Details9", 9000, AssetType.Cash),
    new Asset("10", "Name10","Details10", 10000, AssetType.Cash),
  ]);

  constructor() {}

  get userAssets() {
    return this._userAssets.asObservable();
  }

  getUserAssetsForAssetType(assetType: AssetTypeLayout) {
    return this._userAssets.asObservable().pipe(
      map((userAssets) => {
        return userAssets.filter((userAsset) => userAsset.assetType === assetType);
      })
    );
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
