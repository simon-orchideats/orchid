import { ServiceType } from './../../order/orderModel';
import { ServiceDay } from './../../rest/restModel';
import { ServerResolovers } from '../../utils/apolloUtils';
import { getRestService } from './restService';
import { IRestInput } from '../../rest/restModel';

export const RestQueryResolvers: ServerResolovers = {
  doesRestDeliverToArea: async (_root: any, { addr, restId }: { addr: string, restId: string }) => {
    try {
      return await getRestService().doesRestDeliverToArea(addr, restId);
    } catch (e) {
      console.error(`[RestResolver] failed doesRestDeliverToArea for addr '${addr}' with restId '${restId}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  },

  nearbyRests: async (
    _root: any,
    {
      addr,
      from,
      to,
      serviceDay,
      serviceType,
    }: {
      addr: string,
      from: string,
      to: string,
      serviceDay: ServiceDay,
      serviceType: ServiceType,
    }
  ) => {
    try {
      return await getRestService().getNearbyRests(addr, from, to, serviceDay, serviceType);
    } catch (e) {
      console.error('[RestResolver] failed to get nearby rests', e.stack);
      throw new Error('Internal Server Error');
    }
  },

  rest: async (_root: any, { restId }: { restId: string }) => {
    try {
      return await getRestService().getRest(restId);
    } catch (e) {
      console.error(`[RestResolver] failed to get rest ${restId}`, e.stack);
      throw new Error('Internal Server Error');
    }
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