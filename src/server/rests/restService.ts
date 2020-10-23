import { ServiceType, ServiceTypes } from './../../order/orderModel';
import { ECuisine, ITag } from './../../rest/tagModel';
import { IPlanService, getPlanService } from './../plans/planService';
import { Permissions } from './../../consumer/consumerModel';
import { MutationBoolRes, SignedInUser } from './../../utils/apolloUtils';
import { getGeoService, IGeoService } from './../place/geoService';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { ERest, IRest, IRestInput, Rest, ServiceDay } from './../../rest/restModel';

const REST_INDEX = 'rests4';
const TAG_INDEX = 'tags';

export interface IRestService {
  addRest: (signedInUser: SignedInUser, rest: IRestInput) => Promise<MutationBoolRes>
  doesRestDeliverToArea: (addr: string, restId: string) => Promise<boolean>
  getAllTags: () => Promise<ITag[]>
  getNearbyERests: (
    addr: string,
    from: string,
    to: string,
    serviceDay: ServiceDay,
    serviceType: ServiceType,
    cuisines?: string[],
    fields?: string[]
  ) => Promise<{
    _id: string,
    rest: ERest
  }[]>
  getNearbyRests: (
    addr: string,
    cuisines: string[],
    from: string,
    to: string,
    serviceDay: ServiceDay,
    serviceType: ServiceType,
    fields?: string[]
  ) => Promise<IRest[]>
  getERest: (restId: string, fields?: string[]) => Promise<ERest | null>
  getRest: (restId: string, fields?: string[]) => Promise<IRest | null>
}

class RestService implements IRestService {
  private readonly elastic: Client
  private geoService?: IGeoService
  private  planService?: IPlanService

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  public setGeoService(geoService: IGeoService) {
    this.geoService = geoService;
  }

  public setPlanService(planService: IPlanService) {
    this.planService = planService;
  }

  public async doesRestDeliverToArea(addr: string, restId: string) {
    let options: any;
    try {
      if (!this.geoService) throw new Error('GeoService not set');
      const geo = await this.geoService.getGeocodeByQuery(addr);
      if (!geo) {
        throw new Error(`Couldn't verify this address ${addr}`);
      };
      const { lat, lon } = geo;
      options = {
        index: REST_INDEX,
        size: 1000, // todo handle case when results > 1000
        body: {
          query: {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      geo_shape : {
                        'location.geoShape' : {
                          shape: {
                            type: 'point',
                            coordinates: [ lon, lat ]
                          },
                          relation: 'intersects'
                        }
                      }
                    },
                    {
                      term: {
                        _id: restId
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search(options);
      if (res.body.hits.total.value > 1) throw new Error('Got multiple rests');
      if (res.body.hits.total.value === 1) return true;
      return false;
    } catch (e) {
      console.error(`[RestService] could not doesRestDeliverToArea '${addr}' and with restId '${restId}'`, e.stack);
      throw e;
    }
  }

  public async addRest(signedInUser: SignedInUser, rest: IRestInput) {
    try {
      if (!signedInUser) throw new Error('No signed in user');
      if (!signedInUser.permissions.includes(Permissions.createRests)) throw new Error (`'${signedInUser._id}' Unauthorized to add rest`);
      if (!this.geoService) throw new Error('GeoService not set');
      if (!this.planService) throw new Error('PlanService not set');
      const {
        address1,
        city,
        state,
        zip,
      } = rest.address
      const geo = await this.geoService.getGeocode(address1, city, state, zip);
      const eRest: ERest = Rest.getERestFromRestInput(
        rest,
        geo,
        350,
        1000,
        0.06625
      );
      try {
        await this.elastic.index({
          index: REST_INDEX,
          body: eRest,
        });
        return {
          res: true,
          error: null,
        }
      } catch (e) {
        console.error(`Failed to index rest, '${rest.profile.name}' for '${signedInUser._id}'`, e.stack);
        throw e;
      }
    } catch (e) {
      console.error(`Failed to add rest, '${rest.profile.name}' for '${signedInUser?._id}'`, e.stack);
      throw e;
    }
  }

  public async getAllTags() {
    try {
      const res: ApiResponse<SearchResponse<ECuisine>> = await this.elastic.search({
        index: TAG_INDEX,
        size: 1000, // todo handle case when results > 1000
      });
      return res.body.hits.hits.map(({ _source }) => _source)
    } catch (e) {
      console.error(`[RestService] could not get cuisines`, e.stack);
      throw e;
    }
  }

  public async getNearbyERests(
    location: string,
    from: string,
    to: string,
    serviceDay: ServiceDay,
    serviceType: ServiceType,
    cuisines?: string[],
    fields?: string[]
  ): Promise<{
    _id: string,
    rest: ERest
  }[]> {
    console.log(from, to, serviceDay);
    let options: any;
    try {
      if (!this.geoService) throw new Error('GeoService not set');
      const geo = await this.geoService.getGeocodeByQuery(location);
      if (!geo) {
        console.warn(`Failed to get lat/lon for ${location}`);
        return [];
      }
      const { lat, lon } = geo;
      options = {
        index: REST_INDEX,
        size: 1000, // todo handle case when results > 1000
        body: {
          query: {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        'featured.isActive': true
                      }
                    },
                    {
                      term: {
                        'status': 'Active',
                      }
                    },
                    // {
                    //   nested: {
                    //     path: 'hours',
                    //     query: {
                    //       bool: {
                    //         filter: {
                    //           bool: {
                    //             must: [
                    //               {
                    //                 term: {
                    //                   'hours.name': serviceType
                    //                 }
                    //               },
                    //               {
                    //                 nested: {
                    //                   path: `hours.weekHours.${serviceDay}`,
                    //                   query: {
                    //                     bool: {
                    //                       filter: {
                    //                         bool: {
                    //                           must: [
                    //                             {
                    //                               range: {
                    //                                 [`hours.weekHours.${serviceDay}.open`]: {
                    //                                   lte: from
                    //                                 }
                    //                               }
                    //                             },
                    //                             {
                    //                               range: {
                    //                                 [`hours.weekHours.${serviceDay}.close`]: {
                    //                                   gte: to
                    //                                 }
                    //                               }
                    //                             }
                    //                           ]
                    //                         }
                    //                       }
                    //                     }
                    //                   }
                    //                 }
                    //               }
                    //             ]
                    //           }
                    //         }
                    //       }
                    //     }
                    //   }
                    // }
                  ]
                }
              }
            }
          }
        }
      }
      console.log(cuisines);
      // todo update this query to use nested so we only get meals that are active and follow the cuisine
      if (cuisines && cuisines.length > 0) {
        options.body.query.bool.filter.bool.must.push({
          terms: {
            'featured.tags.name.keyword': cuisines
          }
        });
      }
      if (serviceType === ServiceTypes.Pickup) {
        options.body.query.bool.filter.bool.must.push({
          geo_distance : {
            distance: '5mi',
            'location.geoPoint' : {
              lat,
              lon
            }
          }
        })
      } else if (serviceType === ServiceTypes.Delivery) {
        options.body.query.bool.filter.bool.must.push({
          geo_shape : {
            'location.geoShape' : {
              shape: {
                type: 'point',
                coordinates: [ lon, lat ]
              },
              relation: 'intersects'
            }
          }
        })
      } else {
        throw new Error(`Got invalid service type '${serviceType}'`);
      }
      if (fields) options._source = fields;
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search(options);
      return res.body.hits.hits.map(({ _id, _source }) => ({
        rest: _source,
        _id,
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby ERests for '${location}' and options '${JSON.stringify(options)}' and cuisines '${JSON.stringify(cuisines)}'`, e.stack);
      throw e;
    }
  }

  async getNearbyRests(
    addr: string,
    cuisines: string[],
    from: string,
    to: string,
    serviceDay: ServiceDay,
    serviceType: ServiceType,
    fields?: string[]
  ): Promise<IRest[]> {
    try {
      const eRests = await this.getNearbyERests(
        addr,
        from,
        to,
        serviceDay,
        serviceType,
        cuisines, 
        fields
      );
      return eRests.map(({ _id, rest }) => ({
        ...rest,
        // discount: {
        //   description: null,
        //   amountOff: null,
        //   percentOff: 10,
        // },
        _id,
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby rests for '${addr}' and cuisines '${JSON.stringify(cuisines)}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async getERest(restId: string, fields?: string[]): Promise<ERest | null> {
    const options: any = {
      index: REST_INDEX,
      id: restId,
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<ERest> = await this.elastic.getSource(options);
      return res.body;
    } catch (e) {
      console.error(`[RestService] failed to get ERest '${restId}'`, e.stack);
      return null;
    }
  }

  async getRest(restId: string, fields?: string[]): Promise<IRest | null> {
    const options: any = {
      index: REST_INDEX,
      id: restId,
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<ERest> = await this.elastic.getSource(options);
      return Rest.getRestFromERest(res.body, restId);
    } catch (e) {
      console.error(`[RestService] failed to get rest '${restId}'`, e.stack);
      return null;
    }
  }
}

let restService: RestService;

export const initRestService = (elastic: Client) => {
  if (restService) throw new Error('[RestService] already initialized.');
  restService = new RestService(elastic);
  return restService;
};

export const getRestService = () => {
  if (restService) return restService;
  initRestService(initElastic());
  restService!.setGeoService(getGeoService());
  restService!.setPlanService(getPlanService());
  return restService;
}
