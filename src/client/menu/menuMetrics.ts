import { IPlan } from './../../plan/planModel';
import { Cart } from '../../order/cartModel';
import { AnalyticsService, analyticsService, events } from "../utils/analyticsService";

export const sendCartMenuMetrics = (
  cart: Cart,
  plans: IPlan[],
) => {
  AnalyticsService.sendMenuMetrics(events.FILLED_CART, events.FILLED_CART_MEALS, cart, plans);
}

export const sendZipMetrics = (
  zip: string
) => {
  analyticsService.trackEvent(events.ENTERED_ZIP, {
    zip
  });
}