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

  constructor(
    public currencyService: CurrencyService,
    private assetsUtils: AssetsUtils,
    private assetsService: AssetsService
  ) {}

  ngOnInit() {}

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
