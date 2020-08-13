import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { AssetsPage } from 'src/app/home/assets/assets.page';
import { GoalsPage } from 'src/app/home/goals/goals.page';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardPage  implements OnInit, AfterViewInit {
  @ViewChild(AssetsPage, { static: true }) assetsgroup: AssetsPage;
  @ViewChild(GoalsPage, { static: true }) goalPage: GoalsPage;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}
