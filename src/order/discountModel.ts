
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
}
