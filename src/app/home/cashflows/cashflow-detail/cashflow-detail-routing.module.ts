import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashflowDetailPage } from './cashflow-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CashflowDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashflowDetailPageRoutingModule {}
