import { DeliveryInput } from './../../order/deliveryModel';
import { isServer } from './isServer';
import { activeConfig } from '../../config';
import { AmplitudeClient } from 'amplitude-js';
import Router from 'next/router'
import { Cart } from '../../order/cartModel';
import { IPlan, Tier, PlanNames } from '../../plan/planModel';
import { Schedule, MealPlan } from '../../consumer/consumerPlanModel';
import { CuisineType } from '../../rest/mealModel';
import { Order } from '../../order/orderModel';
import moment from 'moment';

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

const copyMealPlansWithPriceAndCount = (mealPlans: MealPlan[], plans: IPlan[]) =>
  mealPlans.reduce<
    { [key: string]: number }
  >((sum, rm) => {
    sum[rm.PlanName + '-Count'] = rm.MealCount;
    sum[rm.PlanName + '-Price'] = Tier.getMealPrice(rm.PlanName, rm.MealCount, plans);
    return sum;
  }, {});

const getMealCounts = (order: Order) => {
  type mealCountsType =  { [key: string]: number };
  const mealCounts: mealCountsType = order.Deliveries.reduce<mealCountsType>((sum, d) => {
    const deliverySum = d.Meals.reduce<mealCountsType>((sum, m) => {
      if (sum[m.StripePlanId]) {
        sum[m.StripePlanId] += m.Quantity;
      } else {
        sum[m.StripePlanId] = m.Quantity
      }
      return sum;
    }, {});
    return Object.entries(deliverySum).reduce<mealCountsType>((sum, [stripePlanId, count]) => {
      if (sum[stripePlanId]) {
        sum[stripePlanId] += count;
      } else {
        sum[stripePlanId] = count;
      }
      return sum;
    }, sum);
  }, {})

  return order.Costs.MealPrices.reduce<
    { [key: string]: number }
  >((sum, mp) => {
    let count = mealCounts[mp.StripePlanId] || 0;
    sum[mp.PlanName + '-Count'] = count + (mp.PlanName === PlanNames.Standard ? order.DonationCount : 0)
    sum[mp.PlanName + '-Price'] = mp.MealPrice;
    return sum;
  }, {});
}

const trackDeliveries = (deliveries: DeliveryInput[], mealEvent: string, tagEvent: string) => {
  deliveries.forEach(d => {
    d.Meals.forEach(m => {
      for (let i = 0; i < m.Quantity; i++) {
        analyticsService.trackEvent(mealEvent, {
          mealId: m.MealId,
          mealName: m.Name,
          restId: m.RestId,
          deliveryTime: d.deliveryTime,
          deliveryDay: moment(d.deliveryDate).day(),
          restName: m.RestName,
          planName: m.PlanName,
          planId: m.StripePlanId,
        });
        m.Tags.forEach(t => {
          analyticsService.trackEvent(tagEvent, {
            tag: t,
          });
        });
      }
    });
  });
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

  public static sendCancelSubscriptionMetrics(mealPlans: MealPlan[], plans: IPlan[]) {
    analyticsService.trackEvent(events.CANCELED_SUBSCRIPTION, {
      ...copyMealPlansWithPriceAndCount(mealPlans, plans),
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
    trackDeliveries(deliveries, events.CHOSE_DELIVERY_MEALS, events.CHOSE_DELIVERY_MEAL_TAG);
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

  public static sendRemoveDonationsMetrics(order: Order) {
    const fields = getMealCounts(order);
    analyticsService.trackEvent(events.REMOVED_DONATIONS_FROM_DELIVERY, {
      donationsRemoved: order.DonationCount,
      ...fields,
    });
  }

  public static sendSkipDeliveryMetrics(
    order: Order,
    deliveryIndex: number,
  ) {
    let skippedMealsCount = 0;
    order.Deliveries[deliveryIndex].Meals.forEach(m => {
      skippedMealsCount += m.Quantity;
      for (let i = 0; i < m.Quantity; i++) {
        analyticsService.trackEvent(events.SKIPPED_DELIVERY_MEALS, {
          mealId: m.MealId,
          mealName: m.Name,
          restId: m.RestId,
          restName: m.RestName,
          planName: m.PlanName,
          planId: m.StripePlanId,
        });
        m.Tags.forEach(t => {
          analyticsService.trackEvent(events.SKIPPED_DELIVERY_MEAL_TAG, {
            tag: t,
          });
        });
      }
    });
    const fields = getMealCounts(order);
    analyticsService.trackEvent(events.SKIPPED_DELIVERY, {
      ...fields,
      mealsSkipped: skippedMealsCount,
    });
  }

  public static sendUpdateOrderMetrics(
    cart: Cart,
    order: Order,
    plans: IPlan[],
  ) {
    AnalyticsService.sendDeliveryMetrics(cart.Deliveries);
    analyticsService.trackEvent(events.EDITED_DELIVERY_TO_PLAN, {
      donationCount: cart.DonationCount,
      ...copyMealPlansWithPriceAndCount(
        Object.values(Cart.getCombinedMealPlans(cart.RestMeals, cart.DonationCount)),
        plans
      ),
    });
    analyticsService.trackEvent(events.EDITED_DELIVERY_FROM_PLAN, {
      donationCount: order.DonationCount,
      ...getMealCounts(order),
    });
    trackDeliveries(order.Deliveries, events.EDITED_DELIVERY_FROM_MEALS, events.EDITED_DELIVERY_FROM_TAGS);
  }

  public static sendZipMetrics(zip: string) {
    analyticsService.trackEvent(events.ENTERED_ZIP, {
      zip
    });
  }
}

export const analyticsService = AnalyticsService.Instance
