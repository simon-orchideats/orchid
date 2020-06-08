import { Cart } from '../../order/cartModel';
import { AnalyticsService } from "../utils/analyticsService";
import { IPlan } from '../../plan/planModel';

export const sendCheckoutMetrics = (
  cart: Cart,
  plans: IPlan[],
  cuisines: string[],
) => {
  AnalyticsService.sendCheckoutMetrics(cart, plans);
  AnalyticsService.sendDeliveryMetrics(cart.Deliveries);
  AnalyticsService.sendPlanMetrics(
    Object.values(Cart.getCombinedMealPlans(cart.RestMeals, cart.DonationCount)),
    plans
  );
  AnalyticsService.sendChoseScheduleMetrics(cart.Schedules);
  AnalyticsService.sendCuisineMetrics(cuisines);
}