export class Asset {
  constructor(public id: string, public name: string, public amount: number) {}
}

export class Contribution {
  constructor(
    public id: string,
    public assetId: string,
    public goalId: string,
    public percentageContribution: number
  ) {}
}
