import { ServerResolovers } from '../../utils/apolloUtils';
import { getRestService } from './restService';

export const RestQueryResolvers: ServerResolovers = {
  nearbyRests: async (
    _root: any,
    { zip }: { zip: string }
  ) => {
    return await getRestService().getNearbyRests(zip);
  },

  rest: (_root: any, { restId }: { restId: string }) => {
    return getRestService().getRest(restId);
  },
}