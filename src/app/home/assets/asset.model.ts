import { of } from 'rxjs';

export class Asset {
  public id: string;
  public assetType: AssetType;
  public notes: string;

  public savingsAccount: SavingsAccount;
  public deposits: Deposits;
  public mutualFunds: MutualFunds;
  public equity: Equity;
  public cash: Cash;

  public percentUnallocated: number;

  constructor(
    id: string,
    asset: SavingsAccount | Deposits | MutualFunds | Equity | Cash,
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
  }

  getAmountForAsset(date: Date) {
    // compounding quarterly
    if (this.assetType === AssetType.SavingsAccount) {
      let daysDiff = Math.floor(
        (date.getTime() - this.savingsAccount.date.getTime()) / (1000 * 3600 * 24));
      let amount = this.savingsAccount.amount * Math.pow(1 + (this.savingsAccount.interestRate/4), Math.floor(daysDiff / 90));
      return of(amount);
    }
    if (this.assetType === AssetType.Deposits) {
      let daysDiff = Math.floor(
        (date.getTime() - this.deposits.depositDate.getTime()) / (1000 * 3600 * 24));
      let amount = this.deposits.amount * Math.pow(1 + (this.deposits.interestRate/4), Math.floor(daysDiff / 90));
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
}

export enum AssetType {
  SavingsAccount = "Savings Account",
  Deposits = "Deposits",
  MutualFunds = "Mutual Funds",
  Equity = "Equity",
  Cash = "Cash",
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
  }
}

export class SavingsAccount {
  constructor(
    public bankName: string,
    public accountNumber: string,
    public amount: number,
    public date: Date = new Date(), // the stored amount is at the given date
    public interestRate: number = 0.04
  ) {}
}

export class Deposits {
  constructor(
    public bankName: string,
    public depositNumber: string,
    public amount: number,
    public depositDate: Date,
    public maturityDate: Date,
    public interestRate: number = 0.04
  ) {}
}

export class MutualFunds {
  constructor(
    public fundName: string,
    public units: number,
    public price: number,
    public currentValue: number = price
  ) {}
}

export class Equity {
  constructor(
    public stockName: string,
    public units: number,
    public price: number,
    public currentValue: number = price
  ) {}
}

export class Cash {
  constructor(public name: string, public amount: number) {}
}
