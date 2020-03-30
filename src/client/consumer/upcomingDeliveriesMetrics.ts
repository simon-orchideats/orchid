import { sendChoosePlanMetrics } from './myPlanMetrics';
import { Order } from './../../order/orderModel';
import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";

export const sendEditOrderMetrics = (
  fromOrder: Order,
  fromPlanMealCount: number | null,
  toCart: Cart,
  toPlanMealPrice: number,
  toPlanMealCount: number,
  toRestName?: string
) => {
  analyticsService.trackEvent(events.EDITED_ORDER, {
    fromRestId: fromOrder.Rest && fromOrder.Rest.Id,
    fromRestName: fromOrder.Rest && fromOrder.Rest.Profile.Name,
    fromOrderMealCount: Cart.getMealCount(fromOrder.Meals),
    fromOrderDonationCount: fromOrder.DonationCount,
    fromPlanMealPrice: fromOrder.MealPrice,
    fromPlanMealCount,
    toRestId: toCart.RestId,
    toRestName,
    toCartMealCount: Cart.getMealCount(toCart.Meals),
    toCartDonationCount: toCart.DonationCount,
    toPlanMealPrice,
    toPlanMealCount,
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
  sendChoosePlanMetrics(
    toPlanMealPrice,
    toPlanMealCount,
    fromOrder.MealPrice || undefined,
    fromPlanMealCount || undefined
  );
}

export const sendSkippedOrderMetrics = (
  fromOrder: Order,
  fromRestName: string,
  fromPlanMealPrice: number,
  fromPlanMealCount: number
) => {
  if (!fromOrder.Rest) {
    const err = new Error('No rest');
    console.error(err.stack);
    throw err;
  }
  analyticsService.trackEvent(events.SKIPPED_ORDER, {
    fromRestId: fromOrder.Rest.Id,
    fromRestName,
    fromOrderMealCount: Cart.getMealCount(fromOrder.Meals),
    fromOrderDonationCountCount: fromOrder.DonationCount,
    fromPlanMealPrice,
    fromPlanMealCount, 
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