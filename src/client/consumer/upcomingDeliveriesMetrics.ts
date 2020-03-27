import { Order } from './../../order/orderModel';
import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";

export const sendEditOrderMetrics = (
  fromOrder: Order,
  toCart: Cart,
  toRestName: string,
  toMealPrice: number,
  toMealCount: number,
) => {
  analyticsService.trackEvent(events.EDITED_ORDER, {
    fromCount: Cart.getMealCount(fromOrder.Meals),
    fromRestId: fromOrder.Rest && fromOrder.Rest.Id,
    fromRestName: fromOrder.Rest && fromOrder.Rest.Profile.Name,
    fromMealPrice: fromOrder.MealPrice,
    toCount: toMealCount,
    toRestId: toCart.RestId,
    toRestName,
    toMealPrice,
  });
  analyticsService.trackEvent(events.CHOSE_PLAN, {
    count: toMealCount,
    mealPrice: toMealPrice,
  });
  fromOrder.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.EDITED_ORDER_FROM_MEALS, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  })
  toCart.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.EDITED_ORDER_TO_MEALS, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  });
}

export const sendSkippedOrderMetrics = (
  fromOrder: Order,
  fromRestName: string,
  fromMealPrice: number,
) => {
  if (!fromOrder.Rest) {
    const err = new Error('No rest');
    console.error(err.stack);
    throw err;
  }
  analyticsService.trackEvent(events.SKIPPED_ORDER, {
    fromRestId: fromOrder.Rest.Id,
    fromRestName,
    fromMealPrice,
    fromMealCount: Cart.getMealCount(fromOrder.Meals),
  });
  fromOrder.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.SKIPPED_ORDER_FROM_MEALS, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  })
}