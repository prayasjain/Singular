import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AssetsPage } from './assets.page';

const routes: Routes = [
  {
    path: '',
    component: AssetsPage
  },
  {
    path: 'asset-detail/:assetSlug',
    loadChildren: () => import('./asset-detail/asset-detail.module').then(m => m.AssetDetailPageModule)
  },
  {
    path: 'asset-item/:itemId',
    loadChildren: () => import('./asset-item-page/asset-item-page.module').then(m => m.AssetItemPagePageModule)
  },
  {
    path: 'select-asset',
    loadChildren: () => import('./select-asset/select-asset.module').then( m => m.SelectAssetPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetsPageRoutingModule { }
