import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";

export const sendCartMenuMetrics = (
  cart: Cart,
  restName: string | null,
  mealPrice: number,
) => {
  analyticsService.trackEvent(events.FILLED_CART, {
    mealCount: Cart.getMealCount(cart.Meals),
    restId: cart.RestId,
    restName,
    mealPrice,
    donationCount: cart.DonationCount,
  });
  cart.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.FILLED_CART_MEALS, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  });
}

export const sendZipMetrics = (
  zip: string
) => {
  analyticsService.trackEvent(events.ENTERED_ZIP, {
    zip
  });
}