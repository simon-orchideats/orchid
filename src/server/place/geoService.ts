import fetch from 'node-fetch';
import { activeConfig } from '../../config';
import querystring from 'querystring';
import { state } from '../../place/addressModel';

class GeoService {
  async getGeocode(street: string, city: string, state: state, zip: string) {
    try {
      const query = `street=${querystring.escape(street)}`
                  + `&city=${querystring.escape(city)}`
                  + `&state=${querystring.escape(state)}`
                  + `&postal_code=${querystring.escape(zip)}`
                  + `&fields=timezone`
                  + `&api_key=${activeConfig.server.geo.key}`;
      let jsonData;
      try {
        const res = await fetch(`https://api.geocod.io/v1.3/geocode?${query}`);
        if (res.status != 200) throw new Error('Could not fetch geocode');
        jsonData = await res.json();
      } catch (e) {
        throw new Error('Could not fetch geocode');
      }
      if (jsonData.results && jsonData.results.length > 0) {
        // always take first result as it has highest accuracy
        const firstRes = jsonData.results[0];
        const {
          accuracy,
          accuracy_type,
          // fields
        } = firstRes;
        if (accuracy > 0.7 && (accuracy_type === 'rooftop' || accuracy_type === 'range_interpolation' || accuracy_type === 'point')) {
          const { lat, lng } = firstRes.location;
          return {
            geo: {
              lat: lat as string,
              lon: lng as string,
            },
            // timezone: {
            //   name: fields.timezone.name as string,
            //   shortName: fields.timezone.abbreviation as string
            // }
          }
        }
      }
      throw new Error(`Could not find coordinates for '${street} ${city} ${state}, ${zip}'`);
    } catch (e) {
      console.error('[GeoService] could not get geoCode', e.stack)
      throw e;
    }
  }
}

let geoService: GeoService;

export const initGeoService = () => {
  if (geoService) throw new Error('[GeoService] already initialized.');
  geoService = new GeoService();
};

export const getGeoService = () => {
  if (geoService) return geoService;
  initGeoService();
  return geoService;
}