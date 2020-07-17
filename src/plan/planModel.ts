export const MIN_MEALS = 4;

export type PlanName = 'Standard' | 'Gourmet';

export const PlanNames: {
  Standard: 'Standard',
  Gourmet: 'Gourmet',
} = {
  Standard: 'Standard',
  Gourmet: 'Gourmet',
}

export interface IPlan {
  readonly stripePlanId: string;
  readonly name: PlanName;
  readonly tiers: ITier[];
  readonly isActive: boolean;
}

export class Plan implements IPlan {
  readonly stripePlanId: string;
  readonly name: PlanName;
  readonly tiers: Tier[];
  readonly isActive: boolean;

  constructor(plan: IPlan) {
    this.stripePlanId = plan.stripePlanId;
    this.name = plan.name;
    this.tiers = plan.tiers.map(t => new Tier(t));
    this.isActive = plan.isActive;
  }

  public get StripePlanId() { return this.stripePlanId }
  public get Name() { return this.name }
  public get Tiers() { return this.tiers }
  public get IsActive() { return this.isActive }

  public static getActivePlan(name: string, plans: IPlan[]) {
    const plan = plans.find(p => p.name === PlanNames.Standard && p.isActive);
    if (!plan) {
      const err = new Error(`Missing active plan of name '${name}'`);
      console.error(err.stack);
      throw err;
    }
    return plan;
  }

  public static getPlan(id: string, plans: IPlan[]) {
    return getPlanById(id, plans);
  }
}


export interface ITier {
  readonly maxMeals: number | null;
  readonly minMeals: number;
  readonly mealPrice: number;
}

const getPlanById = (id: string, plans: IPlan[]) => {
  const plan = plans.find(p => p.stripePlanId === id);
  if (!plan) {
    const err = new Error(`Failed to find plan '${id}'`);
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

  public static getMealPrice(planId: string, count: number, plans: IPlan[]) {
    const plan = getPlanById(planId, plans);
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

  public static getNextTier(planId: string, count: number, plans: IPlan[]) {
    const plan = getPlanById(planId, plans);
    const tiers = plan.tiers;
    const res = [];
    for (let i = 0; i < tiers.length; i++) {
      if (count < tiers[i].minMeals) {
        res.push({
          count: tiers[i].minMeals - count,
          price: tiers[i].mealPrice
        });
      }
    }
    return res
  }

  public static getPlanPrice(planId: string, count: number, plans: IPlan[]) {
    const price = Tier.getMealPrice(planId, count, plans);
    return price * count;
  }

}
