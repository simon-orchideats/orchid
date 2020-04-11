export const MIN_MEALS = 4;

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

  public static getMealPrice(count: number, plans: IPlan[]) {
    for (let i = 0; i < plans.length; i++) {
      if (count >= plans[i].minMeals && (plans[i].maxMeals === null || count <= plans[i].maxMeals!)) {
        return plans[i].mealPrice;
      }
    }
    const err = new Error(`Failed to get meal price from count '${count}'`);
    console.error(err.stack);
    throw err;
  }

  public static getNextMealPrice(count: number, plans: IPlan[]) {
    for (let i = 0; i < plans.length; i++) {
      if (count < plans[i].minMeals) {
        return plans[i].mealPrice;
      }
    }
    return null
  }

  public static getCountTillNextPlan(count: number, plans: IPlan[]) {
    for (let i = 0; i < plans.length; i++) {
      if (count < plans[i].minMeals) {
        return plans[i].minMeals - count;
      }
    }
    return null
  }

  public static getPlanPrice(count: number, plans: IPlan[]) {
    const price = Plan.getMealPrice(count, plans);
    return price * count;
  }
}
