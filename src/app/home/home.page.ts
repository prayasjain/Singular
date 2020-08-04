import { Component } from '@angular/core';
import { AssetType } from './assets/asset.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  goals = false;
  assets = true;
  constructor() { }

  OTHERS = AssetType.Others;
  toggleAssets() {
    this.assets = true;
    this.goals = false;
  }

  toggleGoals() {
    this.assets = false;
    this.goals = true;
  }
}
