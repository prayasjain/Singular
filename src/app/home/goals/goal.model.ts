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

  static deepCopy(c: Contribution) {
    let newO = new Contribution(c.id, c.assetId, c.goalId, c.percentageContribution);
    newO.userId = c.userId;
    return newO;
  }
}
