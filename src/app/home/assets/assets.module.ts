import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetsPageRoutingModule } from './assets-routing.module';

import { AssetsPage } from './assets.page';
import { SharedModule } from '../shared.module';
import { AssetComponent } from './asset/asset.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetsPageRoutingModule,
    SharedModule
  ],
  declarations: [AssetsPage, AssetComponent]
})
export class AssetsPageModule {}
