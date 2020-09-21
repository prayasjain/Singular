import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SharedModule } from './shared.module';
import { MatMenuModule } from '@angular/material/menu';
import { ExportAssetsModule } from '../export-assets/export-assets.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule,
    MatMenuModule,
    ExportAssetsModule
  ],
  declarations: [HomePage]
})
export class HomePageModule { }
