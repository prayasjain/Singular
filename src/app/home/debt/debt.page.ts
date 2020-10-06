import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { DebtService } from "./debt.service";
import { Debt, DebtType, DebtTypeUtils, Loan, CreditCard } from "./debt.model";
import { Subscription, zip, of } from "rxjs";
import { take, tap, switchMap, map } from "rxjs/operators";
import { AuthService } from "src/app/auth/auth.service";
import { LoadingController } from "@ionic/angular";
import { CurrencyService } from "../currency/currency.service";
import { StateService, AddType } from "../state.service";
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { EditService, ToolbarService, PageService, NewRowPosition, IEditCell } from '@syncfusion/ej2-angular-grids';
import { Query, DataManager } from '@syncfusion/ej2-data';
import { ChangeEventArgs, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { PdfService } from 'src/app/pdf/pdf.service';
import { } from '@syncfusion/ej2-base';

interface DebtGroup {
  debtType: DebtType;
  amount: number;
}

@Component({
  selector: 'app-debt',
  templateUrl: './debt.page.html',
  styleUrls: ['./debt.page.scss'],
  providers: [ToolbarService, EditService, PageService]
})
export class DebtPage implements OnInit, OnDestroy {
  user: firebase.User;
  userDebts: Debt[] = [];
  debtSub: Subscription;
  currencySub: Subscription;
  debtGroups: DebtGroup[] = [];
  totalAmount: number;
  currentDate: Date;
  currentDebtGroup: DebtGroup;
  totalAmountByDebtType = new Map();
  constructor(
    private debtService: DebtService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    public currencyService: CurrencyService,
    private stateService: StateService,
    private pdfService: PdfService
  ) {}

  colorNo = 0;
  DebtType = DebtType;

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
   
    this.editSettings = { allowEditing: true, allowAdding: true, allowDeleting: true , newRowPosition: 'Top' };
    this.toolbar = ['Add', 'Delete', 'Cancel'];
    this.editparams = { params: { popupHeight: '300px' } };
    this.pageSettings = { pageCount: 5 };
    this.formatoptions = {type: 'date', format: 'dd/MM/yyyy'}
    this.currentDate = new Date();
    this.currencySub = this.currencyService.currency.subscribe(c => {
      this.currentCurrency = c;
      this.changeCurrentSelectedDebt(this.currentDebtGroup).then(() => {
        console.log("done")
      })
    })
    this.debtSub = this.authService.authInfo
      .pipe(
        take(1),
        switchMap((user) => {
          this.user = user;
          return this.debtService.userDebts;
        }),
        switchMap((userDebts) => {
          this.userDebts = userDebts;
          
          this.totalAmountByDebtType.clear();
          this.debtGroups = [];

          this.totalAmount = 0;
          let observableList = this.userDebts.map((userDebt) =>
            userDebt.getAmountForDebt(this.currentDate).pipe(
              take(1),
              tap((debtValue) => {
                this.totalAmountByDebtType.set(
                  userDebt.debtType,
                  (this.totalAmountByDebtType.get(userDebt.debtType) || 0) + Number(debtValue)
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
        this.debtGroups.forEach((debtGroup) => {
          this.totalAmount += Number(debtGroup.amount);
        });
        if (this.debtGroups && this.debtGroups.length > 0) {
          if (this.currentDebtGroup) {
            await this.changeCurrentSelectedDebt(this.currentDebtGroup);
          } else {
            await this.changeCurrentSelectedDebt(this.debtGroups[0]);
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

  getAmountByGroup() {
    this.totalAmountByDebtType.forEach((amount, debtType) => {
      let debtGroup: DebtGroup = {
        debtType: debtType,
        amount: amount,
      };
      this.debtGroups.push(debtGroup);
    });
    this.debtGroups.sort();
  }

  getSlug(debtType: DebtType) {
    return DebtTypeUtils.slug(debtType);
  }

  ngOnDestroy() {
    if (this.debtSub) {
      this.debtSub.unsubscribe();
    }
    if (this.currencySub) {
      this.currencySub.unsubscribe();
    }
  }

  public percentFormatter = (data) => {
    return (100 * (Number(data.currentvalue) - Number(data.totalcost) )/ Number(data.totalcost)).toFixed(2) + "%";
  }

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

  async changeCurrentSelectedDebt(debtGroup: DebtGroup) {
    this.currentDebtGroup = debtGroup;
    this.data = await this.mapDataFromDebt();
  }

  async mapDataFromDebt() : Promise<Object[]> {
    let data = [];
    if (!this.currentDebtGroup || !this.userDebts) {
      return [];
    }
    let currentDebtType = this.currentDebtGroup.debtType;
    let filteredDebts = this.userDebts.filter(debt => debt.debtType === currentDebtType);
    await filteredDebts.forEach(async debt => {
      let amount : number = await debt.getAmountForDebt(this.currentDate).toPromise();
      let name = debt.debtName;
      let maturityDate;
      
      if (debt.maturityDate && debt.maturityDate !== "") {
        maturityDate = new Date(debt.maturityDate);
      }
      data = data.concat({id: debt.id, name: name, amount: amount, maturitydate: maturityDate});
    })
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
          obsList.push(this.debtService.deleteDebt(data.id));
        }
      });
      if (obsList.length > 0) {
        zip(...obsList).subscribe(() => {
          console.log("debt deleted");
        });
      }
    }
    if (event.requestType === "save") {
      if (!event.data) {
        return;
      }
      let updatedDebt : Debt = this.userDebts.find(debt => debt.id === event.data.id);
      // this is a new record
      if (!updatedDebt) {
        updatedDebt = await this.createDebt(event.data, this.currentDebtGroup.debtType);
        console.log(updatedDebt);
        this.debtService.addUserDebt(updatedDebt).subscribe((debt) => {
          console.log("added debt");
          console.log(debt)
        })
        return;
      }
      updatedDebt = await this.updateDebt(updatedDebt, event.data);
      this.debtService.updateUserDebts([updatedDebt]).subscribe(() => {
        console.log("updated debt");
        console.log(updatedDebt);
      });
    }
  }

  async updateDebt(debt : Debt, data) : Promise<Debt> {
    let debtType = debt.debtType;
    if (debtType === DebtType.Loan) {
      debt.loan.name = data.name;
      debt.loan.balance = +data.amount;
      debt.loan.maturityDate = data.maturitydate;
    } else if (debtType === DebtType.CreditCard) {
      debt.creditcard.name = data.name;
      debt.creditcard.balance = +data.amount;
      debt.creditcard.maturityDate = data.maturitydate;
    }
    
    return debt;
  }

  async createDebt(data, debtType) {
    let debtId = Math.random().toString();
    let debt : Debt;
    if (debtType === DebtType.Loan) {
      debt = new Debt(
        debtId,
        new Loan(data.name, +data.amount, data.maturitydate),
      );
    }
    if (debtType === DebtType.CreditCard) {
      debt = new Debt(
        debtId,
        new CreditCard(data.name, +data.amount, data.maturitydate),
      );
    }
    
    return debt;
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

 

  debtGroupPresent(debtType : DebtType) {
    return this.debtGroups.filter(ag => ag.debtType === debtType).length !== 0;
  }

  debtGroupAdd(debtType : DebtType) {
    let debtGroup: DebtGroup = {
      debtType: debtType,
      amount: 0,
    };
    
    this.debtGroups.push(debtGroup);
    this.currentDebtGroup = debtGroup;
    this.data = [];
  }

  
  getStarted() {
    let debtGroup : DebtGroup = {
      debtType: DebtType.Loan,
      amount: 0,
    };
    this.debtGroups.push(debtGroup);
    this.debtGroups.push({
      debtType: DebtType.CreditCard,
      amount: 0,
    })
    this.currentDebtGroup = debtGroup;
  }
}
