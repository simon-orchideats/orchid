import { isServer } from './isServer';
import { activeConfig } from '../../config';
import { AmplitudeClient } from 'amplitude-js';
import Router from 'next/router'

const amplitude: {
  getInstance: () => AmplitudeClient
} = isServer() ? null : require("amplitude-js");

export const events = {
  ADDED_CUISINE: 'Added cuisine',
  ADDED_DELIVERY_DAY: 'Added delivery day',
  ADDED_DELIVERY_TIME: 'Added delivery time',
  CANCELED_SUBSCRIPTION: 'Canceled subscription',
  CHECKEDOUT: 'Checkedout',
  CHOSE_DELIVERY_DAY: 'Chose delivery day',
  CHOSE_DELIVERY_TIME: 'Chose delivery time',
  CHOSE_PLAN: 'Chose plan',
  CHOSE_DELIVERY_MEALS: 'Chose delivery meals',
  CHOSE_DELIVERY_COUNT: 'Chose delivery count',
  CHOSE_DELIVERY_MEAL_TAG: 'Chose delivery meal tag',
  CHOSE_SCHEDULE_COUNT: 'Chose schedule count',
  EDITED_DELIVERY_TO_PLAN: 'Edited delivery to plan',
  EDITED_DELIVERY_FROM_PLAN: 'Edited delivery from plan',
  EDITED_DELIVERY_FROM_MEALS: 'Edited delivery from meals',
  EDITED_DELIVERY_FROM_TAGS: 'Edited delivery from tags',
  ENTERED_ZIP: 'Entered zip',
  NAVIGATED: 'Navigated to route',
  OPENED_APP: 'Opened app',
  OPEN_DESCRIPTION: 'Opened description',
  REMOVED_CUISINE: 'Removed cuisine',
  REMOVED_CHECKOUT_SCHEDULE: 'Removed checkout schedule',
  REMOVED_DONATIONS_FROM_DELIVERY: 'Removed donations from delivery',
  REMOVED_PLAN_SCHEDULE: 'Removed plan schedule',
  REMOVED_PLAN: 'Removed plan',
  SKIPPED_DELIVERY: 'Skipped delivery',
  SKIPPED_DELIVERY_MEALS: 'Skipped delivery meals',
  SKIPPED_DELIVERY_MEAL_TAG: 'Skipped delivery meal tag',
  UPDATED_ADDRESS: 'Updated address',
  UPDATED_CARD: 'Updated card',
  UPDATED_PHONE: 'Updated phone',
  UPDATED_INSTRUCTIONS: 'Updated instructions',
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
      const err = new Error('AnalyticsService aleady initialized');
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

  // public static sendCheckoutMetrics(cart: Cart, plans: IProduct[]) {
    // const fields = copyMealPlansWithPriceAndCount(
    //   Object.values(Cart.getCombinedMealPlans(cart.RestMeals, cart.DonationCount)),
    //   plans
    // );
    // analyticsService.trackEvent(events.CHECKEDOUT, {
    //   donationCount: cart.DonationCount,
    //   ...fields,
    // });
  // }

  // public static sendCancelSubscriptionMetrics(mealPlans: MealPlan[], plans: IProduct[]) {
  //   analyticsService.trackEvent(events.CANCELED_SUBSCRIPTION, {
  //     ...copyMealPlansWithPriceAndCount(mealPlans, plans),
  //   });
  //   // @ts-ignore
  //   window.fbq(fbEvents.TRACK_CUSTOM, events.CANCELED_SUBSCRIPTION);
  // }

  // public static sendOpenDescriptionMetrics() {
  //   analyticsService.trackEvent(events.OPEN_DESCRIPTION);
  // }

  // public static sendPlanMetrics(mealPlans: MealPlan[], plans: IProduct[]) {
  //   const fields = copyMealPlansWithPriceAndCount(mealPlans, plans);
  //   analyticsService.trackEvent(events.CHOSE_PLAN, {
  //     ...fields,
  //   });

  //   // @ts-ignore
  //   window.fbq(fbEvents.TRACK_CUSTOM, events.CHOSE_PLAN, { ...fields });
  // }

  // public static sendUpdatePlanMetrics(
  //   newMealPlans: MealPlan[],
  //   oldMealPlans: MealPlan[],
  //   plans: IProduct[]
  // ) {
  //   analyticsService.trackEvent(events.CHOSE_PLAN, {
  //     ...copyMealPlansWithPriceAndCount(newMealPlans, plans),
  //   });

  //   // @ts-ignore
  //   window.fbq(fbEvents.TRACK_CUSTOM, events.CHOSE_PLAN, { ...copyMealPlansWithPriceAndCount(newMealPlans, plans) });

  //   analyticsService.trackEvent(events.REMOVED_PLAN, {
  //     ...copyMealPlansWithPriceAndCount(oldMealPlans, plans),
  //   });
  // }

  public static sendCuisineMetrics(newCuisines: string[], oldCuisines: string[] = []) {
    const addedCuisines: string[] = [];
    const removedCuisines: string[] = [];
    oldCuisines.forEach(old => {
      if (!newCuisines.find(newC => newC === old)) {
        removedCuisines.push(old);
      }
    });
    newCuisines.forEach(newC => {
      if (!oldCuisines.find(old => old === newC)) {
        addedCuisines.push(newC);
      }
    });
    addedCuisines.forEach(cuisine => {
      analyticsService.trackEvent(events.ADDED_CUISINE, {
        cuisine
      });
      // @ts-ignore
      window.fbq(fbEvents.TRACK_CUSTOM, events.ADDED_CUISINE, { cuisineType: cuisine });
    });

    removedCuisines.forEach(cuisine => {
      analyticsService.trackEvent(events.REMOVED_CUISINE, {
        cuisine
      });
      // @ts-ignore
      window.fbq(fbEvents.TRACK_CUSTOM, events.REMOVED_CUISINE, { cuisineType: cuisine });
    });
  }
}

export const analyticsService = AnalyticsService.Instance
