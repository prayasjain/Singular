import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { AssetDetailPageRoutingModule } from "./asset-detail-routing.module";

import { AssetDetailPage } from "./asset-detail.page";
import { ItemDetailsComponent } from "../asset-detail/item-details/item-details.component";
import { SharedModule } from "../../shared.module";

import { AvatarModule } from "ngx-avatar";
import { ChartsModule } from 'ng2-charts';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetDetailPageRoutingModule,
    SharedModule,
    AvatarModule,
    ChartsModule
  ],
  declarations: [AssetDetailPage, ItemDetailsComponent],
})
export class AssetDetailPageModule {}
