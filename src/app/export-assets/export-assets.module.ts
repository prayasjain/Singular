import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportAssetsComponent } from './export-assets/export-assets.component';



@NgModule({
  declarations: [ExportAssetsComponent],
  imports: [
    CommonModule
  ],
  exports: [ExportAssetsComponent]
})
export class ExportAssetsModule { }
