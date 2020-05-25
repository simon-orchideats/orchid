
export const welcomePromoAmount = 1000;
export const referralFriendAmmount = 1100;
export const referralSelfAmount = 1100;

export interface EPromo {
  readonly _id: string
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

export type ReferralSource = {
  readonly stripeCustomerId: string
  readonly amountOff: number | null
  readonly percentOff: number | null
}

export interface ReferralPromo extends IPromo {
  readonly referralSource: ReferralSource
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

  public static getICopy(p: IPromo) {
    return {
      ...p
    }
  }
}

export type MutationPromoRes = {
  res: IPromo | null;
  error: string | null;
}

export const welcomePromoSubscriptionMetaKey = 'welcomePromo';