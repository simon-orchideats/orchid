
export interface EPromo {
  readonly stripeCouponId: string
  readonly fullAddrWithPhoneKey: string
  readonly lastRedemptionDate: number
  readonly nextAllowedRedemptionDate: number
}

export interface IPromo {
  readonly stripeCouponId: string
  readonly percentOff: number | null
  readonly amountOff: number | null
}

export class Promo implements IPromo {
  readonly stripeCouponId: string
  readonly percentOff: number | null
  readonly amountOff: number | null

  constructor(promo: IPromo) {
    this.stripeCouponId = promo.stripeCouponId;
    this.percentOff = promo.percentOff;
    this.amountOff = promo.amountOff;
  }

  public get StripeCouponId() { return this.stripeCouponId }
  public get PercentOff() { return this.percentOff }
  public get AmountOff() { return this.amountOff }
}

export type MutationPromoRes = {
  res: IPromo | null;
  error: string | null;
}