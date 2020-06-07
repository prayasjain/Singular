import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetItemPagePage } from './asset-item-page.page';

const routes: Routes = [
  {
    path: '',
    component: AssetItemPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetItemPagePageRoutingModule {}
