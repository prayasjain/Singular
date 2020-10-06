import { of } from "rxjs";
import { Constants } from 'src/app/config/constants';

export class Insurance {
  public id: string;
  public userId: string;
  public insuranceType: InsuranceType;
  public notes: string;

  public lifeinsurance: LifeInsurance;

  constructor(
    id: string,
    insurance: LifeInsurance,
    notes?: string
  ) {
    this.id = id;

    if (insurance instanceof LifeInsurance) {
      this.insuranceType = InsuranceType.LifeInsurance;
      this.lifeinsurance = insurance;
    }
  }

  getAmountForInsurance(date: Date) {
    if (this.insuranceType === InsuranceType.LifeInsurance) {
      return of(this.lifeinsurance.insuredValue);
    }
  }

  get policyName() {
    if (this.insuranceType === InsuranceType.LifeInsurance) {
      return this.lifeinsurance.policyName;
    }
  }

  get policyNumber() {
    if (this.insuranceType === InsuranceType.LifeInsurance) {
      return this.lifeinsurance.policyNumber;
    }
  }

  get annualPremium() {
    if (this.insuranceType === InsuranceType.LifeInsurance) {
      return this.lifeinsurance.annualPremium;
    }
  }

  get insuredValue() {
    if (this.insuranceType === InsuranceType.LifeInsurance) {
      return this.lifeinsurance.insuredValue;
    }
  }
}

export enum InsuranceType {
  LifeInsurance = "Life Insurance"
}

export namespace InsuranceTypeUtils {
  export function slug(insuranceType: InsuranceType): string {
    
    return insuranceType.toLowerCase().replace(" ", "-");
  }
  export function getItemFromSlug(slug: string): InsuranceType {
    if (slug === "life-insurance") {
      return InsuranceType.LifeInsurance;
    }
  }
}

export class LifeInsurance {
  constructor(
    public policyName: string,
    public policyNumber: string,
    public annualPremium: number,
    public insuredValue: number
  ) { }

  static toObject(data) {
    
    return new LifeInsurance(
      data.policyName,
      data.policyNumber,
      +data.annualPremium,
      +data.insuredValue
    );
  }
}
