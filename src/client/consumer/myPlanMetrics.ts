import { analyticsService, events } from "../utils/analyticsService";
import { CuisineType } from '../../consumer/consumerModel';


export const sendCancelSubscriptionMetrics = (
  fromMealPrice: number,
  fromMealCount: number
) => {
  analyticsService.trackEvent(events.CANCELED_SUBSCRIPTION, {
    fromMealPrice,
    fromMealCount,
  });
}

export const sendUpdateCuisinesMetrics = (
  oldCuisines: CuisineType[],
  newCuisines: CuisineType[],
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

export const sendUpdateDeliveryDayMetrics = (
  fromDay: number,
  toDay: number,
) => {
  analyticsService.trackEvent(events.UPDATED_DELIVERY_DAY, {
    fromDay,
    toDay,
  });
  analyticsService.trackEvent(events.CHOSE_DELIVERY_DAY, {
    day: toDay,
  });
}

export const sendUpdatePlanMetrics = (
  fromMealPrice: number,
  fromMealCount: number,
  toMealPrice: number,
  toMealCount: number,
) => {
  analyticsService.trackEvent(events.UPDATED_PLAN, {
    fromMealPrice,
    fromMealCount,
    toMealPrice,
    toMealCount,
  });
  analyticsService.trackEvent(events.CHOSE_PLAN, {
    count: toMealCount,
    mealPrice: toMealPrice,
  });
}