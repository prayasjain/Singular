import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { InsurancePageRoutingModule } from './insurance-routing.module';

import { InsurancePage } from './insurance.page';
import { SharedModule } from '../shared.module';

import { MatMenuModule} from '@angular/material/menu';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import {MatTableModule} from '@angular/material/table';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsurancePageRoutingModule,
    SharedModule,
    MatMenuModule,
    DropDownListModule,
    GridModule,
    MatTableModule
  ],
  declarations: [InsurancePage],
  exports: [InsurancePage]
})
export class InsurancePageModule {}
