import { Plan } from "../../plans/planModel";

export class PlanService {
  constructor() {}

  getAvailablePlans() {
    return [
      new Plan({
        _id: 'plan1',
        mealCount: 4,
        mealPrice: 12.50,
        weekPrice: 49.99
      }),
      new Plan({
        _id: 'plan2',
        mealCount: 8,
        mealPrice: 9.99,
        weekPrice: 79.99
      }),
      new Plan({
        _id: 'plan3',
        mealCount: 12,
        mealPrice: 8.99,
        weekPrice: 107.99
      }),
    ];
  }
}

let planService: PlanService;

export const getPlanService = () => {
  if (planService) return planService;
  planService = new PlanService();
  return planService;
};
