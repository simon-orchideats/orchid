import { getGeoService, IGeoService } from './../place/geoService';
import { CuisineType } from './../../consumer/consumerModel';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { ERest, IRest } from './../../rest/restModel';

const REST_INDEX = 'rests';

export interface IRestService {
  getNearbyRests: (zip: string) => Promise<IRest[]>
  getRest: (restId: string, fields?: string[]) => Promise<IRest | null>
  getRestsByCuisines: (cuisines: CuisineType[], fields?: string[]) => Promise<IRest[]>
}

class RestService implements IRestService {
  private readonly elastic: Client
  private readonly geoService: IGeoService

  public constructor(elastic: Client, geoService: IGeoService) {
    this.elastic = elastic;
    this.geoService = geoService;
  }

  async getNearbyRests(zip: string): Promise<IRest[]> {
    try {
      const geo = await this.geoService.getCityState(zip);
      if (!geo) return [];
      const { city, state } = geo;
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search({
        index: REST_INDEX,
        size: 1000, // todo handle case when results > 1000
      });
      return res.body.hits.hits.map(({ _id, _source }) => ({
        ..._source,
        _id,
        location: {
          address: {
            ..._source.location.address,
            city,
            state,
          }
        }
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby rests for '${zip}'. '${e.stack}'`);
      throw e;
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

  async getRestsByCuisines(cuisines: CuisineType[], fields?: string[]): Promise<IRest[]> {
    const options: any = {
      index: REST_INDEX,
      size: 1000,
      body: {
        query: {
          bool: {
            filter: {
              terms: {
                'profile.tags.keyword': cuisines
              }
            }
          }
        }
      }
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search(options);
      return res.body.hits.hits.map(({ _id, _source }) => ({
        ..._source,
        _id
      }))
    } catch (e) {
      console.error(`[RestService] could not get rests of cuisines '${JSON.stringify(cuisines)}'. '${e.stack}'`);
      throw e;
    }
  }
}

let restService: RestService;

export const initRestService = (elastic: Client, geoService: IGeoService) => {
  if (restService) throw new Error('[RestService] already initialized.');
  restService = new RestService(elastic, geoService);
};

export const getRestService = () => {
  if (restService) return restService;
  initRestService(
    initElastic(),
    getGeoService(),
  );
  return restService;
}
