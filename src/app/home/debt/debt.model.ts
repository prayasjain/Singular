import { of } from "rxjs";
import { Constants } from 'src/app/config/constants';

export class Debt {
  public id: string;
  public userId: string;
  public debtType: DebtType;
  public notes: string;

  public loan: Loan;
  public creditcard: CreditCard;

  constructor(
    id: string,
    debt: Loan | CreditCard,
    notes?: string
  ) {
    this.id = id;

    if (debt instanceof Loan) {
      this.debtType = DebtType.Loan;
      this.loan = debt;
    }
    if (debt instanceof CreditCard) {
      this.debtType = DebtType.CreditCard;
      this.creditcard = debt;
    }
  }

  getAmountForDebt(date: Date) {
    if (this.debtType === DebtType.Loan) {
      return of(this.loan.balance);
    }
    if (this.debtType === DebtType.CreditCard) {
      return of(this.creditcard.balance);
    }
  }

  get debtName() {
    if (this.debtType === DebtType.Loan) {
      return this.loan.name;
    }
    if (this.debtType === DebtType.CreditCard) {
      return this.creditcard.name;
    }
  }

  get maturityDate() {
    if (this.debtType === DebtType.Loan) {
      if (!this.loan.maturityDate) {
        return ""
      }
      return this.loan.maturityDate.toISOString();
    }
    if (this.debtType === DebtType.CreditCard) {
      if (!this.creditcard.maturityDate) {
        return ""
      }
      return this.creditcard.maturityDate.toISOString();
    }
    
  }

  get maturityDateDisplay() {
    if (this.debtType === DebtType.Loan) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(
        this.loan.maturityDate);
    }
    if (this.debtType === DebtType.CreditCard) {
      return new Intl.DateTimeFormat(Constants.DISPLAY_DATE_FORMAT.enGB).format(
        this.creditcard.maturityDate);;
    }
  }
}

export enum DebtType {
  Loan = "Loan",
  CreditCard = "Credit Card",
}

export namespace DebtTypeUtils {
  export function slug(debtType: DebtType): string {
    
    return debtType.toLowerCase().replace(" ", "-");
  }
  export function getItemFromSlug(slug: string): DebtType {
    if (slug === "loan") {
      return DebtType.Loan;
    }
    if (slug === "credit-card") {
      return DebtType.CreditCard;
    }
  }
}

export class Loan {
  constructor(
    public name: string,
    public balance: number,
    public maturityDate: Date
  ) { }

  static toObject(data) {
    let date: Date;
    if (data.maturityDate) {
      date = new Date(data.maturityDate);
    }
    return new Loan(
      data.name,
      data.balance,
      date
    );
  }
}

export class CreditCard {
  constructor(
    public name: string,
    public balance: number,
    public maturityDate: Date
  ) { }

  static toObject(data) {
    let date: Date;
    if (data.maturityDate) {
      date = new Date(data.maturityDate);
    }
    return new CreditCard(
      data.name,
      data.balance,
      date
    );
  }
}
