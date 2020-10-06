
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { DebtPageRoutingModule } from './debt-routing.module';

import { DebtPage } from './debt.page';
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
    DebtPageRoutingModule,
    SharedModule,
    MatMenuModule,
    DropDownListModule,
    GridModule,
    MatTableModule
  ],
  declarations: [DebtPage],
  exports: [DebtPage]
})
export class DebtPageModule {}
