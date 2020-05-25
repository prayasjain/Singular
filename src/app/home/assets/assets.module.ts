import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssetsPageRoutingModule } from './assets-routing.module';

import { AssetsPage } from './assets.page';
import { AssetComponent } from './asset/asset.component';
import { AddNewComponent } from '../add-new/add-new.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetsPageRoutingModule
  ],
  declarations: [AssetsPage, AssetComponent, AddNewComponent]
})
export class AssetsPageModule {}
