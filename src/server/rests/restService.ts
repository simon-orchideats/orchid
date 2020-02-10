import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { Location } from '../../place/locationModel';
import { RestProfile } from '../../rest/restProfileModel';
import { Meal } from './../../rest/mealModel';
import { Address } from '../../place/addressModel';
import { Rest, ERest } from './../../rest/restModel';

const REST_INDEX = 'rests';

export class RestService {
  private readonly elastic: Client

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  async getNearbyRests(zip: string) {
    try {
      const res: ApiResponse<SearchResponse<ERest>> = await this.elastic.search({
        index: REST_INDEX,
        size: 1000,
      });
      return res.body.hits.hits.map(({ _id, _source }) => ({
        ..._source,
        _id
      }))
    } catch (e) {
      console.error(`[RestService] could not get nearby rests for '${zip}'. '${e.stack}'`);
      throw e;
    }

  }

  getRest(restId: string) {
    return new Rest({
      _id: restId,
      location: new Location({
        address: new Address({
          address1: '100 greene st',
          city: 'Jersey City',
          state: 'NJ',
          zip: '12345'
        }),
        timezone: 'America/New_York'
      }),
      menu: [
        new Meal({
          _id: 'meal00',
          img: 'placeholderMeal2.jpg',
          name: 'Ricebowl 1'
        }),
      ],
      profile: new RestProfile({
        name: 'Domo6',
        phone: '609-513-8166',
      })
    });
  }
}

let restService: RestService;

export const initRestService = (elastic: Client) => {
  if (restService) throw new Error('[RestService] already initialized.');
  restService = new RestService(elastic);
};

export const getRestService = () => {
  if (restService) return restService;
  initRestService(initElastic());
  return restService;
}
