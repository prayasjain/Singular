export class Asset {
  constructor(
    public id: string,
    public name: string,
    public details: string,
    public amount: number,
    public assetType: AssetTypeLayout,
    public percent_unallocated: number
  ) {}
}

export interface AssetTypeLayout {
  typeName: string;
  typeNameSlug: string;
}

export const AssetType = {
  SavingsAccount: {
    typeName: "Savings Account",
    typeNameSlug: "savings-account",
  },
  Deposits: { typeName: "Deposits", typeNameSlug: "deposits" },
  MutualFunds: { typeName: "Mutual Funds", typeNameSlug: "mutual-funds" },
  Equity: { typeName: "Equity", typeNameSlug: "equity" },
  Cash: { typeName: "Cash", typeNameSlug: "cash" },
};
