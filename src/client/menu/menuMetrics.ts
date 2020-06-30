import { AnalyticsService } from "../utils/analyticsService";

export const sendZipMetrics = (
  zip: string
) => {
  AnalyticsService.sendZipMetrics(zip);
}


export const sendOpenDescriptionMetrics = () => {
  AnalyticsService.sendOpenDescriptionMetrics();
}