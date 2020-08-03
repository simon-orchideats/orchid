import { MIN_MEALS, IPlan, PlanName } from './../../plan/planModel';
import Stripe from 'stripe';
import { activeConfig } from '../../config';

export interface IPlanService {
  getAvailablePlans(): Promise<IPlan[]>
}

class PlanService implements IPlanService {
  private readonly stripe: Stripe

  public constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async getAvailablePlans(): Promise<IPlan[]> {
    try {
      const plans = await this.stripe.plans.list({
        product: activeConfig.server.stripe.productId,
      });
      return plans.data.map(p => {
        let min: number | null = MIN_MEALS;
        if (!p.tiers) throw new Error('Could not get tiers');
        if (!p.nickname) throw new Error('No plan nickname');
        return {
          stripePlanId: p.id,
          isActive: p.active,
          name: p.nickname as PlanName,
          tiers: p.tiers.map(tier => {
            if (!tier.unit_amount) throw new Error(`Tier up_to '${tier.up_to}' missing unit amount`);
            if (min === null) throw new Error('min is null');
            const res = {
              minMeals: min,
              maxMeals: tier.up_to,
              mealPrice: tier.unit_amount,
            };
            min = res.maxMeals && res.maxMeals + 1;
            return res;
          })
        }
      })
    } catch (e) {
      console.error(`[PlanService] could not get plans. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }
}

let planService: PlanService;

export const initPlanService = (stripe: Stripe) => {
  if (planService) throw new Error('[PlanService] already initialized.');
  planService = new PlanService(stripe);
  return planService;
};

export const getPlanService = () => {
  if (planService) return planService;
  initPlanService(new Stripe(activeConfig.server.stripe.key, {
    apiVersion: '2020-03-02',
  }));
  return planService;
}
