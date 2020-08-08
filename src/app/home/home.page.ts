import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { AssetType } from './assets/asset.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  // boolean vaiable to show or remove the add icon
  goals: boolean;
  assets: boolean;
  constructor(private router: Router) {
    this.checkRoute();
  }

  OTHERS = AssetType.Others;
  //  as the add icon is added to home, this function cross check if we need to display the add icon or not according to the route
  checkRoute() {
    const route = this.router.url;
    if (route.includes('assets')) {
      this.toggleAssets();
    } else {
      if (route.includes('goals')) {
        this.toggleGoals();
      } else {
        this.assets = false;
        this.goals = false;
      }
    }
  }
  //  show the assets add button and remove the goals button
  toggleAssets() {
    this.assets = true;
    this.goals = false;
  }
  //  show the goals add button and remove the assets button
  toggleGoals() {
    this.assets = false;
    this.goals = true;
  }
}
