import fetch from 'node-fetch';
import { activeConfig } from '../../config';
import querystring from 'querystring';
import { state } from '../../place/addressModel';

export interface IGeoService {
  getGeocode: (street: string, city: string, state: state, zip: string) => Promise<{
    lat: string,
    lon: string,
    timezone: string,
  }>
  getGeocodeByCity: (city: string) => Promise<{
    lat: string,
    lon: string,
    state: state,
  } | null>
  getGeocodeByZip: (zip: string) => Promise<{
    lat: string,
    lon: string,
    state: state,
  } | null>
}

class GeoService implements IGeoService{

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
          fields
        } = firstRes;
        if (accuracy > 0.7 && (accuracy_type === 'rooftop' || accuracy_type === 'range_interpolation' || accuracy_type === 'point')) {
          const { lat, lng } = firstRes.location;
          return {
            lat: lat as string,
            lon: lng as string,
            timezone: fields.timezone.name as string,
          }
        }
      }
      throw new Error(`Could not find coordinates for '${street} ${city} ${state}, ${zip}'`);
    } catch (e) {
      console.error('[GeoService] could not get geoCode', e.stack)
      throw e;
    }
  }

  async getGeocodeByCity(city: string): Promise<{
    lat: string
    lon: string,
    state: state,
  } | null> {
    try {
      const query = `city=${querystring.escape(city)}&api_key=${activeConfig.server.geo.key}`;
      let jsonData;
      try {
        const res = await fetch(`https://api.geocod.io/v1.3/geocode?${query}`);
        if (res.status != 200) throw new Error('Could not fetch geocode');
        jsonData = await res.json();
      } catch (e) {
        console.warn(`Could not fetch city, state for '${city}': ${e.stack}`);
        return null;
      }
      if (jsonData.results && jsonData.results.length > 0) {
        const {
          address_components,
          accuracy,
          accuracy_type,
          location,
        } = jsonData.results[0];
        if (accuracy === 1 && accuracy_type === 'place') {
          return {
            lat: location.lat,
            lon: location.lng,
            state: address_components.state,
          }
        }
      }
      console.warn(`[GeoService] Could not find lat, lon for '${city}'`);
      return null;
    } catch (e) {
      console.error('[GeoService] could not get lat, lon', e.stack);
      throw e;
    }
  }

  async getGeocodeByZip(zip: string): Promise<{
    lat: string
    lon: string,
    state: state,
  } | null> {
    try {
      const query = `postal_code=${querystring.escape(zip)}&api_key=${activeConfig.server.geo.key}`;
      let jsonData;
      try {
        const res = await fetch(`https://api.geocod.io/v1.3/geocode?${query}`);
        if (res.status != 200) throw new Error('Could not fetch geocode');
        jsonData = await res.json();
      } catch (e) {
        console.warn(`Could not fetch city, state for '${zip}': ${e.stack}`);
        return null;
      }
      if (jsonData.results && jsonData.results.length > 0) {
        const {
          address_components,
          accuracy,
          accuracy_type,
          location,
        } = jsonData.results[0];
        if (accuracy === 1 && accuracy_type === 'place') {
          return {
            lat: location.lat,
            lon: location.lng,
            state: address_components.state,
          }
        }
      }
      console.warn(`[GeoService] Could not find lat, lon for '${zip}'`);
      return null;
    } catch (e) {
      console.error('[GeoService] could not get lat, lon', e.stack);
      throw e;
    }
  }
}

let geoService: GeoService;

export const initGeoService = () => {
  if (geoService) throw new Error('[GeoService] already initialized.');
  geoService = new GeoService();
  return geoService;
};

export const getGeoService = () => {
  if (geoService) return geoService;
  initGeoService();
  return geoService;
}