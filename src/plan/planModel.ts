import { useMemo } from "react";
export interface EPlan {
  readonly mealCount: number;
  readonly mealPrice: number;
  readonly weekPrice: number;
}

export interface IPlan extends EPlan {
  readonly _id: string;
}

export class Plan implements IPlan {
  readonly _id: string;
  readonly mealCount: number;
  readonly mealPrice: number;
  readonly weekPrice: number;

  constructor(plan: IPlan) {
    this._id = plan._id;
    this.mealCount = plan.mealCount;
    this.mealPrice = plan.mealPrice;
    this.weekPrice = plan.weekPrice;
  }

  public get Id() { return this._id }
  public get MealCount() { return this.mealCount }
  public get MealPrice() { return this.mealPrice }
  public get WeekPrice() { return this.weekPrice }

  public static getPlanId(mealCount: number, plans?: IPlan[]) {
    if (!plans) return undefined;
    for (let i = 0; i < plans.length; i++) {
      if (plans[i].mealCount === mealCount) return plans[i]._id;
    }
    return undefined;
  }

  public static getPlanCounts(plans?: Plan[]) {
    return useMemo(() => {
      return plans && plans.reduce<number[]>(((acc, plan) => [...acc, plan.mealCount]), [])
    }, [plans])
  }
}
