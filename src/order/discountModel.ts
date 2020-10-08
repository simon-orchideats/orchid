
export interface IDiscount {
  readonly description: string | null
  readonly amountOff: number | null
  readonly percentOff: number | null
}

export class Discount {
  static getICopy(d: IDiscount): IDiscount {
    return {
      description: d.description,
      amountOff: d.amountOff,
      percentOff: d.percentOff,
    }
  }

  static equals(d1: IDiscount, d2: IDiscount): boolean {
    return d1.description === d2.description
      && d1.amountOff === d2.amountOff
      && d1.percentOff === d2.percentOff
  }
}
