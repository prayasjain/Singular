import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashflowDetailPageRoutingModule } from './cashflow-detail-routing.module';

import { CashflowDetailPage } from './cashflow-detail.page';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashflowDetailPageRoutingModule,
    SharedModule
  ],
  declarations: [CashflowDetailPage]
})
export class CashflowDetailPageModule {}
