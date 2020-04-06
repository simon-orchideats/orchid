// import { useMemo } from "react";

/**
 * {
  "id": "plan_H2Ob1XWdwg73bM",
  "object": "plan",
  "active": true,
  "aggregate_usage": "sum",
  "amount": null,
  "amount_decimal": null,
  "billing_scheme": "tiered",
  "created": 1586036772,
  "currency": "usd",
  "interval": "week",
  "interval_count": 1,
  "livemode": false,
  "metadata": {},
  "nickname": "standard meal",
  "product": "prod_H2OZ0ZJX9MA18B",
  "tiers": [
    {
      "flat_amount": null,
      "flat_amount_decimal": null,
      "unit_amount": 1149,
      "unit_amount_decimal": "1149",
      "up_to": 7
    },
    {
      "flat_amount": null,
      "flat_amount_decimal": null,
      "unit_amount": 1099,
      "unit_amount_decimal": "1099",
      "up_to": 11
    },
    {
      "flat_amount": null,
      "flat_amount_decimal": null,
      "unit_amount": 999,
      "unit_amount_decimal": "999",
      "up_to": null
    }
  ],
  "tiers_mode": "volume",
  "transform_usage": null,
  "trial_period_days": null,
  "usage_type": "metered"
}
 */


export interface IPlan {
  readonly maxMeals: number | null;
  readonly minMeals: number;
  readonly mealPrice: number;
}

export class Plan implements IPlan {
  readonly mealPrice: number;
  readonly minMeals: number;
  readonly maxMeals: number | null;

  constructor(plan: IPlan) {
    this.mealPrice = plan.mealPrice;
    this.minMeals = plan.minMeals;
    this.maxMeals = plan.maxMeals;
  }

  public get MaxMeals() { return this.maxMeals }
  public get MinMeals() { return this.minMeals }
  public get MealPrice() { return this.mealPrice }

  //todo simon: remove this
  //@ts-ignore
  public static getPlanCounts(plans: Plan[]) {
    // return useMemo(() => {
    //   return plans && plans.reduce<number[]>(((acc, plan) => [...acc, plan.mealCount]), [])
    // }, [plans])
    return [10]
  }

  //todo simon: remove this
  //@ts-ignore
  public static getMealPrice(mealCount: number, plans: IPlan[]) {
    return 10
  }

  //todo simon: remove this
  //@ts-ignore
  public static getMealPriceFromCount(count: number, plans: IPlan[]) {
  return 10;
  }

  //todo simon: remove this
  //@ts-ignore
  public static getPlanPrice(count: number, plans: IPlan[]) {
    const price = Plan.getMealPrice(count, plans);
    return price * count;
  }
}
