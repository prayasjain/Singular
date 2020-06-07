import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetItemPagePageRoutingModule } from './asset-item-page-routing.module';

import { AssetItemPagePage } from './asset-item-page.page';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatMenuModule,
    AssetItemPagePageRoutingModule
  ],
  declarations: [AssetItemPagePage]
})
export class AssetItemPagePageModule {}
