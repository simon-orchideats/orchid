import { Tier, IPlan } from './../../plan/planModel';
import { Cart } from '../../order/cartModel';
import { analyticsService, events } from "../utils/analyticsService";

export const sendCartMenuMetrics = (
  cart: Cart,
  plans: IPlan[],
) => {
  const fields = Object.values(Cart.getCombinedMealPlans(cart.RestMeals)).reduce<
    { [key: string]: number }
  >((sum, rm) => {
    sum[rm.PlanName + '-Count'] = rm.MealCount;
    sum[rm.PlanName + '-Price'] = Tier.getMealPrice(rm.PlanName, rm.MealCount, plans);
    return sum;
  }, {});
  analyticsService.trackEvent(events.FILLED_CART, {
    donationCount: cart.DonationCount,
    ...fields,
  });
  Object.values(cart.RestMeals).forEach(rm => {
    rm.meals.forEach(m => {
      for (let i = 0; i < m.Quantity; i++) {
        m.Tags.forEach(t => {
          analyticsService.trackEvent(events.FILLED_CART_MEALS, {
            planName: m.PlanName,
            planId: m.StripePlanId,
            restId: m.RestId,
            mealId: m.MealId,
            tag: t,
          });
        });
      }
    })
  });
}

export const sendZipMetrics = (
  zip: string
) => {
  analyticsService.trackEvent(events.ENTERED_ZIP, {
    zip
  });
}