import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { AssetsPage } from 'src/app/home/assets/assets.page';
import { GoalsPage } from 'src/app/home/goals/goals.page';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(AssetsPage, { static: true }) assetsgroup: AssetsPage;
  @ViewChild(GoalsPage, { static: true }) goalPage: GoalsPage;

  constructor() { }

  ngOnInit() {
    document.getElementsByTagName('main')[0].style.padding = '0px'
  }

  ngAfterViewInit() {
  }
}
