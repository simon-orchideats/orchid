import { DeliveryInput } from './../../order/deliveryModel';
import { isServer } from './isServer';
import { activeConfig } from '../../config';
import { AmplitudeClient } from 'amplitude-js';
import Router from 'next/router'
import { Cart } from '../../order/cartModel';
import { IPlan, Tier } from '../../plan/planModel';
import { Schedule, MealPlan, CuisineType } from '../../consumer/consumerModel';

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
  CHOSE_PLAN: 'Chose plan', // using
  CHOSE_MEAL_DELIVERY: 'Chose meal delivery',
  CHOSE_DELIVERY_COUNT: 'Chose delivery count',
  CHOSE_SCHEDULE_COUNT: 'Chose schedule count',
  EDITED_ORDER: 'Edited order',
  EDITED_ORDER_FROM_MEALS: 'Edited order from meals',
  EDITED_ORDER_TO_MEALS: 'Edited order to meals',
  ENTERED_ZIP: 'Entered zip',
  NAVIGATED: 'Navigated to route',
  OPENED_APP: 'Opened app',
  REMOVED_CUISINE: 'Removed cuisine',
  REMOVED_CHECKOUT_SCHEDULE: 'Removed checkout schedule',
  REMOVED_PLAN_SCHEDULE: 'Removed plan schedule',
  REMOVED_PLAN: 'Removed plan',
  SKIPPED_ORDER: 'Skipped order',
  SKIPPED_ORDER_FROM_MEALS: 'Skipped order from meals',
  UPDATED_ADDRESS: 'Updated address',
  UPDATED_CARD: 'Updated card',
  UPDATED_PHONE: 'Updated phone',
}

const copyMealPlansWithPriceAndCount = (mealPlans: MealPlan[], plans: IPlan[]) =>
  mealPlans.reduce<
    { [key: string]: number }
  >((sum, rm) => {
    sum[rm.PlanName + '-Count'] = rm.MealCount;
    sum[rm.PlanName + '-Price'] = Tier.getMealPrice(rm.PlanName, rm.MealCount, plans);
    return sum;
  }, {});

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

  public static sendAddScheduleMetrics(s: Schedule) {
    analyticsService.trackEvent(events.ADDED_DELIVERY_DAY, {
      day: s.Day
    });
    analyticsService.trackEvent(events.ADDED_DELIVERY_TIME, {
      time: s.Time
    });
  }

  public static sendCheckoutMetrics(cart: Cart, plans: IPlan[]) {
    const fields = copyMealPlansWithPriceAndCount(
      Object.values(Cart.getCombinedMealPlans(cart.RestMeals, cart.DonationCount)),
      plans
    );
    analyticsService.trackEvent(events.CHECKEDOUT, {
      donationCount: cart.DonationCount,
      ...fields,
    });
  }

  public static sendPlanMetrics(mealPlans: MealPlan[], plans: IPlan[]) {
    const fields = copyMealPlansWithPriceAndCount(mealPlans, plans);
    analyticsService.trackEvent(events.CHOSE_PLAN, {
      ...fields,
    });
  }

  public static sendUpdatePlanMetrics(
    newMealPlans: MealPlan[],
    oldMealPlans: MealPlan[],
    plans: IPlan[]
  ) {
    analyticsService.trackEvent(events.CHOSE_PLAN, {
      ...copyMealPlansWithPriceAndCount(newMealPlans, plans),
    });
    analyticsService.trackEvent(events.REMOVED_PLAN, {
      ...copyMealPlansWithPriceAndCount(oldMealPlans, plans),
    });
  }

  public static sendRemoveCheckoutScheduleMetrics(schedule: Schedule) {
    analyticsService.trackEvent(events.REMOVED_CHECKOUT_SCHEDULE, {
      day: schedule.Day,
      time: schedule.Time,
    });
  }

  public static sendChoseScheduleMetrics(schedules: Schedule[]) {
    schedules.forEach(s => {
      analyticsService.trackEvent(events.CHOSE_DELIVERY_DAY, {
        day: s.Day,
      });
      analyticsService.trackEvent(events.CHOSE_DELIVERY_TIME, {
        time: s.Time
      });
    });
    analyticsService.trackEvent(events.CHOSE_SCHEDULE_COUNT, {
      count: schedules.length,
    });
  }

  public static sendRemoveScheduleMetrics(removedSchedule: Schedule, numSchedulesRemaining: number) {
    analyticsService.trackEvent(events.CHOSE_SCHEDULE_COUNT, {
      count: numSchedulesRemaining,
    });
    analyticsService.trackEvent(events.REMOVED_PLAN_SCHEDULE, {
      day: removedSchedule.Day,
    });
    analyticsService.trackEvent(events.REMOVED_PLAN_SCHEDULE, {
      time: removedSchedule.Time
    });
  }

  public static sendUpdateScheduleMetrics(newSchedule: Schedule, numSchedules?: number) {
    if (numSchedules !== undefined) {
      analyticsService.trackEvent(events.CHOSE_SCHEDULE_COUNT, {
        count: numSchedules,
      });
    }
    analyticsService.trackEvent(events.CHOSE_DELIVERY_DAY, {
      day: newSchedule.Day,
    });
    analyticsService.trackEvent(events.CHOSE_DELIVERY_TIME, {
      time: newSchedule.Time
    });
  }

  public static sendDeliveryMetrics(deliveries: DeliveryInput[]) {
    deliveries.forEach(d => {
      d.Meals.forEach(m => {
        for (let i = 0; i < m.Quantity; i++) {
          m.Tags.forEach(t => {
            analyticsService.trackEvent(events.CHOSE_MEAL_DELIVERY, {
              mealId: m.MealId,
              mealName: m.Name,
              restId: m.RestId,
              restName: m.RestName,
              planName: m.PlanName,
              planId: m.StripePlanId,
              tag: t,
            });
          });
        }
      });
    });
    analyticsService.trackEvent(events.CHOSE_DELIVERY_COUNT, {
      count: deliveries.length,
    });
  }

  public static sendCuisineMetrics(newCuisines: CuisineType[], oldCuisines: CuisineType[] = []) {
    const addedCuisines: CuisineType[] = [];
    const removedCuisines: CuisineType[] = [];
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
    });
    removedCuisines.forEach(cuisine => {
      analyticsService.trackEvent(events.REMOVED_CUISINE, {
        cuisine
      });
    });
  }

  public static sendZipMetrics(zip: string) {
    analyticsService.trackEvent(events.ENTERED_ZIP, {
      zip
    });
  }
}

export const analyticsService = AnalyticsService.Instance
