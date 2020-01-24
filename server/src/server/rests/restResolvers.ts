import { getRestService } from './restService';

export const RestQueryResolvers = {
  nearbyRests: (_root: any, args: { zip: string }) => {
    return getRestService().getNearbyRests(args.zip);
  }
}