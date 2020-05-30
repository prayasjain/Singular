export class Goal {
  constructor(
    public id: string,
    public name: string,
    public amountReqd: number,
    public creationDate: Date
  ) {}
}

export class Contribution {
  constructor(
    public id: string,
    public assetId: string,
    public goalId: string,
    public percentageContribution: number
  ) {}
}
