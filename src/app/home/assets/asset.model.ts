import { of } from "rxjs";
import { Constants } from 'src/app/config/constants';

export class Asset {
  public id: string;
  public userId: string;
  public assetType: AssetType;
  public notes: string;

  public savingsAccount: SavingsAccount;
  public deposits: Deposits;
  public mutualFunds: MutualFunds;
  public equity: Equity;
  public cash: Cash;
  public others: Others;
  public gold: Gold;
  public realEstate: RealEstate;
  public ePF: EPF;
  public pPf: PPF;

  public percentUnallocated: number;

  constructor(
    id: string,
    asset: SavingsAccount | Deposits | Gold | RealEstate | EPF | PPF | MutualFunds | Equity | Cash | Others,
    percentUnallocated: number,
    notes?: string
  ) {
    this.id = id;

    this.percentUnallocated = percentUnallocated;
    if (asset instanceof SavingsAccount) {
      this.assetType = AssetType.SavingsAccount;
      this.savingsAccount = asset;
    }
    if (asset instanceof Deposits) {
      this.assetType = AssetType.Deposits;
      this.deposits = asset;
    }
    if (asset instanceof MutualFunds) {
      this.assetType = AssetType.MutualFunds;
      this.mutualFunds = asset;
    }
    if (asset instanceof Equity) {
      this.assetType = AssetType.Equity;
      this.equity = asset;
    }
    if (asset instanceof Cash) {
      this.assetType = AssetType.Cash;
      this.cash = asset;
    }
    if (asset instanceof Gold) {
      this.assetType = AssetType.Gold;
      this.gold = asset;
    }
    if (asset instanceof RealEstate) {
      this.assetType = AssetType.RealEstate;
      this.realEstate = asset;
    }
    if (asset instanceof EPF) {
      this.assetType = AssetType.EPF;
      this.ePF = asset;
    }
    if (asset instanceof PPF) {
      this.assetType = AssetType.PPF;
      this.pPf = asset;
    }
    if (asset instanceof Others) {
      this.assetType = AssetType.Others;
      this.others = asset;
    }
  }

  getAmountForAsset(date: Date) {
    // compounding quarterly
    if (this.assetType === AssetType.SavingsAccount) {
      let daysDiff = Math.floor(
        (date.getTime() - this.savingsAccount.date.getTime()) /
        (1000 * 3600 * 24)
      );
      let amount =
        this.savingsAccount.amount *
        Math.pow(
          1 + this.savingsAccount.interestRate / 4,
          Math.floor(daysDiff / 90)
        );
      return of(amount);
    }
    if (this.assetType === AssetType.Deposits) {
      if (!this.deposits.depositDate || !this.deposits.maturityDate) {
        return of(this.deposits.amount);
      }
      let daysDiff = Math.floor(
        (date.getTime() - this.deposits.depositDate.getTime()) /
        (1000 * 3600 * 24)
      );
      let amount =
        this.deposits.amount *
        Math.pow(1 + this.deposits.interestRate / 4, Math.floor(daysDiff / 90));
      return of(amount);
    }
    if (this.assetType === AssetType.MutualFunds) {
      return of(this.mutualFunds.units * this.mutualFunds.currentValue);
    }
    if (this.assetType === AssetType.Equity) {
      return of(this.equity.units * this.equity.currentValue);
    }
    if (this.assetType === AssetType.Cash) {
      return of(this.cash.amount);
    }
    if (this.assetType === AssetType.Others) {
      return of(this.others.amount);
    }
    if (this.assetType === AssetType.Gold) {
      return of(this.gold.currentValue);
    }
    if (this.assetType === AssetType.PPF) {
      return of(this.pPf.currentValue);
    }
    if (this.assetType === AssetType.EPF) {
      return of(this.ePF.price);
    }
    if (this.assetType === AssetType.RealEstate) {
      return of(this.realEstate.currentValue);
    }
  }

  get assetTitle() {
    if (this.assetType === AssetType.SavingsAccount) {
      return this.savingsAccount.bankName;
    }
    if (this.assetType === AssetType.Deposits) {
      return this.deposits.bankName;
    }
    if (this.assetType === AssetType.MutualFunds) {
      return this.mutualFunds.fundName;
    }
    if (this.assetType === AssetType.Equity) {
      return this.equity.stockName;
    }
    if (this.assetType === AssetType.Cash) {
      return this.cash.name;
    }
    if (this.assetType === AssetType.Gold) {
      return this.gold.name;
    }
    if (this.assetType === AssetType.RealEstate) {
      return this.realEstate.name;
    }
    if (this.assetType === AssetType.PPF) {
      return this.pPf.name;
    }
    if (this.assetType === AssetType.EPF) {
      return this.ePF.name;
    }
    if (this.assetType === AssetType.Others) {
      return this.others.name;
    }
  }

  get assetDetails() {
    if (this.assetType === AssetType.SavingsAccount) {
      return this.savingsAccount.accountNumber;
    }
    if (this.assetType === AssetType.Deposits) {
      return this.deposits.depositNumber;
    }
    return "";
  }
  get accountNumber() {
    if (this.assetType === AssetType.SavingsAccount) {
      return this.savingsAccount.accountNumber;
    }

    if (this.assetType === AssetType.Deposits) {
      return this.deposits.depositNumber;
    }
  }

  get interestRate() {
    if (this.assetType === AssetType.SavingsAccount) {
      return this.savingsAccount.interestRate * 100;
    }

    if (this.assetType === AssetType.Deposits) {
      return this.deposits.interestRate * 100;
    }
  }

  get maturityDate() {
    if (this.assetType === AssetType.Deposits) {
      return this.deposits.maturityDate.toISOString();
    }
  }

  get depositDate() {
    if (this.assetType === AssetType.Deposits) {
      return this.deposits.depositDate.toISOString();
    }
  }
  get lastEvaluationDate() {
    if (this.assetType === AssetType.Gold) {
      return this.gold.lastEvaluationDate && this.gold.lastEvaluationDate.toISOString();
    }
    if (this.assetType === AssetType.EPF) {
      return this.ePF.lastEvaluationDate && this.ePF.lastEvaluationDate.toISOString();
    }
    if (this.assetType === AssetType.PPF) {
      return this.pPf.lastEvaluationDate && this.pPf.lastEvaluationDate.toISOString();
    }
    if (this.assetType === AssetType.RealEstate) {
      return this.realEstate.lastEvaluationDate && this.realEstate.lastEvaluationDate.toISOString();
    }
  }
  get date() {
    if (this.assetType === AssetType.Gold) {
      return this.gold.date && this.gold.date.toISOString();
    }
    if (this.assetType === AssetType.PPF) {
      return  this.pPf.date && this.pPf.date.toISOString();
    }
    if (this.assetType === AssetType.RealEstate) {
      return   this.realEstate.date && this.realEstate.date.toISOString();
    }
  }

  get maturityDateDisplay() {
    if (this.assetType === AssetType.Deposits && this.deposits.maturityDate) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(
        this.deposits.maturityDate
      );
    }
  }
  get depositDateDisplay() {
    if (this.assetType === AssetType.Deposits && this.deposits.depositDate) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(this.deposits.depositDate);
    }
  }

  buyDateDisplay(type) {
    if (this.assetType === AssetType.Gold && this.gold[type]) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(this.gold[type]);
    }
    if (this.assetType === AssetType.EPF && this.ePF[type]) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(this.ePF[type]);
    }
    if (this.assetType === AssetType.PPF && this.pPf[type]) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(this.pPf[type]);
    }
    if (this.assetType === AssetType.RealEstate && this.realEstate[type]) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(this.realEstate[type]);
    }
  }

  get folioNo() {
    if (this.assetType === AssetType.MutualFunds) {
      return this.mutualFunds.folioNo;
    }
  }

  get units() {
    if (this.assetType === AssetType.Equity) {
      return this.equity.units;
    }
    if (this.assetType === AssetType.MutualFunds) {
      return this.mutualFunds.units;
    }
    if (this.assetType === AssetType.Gold) {
      return this.gold.units;
    }
  }

  get uanNumber() {
    if (this.assetType === AssetType.EPF) {
      return this.ePF.uanNumber;
    }
  }

  get price() {
    if (this.assetType === AssetType.Equity) {
      return this.equity.price;
    }
    if (this.assetType === AssetType.MutualFunds) {
      return this.mutualFunds.price;
    }
    if (this.assetType === AssetType.Gold) {
      return this.gold.price;
    }
    if (this.assetType === AssetType.RealEstate) {
      return this.realEstate.price;
    }
    if (this.assetType === AssetType.EPF) {
      return this.ePF.price;
    }
    if (this.assetType === AssetType.PPF) {
      return this.pPf.price;
    }
  }

  get currentValue() {
    if (this.assetType === AssetType.Equity) {
      return this.equity.currentValue;
    }
    if (this.assetType === AssetType.MutualFunds) {
      return this.mutualFunds.currentValue;
    }
    if (this.assetType === AssetType.Gold) {
      return this.gold.currentValue;
    }
    if (this.assetType === AssetType.RealEstate) {
      return this.realEstate.currentValue;
    }
    if (this.assetType === AssetType.PPF) {
      return this.pPf.currentValue;
    }
  }

  get isin() {
    if (this.assetType === AssetType.Equity) {
      return this.equity.isin;
    }
  }
}

export enum AssetType {
  SavingsAccount = "Savings Account",
  Deposits = "Deposits",
  MutualFunds = "Mutual Funds",
  Equity = "Equity",
  Cash = "Cash",
  Gold = 'Gold',
  PPF = 'PPF',
  EPF = 'EPF',
  RealEstate = 'Real Estate',
  Others = "Others",
}

export namespace AssetTypeUtils {
  export function slug(assetType: AssetType): string {
    
    return assetType.toLowerCase().replace(" ", "-");
  }
  export function getItemFromSlug(slug: string): AssetType {
    if (slug === Constants.ASSET_TYPES.savingsAccount) {
      return AssetType.SavingsAccount;
    }
    if (slug === Constants.ASSET_TYPES.deposits) {
      return AssetType.Deposits;
    }
    if (slug === Constants.ASSET_TYPES.mutualFunds) {
      return AssetType.MutualFunds;
    }
    if (slug === Constants.ASSET_TYPES.equity) {
      return AssetType.Equity;
    }
    if (slug === Constants.ASSET_TYPES.cash) {
      return AssetType.Cash;
    }
    if (slug === Constants.ASSET_TYPES.gold) {
      return AssetType.Gold;
    }
    if (slug === Constants.ASSET_TYPES.ePF) {
      return AssetType.EPF;
    }
    if (slug === Constants.ASSET_TYPES.realEstate) {
      return AssetType.RealEstate;
    }
    if (slug === Constants.ASSET_TYPES.pPf) {
      return AssetType.PPF;
    }
    if (slug === "others") {
      return AssetType.Others;
    }
  }
}

export class SavingsAccount {
  constructor(
    public bankName: string,
    public amount: number,
    public accountNumber?: string,
    public date: Date = new Date(), // the stored amount is at the given date
    public interestRate: number = 0.04
  ) { }

  static toObject(data) {
    let date: Date;
    if (data.date) {
      date = new Date(data.date);
    }
    return new SavingsAccount(
      data.bankName,
      data.amount,
      data.accountNumber,
      date,
      data.interestRate
    );
  }
}

export class Deposits {
  constructor(
    public bankName: string,
    public amount: number,
    public depositNumber?: string,
    public depositDate?: Date,
    public maturityDate?: Date,
    public interestRate: number = 0.04
  ) { }

  static toObject(data) {
    let depositDate: Date;
    let maturityDate: Date;
    if (data.depositDate) {
      depositDate = new Date(data.depositDate);
    }
    if (data.maturityDate) {
      maturityDate = new Date(data.maturityDate);
    }

    return new Deposits(
      data.bankName,
      data.amount,
      data.depositNumber,
      depositDate,
      maturityDate,
      data.interestRate
    );
  }
}

export class MutualFunds {
  constructor(
    public fundName: string,
    public units: number,
    public price: number,
    public currentValue: number = price,
    public folioNo?: string
  ) { }

  static toObject(data) {
    return new MutualFunds(
      data.fundName,
      data.units,
      data.price,
      data.currentValue,
      data.folioNo
    );
  }
}

export class Equity {
  constructor(
    public stockName: string,
    public units: number,
    public price: number,
    public currentValue: number = price,
    public isin?: string
  ) { }

  static toObject(data) {
    return new Equity(
      data.stockName,
      data.units,
      data.price,
      data.currentValue,
      data.isin
    );
  }
}

export class Cash {
  constructor(public name: string, public amount: number) { }

  static toObject(data) {
    return new Cash(data.name, data.amount);
  }
}

export class Others {
  constructor(public name: string, public amount: number) { }

  static toObject(data) {
    return new Others(data.name, data.amount);
  }
}

export class EPF {
  constructor(
    public name: string,
    public price: number,
    public lastEvaluationDate?: Date,
    public uanNumber?: number
  ) { }

  static toObject(data) {
    let lastEvaluationDate: Date;
    if (data.lastEvaluationDate) {
      lastEvaluationDate = new Date(data.lastEvaluationDate);
    }
    return new EPF(
      data.name,
      data.price,
      lastEvaluationDate,
      data.uanNumber
    );
  }
}
export class Gold {
  constructor(
    public name: string,
    public date: Date,
    public price: number,
    public currentValue: number = price,
    public lastEvaluationDate?: Date,
    public units?: number
  ) { }

  static toObject(data) {
    let date: Date;
    let lastEvaluationDate: Date;
    if (data && data.date) {
      date = new Date(data.date);
    }
    if (data.lastEvaluationDate) {
      lastEvaluationDate = new Date(data.lastEvaluationDate);
    }
    return new Gold(
      data.name,
      date,
      data.price,
      data.currentValue,
      lastEvaluationDate,
      data.units
    );
  }
}
export class RealEstate {
  constructor(
    public name: string,
    public date: Date,
    public price: number,
    public currentValue: number = price,
    public lastEvaluationDate?: Date
  ) { }

  static toObject(data) {
    let date: Date;
    let lastEvaluationDate: Date;
    if (data.date) {
      date = new Date(data.date);
    }
    if (data.lastEvaluationDate) {
      lastEvaluationDate = new Date(data.lastEvaluationDate);
    }
    return new RealEstate(
      data.name,
      date,
      data.price,
      data.currentValue,
      lastEvaluationDate
    );
  }
}
export class PPF {
  constructor(
    public name: string,
    public date: Date,
    public price: number,
    public currentValue: number = price,
    public lastEvaluationDate?: Date
  ) { }

  static toObject(data) {
    let date: Date;
    let lastEvaluationDate: Date;
    if (data && data.date) {
      date = new Date(data.date);
    }
    if (data && data.lastEvaluationDate) {
      lastEvaluationDate = new Date(data.lastEvaluationDate);
    }
    return new PPF(
      data && data.name,
      date,
      data &&  data.price,
      data && data.currentValue,
      lastEvaluationDate
    );
  }
}
