import { Plan } from "../../plan/planModel";
import { callElasticWithErrorHandler } from '../utils';
interface elastic {
  search: any
}
class PlanService {
  elastic: elastic
  constructor(elastic: elastic) {
    this.elastic = elastic;
  }

  async getAvailablePlans() {
    const res = await callElasticWithErrorHandler((options: any) => this.elastic.search(options), {
      index: 'plans',
      size: 1000,
    });

    const planDB = res.hits.hits;
    let plans: Plan[] = [];

    for (let i = 0; i < planDB.length; i++) {
      plans.push(new Plan({
        _id: planDB[i]['_id'],
        mealCount: planDB[i]['_source'].mealCount,
        mealPrice: planDB[i]['_source'].mealPrice,
        weekPrice: planDB[i]['_source'].weekPrice
      }))
    }
    return plans;
  }
}

let planService: PlanService;

export const getPlanService = (elastic: elastic) => {
  if (planService) return planService;
  planService = new PlanService(elastic);
  return planService;
};
