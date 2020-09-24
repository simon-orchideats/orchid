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
  readonly stripeProductId: string
  readonly stripeProductName: string
}

export interface EConsumerPlan extends IConsumerPlan {
  readonly stripeSubscriptionId: string
}

export class ConsumerPlan {

  static getICopy(plan: IConsumerPlan) {
    return {
      role: plan.role,
      stripeProductId: plan.stripeProductId,
      stripeProductName: plan.stripeProductName,
    }
  }

  // static getIConsumerPlanInputFromConsumerPlan(plan: any) {
  //   console.log(plan)
  // }

  static equals(p1: IConsumerPlan, p2: IConsumerPlan) {
    if (p1.role !== p2.role) return false;
    if (p1.stripeProductId !== p2.stripeProductId) return false;
    if (p1.stripeProductName !== p2.stripeProductName) return false;
    // if (!Schedule.equalsLists(plan1.Schedules, plan2.Schedules)) return false;
    // if (!Tag.areTagsEqual(plan1.Tags, plan2.Tags)) return false;
    // if (!MealPlan.equalsLists(plan1.MealPlans, plan2.MealPlans)) return false;
    return true;
  }}


