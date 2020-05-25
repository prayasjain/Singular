import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashflowsPageRoutingModule } from './cashflows-routing.module';

import { CashflowsPage } from './cashflows.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashflowsPageRoutingModule
  ],
  declarations: [CashflowsPage]
})
export class CashflowsPageModule {}
