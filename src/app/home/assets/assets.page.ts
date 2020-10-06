import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { AssetsService } from "./assets.service";
import { Asset, AssetType, AssetTypeUtils, MutualFunds, Equity, SavingsAccount, Deposits, Gold, Others, RealEstate } from "./asset.model";
import { Subscription, zip, of } from "rxjs";
import { take, tap, switchMap, map } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from "../currency/currency.service";
import { MarketDataService, PriceData, AutoCompleteData } from "./market-data.service";
import { StateService, AddType } from "../state.service";
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { EditService, ToolbarService, PageService, NewRowPosition, IEditCell } from '@syncfusion/ej2-angular-grids';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { ChangeEventArgs, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { PdfService } from 'src/app/pdf/pdf.service';
import { } from '@syncfusion/ej2-base';

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
  currencySub: Subscription;
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
    private stateService: StateService,
    private pdfService: PdfService,
    private marketDataService: MarketDataService
  ) {}

  colorNo = 0;
  AssetType = AssetType;
  @ViewChild("camsFilePicker", { static: false }) camsFilePicker: ElementRef;
  @ViewChild("nsdlFilePicker", { static: false }) nsdlFilepicker: ElementRef;

  @ViewChild('ddsample')
    public dropDown: DropDownListComponent;
    public data: Object[] = [];
    public editSettings: Object;
    public toolbar: string[];
    public editparams: Object;
    public pageSettings: Object;
    public formatoptions: Object;
    public equityParams: IEditCell;
    public mfParams: IEditCell;
    public equities: object[] = [];
    public mutualFunds: object[] = [];
  
    currentCurrency: string;

  async ngOnInit() {
    let stockArray = await this.assetsService.getEquities();
    let mfArray = await this.assetsService.getMutualFunds();
    this.equityParams = {
      params: {
          allowFiltering: true,
          dataSource: stockArray,
          fields: { text: 'name', value: 'name' },
          query: new Query(),
          actionComplete: (data) => {console.log("dropdown")}
      }
    };
    this.mfParams = {
      params: {
          allowFiltering: true,
          dataSource: mfArray,
          fields: { text: 'name', value: 'name' },
          query: new Query(),
          actionComplete: (data) => {console.log(data)}
      }
    };
    this.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true , newRowPosition: 'Top' };
    this.toolbar = ['Add', 'Delete', 'Cancel'];
    this.editparams = { params: { popupHeight: '300px' } };
    this.pageSettings = { pageCount: 5 };
    this.formatoptions = {type: 'date', format: 'dd/MM/yyyy'}
    this.currentDate = new Date();
    this.currencySub = this.currencyService.currency.subscribe(c => {
      this.currentCurrency = c;
      this.changeCurrentSelectedAsset(this.currentAssetGroup).then(() => {
        console.log("done")
      })
    })
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
          if (this.currentAssetGroup) {
            await this.changeCurrentSelectedAsset(this.currentAssetGroup);
          } else {
            await this.changeCurrentSelectedAsset(this.assetGroups[0]);
          }
        }
      });
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
    if (this.currencySub) {
      this.currencySub.unsubscribe();
    }
  }

  public percentFormatter = (data) => {
    return (100 * (Number(data.currentvalue) - Number(data.totalcost) )/ Number(data.totalcost)).toFixed(2) + "%";
  }

  // public equityValueFormatter = (data) => {
    
  //   if (data.identifier) {
  //     return this.marketDataService.getPrice([data.identifier], this.currentAssetGroup.assetType).pipe(take(1), map((priceData : PriceData[]) => {
  //       let currentPrice = priceData.find(priceData => priceData.key === data.identifier);
  //       if (currentPrice) {
  //         let amount = Number(currentPrice.nav).toLocaleString(this.currencyService.getLocaleForCurrency(this.currentCurrency), 
  //         { style: 'currency', currency: this.currentCurrency, maximumFractionDigits: 0, minimumFractionDigits: 0 });
  //         console.log(amount)
  //         return amount
  //       }
  //     }));
      
      
  //   } else {
  //     return of("");
  //   }
  // }

  public unitFormatter = (field: string, data: object, column: object) => {
    let value = +data[field];
    if (!value) {
      return;
    }
    return value.toFixed(2);
  }
  
  public currencyFormatter = (field: string, data: object, column: object) => {
    let value = +data[field];
    if (!value) {
      return;
    }
    
    return value.toLocaleString(this.currencyService.getLocaleForCurrency(this.currentCurrency), 
      { style: 'currency', currency: this.currentCurrency, maximumFractionDigits: 0, minimumFractionDigits: 0 })
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
        let identifier;
        if (asset.assetType === AssetType.MutualFunds) {
          identifier = asset.mstarId;
        } else if (asset.assetType === AssetType.Equity) {
          identifier = asset.isin;
        }
        let units : number = asset.units;
        let price : number = asset.price;
        let totalcost: number = units*price;
        let currentprice : number = asset.currentValue;
        let change = 100 * (amount - (units*price) )/ (units*price);
        data = data.concat({id: asset.id, name: name, change: change, units: units, totalcost : totalcost, currentprice: currentprice, currentvalue: units*currentprice, identifier: identifier});
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
        data = data.concat({id: asset.id, name: name, change: change, totalcost : price, currentvalue: amount});
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
        
        data = data.concat({id: asset.id, name: name, change: change, totalcost : price, currentvalue: amount, depositdate: depositDate, maturitydate: maturityDate});
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
        data = data.concat({id: asset.id, name: name, change: change, units: units, totalcost : price, currentvalue: amount});
      })
    }
    return data;
  }

  async updateGrid(event) {
    console.log(event);
    if (event.requestType === "delete") {
      let data : Object[] = event.data;
      if (!event.data || event.data.length === 0) {
        return;
      }
      let obsList = [];
      event.data.forEach(data => {
        if (data.id) {
          obsList.push(this.assetsService.deleteAsset(data.id));
        }
      });
      if (obsList.length > 0) {
        zip(...obsList).subscribe(() => {
          console.log("asset deleted");
        });
      }
    }
    if (event.requestType === "save") {
      if (!event.data) {
        return;
      }
      let updatedAsset : Asset = this.userAssets.find(asset => asset.id === event.data.id);
      // this is a new record
      if (!updatedAsset) {
        updatedAsset = await this.createAsset(event.data, this.currentAssetGroup.assetType);
        console.log(updatedAsset);
        this.assetsService.addUserAsset(updatedAsset).subscribe((asset) => {
          console.log("added asset");
          console.log(asset)
        })
        return;
      }
      updatedAsset = await this.updateAsset(updatedAsset, event.data);
      this.assetsService.updateUserAssets([updatedAsset]).subscribe(() => {
        console.log("updated asset");
        console.log(updatedAsset);
      });
    }
  }

  async updateAsset(asset : Asset, data) : Promise<Asset> {
    let assetType = asset.assetType;
    if (assetType === AssetType.Equity || assetType === AssetType.MutualFunds) {
      if (assetType === AssetType.Equity) {
        asset.equity.stockName = data.name;
        let isin
        let autoCompleteData : AutoCompleteData[] = await this.marketDataService.getData(data.name.trim().toLowerCase(), assetType).toPromise();
        if (autoCompleteData.length === 1) {
          isin = autoCompleteData[0].equity.isin;
          asset.equity.isin = isin
        }
        asset.equity.units = data.units;
        asset.equity.price = data.totalcost / data.units;
        if (asset.equity.isin) {
          let priceData : PriceData[] = await this.marketDataService.getPrice([asset.equity.isin], AssetType.Equity).toPromise();
          let currentPrice = priceData.find(p => p.key === isin);
          if (currentPrice) {
            asset.equity.currentValue = currentPrice.nav;
          } else {
            asset.equity.currentValue = data.currentvalue / data.units;
          }
        } else {
          asset.equity.currentValue = data.currentvalue / data.units;
        }
        
      }
      else if (assetType === AssetType.MutualFunds) {
        asset.mutualFunds.fundName = data.name;
        let mstarId;
        let autoCompleteData : AutoCompleteData[] = await this.marketDataService.getData(data.name.trim().toLowerCase(), assetType).toPromise();
        if (autoCompleteData.length === 1) {
          mstarId = autoCompleteData[0].mutualfund.mstarId;
          asset.mutualFunds.mstarId = mstarId;
        }
        asset.mutualFunds.units = data.units;
        asset.mutualFunds.price = data.totalcost / data.units;
        if (asset.mutualFunds.mstarId) {
          let priceData : PriceData[] = await this.marketDataService.getPrice([mstarId], AssetType.MutualFunds).toPromise();
          let currentPrice = priceData.find(p => p.key === mstarId);
          if (currentPrice) {
            asset.mutualFunds.currentValue = currentPrice.nav;
          } else {
            asset.mutualFunds.currentValue = data.currentvalue / data.units;
          }
        } else {
          asset.mutualFunds.currentValue = data.currentvalue / data.units;
        }
      }
    }
    else if (assetType === AssetType.SavingsAccount || assetType === AssetType.RealEstate || assetType === AssetType.Others) {
      if (assetType === AssetType.SavingsAccount) {
        asset.savingsAccount.bankName = data.name;
        asset.savingsAccount.amount = data.totalcost;
      }
      else if (assetType === AssetType.RealEstate) {
        asset.realEstate.name = data.name;
        asset.realEstate.price = data.totalcost;
        asset.realEstate.currentValue = data.currentvalue;
      } else if (assetType === AssetType.Others) {
        asset.others.name = data.name;
        asset.others.amount = data.currentvalue;
      }
    }
    else if (assetType === AssetType.Deposits) {
      asset.deposits.bankName = data.name;
      asset.deposits.amount = data.totalcost;
      asset.deposits.depositDate = data.depositdate;
      asset.deposits.maturityDate = data.maturitydate;
    }
    else if (assetType === AssetType.Gold) {
      asset.gold.name = data.name;
      asset.gold.price = data.totalcost;
      asset.gold.units = data.units;
      asset.gold.currentValue = data.currentvalue;
    }
    return asset;
  }

  async createAsset(data, assetType) {
    let assetId = Math.random().toString();
    let asset : Asset;
    let percentUnAlloc = 1;
    if (assetType === AssetType.SavingsAccount) {
      asset = new Asset(
        assetId,
        new SavingsAccount(data.name, +data.totalcost, "", new Date(), 0),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Deposits) {
      asset = new Asset(
        assetId,
        new Deposits(
          data.name,
          +data.totalcost,
          "",
          data.depositdate,
          data.maturitydate,
          0
        ),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.MutualFunds) {
      let mstarId;
      let autoCompleteData : AutoCompleteData[] = await this.marketDataService.getData(data.name.trim().toLowerCase(), assetType).toPromise();
      if (autoCompleteData.length === 1) {
        mstarId = autoCompleteData[0].mutualfund.mstarId;
      }
      let priceData : PriceData[] = await this.marketDataService.getPrice([mstarId], AssetType.MutualFunds).toPromise();
      let currentPrice = priceData.find(p => p.key === mstarId);

      asset = new Asset(
        assetId,
        new MutualFunds(data.name, +data.units, +data.totalcost / +data.units, +currentPrice?.nav, "", mstarId),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Equity) {
      let isin
      let autoCompleteData : AutoCompleteData[] = await this.marketDataService.getData(data.name.trim().toLowerCase(), assetType).toPromise();
      if (autoCompleteData.length === 1) {
          isin = autoCompleteData[0].equity.isin;
      }
      let priceData : PriceData[] = await this.marketDataService.getPrice([isin], AssetType.Equity).toPromise();
      let currentPrice = priceData.find(p => p.key === isin);
      asset = new Asset(
        assetId,
        new Equity( data.name, +data.units, +data.totalcost / +data.units, +currentPrice?.nav, isin),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Gold) {
      asset = new Asset(
        assetId,
        new Gold(
          data.name,
          new Date(),
          +data.totalcost,
          +data.currentvalue,
          new Date(),
          +data.units
        ),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.RealEstate) {
      asset = new Asset(
        assetId,
        new RealEstate(data.name, new Date(), +data.totalcost, +data.currentvalue, new Date()),
        percentUnAlloc
      );
    }
    if (assetType === AssetType.Others) {
      asset = new Asset(assetId, new Others(data.name, +data.currentvalue), percentUnAlloc);
      console.log(asset);
    }
    return asset;
  }

  isObjectEqual(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (let key in obj1) { 
      if(obj1[key] !== obj2[key]) {
          return false;
      }
    }
    return true;
  }

  onCAMSPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    this.loadingCtrl
      .create({ message: "Updating your Mutual Funds" })
      .then((loadingEl) => {
        reader.onload = () => {
          this.camsFilePicker.nativeElement.value = ""; //reset the input
          this.pdfService
            .readPdf(reader.result)
            .then((data) => {
              loadingEl.present();
              let mutualFunds: MutualFunds[] = this.pdfService.parseCAMSStatement(
                data
              );
              if (!mutualFunds || mutualFunds.length == 0) {
                loadingEl.dismiss();
                return;
              }
              this.pdfService.saveMutualFunds(mutualFunds).subscribe(
                (data) => {
                  loadingEl.dismiss();
                },
                (err) => {
                  console.log(err);
                  loadingEl.dismiss();
                }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        };
        reader.readAsArrayBuffer(file);
      });
  }

  onNSDLPicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();

    this.loadingCtrl
      .create({ message: "Updating your Equities Funds" })
      .then((loadingEl) => {
        reader.onload = () => {
          this.nsdlFilepicker.nativeElement.value = ""; //reset the input
          this.pdfService
            .readPdf(reader.result)
            .then((data) => {
              loadingEl.present();
              let equities: Equity[] = this.pdfService.parseNSDLStatement(
                data
              );
              if (!equities || equities.length == 0) {
                loadingEl.dismiss();
                return;
              }
              this.pdfService.saveEquities(equities).subscribe(
                (data) => {
                  loadingEl.dismiss();
                },
                (err) => {
                  console.log(err);
                  loadingEl.dismiss();
                }
              );
            })
            .catch((err) => {
              console.log(err);
            });
        };
        reader.readAsArrayBuffer(file);
      });
  }

  assetGroupPresent(assetType : AssetType) {
    return this.assetGroups.filter(ag => ag.assetType === assetType).length !== 0;
  }

  assetGroupAdd(assetType : AssetType) {
    let assetGroup: AssetGroup = {
      assetType: assetType,
      amount: 0,
    };
    
    this.assetGroups.push(assetGroup);
    this.currentAssetGroup = assetGroup;
    this.data = [];
  }

  getColor(currentValue, totalCost) {
    if (Number(currentValue) > Number(totalCost)) {
      return "success"
    } else if (Number(currentValue) < Number(totalCost)) {
      return "danger";
    }
    return "warning";
  }
  getStarted() {
    let assetGroup : AssetGroup= {
      assetType: AssetType.MutualFunds,
      amount: 0,
    };
    this.assetGroups.push(assetGroup);
    this.assetGroups.push({
      assetType: AssetType.Equity,
      amount: 0,
    })
    this.assetGroups.push({
      assetType: AssetType.Others,
      amount: 0,
    })
    this.currentAssetGroup = assetGroup;
  }
}
