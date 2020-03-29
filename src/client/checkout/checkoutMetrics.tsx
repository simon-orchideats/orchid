import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";
import { CuisineType } from '../../consumer/consumerModel';
import { sendChoosePlanMetrics, sendChooseDeliveryDayMetrics, sendChooseDeliveryTimeMetrics, sendChooseCuisineMetrics } from '../consumer/myPlanMetrics';

export const sendCheckoutMetrics = (
  cart: Cart,
  restName: string,
  planMealPrice: number,
  planMealCount: number,
  cuisines: CuisineType[],
) => {
  analyticsService.trackEvent(events.CHECKEDOUT, {
    cartRestId: cart.RestId,
    cartRestName: restName,
    cartDonationCount: cart.DonationCount,
    cartMealCount: Cart.getMealCount(cart.Meals),
    planMealPrice,
    planMealCount,
  });
  cart.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.CHECKEDOUT_MEALS, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  });
  sendChoosePlanMetrics(planMealPrice, planMealCount);
  if (cart.DeliveryDay === null) {
    const err = new Error('Missing delivery day');
    console.error(err.stack);
    throw err;
  }
  if (!cart.DeliveryTime) {
    const err = new Error('Missing delivery time');
    console.error(err.stack);
    throw err;
  }
  sendChooseDeliveryDayMetrics(cart.DeliveryDay);
  sendChooseDeliveryTimeMetrics(cart.DeliveryTime);
  sendChooseCuisineMetrics(cuisines);
}