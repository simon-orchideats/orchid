import { useMemo } from "react";

export interface IPlan {
  readonly stripeId: string;
  readonly mealCount: number;
  readonly mealPrice: number;
  readonly weekPrice: number;
}

export class Plan implements IPlan {
  readonly stripeId: string;
  readonly mealCount: number;
  readonly mealPrice: number;
  readonly weekPrice: number;

  constructor(plan: IPlan) {
    this.stripeId = plan.stripeId;
    this.mealCount = plan.mealCount;
    this.mealPrice = plan.mealPrice;
    this.weekPrice = plan.weekPrice;
  }

  public get StripeId() { return this.stripeId }
  public get MealCount() { return this.mealCount }
  public get MealPrice() { return this.mealPrice }
  public get WeekPrice() { return this.weekPrice }

  public static getPlanId(mealCount: number, plans?: IPlan[]) {
    if (!plans) return undefined;
    for (let i = 0; i < plans.length; i++) {
      if (plans[i].mealCount === mealCount) return plans[i].stripeId;
    }
    return undefined;
  }

  public static getPlanCounts(plans?: Plan[]) {
    return useMemo(() => {
      return plans && plans.reduce<number[]>(((acc, plan) => [...acc, plan.mealCount]), [])
    }, [plans])
  }

  public static getPlanCount(stripePlanId: string, plans: Plan[]) {
    for (let i = 0; i < plans.length; i++) {
      if (plans[i].StripeId === stripePlanId) return plans[i].MealCount;
    }
    const err = new Error(`No count found for stripePlanId '${stripePlanId}'`);
    console.error(err.stack);
    throw err;
  }

  public static getPlanPrice(stripePlanId: string | null, plans: Plan[]) {
    for (let i = 0; i < plans.length; i++) {
      if (plans[i].StripeId === stripePlanId) return plans[i].WeekPrice;
    }
    const err = new Error(`No plan found for stripePlanId '${stripePlanId}'`);
    console.error(err.stack);
    throw err;
  }

  public static getMealPrice(stripePlanId: string | null, plans: Plan[]) {
    for (let i = 0; i < plans.length; i++) {
      if (plans[i].StripeId === stripePlanId) return plans[i].MealPrice;
    }
    const err = new Error(`No plan found for stripePlanId '${stripePlanId}'`);
    console.error(err.stack);
    throw err;
  }

  public static getMealPriceFromCount(count: number, plans: IPlan[]) {
    for (let i = 0; i < plans.length; i++) {
      if (plans[i].mealCount === count) return plans[i].mealPrice;
    }
    const err = new Error(`No plan found for count '${count}'`);
    console.error(err.stack);
    throw err;
  }
}
