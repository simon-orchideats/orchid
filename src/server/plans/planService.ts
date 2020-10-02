import { IPlan, PlanName } from './../../plan/planModel';
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
      const plans = await this.stripe.prices.list({
        active: true,
      });
      return plans.data.map(p => ({
        stripeProductPriceId: p.id,
        name: p.nickname as PlanName,
        price: p.unit_amount!,
        numAccounts: parseInt(p.metadata.numAccounts)
      }))
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
    apiVersion: '2020-08-27',
  }));
  return planService;
}
