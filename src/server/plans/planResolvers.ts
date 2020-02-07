import { ServerResolovers } from './../schema/utilModels';
import { getPlanService } from './planService';

export const PlanQueryResolvers: ServerResolovers = {
  availablePlans: async () => {
    return await getPlanService().getAvailablePlans();
  }
}