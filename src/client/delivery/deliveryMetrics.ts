import { analyticsService, events } from "../utils/analyticsService";
import { Schedule } from '../../consumer/consumerModel';

export const sendRemoveScheduleMetrics = (
  removedSchedule: Schedule,
) => {
  analyticsService.trackEvent(events.REMOVED_SCHEDULE, {
    day: removedSchedule.Day,
    time: removedSchedule.Time,
  });
}
