import { Rest } from './../../rest/restModel';
import { Plan } from './../../plan/planModel';
import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";

export const sendCartMenuMetrics = (
  stripePlanId: string | undefined,
  plans: Plan[] | undefined,
  cart: Cart | null,
  rest: Rest | undefined,
  mealCount: number,
) => {
  if (!stripePlanId) {
    const err = new Error('Missing stripePlanId');
    console.error(err.stack);
    throw err;
  }
  if (!plans) {
    const err = new Error('Missing plans');
    console.error(err.stack);
    throw err;
  }
  if (!cart) {
    const err = new Error('Missing cart');
    console.error(err.stack);
    throw err;
  }
  if (!rest) {
    const err = new Error('Missing rest');
    console.error(err.stack);
    throw err;
  }
  if (!stripePlanId) {
    const err = new Error('Missing stripePlanId');
    console.error(err.stack);
    throw err;
  }
  analyticsService.trackEvent(events.FILLED_CART, {
    count: mealCount,
    stripePlanId,
    restId: cart.RestId,
    restName: rest.Profile.Name,
    mealPrice: Plan.getMealPrice(stripePlanId, plans),
  });
  cart.Meals.forEach(meal => {
    for (let i = 0; i < meal.Quantity; i++) {
      analyticsService.trackEvent(events.ADDED_TO_FINAL_CART, {
        name: meal.Name,
        mealId: meal.MealId,
      });
    }
  });
}