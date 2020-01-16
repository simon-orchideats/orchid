import { Context } from '../schema/utilModels';

export const PlanQueryResolvers = {
  availablePlans: (_root: any, _args: any, { PlanService }: Context) => {
    return PlanService.getAvailablePlans();
  }
}