import { getPlanService } from './planService';

export const PlanQueryResolvers = {
  availablePlans: async () => {
    return await getPlanService().getAvailablePlans();
  }
}