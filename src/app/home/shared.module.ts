import { NgModule } from '@angular/core';
import { AddNewComponent } from './add-new/add-new.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';


@NgModule({
    imports: [CommonModule, IonicModule, RouterModule],
  declarations: [ AddNewComponent ],
  exports: [ AddNewComponent]
})
export class SharedModule {}
