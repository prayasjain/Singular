import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { AssetType } from "../../../assets/asset.model";
import { MarketDataService, AutoCompleteData } from "src/app/home/assets/market-data.service";
import { Observable, of } from "rxjs";

@Component({
  templateUrl: "./search-popover.component.html",
  styleUrls: ["./search-popover.component.scss"],
})
export class SearchPopoverComponent implements OnInit {
  @Input() assetType: AssetType;
  searchPlaceholder: string = "";
  searchList: Observable<AutoCompleteData[]>;
  @ViewChild("searchbar", { static: false }) searchbar: any;

  constructor(private modalCtrl: ModalController, private marketDataService: MarketDataService) {}

  ngOnInit() {
    if (this.assetType === AssetType.Equity) {
      this.searchPlaceholder = "Search Equities";
    } else if (this.assetType === AssetType.MutualFunds) {
      this.searchPlaceholder = "Search Mutual Funds";
    }

    setTimeout(() => {
      this.searchbar.setFocus();
    }, 500);
  }

  cancelPopover() {
    this.modalCtrl.dismiss(null, "cancel");
  }

  searchChange(event) {
    let searchKey: string = event.detail.value;
    searchKey = searchKey.trim().toLowerCase();
    if (searchKey.length <= 2) {
      return;
    }
    this.searchList = this.marketDataService.getData(searchKey, this.assetType);
  }

  submitData(data: AutoCompleteData) {
    this.modalCtrl.dismiss(data, "confirm");
  }

  // abbreviateAssetType(assetType: AssetType) {
  //   if (assetType === AssetType.Equity) {
  //     return "EQ";
  //   }
  //   if (assetType === AssetType.MutualFunds) {
  //     return "MF";
  //   }
  // }
}
