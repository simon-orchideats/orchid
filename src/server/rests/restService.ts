import { getGeoService, IGeoService } from './../place/geoService';
import { CuisineType } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { ERest, IRest } from './../../rest/restModel';

const REST_INDEX = 'rests';

export interface IRestService {
  getNearbyERests: (
    zip: string,
    cuisines?: CuisineType[],
    canAutoPick?: boolean,
    fields?: string[]
  ) => Promise<{
    _id: string,
    rest: ERest
  }[]>
  getNearbyRests: (zip: string, cuisines?: CuisineType[], fields?: string[]) => Promise<IRest[]>
  getRest: (restId: string, fields?: string[]) => Promise<IRest | null>
}

class RestService implements IRestService {
  private readonly elastic: Client
  private geoService?: IGeoService

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  public setGeoService(geoService: IGeoService) {
    this.geoService = geoService;
  }

  public async getNearbyERests(
    cityOrZip: string,
    cuisines?: CuisineType[],
    canAutoPick?: boolean,
    fields?: string[]
  ): Promise<{
    _id: string,
    rest: ERest
  }[]> {
    try {
      if (!this.geoService) throw new Error('GeoService not set');
      let geo;
      const isCity = isNaN(parseFloat(cityOrZip));
      if (isCity) {
        geo = await this.geoService.getGeocodeByCity(cityOrZip);
      } else {
        geo = await this.geoService.getGeocodeByZip(cityOrZip);
      }
      if (!geo) return [];
      const { lat, lon, state } = geo;
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
                      geo_distance : {
                        distance: '5mi',
                        'location.geo' : {
                          lat,
                          lon
                        }
                      }
                    },
                    {
                      term: {
                        'menu.isActive': true
                      }
                    },
                    {
                      term: {
                        'location.address.state': state
                      }
                    },
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
      if (canAutoPick) {
        options.body.query.bool.filter.bool.must.push({
          term: {
            'menu.canAutoPick': true
          }
        })
      }
      if (cuisines) {
        const bool = {
          bool: {
            must: [
              {
                terms: {
                  'menu.tags': cuisines
                }
              },
              {
                terms: {
                  'menu.isActive': true
                }
              }
            ],
          },
        } as any;
        if (canAutoPick) {
          bool.bool.must.push({
            term: {
              'menu.canAutoPick': true
            }
          })
        }
        options.body.query.bool.filter.bool.must.push({
          bool: {
            must: [
              {
                terms: {
                  'menu.tags': cuisines
                }
              },
              {
                terms: {
                  'menu.isActive': true
                }
              }
            ],
          },
        });
      }
      if (fields) options._source = fields;
      console.log(options);
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search(options);
      return res.body.hits.hits.map(({ _id, _source }) => ({
        rest: _source,
        _id,
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby ERests for '${cityOrZip}' and cuisines '${JSON.stringify(cuisines)}' and canAutoPick '${canAutoPick}'`, e.stack);
      throw e;
    }
  }

  // left off here
  async getNearbyRests(cityOrZip: string, cuisines?: CuisineType[], fields?: string[]): Promise<IRest[]> {
    try {
      const eRests = await this.getNearbyERests(cityOrZip, cuisines, undefined, fields);
      eRests.forEach(e => e.rest.menu.forEach(m => console.log(m.name, m.optionGroups)));
      return eRests.map(({ _id, rest }) => ({
        ...rest,
        _id,
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby rests for '${cityOrZip}' and cuisines '${JSON.stringify(cuisines)}'`, e.stack);
      throw new Error('Internal Server Error');
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
      const rest: any = res.body;
      rest._id = restId;
      return rest as IRest;
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
  restService!.setGeoService(getGeoService())
  return restService;
}
