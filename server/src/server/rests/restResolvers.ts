import { getRestService } from './restService';

export const RestQueryResolvers = {
  nearbyRests: (_root: any, { zip }: { zip: string }) => {
    return getRestService().getNearbyRests(zip);
  },

  rest: (_root: any, { restId }: { restId: string }) => {
    return getRestService().getRest(restId);
  },
}