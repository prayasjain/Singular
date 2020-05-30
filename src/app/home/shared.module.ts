import { NgModule } from '@angular/core';
import { AddNewComponent } from './add-new/add-new.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AddNewModalComponent } from './add-new/add-new-modal/add-new-modal.component';
import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  declarations: [ AddNewComponent, AddNewModalComponent ],
  exports: [ AddNewComponent, AddNewModalComponent]
})
export class SharedModule {}
