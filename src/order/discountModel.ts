export type DiscountReason =
'Referred a friend'

export const DiscountReasons: {
  ReferredAFriend: 'Referred a friend',
} = {
  ReferredAFriend: 'Referred a friend',
}

export interface IDiscount {
  readonly description: string
  readonly amountOff: number | null
  readonly percentOff: number | null
  readonly reason: DiscountReason
  readonly referredUserId: string | null
}

export class Discount implements IDiscount {
  readonly description: string
  readonly amountOff: number | null
  readonly percentOff: number | null
  readonly reason: DiscountReason
  readonly referredUserId: string | null

  constructor(d: IDiscount) {
    this.description = d.description;
    this.amountOff = d.amountOff;
    this.percentOff = d.percentOff;
    this.reason = d.reason;
    this.referredUserId = d.referredUserId;
  }

  public get Description() { return this.description }
  public get AmountOff() { return this.amountOff }
  public get PercentOff() { return this.percentOff }
  public get Reason() { return this.reason }
  public get ReferredUserId() { return this.referredUserId }

  public static getICopy(d: IDiscount) {
    return {
      ...d,
    }
  }
}

export interface IWeeklyDiscount {
  readonly discounts: IDiscount[];
}

export class WeeklyDiscount implements IWeeklyDiscount {
  readonly discounts: IDiscount[];

  constructor(wd: IWeeklyDiscount) {
    this.discounts = wd.discounts.map(wd => ({ ...wd }))
  }

  public get Discounts() { return this.discounts }

  public static getICopy(wd: IWeeklyDiscount) {
    return {
      discounts: wd.discounts.map(d => Discount.getICopy(d))
    }
  }

  public static removeFirstDiscounts(weeklyDiscounts: IWeeklyDiscount[]) {
    const firstDiscounts = weeklyDiscounts.map(wd => {
      const discount = wd.discounts.shift();
      if (!discount) {
        const err = new Error('Missing discount in weekly discount');
        console.error(err.stack);
        throw err;
      }
      return discount;
    });
    let i = 0;
    while (i < weeklyDiscounts.length) {
      if (weeklyDiscounts[i].discounts.length === 0) {
        weeklyDiscounts.splice(i, 1);
      } else {
        i++;
      }
    }
    return firstDiscounts;
  }
}