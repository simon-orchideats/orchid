import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";
import { CuisineType } from '../../consumer/consumerModel';

export const sendCheckoutMetrics = (
  cart: Cart,
  restName: string,
  mealPrice: number,
  cuisines: CuisineType[],
) => {
  analyticsService.trackEvent(events.CHECKEDOUT, {
    count: Cart.getMealCount(cart.Meals),
    restId: cart.RestId,
    restName,
    mealPrice,
  });
  analyticsService.trackEvent(events.CHOSE_PLAN, {
    count: Cart.getMealCount(cart.Meals),
    mealPrice,
  });
  analyticsService.trackEvent(events.CHOSE_DELIVERY_DAY, {
    day: cart.DeliveryDay,
  });
  cuisines.forEach(cuisine => {
    analyticsService.trackEvent(events.ADDED_CUISINE, {
      cuisine
    });
  });
  cart.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.CHECKEDOUT_MEALS, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  });
}