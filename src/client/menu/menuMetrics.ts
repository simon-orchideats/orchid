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
  if (!stripePlanId) throw new Error('Missing stripePlanId');
  if (!plans) throw new Error('Missing plans');
  if (!cart) throw new Error('Missing cart');
  if (!rest) throw new Error('Missing rest');
  if (!stripePlanId) throw new Error('Missing stripePlanId');
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