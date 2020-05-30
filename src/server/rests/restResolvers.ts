import { ServerResolovers } from '../../utils/apolloUtils';
import { getRestService } from './restService';

export const RestQueryResolvers: ServerResolovers = {
  nearbyRests: async (
    _root: any,
    { cityOrZip }: { cityOrZip: string }
  ) => {
    return await getRestService().getNearbyRests(cityOrZip);
  },

  rest: (_root: any, { restId }: { restId: string }) => {
    return getRestService().getRest(restId);
  },
}