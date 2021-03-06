import { IPlan } from "../plan/planModel";

export type PlanRole = 'Member' | 'Owner';

export const PlanRoles: {
  Member: 'Member',
  Owner: 'Owner',
} = {
  Member: 'Member',
  Owner: 'Owner',
}

export interface IConsumerPlan {
  readonly role: PlanRole
  readonly stripeProductPriceId: string
}

export interface EConsumerPlan extends IConsumerPlan {
  // all users belonging to the same plan will share the same stripeSubscriptionId. this is how we track multiple
  // accounts per plan
  readonly stripeSubscriptionId: string
}

export class ConsumerPlan {

  static getICopy(plan: IConsumerPlan): IConsumerPlan {
    return {
      role: plan.role,
      stripeProductPriceId: plan.stripeProductPriceId,
    }
  }

  static equals(p1: IConsumerPlan, p2: IConsumerPlan) {
    if (p1.role !== p2.role) return false;
    if (p1.stripeProductPriceId !== p2.stripeProductPriceId) return false;
    return true;
  }

  static getConsumerPlanFromIPlan(plan: IPlan) {
    return {
      role: PlanRoles.Owner,
      stripeProductPriceId: plan.stripeProductPriceId,
    }
  }

}


