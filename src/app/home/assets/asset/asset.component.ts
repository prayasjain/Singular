import { Component, OnInit, Input } from "@angular/core";
import { CurrencyService } from "../../currency/currency.service";
import { take, switchMap } from "rxjs/operators";
import { AssetsUtils } from "../assets-utils";
import { AssetsService } from "../assets.service";
import { AssetType } from "../asset.model";

@Component({
  selector: "app-asset",
  templateUrl: "./asset.component.html",
  styleUrls: ["./asset.component.scss"],
})
export class AssetComponent implements OnInit {
  @Input() title: string;
  @Input() value: number;
  @Input() itemLink: string;
  @Input() assetType: AssetType;

  // these are some pre-defined number for the use case of test(), which controls the sliding item
  hc: number = 35;
  wc: number = 80;
  height: number = 45;
  width: number = 35;

  constructor(
    public currencyService: CurrencyService,
    private assetsUtils: AssetsUtils,
    private assetsService: AssetsService
  ) {}

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

  delete() {
    this.assetsService
      .getUserAssetsForAssetType(this.assetType)
      .pipe(take(1))
      .subscribe((assets) => this.assetsUtils.deleteAssets(assets.map((asset) => asset.id)));
  }
}
