import { isServer } from './isServer';
import { activeConfig } from '../../config';
import { AmplitudeClient } from 'amplitude-js';
import Router from 'next/router'

const amplitude: {
  getInstance: () => AmplitudeClient
} = isServer() ? null : require("amplitude-js");

export const events = {
  CHECKEDOUT: 'Checkedout',
  CHECKEDOUT_MEALS: 'Checkedout meals',
  EDITED_ORDER: 'Edited order',
  EDITED_ORDER_FROM_MEALS: 'Edited order from meals',
  EDITED_ORDER_TO_MEALS: 'Edited order to meals',
  ENTERED_ZIP: 'Entered zip',
  FILLED_CART: 'Filled cart',
  FILLED_CART_MEALS: 'Filled cart meals',
  NAVIGATED: 'Navigated to route',
  OPENED_APP: 'Opened app',
  SKIPPED_ORDER: 'Skipped order',
  SKIPPED_ORDER_FROM_MEALS: 'Skipped order from meals',
}

class AnalyticsService {
  private static _instance: AnalyticsService;

  private didInit: boolean = false;
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  public async init(): Promise<void> {
    if (this.didInit) {
      const err = new Error('AnalyticsService aleady initialized');
      console.error(err.stack);
      throw err;
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
