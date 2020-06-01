import { NgModule } from '@angular/core';
import { AddNewComponent } from './add-new/add-new.component';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddNewGoalModalComponent } from './add-new/add-new-goal-modal/add-new-goal-modal.component';
import { AddNewAssetModalComponent } from './add-new/add-new-asset-modal/add-new-asset-modal.component';


@NgModule({
    imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  declarations: [ AddNewComponent, AddNewGoalModalComponent, AddNewAssetModalComponent ],
  exports: [ AddNewComponent, AddNewAssetModalComponent, AddNewGoalModalComponent]
})
export class SharedModule {}
