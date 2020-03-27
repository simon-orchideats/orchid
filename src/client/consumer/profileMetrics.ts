import { analyticsService, events } from "../utils/analyticsService";

export const sendUpdateAddressMetrics = () => {
  analyticsService.trackEvent(events.UPDATED_ADDRESS);
}

export const sendUpdateCardMetrics = () => {
  analyticsService.trackEvent(events.UPDATED_CARD);
}

export const sendUpdatePhoneMetrics = () => {
  analyticsService.trackEvent(events.UPDATED_PHONE);
}