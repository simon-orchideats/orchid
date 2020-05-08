import { AnalyticsService } from './../utils/analyticsService';
import { Schedule } from '../../consumer/consumerModel';

export const sendRemoveScheduleMetrics = (
  removedSchedule: Schedule,
) => {
  AnalyticsService.sendRemoveCheckoutScheduleMetrics(removedSchedule);
}
