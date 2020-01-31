import { getRestService } from './restService';

export const RestQueryResolvers = {
  nearbyRests: async (_root: any, { zip }: { zip: string }) => {
    return await getRestService().getNearbyRests(zip);
  },

  rest: (_root: any, { restId }: { restId: string }) => {
    return getRestService().getRest(restId);
  },
}