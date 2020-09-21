import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { AssetsService } from "./assets.service";
import { Asset, AssetType, AssetTypeUtils } from "./asset.model";
import { Subscription, zip, of } from "rxjs";
import { take, tap, switchMap, map } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from "../currency/currency.service";
import { MarketDataService, PriceData } from "./market-data.service";
import { StateService, AddType } from "../state.service";
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { EditService, ToolbarService, PageService, NewRowPosition } from '@syncfusion/ej2-angular-grids';
import { ChangeEventArgs, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';

interface AssetGroup {
  assetType: AssetType;
  amount: number;
}

@Component({
  selector: "app-assets",
  templateUrl: "./assets.page.html",
  styleUrls: ["./assets.page.scss"],
  providers: [ToolbarService, EditService, PageService]
})
export class AssetsPage implements OnInit, OnDestroy {
  user: firebase.User;
  userAssets: Asset[] = [];
  assetsSub: Subscription;
  assetGroups: AssetGroup[] = [];
  totalAmount: number;
  currentDate: Date;
  currentAssetGroup: AssetGroup;
  totalAmountByAssetType = new Map();
  constructor(
    private assetsService: AssetsService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    public currencyService: CurrencyService,
    private stateService: StateService
  ) {}

  colorNo = 0;
  AssetType = AssetType;

  @ViewChild('ddsample')
    public dropDown: DropDownListComponent;
    public data: Object[] = [];
    public editSettings: Object;
    public toolbar: string[];
    public orderidrules: Object;
    public customeridrules: Object;
    public freightrules: Object;
    public editparams: Object;
    public pageSettings: Object;
    public formatoptions: Object;

  async ngOnInit() {
    this.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true , newRowPosition: 'Top' };
    this.toolbar = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];
    this.orderidrules = { required: true };//{ required: true, number: true };
    this.customeridrules = { required: true };
    this.freightrules = { required: true };
    this.editparams = { params: { popupHeight: '300px' } };
    this.pageSettings = { pageCount: 5 };
    this.formatoptions = { type: 'dateTime', format: 'M/d/y hh:mm a' }
    this.currentDate = new Date();
    this.assetsSub = this.authService.authInfo
      .pipe(
        take(1),
        switchMap((user) => {
          this.user = user;
          return this.assetsService.userAssets;
        }),
        switchMap((userAssets) => {
          this.userAssets = userAssets;
          this.totalAmountByAssetType.clear();
          this.assetGroups = [];

          this.totalAmount = 0;
          let observableList = this.userAssets.map((userAsset) =>
            userAsset.getAmountForAsset(this.currentDate).pipe(
              take(1),
              tap((assetValue) => {
                this.totalAmountByAssetType.set(
                  userAsset.assetType,
                  (this.totalAmountByAssetType.get(userAsset.assetType) || 0) + Number(assetValue)
                );
              })
            )
          );
          if (observableList.length === 0) {
            return of([]);
          }
          return zip(...observableList);
        })
      )
      .subscribe(async () => {
        this.getAmountByGroup();
        this.assetGroups.forEach((assetGroup) => {
          this.totalAmount += Number(assetGroup.amount);
        });
        if (this.assetGroups && this.assetGroups.length > 0) {
          await this.changeCurrentSelectedAsset(this.assetGroups[0]);
        }
      });
  }

public newRowPosition: { [key: string]: Object }[] = [
    { id: 'Top', newRowPosition: 'Top' },
    { id: 'Bottom', newRowPosition: 'Bottom' }
];
public localFields: Object = { text: 'newRowPosition', value: 'id' };

public onChange(e: ChangeEventArgs): void {
    let gridInstance: any = (<any>document.getElementById('Normalgrid')).ej2_instances[0];
    (gridInstance.editSettings as any).newRowPosition = <NewRowPosition>this.dropDown.value;
}

actionBegin(args: any) :void {
    let gridInstance: any = (<any>document.getElementById('Normalgrid')).ej2_instances[0];
    if (args.requestType === 'save') {
        if (gridInstance.pageSettings.currentPage !== 1 && gridInstance.editSettings.newRowPosition === 'Top') {
            args.index = (gridInstance.pageSettings.currentPage * gridInstance.pageSettings.pageSize) - gridInstance.pageSettings.pageSize;
        } else if (gridInstance.editSettings.newRowPosition === 'Bottom') {
            args.index = (gridInstance.pageSettings.currentPage * gridInstance.pageSettings.pageSize) - 1;
        }
    }
}

  ionViewWillEnter() {
    this.stateService.updateAddType(AddType.Asset);
    this.stateService.updateAssetType(AssetType.Others);
  }

  getAmountByGroup() {
    this.totalAmountByAssetType.forEach((amount, assetType) => {
      let assetGroup: AssetGroup = {
        assetType: assetType,
        amount: amount,
      };
      this.assetGroups.push(assetGroup);
    });
    this.assetGroups.sort();
  }

  getSlug(assetType: AssetType) {
    return AssetTypeUtils.slug(assetType);
  }

  ngOnDestroy() {
    if (this.assetsSub) {
      this.assetsSub.unsubscribe();
    }
  }

  async changeCurrentSelectedAsset(assetGroup: AssetGroup) {
    this.currentAssetGroup = assetGroup;
    this.data = await this.mapDataFromAsset();
  }

  async mapDataFromAsset() : Promise<Object[]> {
    let data = [];
    if (!this.currentAssetGroup || !this.userAssets) {
      return [];
    }
    let currentAssetType = this.currentAssetGroup.assetType;
    let filteredAssets = this.userAssets.filter(asset => asset.assetType === currentAssetType);
    if (currentAssetType === AssetType.Equity || currentAssetType === AssetType.MutualFunds) {
      await filteredAssets.forEach(async asset => {
        let amount : number = await asset.getAmountForAsset(this.currentDate).toPromise();
        let name = asset.assetTitle;
        let units : number = asset.units;
        let price : number = asset.price;
        let totalcost: number = units*price;
        let currentprice : number = asset.currentValue;
        let change = 100 * (amount - (units*price) )/ (units*price);
        data = data.concat({name: name, change: change, units: units, totalcost : totalcost, currentprice: currentprice, currentvalue: units*currentprice});
      })
    }

    if (currentAssetType === AssetType.SavingsAccount || currentAssetType === AssetType.RealEstate || currentAssetType === AssetType.Others) {
      await filteredAssets.forEach(async asset => {
        let amount : number = await asset.getAmountForAsset(this.currentDate).toPromise();
        let name = asset.assetTitle;
        let price : number = asset.price;
        if (!price) {
          price = amount;
        }
        let change = 100 * (amount - price)/ price;
        data = data.concat({name: name, change: change, totalcost : price, currentvalue: amount});
      })
    }

    if (currentAssetType === AssetType.Deposits) {
      await filteredAssets.forEach(async asset => {
        let amount : number = await asset.getAmountForAsset(this.currentDate).toPromise();
        let name = asset.assetTitle;
        let price : number = asset.price;
        let change = 100 * (amount - price )/ (price);
        let depositDate
        if (asset.depositDate) {
          depositDate = new Date(asset.depositDate);
        }
        let maturityDate
        if (asset.maturityDate) {
          maturityDate = new Date(asset.maturityDate);
        }
        
        data = data.concat({name: name, change: change, totalcost : price, currentvalue: amount, depositdate: depositDate, maturitydate: maturityDate});
      })
    }

    if (currentAssetType === AssetType.Gold) {
      await filteredAssets.forEach(async asset => {
        let amount : number = await asset.getAmountForAsset(this.currentDate).toPromise();
        let name = asset.assetTitle;
        let price : number = asset.price;
        if (!price) {
          price = amount;
        }
        let units : number = asset.units;
        let change = 100 * (amount - price) / (price);
        data = data.concat({name: name, change: change, units: units, totalcost : price, currentvalue: amount});
      })
    }
    return data;
  }
}
