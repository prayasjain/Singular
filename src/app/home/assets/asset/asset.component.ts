import { Component, OnInit, Input } from "@angular/core";
import { CurrencyService } from "../../currency/currency.service";
import { take, switchMap } from "rxjs/operators";

@Component({
  selector: "app-asset",
  templateUrl: "./asset.component.html",
  styleUrls: ["./asset.component.scss"],
})
export class AssetComponent implements OnInit {
  @Input() itemColor: string;
  @Input() title: string;
  @Input() value: number;
  @Input() itemLink: string;
  @Input() idNumber: any;

  // these are some pre-defined number for the use case of test(), which controls the sliding item
  hc:number = 50;
  wc:number = 80;
  height:number = 50;
  width:number = 80;

  constructor(public currencyService: CurrencyService) {}

  ngOnInit() {
    if (!this.itemColor) {
      this.itemColor = "tertiary";
    }
  }

  // controls the sliding option of ion-item-sliding and provide some responsive sliding effect
  test(event) {
    // numbers used inside are for controling the size of buttons on the basis of sliding ratio
    if (event.detail.ratio > 0.3 && event.detail.ratio < 0.5) {
      this.height = this.hc + 41.6 * event.detail.ratio;
      this.width = this.wc + 11.33 * event.detail.ratio;
    }
    if (event.detail.ratio < 0.3) {
      this.height = 50;
      this.width = 80;
    }
  }

  cancel() {
    document.querySelector('ion-item-sliding').closeOpened();
  }

  delete(id) {
    const track = '#item' + id;
    document.querySelector(track).classList.add('remove');
  }
}
