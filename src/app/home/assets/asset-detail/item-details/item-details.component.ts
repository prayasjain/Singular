import { Component, OnInit, Input } from "@angular/core";
import { CurrencyService } from "src/app/home/currency/currency.service";
import { AssetsUtils } from "../../assets-utils";

@Component({
  selector: "app-assets-item-details",
  templateUrl: "./item-details.component.html",
  styleUrls: ["./item-details.component.scss"],
})
export class ItemDetailsComponent implements OnInit {
  @Input() title: string;
  @Input() content: string;
  @Input() value: number;
  //  @Input() imgUrl: string;
  @Input() id: string;

  // these are some pre-defined number for the use case of test(), which controls the sliding item
  hc: number = 35;
  wc: number = 80;
  height: number = 45;
  width: number = 35;
  constructor(public currencyService: CurrencyService, private assetUtils: AssetsUtils) {}

  ngOnInit() {}

  // controls the sliding option of ion-item-sliding and provide some responsive sliding effect
  listDrag(event) {
    // numbers used inside are for controling the size of buttons on the basis of sliding ratio
    if (event.detail.ratio > 0.3 && event.detail.ratio < 0.5) {
      this.height = this.hc + 41.6 * event.detail.ratio;
      this.width = this.wc + 11.33 * event.detail.ratio;
    }
    if (event.detail.ratio < 0.3) {
      this.height = 45;
      this.width = 80;
    }
  }

  cancel() {
    document.querySelector("ion-item-sliding").closeOpened();
  }

  delete(id) {
    this.assetUtils.deleteAsset(id);
  }
}
