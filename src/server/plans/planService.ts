import { Client } from "elasticsearch";
import { EPlan } from "../../plan/planModel";

class PlanService {
  static PlanService: PlanService;
  private readonly elastic: Client
  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  async getAvailablePlans() {
    const res = await this.elastic.search<EPlan>({
      index: 'plans',
      size: 1000,
    });
    return res.hits.hits.map(({ _id, _source }) => ({
      ..._source,
      _id
    }))
  }
}

let planService: PlanService;

export const initPlanService = (elastic: Client) => {
  if (planService) throw new Error('[PlanService] Plan service already initialized.');
  planService = new PlanService(elastic);
};

export const getPlanService = () => {
  if (!planService) throw new Error('[PlanService] Plan service not initialized.');
  return planService;
}
