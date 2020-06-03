import { AnalyticsService } from './../utils/analyticsService';
import { Schedule, MealPlan } from './../../consumer/consumerPlanModel';
import { CuisineType } from '../../rest/mealModel';
import { IPlan } from '../../plan/planModel';

export const sendCancelSubscriptionMetrics = (oldMealPlans: MealPlan[], plans: IPlan[]) => {
  AnalyticsService.sendCancelSubscriptionMetrics(oldMealPlans, plans);
}

export const sendChooseCuisineMetrics = (
  newCuisines: CuisineType[],
  oldCuisines: CuisineType[] = [],
) => {
  AnalyticsService.sendCuisineMetrics(newCuisines, oldCuisines);
}

export const sendUpdateScheduleMetrics = (newSchedule: Schedule) => {
  AnalyticsService.sendUpdateScheduleMetrics(newSchedule)
}

export const sendAddScheduleMetrics = (newSchedule: Schedule, numSchedules: number) => {
  AnalyticsService.sendUpdateScheduleMetrics(newSchedule, numSchedules);
  AnalyticsService.sendAddScheduleMetrics(newSchedule);
}

export const sendRemoveScheduleMetrics = (removedSchedule: Schedule, numSchedules: number) => {
  AnalyticsService.sendRemoveScheduleMetrics(removedSchedule, numSchedules);
}

export const sendUpdatePlanMetrics = (
  newMealPlans: MealPlan[],
  oldMealPlans: MealPlan[],
  plans: IPlan[]
) => {
  AnalyticsService.sendUpdatePlanMetrics(newMealPlans, oldMealPlans, plans);
}