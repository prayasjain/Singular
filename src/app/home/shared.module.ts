import { NgModule } from "@angular/core";
import { AddNewComponent } from "./add-new/add-new.component";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AddNewGoalModalComponent } from "./add-new/add-new-goal-modal/add-new-goal-modal.component";
import { AddNewAssetModalComponent } from "./add-new/add-new-asset-modal/add-new-asset-modal.component";
import { EditGoalComponent } from "./goals/edit-goal/edit-goal.component";
import { SearchPopoverComponent } from "./add-new/add-new-asset-modal/search-popover/search-popover.component";
import {MatExpansionModule} from "@angular/material/expansion"
import {MatSliderModule} from "@angular/material/slider"

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, MatExpansionModule, MatSliderModule],
  declarations: [
    AddNewComponent,
    AddNewGoalModalComponent,
    AddNewAssetModalComponent,
    EditGoalComponent,
    SearchPopoverComponent,
  ],
  exports: [AddNewComponent, AddNewAssetModalComponent, AddNewGoalModalComponent, EditGoalComponent, SearchPopoverComponent],
})
export class SharedModule {}
