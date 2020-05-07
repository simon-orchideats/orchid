//@ts-nocheck

import { Cart } from '../../order/cartModel';
import { AnalyticsService, analyticsService, events } from "../utils/analyticsService";
import { CuisineType } from '../../consumer/consumerModel';
import { sendChoosePlanMetrics, sendChooseDeliveryDayMetrics, sendChooseDeliveryTimeMetrics, sendChooseCuisineMetrics } from '../consumer/myPlanMetrics';

export const sendCheckoutMetrics = (
  cart: Cart,
  planMealPrice: number,
  planMealCount: number,
  cuisines: CuisineType[],
  restName?: string,
) => {
  AnalyticsService.sendMenuMetrics(events.CHECKEDOUT, events.CHECKEDOUT_MEALS, cart, plans);
  
  // sendChoosePlanMetrics(planMealPrice, planMealCount);
  // if (cart.DeliveryDay === null) {
  //   const err = new Error('Missing delivery day');
  //   console.error(err.stack);
  //   throw err;
  // }
  // if (!cart.DeliveryTime) {
  //   const err = new Error('Missing delivery time');
  //   console.error(err.stack);
  //   throw err;
  // }
  // sendChooseDeliveryDayMetrics(cart.DeliveryDay);
  // sendChooseDeliveryTimeMetrics(cart.DeliveryTime);
  // sendChooseCuisineMetrics(cuisines);
}