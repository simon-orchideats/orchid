export const MIN_MEALS = 4;

export type PlanType = 'Standard' | 'Gourmet';

export const PlanTypes: {
  Standard: 'Standard',
  Gourmet: 'Gourmet',
} = {
  Standard: 'Standard',
  Gourmet: 'Gourmet',
}

export interface IPlan {
  readonly stripePlanId: string;
  readonly type: PlanType;
  readonly tiers: ITier[]
}

export class Plan implements IPlan {
  readonly stripePlanId: string;
  readonly type: PlanType;
  readonly tiers: Tier[]

  constructor(plan: IPlan) {
    this.stripePlanId = plan.stripePlanId;
    this.type = plan.type;
    this.tiers = plan.tiers.map(t => new Tier(t));
  }

  public get StripePlanId() { return this.stripePlanId }
  public get Type() { return this.type }
  public get Tiers() { return this.tiers }

  public static getPlan(type: PlanType, plans: IPlan[]) {
    return getPlanByType(type, plans);
  }
}


export interface ITier {
  readonly maxMeals: number | null;
  readonly minMeals: number;
  readonly mealPrice: number;
}

const getPlanByType = (type: PlanType, plans: IPlan[]) => {
  const plan = plans.find(p => p.type === type);
  if (!plan) {
    const err = new Error(`Failed to find plan type '${type}'`);
    console.error(err.stack);
    throw err;
  };
  return plan;
}

export class Tier implements ITier {
  readonly mealPrice: number;
  readonly minMeals: number;
  readonly maxMeals: number | null;

  constructor(tier: ITier) {
    this.mealPrice = tier.mealPrice;
    this.minMeals = tier.minMeals;
    this.maxMeals = tier.maxMeals;
  }

  public get MaxMeals() { return this.maxMeals }
  public get MinMeals() { return this.minMeals }
  public get MealPrice() { return this.mealPrice }

  public static getMealPrice(type: PlanType, count: number, plans: IPlan[]) {
    const plan = getPlanByType(type, plans);
    const tiers = plan.tiers;
    for (let i = 0; i < tiers.length; i++) {
      if (count >= tiers[i].minMeals && (tiers[i].maxMeals === null || count <= tiers[i].maxMeals!)) {
        return tiers[i].mealPrice;
      }
    }
    const err = new Error(`Failed to get meal price from count '${count}'`);
    console.error(err.stack);
    throw err;
  }

  public static getNextMealPrice(type: PlanType, count: number, plans: IPlan[]) {
    const plan = getPlanByType(type, plans);
    const tiers = plan.tiers;
    for (let i = 0; i < tiers.length; i++) {
      if (count < tiers[i].minMeals) {
        return tiers[i].mealPrice;
      }
    }
    return null
  }

  public static getCountTillNextPlan(type: PlanType, count: number, plans: IPlan[]) {
    const plan = getPlanByType(type, plans);
    const tiers = plan.tiers;
    for (let i = 0; i < tiers.length; i++) {
      if (count < tiers[i].minMeals) {
        return tiers[i].minMeals - count;
      }
    }
    return null
  }

  public static getPlanPrice(type: PlanType, count: number, plans: IPlan[]) {
    const price = Tier.getMealPrice(type, count, plans);
    return price * count;
  }

}
