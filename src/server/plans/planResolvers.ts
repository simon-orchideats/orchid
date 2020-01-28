// import { getPlanService } from './planService';

export const PlanQueryResolvers = {
  availablePlans: async (_parent: object, _args: any, { PlanService }: any) => {
    return await PlanService.getAvailablePlans();
  }
}