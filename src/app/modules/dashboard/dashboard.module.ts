import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard/dashboard.page';
import { AssetsPageModule } from 'src/app/home/assets/assets.module';
import { GraphComponent } from './graph/graph.component';
import { GoalsPageModule } from 'src/app/home/goals/goals.module';
import { IonicModule } from '@ionic/angular';
import { NgCircleProgressModule } from 'ng-circle-progress';



@NgModule({
  declarations: [DashboardPage, GraphComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AssetsPageModule,
    GoalsPageModule,
    IonicModule,
    NgCircleProgressModule.forRoot()
  ]
})
export class DashboardModule { }
