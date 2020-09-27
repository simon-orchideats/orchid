import { ECuisine, ITag } from './../../rest/tagModel';
import { IPlanService, getPlanService } from './../plans/planService';
import { Permissions } from './../../consumer/consumerModel';
import { MutationBoolRes, SignedInUser } from './../../utils/apolloUtils';
import { getGeoService, IGeoService } from './../place/geoService';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { ERest, IRest, IRestInput, Rest } from './../../rest/restModel';

const REST_INDEX = 'rests2';
const TAG_INDEX = 'tags';

export interface IRestService {
  addRest: (signedInUser: SignedInUser, rest: IRestInput) => Promise<MutationBoolRes>
  getAllTags: () => Promise<ITag[]>
  getNearbyERests: (
    zip: string,
    cuisines?: string[],
    fields?: string[]
  ) => Promise<{
    _id: string,
    rest: ERest
  }[]>
  getNearbyRests: (zip: string, cuisines?: string[], fields?: string[]) => Promise<IRest[]>
  getRest: (restId: string, fields?: string[]) => Promise<ERest | null>
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
    cuisines?: string[],
    fields?: string[]
  ): Promise<{
    _id: string,
    rest: ERest
  }[]> {
    try {
      if (!this.geoService) throw new Error('GeoService not set');
      const geo = await this.geoService.getGeocodeByQuery(location);
      if (!geo) return [];
      const { lat, lon } = geo;
      console.log(lat, lon);
      const options: any = {
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
                        'featured.isActive': true
                      }
                    },
                    // {
                    //   term: {
                    //     'location.address.state': state
                    //   }
                    // },
                    {
                      term: {
                        'status': 'Open',
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
      if (cuisines) {
        options.body.query.bool.filter.bool.must.push({
          bool: {
            must: [
              {
                terms: {
                  'menu.tags.name.keyword': cuisines
                }
              },
              {
                term: {
                  'menu.isActive': true
                }
              }
            ],
          },
        });
      }
      if (fields) options._source = fields;
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search(options);
      return res.body.hits.hits.map(({ _id, _source }) => ({
        rest: _source,
        _id,
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby ERests for '${location}' and cuisines '${JSON.stringify(cuisines)}'`, e.stack);
      throw e;
    }
  }

  async getNearbyRests(cityOrZip: string, cuisines?: string[], fields?: string[]): Promise<IRest[]> {
    try {
      console.log('yo im here');
      const eRests = await this.getNearbyERests(cityOrZip, cuisines, fields);
      return eRests.map(({ _id, rest }) => ({
        ...rest,
        _id,
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby rests for '${cityOrZip}' and cuisines '${JSON.stringify(cuisines)}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async getRest(restId: string, fields?: string[]): Promise<ERest | null> {
    const options: any = {
      index: REST_INDEX,
      id: restId,
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<ERest> = await this.elastic.getSource(options);
      const rest: any = res.body;
      rest._id = restId;
      return rest as ERest;
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
