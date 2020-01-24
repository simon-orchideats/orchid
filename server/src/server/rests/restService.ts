import { Location } from './../../rest/locationModel';
import { Profile } from './../../rest/profileModel';
import { Meal } from './../../rest/mealModel';
import { Address } from './../../rest/addressModel';
import { Rest } from './../../rest/restModel';

export class RestService {
  constructor() {}

  getNearbyRests(zip: string) {
    return [
      new Rest({
        _id: 'rest1',
        location: new Location({
          address: new Address({
            address1: '100 greene st',
            city: 'Jersey City',
            state: 'NJ',
            zip,
          }),
          timezone: 'America/New_York'
        }),
        menu: [
          new Meal({
            _id: 'meal1',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 1'
          }),
          new Meal({
            _id: 'meal2',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 2'
          }),
          new Meal({
            _id: 'meal3',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 3'
          }),
          new Meal({
            _id: 'meal4',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 4'
          }),
          new Meal({
            _id: 'meal5',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 5'
          }),
        ],
        profile: new Profile({
          name: 'Domo',
          phone: '609-513-8166',
        })
      }),
      new Rest({
        _id: 'rest2',
        location: new Location({
          address: new Address({
            address1: '100 greene st',
            city: 'Jersey City',
            state: 'NJ',
            zip,
          }),
          timezone: 'America/New_York'
        }),
        menu: [
          new Meal({
            _id: 'meal21',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 1'
          }),
          new Meal({
            _id: 'meal22',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 2'
          }),
          new Meal({
            _id: 'meal23',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 3'
          }),
          new Meal({
            _id: 'meal24',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 4'
          }),
          new Meal({
            _id: 'meal25',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 5'
          }),
        ],
        profile: new Profile({
          name: 'Domo2',
          phone: '609-513-8166',
        })
      }),
      new Rest({
        _id: 'rest3',
        location: new Location({
          address: new Address({
            address1: '100 greene st',
            city: 'Jersey City',
            state: 'NJ',
            zip,
          }),
          timezone: 'America/New_York'
        }),
        menu: [
          new Meal({
            _id: 'meal31',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 1'
          }),
          new Meal({
            _id: 'meal32',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 2'
          }),
          new Meal({
            _id: 'meal33',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 3'
          }),
          new Meal({
            _id: 'meal34',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 4'
          }),
          new Meal({
            _id: 'meal35',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 5'
          }),
        ],
        profile: new Profile({
          name: 'Domo3',
          phone: '609-513-8166',
        })
      }),
      new Rest({
        _id: 'rest4',
        location: new Location({
          address: new Address({
            address1: '100 greene st',
            city: 'Jersey City',
            state: 'NJ',
            zip,
          }),
          timezone: 'America/New_York'
        }),
        menu: [
          new Meal({
            _id: 'meal41',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 1'
          }),
          new Meal({
            _id: 'meal42',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 2'
          }),
          new Meal({
            _id: 'meal43',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 3'
          }),
          new Meal({
            _id: 'meal44',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 4'
          }),
          new Meal({
            _id: 'meal45',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 5'
          }),
        ],
        profile: new Profile({
          name: 'Domo4',
          phone: '609-513-8166',
        })
      }),
      new Rest({
        _id: 'rest5',
        location: new Location({
          address: new Address({
            address1: '100 greene st',
            city: 'Jersey City',
            state: 'NJ',
            zip,
          }),
          timezone: 'America/New_York'
        }),
        menu: [
          new Meal({
            _id: 'meal51',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 1'
          }),
          new Meal({
            _id: 'meal52',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 2'
          }),
          new Meal({
            _id: 'meal53',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 3'
          }),
          new Meal({
            _id: 'meal54',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 4'
          }),
          new Meal({
            _id: 'meal55',
            img: 'placeholderMeal2.jpg',
            name: 'Ricebowl 5'
          }),
        ],
        profile: new Profile({
          name: 'Domo5',
          phone: '609-513-8166',
        })
      }),
    ];
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
      profile: new Profile({
        name: 'Domo6',
        phone: '609-513-8166',
      })
    });
  }
}

let restService: RestService;

export const getRestService = () => {
  if (restService) return restService;
  restService = new RestService();
  return restService;
};
