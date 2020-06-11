import Stripe from "stripe";
export const welcomePromoCouponId = 'welcome35';
export const welcomePromoAmount = 500;
export const referralFriendAmount = 625;
export const referralSelfAmount = 500;
export const referralMonthDuration = 1;
export const autoPickPromoAmount = 750;
export const oncePromoKey = 'oncePromo';

export interface EPromo {
  readonly _id: string
  readonly stripeCouponId: string
  readonly fullAddrWithPhoneKey: string
  readonly lastRedemptionDate: number
  readonly nextAllowedRedemptionDate: number
}

export type promoDurations = Stripe.Coupon.Duration

export interface IPromo {
  readonly stripeCouponId: string
  readonly percentOff: number | null
  readonly amountOff: number | null
  readonly duration: promoDurations
}

export type ReferralSource = {
  readonly userId: string
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
  readonly duration: Stripe.Coupon.Duration

  constructor(promo: IPromo) {
    this.stripeCouponId = promo.stripeCouponId;
    this.percentOff = promo.percentOff;
    this.amountOff = promo.amountOff;
    this.duration = promo.duration;
  }

  public get StripeCouponId() { return this.stripeCouponId }
  public get PercentOff() { return this.percentOff }
  public get AmountOff() { return this.amountOff }
  public get Duration() { return this.duration }

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