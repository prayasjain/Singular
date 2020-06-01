import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetDetailPageRoutingModule } from './asset-detail-routing.module';

import { AssetDetailPage } from './asset-detail.page';
import {ItemDetailsComponent} from '../asset-detail/item-details/item-details.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetDetailPageRoutingModule,
    SharedModule,

  ],
  declarations: [AssetDetailPage, ItemDetailsComponent]
})
export class AssetDetailPageModule {}
