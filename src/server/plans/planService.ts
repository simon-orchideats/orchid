import { Client } from "elasticsearch";
import { EPlan } from "../../plan/planModel";

const PLAN_INDEX = 'plans';

class PlanService {
  private readonly elastic: Client

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  async getAvailablePlans() {
    try {
      const res = await this.elastic.search<EPlan>({
        index: PLAN_INDEX,
        size: 1000,
      });
      return res.hits.hits.map(({ _id, _source }) => ({
        ..._source,
        _id
      }))
    } catch (e) {
      console.error(`[PlanService] couldn't get available plans. '${e.stack}'`);
      throw e;
    }
  }
}

let planService: PlanService;

export const initPlanService = (elastic: Client) => {
  if (planService) throw new Error('[PlanService] already initialized.');
  planService = new PlanService(elastic);
};

export const getPlanService = () => {
  if (!planService) throw new Error('[PlanService] not initialized.');
  return planService;
}
