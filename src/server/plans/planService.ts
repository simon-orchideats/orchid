import { IPlan } from './../../plan/planModel';
import Stripe from 'stripe';
import { activeConfig } from '../../config';

export interface IPlanService {
  getAvailablePlans(): Promise<IPlan[]>
  getPlan(planId: string): Promise<IPlan | null>
  getPlanByCount(count: number): Promise<IPlan | null> 
}

class PlanService implements IPlanService {
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
      console.error(`[PlanService] could not get plans. '${e.message}'`);
      throw e;
    }
  }

  async getPlanByCount(count: number): Promise<IPlan | null> {
    try {
      const plans = await this.getAvailablePlans();
      const target = plans.find(plan => plan.mealCount === count);
      return target ? target : null;
    } catch (e) {
      console.error(`[PlanService] could not get plans. '${e.message}'`);
      throw e;
    }
  }

  async getDefaultPlan(): Promise<any> {
    try {
      const plans = await this.stripe.plans.list({
        limit: 100,
        active: true,
      });
      const test  = plans.data.filter(plan => parseFloat(plan.metadata.mealCount) === 4);
      console.log(test);
    }
  }

  async getPlan(planId: string): Promise<IPlan | null> {
    try {
      const plan = await this.stripe.plans.retrieve(planId);
      if (!plan.active) throw new Error(`Plan ${planId} is inactive`);
      return {
        stripeId: plan.id,
        mealCount: parseFloat(plan.metadata.mealCount),
        mealPrice: parseFloat(plan.metadata.mealPrice),
        weekPrice: plan.amount! / 100,
      }
    } catch (e) {
      console.error(`[PlanService] could not get plan '${planId}'. ${e.message}'`);
      return null;
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
