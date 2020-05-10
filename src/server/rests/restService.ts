import { getGeoService, IGeoService } from './../place/geoService';
import { CuisineType } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { ERest, IRest } from './../../rest/restModel';

const REST_INDEX = 'rests';

export interface IRestService {
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

  async getNearbyRests(zip: string, cuisines?: CuisineType[], fields?: string[]): Promise<IRest[]> {
    try {
      if (!this.geoService) throw new Error('GeoService not set');
      const geo = await this.geoService.getGeocodeByZip(zip);
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
                        distance: '3mi',
                        'location.geo' : {
                          lat,
                          lon
                        }
                      }
                    },
                    {
                      term: {
                        'location.address.state': state
                      }
                    },
                  ]
                }
              }
            }
          }
        }
      }
      if (cuisines) {
        options.body.query.bool.filter.bool.must.push({
          terms: {
            'profile.tags.keyword': cuisines
          }
        });
      }
      if (fields) options._source = fields;
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search(options);
      return res.body.hits.hits.map(({ _id, _source }) => ({
        ..._source,
        _id,
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby rests for '${zip}' and cuisines '${JSON.stringify(cuisines)}'`, e.stack);
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
