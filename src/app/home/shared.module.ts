import { NgModule } from '@angular/core';
import { AssetComponent } from './assets/asset/asset.component';
import { AddNewComponent } from './add-new/add-new.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';


@NgModule({
    imports: [CommonModule, IonicModule, RouterModule],
  declarations: [AssetComponent, AddNewComponent ],
  exports: [AssetComponent, AddNewComponent]
})
export class SharedModule {}
