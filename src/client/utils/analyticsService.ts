import { isServer } from './isServer';
import { activeConfig } from '../../config';
import { AmplitudeClient } from 'amplitude-js';
import Router from 'next/router'

const amplitude: {
  getInstance: () => AmplitudeClient
} = isServer() ? null : require("amplitude-js");

export const events = {
  CHECKEDOUT: 'Checkedout',
  CLICKED_MENU: 'Clicked menu route',
  NAVIGATED: 'Navigated to route',
  OPENED_APP: 'Opened app',
  OPENED_DESCRIPTION: 'Opened description',
  OPENED_SEE_FULL_MENU: 'Opened see full menu',
}

export const fbEvents = {
  TRACK_CUSTOM: 'trackCustom',
  INIT: 'init',
  TRACK: 'track',
  PAGE_VIEW: 'PageView',
}

export class AnalyticsService {
  private static _instance: AnalyticsService;

  private didInit: boolean = false;
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public async init(): Promise<void> {
    if (this.didInit) {
      const err = new Error('AnalyticsService already initialized');
      console.warn(err.stack);
      return;
    }
    await amplitude.getInstance().init(activeConfig.client.analytics.amplitude.key, undefined, {
      includeUtm: true,
      includeReferrer: true,
    });
    this.didInit = true;
    this.trackEvent(events.OPENED_APP, {
      url: window.location.pathname,
    });
    Router.events.on('routeChangeComplete', url => {
      this.trackEvent(events.NAVIGATED, {
        url
      });
      // @ts-ignore
      window.gtag('config', activeConfig.client.analytics.ga.trackingId, {
        page_path: url,
      })
    });
  }

  public async setUserId(userId: string): Promise<void> {
    this.throwIfNoInit();
    return amplitude.getInstance().setUserId(userId)
  }

  /**
   * 
   * @param properties custom map of properties
   */
  public async setUserProperties(properties: object): Promise<void> {
    this.throwIfNoInit();
    return amplitude.getInstance().setUserProperties(properties)
  }

  /**
   * @param eventName the event name
   * @param properties custom map of properties
   */
  public async trackEvent(eventName: string, properties?: object): Promise<amplitude.LogReturn> {
    this.throwIfNoInit();
    return amplitude.getInstance().logEvent(eventName, properties ? properties : undefined);
  }

  // commented out since this is only available for enterprise amplitude
  // /**
  //  * @param groupType the type of group, ex: 'sports'
  //  * @param groupNames list of groups belonging to the groupType, ex: ['tennis', 'soccer']
  //  */
  // public async setGroup(groupType: string, groupNames: string[]): Promise<void> {
  //   this.throwIfNoInit();
  //   return Amplitude.setGroup(groupType, groupNames);
  // }

  private throwIfNoInit() {
    if (!this.didInit) {
      const err = new Error('AnalyiticsService not initialized. Initialize first with .init()');
      console.error(err.stack);
      throw err;
    }
  }


}

export const analyticsService = AnalyticsService.Instance
