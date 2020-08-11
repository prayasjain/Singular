import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AssetsPageModule } from 'src/app/home/assets/assets.module';
import { GraphComponent } from './graph/graph.component';
import { GoalsPageModule } from 'src/app/home/goals/goals.module';


@NgModule({
  declarations: [DashboardComponent, GraphComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    AssetsPageModule,
    GoalsPageModule
  ]
})
export class DashboardModule { }
