import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashflowsPageRoutingModule } from './cashflows-routing.module';

import { CashflowsPage } from './cashflows.page';
import { SharedModule } from '../shared.module';
import { CashflowComponent } from './cashflow/cashflow.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashflowsPageRoutingModule,
    SharedModule
  ],
  declarations: [CashflowsPage, CashflowComponent]
})
export class CashflowsPageModule {}
