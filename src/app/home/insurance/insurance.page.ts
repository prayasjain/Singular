import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { InsuranceService } from "./insurance.service";
import { Insurance, InsuranceType, InsuranceTypeUtils, LifeInsurance } from "./insurance.model";
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

interface InsuranceGroup {
  insuranceType: InsuranceType;
  amount: number;
}

@Component({
  selector: 'app-insurance',
  templateUrl: './insurance.page.html',
  styleUrls: ['./insurance.page.scss'],
  providers: [ToolbarService, EditService, PageService]
})
export class InsurancePage implements OnInit, OnDestroy {
  user: firebase.User;
  userInsurances: Insurance[] = [];
  insuranceSub: Subscription;
  currencySub: Subscription;
  insuranceGroups: InsuranceGroup[] = [];
  totalAmount: number;
  currentDate: Date;
  currentInsuranceGroup: InsuranceGroup;
  totalAmountByInsuranceType = new Map();
  constructor(
    private insuranceService: InsuranceService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    public currencyService: CurrencyService,
    private stateService: StateService,
    private pdfService: PdfService
  ) {}

  colorNo = 0;
  InsuranceType = InsuranceType;

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
      this.changeCurrentSelectedInsurance(this.currentInsuranceGroup).then(() => {
        console.log("done")
      })
    })
    this.insuranceSub = this.authService.authInfo
      .pipe(
        switchMap((user) => {
          this.user = user;
          return this.insuranceService.userInsurances;
        }),
        switchMap((userInsurances) => {
          this.userInsurances = userInsurances;
          
          this.totalAmountByInsuranceType.clear();
          this.insuranceGroups = [];

          this.totalAmount = 0;
          let observableList = this.userInsurances.map((userInsurance) =>
            userInsurance.getAmountForInsurance(this.currentDate).pipe(
              take(1),
              tap((insuranceValue) => {
                this.totalAmountByInsuranceType.set(
                  userInsurance.insuranceType,
                  (this.totalAmountByInsuranceType.get(userInsurance.insuranceType) || 0) + Number(insuranceValue)
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
        this.insuranceGroups.forEach((insuranceGroup) => {
          this.totalAmount += Number(insuranceGroup.amount);
        });
        if (this.insuranceGroups && this.insuranceGroups.length > 0) {
          if (this.currentInsuranceGroup) {
            await this.changeCurrentSelectedInsurance(this.currentInsuranceGroup);
          } else {
            await this.changeCurrentSelectedInsurance(this.insuranceGroups[0]);
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
    this.totalAmountByInsuranceType.forEach((amount, insuranceType) => {
      let insuranceGroup: InsuranceGroup = {
        insuranceType: insuranceType,
        amount: amount,
      };
      this.insuranceGroups.push(insuranceGroup);
    });
    this.insuranceGroups.sort();
  }

  getSlug(insuranceType: InsuranceType) {
    return InsuranceTypeUtils.slug(insuranceType);
  }

  ngOnDestroy() {
    if (this.insuranceSub) {
      this.insuranceSub.unsubscribe();
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

  async changeCurrentSelectedInsurance(insuranceGroup: InsuranceGroup) {
    this.currentInsuranceGroup = insuranceGroup;
    this.data = await this.mapDataFromInsurance();
  }

  async mapDataFromInsurance() : Promise<Object[]> {
    let data = [];
    if (!this.currentInsuranceGroup || !this.userInsurances) {
      return [];
    }
    let currentInsuranceType = this.currentInsuranceGroup.insuranceType;
    let filteredInsurances = this.userInsurances.filter(insurance => insurance.insuranceType === currentInsuranceType);
    await filteredInsurances.forEach(async insurance => {
      
      let policyName = insurance.policyName;
      let policyNumber = insurance.policyNumber;
      let annualPremium = insurance.annualPremium;
      let insuredValue = insurance.insuredValue;
      
      data = data.concat({id: insurance.id, policyname: policyName, policynumber: policyNumber, annualpremium: annualPremium, insuredvalue: insuredValue});
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
          obsList.push(this.insuranceService.deleteInsurance(data.id));
        }
      });
      if (obsList.length > 0) {
        zip(...obsList).subscribe(() => {
          console.log("insurance deleted");
        });
      }
    }
    if (event.requestType === "save") {
      if (!event.data) {
        return;
      }
      let updatedInsurance : Insurance = this.userInsurances.find(insurance => insurance.id === event.data.id);
      // this is a new record
      if (!updatedInsurance) {
        updatedInsurance = await this.createInsurance(event.data, this.currentInsuranceGroup.insuranceType);
        console.log(updatedInsurance);
        this.insuranceService.addUserInsurance(updatedInsurance).subscribe((insurance) => {
          console.log("added insurance");
          console.log(insurance)
        })
        return;
      }
      updatedInsurance = await this.updateInsurance(updatedInsurance, event.data);
      this.insuranceService.updateUserInsurances([updatedInsurance]).subscribe(() => {
        console.log("updated insurance");
        console.log(updatedInsurance);
      });
    }
  }

  async updateInsurance(insurance : Insurance, data) : Promise<Insurance> {
    let insuranceType = insurance.insuranceType;
    if (insuranceType === InsuranceType.LifeInsurance) {
      insurance.lifeinsurance.policyName = data.policyname;
      insurance.lifeinsurance.policyNumber = data.policynumber;
      insurance.lifeinsurance.annualPremium = +data.annualpremium;
      insurance.lifeinsurance.insuredValue = +data.insuredvalue;
    } 
    
    return insurance;
  }

  async createInsurance(data, insuranceType) {
    let insuranceId = Math.random().toString();
    let insurance : Insurance;
    if (insuranceType === InsuranceType.LifeInsurance) {
      insurance = new Insurance(
        insuranceId,
        new LifeInsurance(data.name, data.policynumber, +data.annualpremium, +data.insuredvalue),
      );
    }
    return insurance;
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

 

  insuranceGroupPresent(insuranceType : InsuranceType) {
    return this.insuranceGroups.filter(ag => ag.insuranceType === insuranceType).length !== 0;
  }

  insuranceGroupAdd(insuranceType : InsuranceType) {
    let insuranceGroup: InsuranceGroup = {
      insuranceType: insuranceType,
      amount: 0,
    };
    
    this.insuranceGroups.push(insuranceGroup);
    this.currentInsuranceGroup = insuranceGroup;
    this.data = [];
  }

  
  getStarted() {
    let insuranceGroup : InsuranceGroup = {
      insuranceType: InsuranceType.LifeInsurance,
      amount: 0,
    };
    this.insuranceGroups.push(insuranceGroup);
    this.currentInsuranceGroup = insuranceGroup;
  }
}
