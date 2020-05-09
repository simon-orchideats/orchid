import { AnalyticsService } from "../utils/analyticsService";
import { Order } from '../../order/orderModel';

export const sendRemoveDonationMetrics = (order: Order) => {
  AnalyticsService.sendRemoveDonationsMetrics(order);
}

export const sendSkipDeliveryMetrics = (
  order: Order,
  deliveryIndex: number,
) => {
  AnalyticsService.sendSkipDeliveryMetrics(order, deliveryIndex);
}