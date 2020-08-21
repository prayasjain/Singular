import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectAssetPageRoutingModule } from './select-asset-routing.module';

import { SelectAssetPage } from './select-asset.page';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelectAssetPageRoutingModule,
    SharedModule
  ],
  declarations: [SelectAssetPage]
})
export class SelectAssetPageModule {}
