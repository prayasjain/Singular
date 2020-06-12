export class Goal {
  public userId: string;
  constructor(
    public id: string,
    public name: string,
    public amountReqd: number,
    public creationDate: Date
  ) {}
}

export class Contribution {
  public userId: string;
  constructor(
    public id: string,
    public assetId: string,
    public goalId: string,
    public percentageContribution: number
  ) {}
}
