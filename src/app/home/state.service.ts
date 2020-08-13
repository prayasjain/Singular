import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AssetType } from './assets/asset.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private _assetType = new BehaviorSubject<AssetType>(AssetType.Others);
  private _addType = new BehaviorSubject<AddType>(AddType.Asset);

  get assetType() {
    return this._assetType.asObservable();
  }

  get addType() {
    return this._addType.asObservable();
  }

  updateAssetType(assetType: AssetType) {
    this._assetType.next(assetType);
  }

  updateAddType(addType: AddType) {
    this._addType.next(addType);
  }

  constructor() { }
}

export enum AddType {
  Asset = "asset",
  Goal = "goal"
}
