import { ServerResolovers } from '../utils/models';
import { getPlanService } from './planService';

export const PlanQueryResolvers: ServerResolovers = {
  availablePlans: async () => {
    return await getPlanService().getAvailablePlans();
  }
}