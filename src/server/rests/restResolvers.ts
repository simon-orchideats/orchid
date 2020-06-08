import { ServerResolovers } from '../../utils/apolloUtils';
import { getRestService } from './restService';
import { IRestInput } from '../../rest/restModel';

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

  allTags: async () => {
    try {
      return await getRestService().getAllTags();
    } catch (e) {
      console.error('[RestResolver] failed to get all tags', e.stack);
      throw new Error('Internal Server Error');
    }
  },
}

export const RestMutationResolvers: ServerResolovers = {
  addRest: async (_root, { rest }: { rest: IRestInput }, { signedInUser }) => {
    return getRestService().addRest(signedInUser, rest);
  },
}