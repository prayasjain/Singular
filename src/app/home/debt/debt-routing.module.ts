import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DebtPage } from './debt.page';

const routes: Routes = [
  {
    path: '',
    component: DebtPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DebtPageRoutingModule {}
