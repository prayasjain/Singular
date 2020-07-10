import { of } from "rxjs";

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

  public percentUnallocated: number;

  constructor(
    id: string,
    asset: SavingsAccount | Deposits | MutualFunds | Equity | Cash | Others,
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

  get maturityDateDisplay() {
    if (this.assetType === AssetType.Deposits && this.deposits.maturityDate) {
      return new Intl.DateTimeFormat("en-GB").format(
        this.deposits.maturityDate
      );
    }
  }

  get depositDateDisplay() {
    if (this.assetType === AssetType.Deposits && this.deposits.depositDate) {
      return new Intl.DateTimeFormat("en-GB").format(this.deposits.depositDate);
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
  }

  get price() {
    if (this.assetType === AssetType.Equity) {
      return this.equity.price;
    }
    if (this.assetType === AssetType.MutualFunds) {
      return this.mutualFunds.price;
    }
  }

  get currentValue() {
    if (this.assetType === AssetType.Equity) {
      return this.equity.currentValue;
    }
    if (this.assetType === AssetType.MutualFunds) {
      return this.mutualFunds.currentValue;
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
  Others = "Others",
}

export namespace AssetTypeUtils {
  export function slug(assetType: AssetType): string {
    return assetType.toLowerCase().replace(" ", "-");
  }
  export function getItemFromSlug(slug: string): AssetType {
    if (slug === "savings-account") {
      return AssetType.SavingsAccount;
    }
    if (slug === "deposits") {
      return AssetType.Deposits;
    }
    if (slug === "mutual-funds") {
      return AssetType.MutualFunds;
    }
    if (slug === "equity") {
      return AssetType.Equity;
    }
    if (slug === "cash") {
      return AssetType.Cash;
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
  ) {}

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
  ) {}

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
  ) {}

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
  ) {}

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
  constructor(public name: string, public amount: number) {}

  static toObject(data) {
    return new Cash(data.name, data.amount);
  }
}

export class Others {
  constructor(public name: string, public amount: number) {}

  static toObject(data) {
    return new Others(data.name, data.amount);
  }
}
