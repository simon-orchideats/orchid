import { IPlan } from './../../plan/planModel';
import { AnalyticsService } from './../utils/analyticsService';
import { Schedule } from '../../consumer/consumerPlanModel';
import { Order } from '../../order/orderModel';
import { Cart } from '../../order/cartModel';

export const sendRemoveScheduleMetrics = (
  removedSchedule: Schedule,
) => {
  AnalyticsService.sendRemoveCheckoutScheduleMetrics(removedSchedule);
}

export const sendUpdateOrderMetrics = (
  cart: Cart,
  order: Order,
  plans: IPlan[],
) => {
  AnalyticsService.sendUpdateOrderMetrics(cart, order, plans);
}
