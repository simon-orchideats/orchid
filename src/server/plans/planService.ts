import { IPlan } from './../../plan/planModel';
import Stripe from 'stripe';
import { activeConfig } from '../../config';

class PlanService {
  private readonly stripe: Stripe

  public constructor(stripe: Stripe) {
    this.stripe = stripe;
  }

  async getAvailablePlans(): Promise<IPlan[]> {
    try {
      const plans = await this.stripe.plans.list({
        limit: 100,
        active: true,
      });
      return plans.data.map(plan => ({
        stripeId: plan.id,
        mealCount: parseFloat(plan.metadata.mealCount),
        mealPrice: parseFloat(plan.metadata.mealPrice),
        weekPrice: plan.amount! / 100,
      }))
    } catch (e) {
      console.error(`[Plan service] could not get plans. '${e.message}'`);
      throw e;
    }
  }
}

let planService: PlanService;

export const initPlanService = (stripe: Stripe) => {
  if (planService) throw new Error('[PlanService] already initialized.');
  planService = new PlanService(stripe);
};

export const getPlanService = () => {
  if (planService) return planService;
  initPlanService(new Stripe(activeConfig.server.stripe.key, {
    apiVersion: '2019-12-03',
  }));
  return planService;
}
