import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashflowsPage } from './cashflows.page';

const routes: Routes = [
  {
    path: '',
    component: CashflowsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashflowsPageRoutingModule {}
