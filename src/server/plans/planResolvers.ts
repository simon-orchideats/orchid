import { ServerResolovers } from '../../utils/apolloUtils';
import { getPlanService } from './planService';

export const PlanQueryResolvers: ServerResolovers = {
  availablePlans: async () => {
    return await getPlanService().getAvailablePlans();
  }
}