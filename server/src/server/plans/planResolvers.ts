import { getPlanService } from './planService';

export const PlanQueryResolvers = {
  availablePlans: () => {
    return getPlanService().getAvailablePlans();
  }
}