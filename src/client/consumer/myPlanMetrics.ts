import { deliveryTime } from './../../consumer/consumerModel';
import { analyticsService, events } from "../utils/analyticsService";
import { CuisineType } from '../../consumer/consumerModel';

export const sendCancelSubscriptionMetrics = (
  fromPlanMealPrice: number,
  fromPlanMealCount: number
) => {
  analyticsService.trackEvent(events.CANCELED_SUBSCRIPTION, {
    fromPlanMealPrice,
    fromPlanMealCount,
  });
}

export const sendChooseCuisineMetrics = (
  newCuisines: CuisineType[],
  oldCuisines: CuisineType[] = [],
) => {
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

export const sendChooseDeliveryDayMetrics = (
  toDay: number,
  fromDay?: number,
) => {
  analyticsService.trackEvent(events.CHOSE_DELIVERY_DAY, {
    toDay,
    fromDay,
  });
}

export const sendChooseDeliveryTimeMetrics = (
  toTime: deliveryTime,
  fromTime?: deliveryTime,
) => {
  analyticsService.trackEvent(events.CHOSE_DELIVERY_TIME, {
    toTime,
    fromTime,
  });
}

export const sendChoosePlanMetrics = (
  toPlanMealPrice: number,
  toPlanMealCount: number,
  fromPlanMealPrice?: number,
  fromPlanMealCount?: number,
) => {
  analyticsService.trackEvent(events.CHOSE_PLAN, {
    toPlanMealPrice,
    toPlanMealCount,
    fromPlanMealPrice,
    fromPlanMealCount,
  });
}