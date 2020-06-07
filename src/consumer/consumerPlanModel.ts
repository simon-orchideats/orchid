import { Tag, ITag } from './../rest/tagModel';
import { IWeeklyDiscount, WeeklyDiscount } from './../order/discountModel';
import { PlanName } from './../plan/planModel';
import moment from 'moment';

export const MIN_DAYS_AHEAD = 1;

export type deliveryDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type deliveryTime =  'TenAToTwelveP' |
'TwelvePToTwoP' |
'TwoPToFourP' |
'FourPToSixP' |
'FivePToSevenP' |
'SixPToEightP' |
'SevenPToNineP'


const deliveryTimes: {
  TenAToTwelveP: '10am - 12pm',
  TwelvePToTwoP: '12pm - 2pm',
  TwoPToFourP: '2pm - 4pm',
  FourPToSixP: '4pm - 6pm',
  FivePToSevenP: '5pm - 7pm',
  SixPToEightP: '6pm - 8pm',
  SevenPToNineP: '7pm - 9pm',
} = {
  TenAToTwelveP: '10am - 12pm',
  TwelvePToTwoP: '12pm - 2pm',
  TwoPToFourP: '2pm - 4pm',
  FourPToSixP: '4pm - 6pm',
  FivePToSevenP: '5pm - 7pm',
  SixPToEightP: '6pm - 8pm',
  SevenPToNineP: '7pm - 9pm',
}

export const defaultDeliveryDay: deliveryDay = 2;
export const defaultDeliveryTime: deliveryTime = 'SixPToEightP';

export interface ISchedule {
  readonly day: deliveryDay;
  readonly time: deliveryTime;
}

export class Schedule implements ISchedule {
  readonly day: deliveryDay;
  readonly time: deliveryTime;

  constructor(s: ISchedule) {
    this.day = s.day;
    this.time = s.time;
  }

  public get Day() { return this.day }
  public get Time() { return this.time }

  static getICopy(s: ISchedule): ISchedule {
    return {
      ...s
    }
  }

  static getDateTimeStr(date: number, time: deliveryTime) {
    return `${moment(date).format('ddd M/D')}, ${ConsumerPlan.getDeliveryTimeStr(time)}`
  }

  static equals(s1: ISchedule, s2: ISchedule) {
    return s1.day === s2.day && s1.time === s2.time
  }

  static equalsLists(s1s: ISchedule[], s2s: ISchedule[]) {
    if (s1s.length !== s2s.length) return false;
    const s1sCopy = [...s1s];
    const s2sCopy = [...s2s];
    for (let i = 0; i < s1s.length; i++) {
      const findIndex = s2sCopy.findIndex(s2 => Schedule.equals(s1s[i], s2));
      if (findIndex === -1) return false;
      s2sCopy.slice(findIndex, 1);
    }
    for (let i = 0; i < s2s.length; i++) {
      const findIndex = s1sCopy.findIndex(s1 => Schedule.equals(s2s[i], s1));
      if (findIndex === -1) return false;
      s1sCopy.slice(findIndex, 1);
    }
    return true;
  }

  static getDefaultSchedule() {
    return new Schedule({
      day: defaultDeliveryDay,
      time: defaultDeliveryTime,
    })
  }
}

export interface IMealPlan {
  readonly stripePlanId: string;
  readonly planName: PlanName;
  readonly mealCount: number;
}

export interface EMealPlan extends IMealPlan {
  readonly stripeSubscriptionItemId: string
}

export class MealPlan implements IMealPlan {
  readonly stripePlanId: string;
  readonly planName: PlanName;
  readonly mealCount: number;

  constructor(plan: IMealPlan) {
    this.stripePlanId = plan.stripePlanId;
    this.planName = plan.planName;
    this.mealCount = plan.mealCount;
  }

  public get StripePlanId() { return this.stripePlanId }
  public get PlanName() { return this.planName }
  public get MealCount() { return this.mealCount }

  static getICopy(plan: IMealPlan): IMealPlan {
    return {
      ...plan
    }
  }

  static equals(p1: MealPlan, p2: MealPlan) {
    return p1.StripePlanId === p2.StripePlanId
      && p1.PlanName === p2.PlanName
      && p1.MealCount === p2.MealCount
  }

  static equalsLists(p1s: MealPlan[], p2s: MealPlan[]) {
    if (p1s.length !== p2s.length) return false;
    const p1Copy = [...p1s];
    const p2Copy = [...p2s];
    for (let i = 0; i < p1s.length; i++) {
      const findIndex = p2Copy.findIndex(p => MealPlan.equals(p1s[i], p));
      if (findIndex === -1) return false;
      p2Copy.slice(findIndex, 1);
    }
    for (let i = 0; i < p2s.length; i++) {
      const findIndex = p1Copy.findIndex(p => MealPlan.equals(p2s[i], p));
      if (findIndex === -1) return false;
      p1Copy.slice(findIndex, 1);
    }
    return true;
  }

  static getTotalCount(ps: IMealPlan[]) {
    return ps.reduce<number>((sum, p) => sum + p.mealCount, 0);
  }
}


export interface IConsumerPlanInput {
  readonly mealPlans: IMealPlan[]
  readonly tags: ITag[]
  readonly schedules: ISchedule[]
}

export interface IConsumerPlan extends IConsumerPlanInput{
  readonly referralCode: string
  readonly weeklyDiscounts: IWeeklyDiscount[]
}

export interface EConsumerPlan extends IConsumerPlan {
  readonly mealPlans: EMealPlan[]
}

export class ConsumerPlan implements IConsumerPlan {
  readonly mealPlans: MealPlan[]
  readonly tags: Tag[]
  readonly schedules: Schedule[]
  readonly referralCode: string
  readonly weeklyDiscounts: WeeklyDiscount[]

  constructor(consumerPlan: IConsumerPlan) {
    this.mealPlans = consumerPlan.mealPlans.map(p => new MealPlan(p));
    this.tags = consumerPlan.tags.map(t => new Tag(t));
    this.schedules = consumerPlan.schedules.map(s => new Schedule(s));
    this.referralCode = consumerPlan.referralCode;
    this.weeklyDiscounts = consumerPlan.weeklyDiscounts.map(wd => new WeeklyDiscount(wd));
  }

  public get Tags() { return this.tags }
  public get MealPlans() { return this.mealPlans }
  public get ReferralCode() { return this.referralCode }
  public get Schedules() { return this.schedules }
  public get WeeklyDiscounts() { return this.weeklyDiscounts }

  static getICopy(plan: IConsumerPlan): IConsumerPlan {
    return {
      mealPlans: plan.mealPlans.map(p => MealPlan.getICopy(p)),
      schedules: plan.schedules.map(s => Schedule.getICopy(s)),
      tags: plan.tags.map(t => Tag.getICopy(t)),
      weeklyDiscounts: plan.weeklyDiscounts.map(wd => WeeklyDiscount.getICopy(wd)),
      referralCode: plan.referralCode
    }
  }

  static getDeliveryTimeStr(deliveryTime: deliveryTime) {
    return deliveryTimes[deliveryTime];
  }

  static getDefaultDeliveryTime(): 'SixPToEightP' {
    return 'SixPToEightP';
  }

  static equals(plan1: ConsumerPlan, plan2: ConsumerPlan) {
    if (!Schedule.equalsLists(plan1.Schedules, plan2.Schedules)) return false;
    if (!Tag.areTagsEqual(plan1.Tags, plan2.Tags)) return false;
    if (!MealPlan.equalsLists(plan1.MealPlans, plan2.MealPlans)) return false;
    return true;
  }

  static getEConsumerPlanFromIConsumerPlanInput(
    plan: IConsumerPlanInput,
    referralPromoId: string,
    weeklyDiscounts: IWeeklyDiscount[],
    planToSubscriptionItemIdMapping: {
      [key: string]: string,
    }
  ): EConsumerPlan {
    return {
      ...plan,
      referralCode: referralPromoId,
      weeklyDiscounts,
      mealPlans: plan.mealPlans.map(p => ({
        ...p,
        stripeSubscriptionItemId: planToSubscriptionItemIdMapping[p.stripePlanId],
      }))
    };
  }

  static getIConsumerPlanInputFromConsumerPlan(plan: ConsumerPlan): IConsumerPlanInput {
    const copy = ConsumerPlan.getICopy(plan);
    return {
      mealPlans: copy.mealPlans,
      tags: copy.tags,
      schedules: copy.schedules,
    }
  }
}