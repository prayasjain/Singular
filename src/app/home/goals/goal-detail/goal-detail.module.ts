import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoalDetailPageRoutingModule } from './goal-detail-routing.module';

import { GoalDetailPage } from './goal-detail.page';
import { SharedModule } from '../../shared.module';
import { ContributionModalComponent } from '../contribution-modal/contribution-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoalDetailPageRoutingModule,
    SharedModule
  ],
  declarations: [GoalDetailPage, ContributionModalComponent]
})
export class GoalDetailPageModule {}
