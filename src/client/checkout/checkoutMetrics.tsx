import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";

export const sendCheckoutMetrics = (
  stripePlanId: string,
  cart: Cart,
  restName: string,
  mealPrice: number,
  mealCount: number,
) => {
  analyticsService.trackEvent(events.CHECKEDOUT, {
    count: mealCount,
    stripePlanId,
    restId: cart.RestId,
    restName,
    mealPrice,
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