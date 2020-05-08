// @ts-nocheck

import { sendUpdatePlanMetrics } from './myPlanMetrics';
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
  // analyticsService.trackEvent(events.EDITED_ORDER, {
  //   fromRestId: fromOrder.Rest && fromOrder.Rest.Id,
  //   fromRestName: fromOrder.Rest && fromOrder.Rest.Profile.Name,
  //   fromOrderMealCount: Cart.getMealCount(fromOrder.Meals),
  //   fromOrderDonationCount: fromOrder.DonationCount,
  //   fromPlanMealPrice: fromOrder.MealPrice,
  //   fromPlanMealCount,
  //   toRestId: toCart.RestId,
  //   toRestName,
  //   toCartMealCount: Cart.getMealCount(toCart.Meals),
  //   toCartDonationCount: toCart.DonationCount,
  //   toPlanMealPrice,
  //   toPlanMealCount,
  // });
  // fromOrder.Meals.forEach(meal => {
  //   for (let i = 0; i < meal.Quantity; i++) {
  //     analyticsService.trackEvent(events.EDITED_ORDER_FROM_MEALS, {
  //       name: meal.Name,
  //       mealId: meal.MealId,
  //     });
  //   }
  // })
  // toCart.Meals.forEach(meal => {
  //   for (let i = 0; i < meal.Quantity; i++) {
  //     analyticsService.trackEvent(events.EDITED_ORDER_TO_MEALS, {
  //       name: meal.Name,
  //       mealId: meal.MealId,
  //     });
  //   }
  // });
  // sendChoosePlanMetrics(
  //   toPlanMealPrice,
  //   toPlanMealCount,
  //   fromOrder.MealPrice || undefined,
  //   fromPlanMealCount || undefined
  // );
}

export const sendSkippedOrderMetrics = (
  fromOrder: Order,
  fromPlanMealPrice: number,
  fromPlanMealCount: number
) => {
  // analyticsService.trackEvent(events.SKIPPED_ORDER, {
  //   fromRestId: fromOrder.Rest ? fromOrder.Rest.Id : undefined,
  //   fromRestName: fromOrder.Rest ? fromOrder.Rest.Profile.Name : undefined,
  //   fromOrderMealCount: Cart.getMealCount(fromOrder.Meals),
  //   fromOrderDonationCountCount: fromOrder.DonationCount,
  //   fromPlanMealPrice,
  //   fromPlanMealCount, 
  // });
  // fromOrder.Meals.forEach(meal => {
  //   for (let i = 0; i < meal.Quantity; i++) {
  //     analyticsService.trackEvent(events.SKIPPED_ORDER_FROM_MEALS, {
  //       name: meal.Name,
  //       mealId: meal.MealId,
  //     });
  //   }
  // })
}