import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectAssetPage } from './select-asset.page';

const routes: Routes = [
  {
    path: '',
    component: SelectAssetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectAssetPageRoutingModule {}
