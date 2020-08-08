import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { GoalDetailPageRoutingModule } from "./goal-detail-routing.module";
import { GoalDetailPage } from "./goal-detail.page";
import { SharedModule } from "../../shared.module";
import { MatMenuModule } from "@angular/material/menu";
import { EditGoalComponent } from "../edit-goal/edit-goal.component";
// circular progress bar
import { NgCircleProgressModule } from 'ng-circle-progress';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatMenuModule,
    GoalDetailPageRoutingModule,
    SharedModule,
    NgCircleProgressModule.forRoot({ })
  ],
  declarations: [GoalDetailPage],
})
export class GoalDetailPageModule {}
