import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";

export const sendEditOrderMetrics = (
  toStripePlanId: string,
  toCart: Cart,
  toRestName: string,
  toMealPrice: number,
  toMealCount: number,
) => {
  analyticsService.trackEvent(events.EDITED_ORDER, {
    toCount: toMealCount,
    toStripePlanId,
    toRestId: toCart.RestId,
    toRestName,
    toMealPrice,
  });
  toCart.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.EDITED_ORDER_MEALS, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  });
}

export const sendSkippedOrderMetrics = (
  fromStripePlanId: string,
  fromRestName: string,
  fromMealPrice: number,
  fromMealCount: number,
) => {
  analyticsService.trackEvent(events.SKIPPED_ORDER, {
    fromStripePlanId,
    fromRestName,
    fromMealPrice,
    fromMealCount,
  });
}