import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashflowsPage } from './cashflows.page';

const routes: Routes = [
  {
    path: '',
    component: CashflowsPage
  },
  {
    path: 'cashflow-detail/:cashflowId',
    loadChildren: () => import('./cashflow-detail/cashflow-detail.module').then( m => m.CashflowDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashflowsPageRoutingModule {}
