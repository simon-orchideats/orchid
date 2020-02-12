import { getNextDeliveryDate } from './utils';
import { ICard } from '../card/cardModel';
import { IDestination } from '../place/destinationModel';
import { deliveryDay, IConsumerPlan, RenewalType, CuisineType } from '../consumer/consumerModel';
import { IMeal, Meal } from '../rest/mealModel';
import { state } from '../place/addressModel';

export interface ICart {
  readonly meals: IMeal[];
  readonly restId: string | null;
  readonly stripePlanId: string | null;
  readonly deliveryDay: deliveryDay | null;
  readonly zip: string | null;
}

export type ICartMealInput = {
  readonly mealId: string
  readonly name: string
  readonly quantity: number
}

export interface ICartInput {
  readonly restId: string
  readonly paymentMethodId: string
  readonly card: ICard
  readonly consumerPlan: IConsumerPlan
  readonly meals: ICartMealInput[]
  readonly phone: string
  readonly destination: IDestination
  readonly deliveryDate: number
};

export class Cart implements ICart {
  readonly meals: Meal[] // todo: change this to ICartMealInput
  readonly restId: string | null
  readonly stripePlanId: string | null
  readonly deliveryDay: deliveryDay | null
  readonly zip: string | null;

  constructor(cart: ICart) {
    this.meals = cart.meals.map(meal => new Meal(meal));
    this.restId = cart.restId;
    this.stripePlanId = cart.stripePlanId;
    this.deliveryDay = cart.deliveryDay;
    this.zip = cart.zip;
  }

  public get DeliveryDay() { return this.deliveryDay }
  public get Meals() { return this.meals }
  public get StripePlanId() { return this.stripePlanId }
  public get RestId() { return this.restId }
  public get Zip() { return this.zip }

  public getGroupedMeals() {
    return this.meals.reduce<{
      quantity: number,
      meal: Meal,
    }[]>((groupings, meal) => {
      const groupIndex = groupings.findIndex(group => group.meal.Id === meal.Id);
      if (groupIndex === -1) {
        groupings.push({
          quantity: 1,
          meal,
        })
      } else {
        groupings[groupIndex].quantity++;
      }
      return groupings;
    }, []);
  }

  public addMeal(meal: Meal) {
    const newCart = new Cart(this);
    newCart.meals!.push(meal);
    return newCart;
  }

  public removeMeal(mealId: string) {
    const newCart = new Cart(this);
    const index = newCart.Meals.findIndex(meal => meal.Id === mealId);
    if (index === -1) {
      throw new Error(`MealId '${mealId}' not found in cart`);
    }
    newCart.Meals.splice(index, 1);
    return newCart;
  }

  public getCartInput(
    deliveryName: string,
    address1: string,
    address2: string,
    city: string,
    state: state,
    zip: string,
    phone: string,
    card: ICard,
    paymentMethodId: string,
    instructions: string,
    renewal: RenewalType,
    cuisines: CuisineType[],
  ): ICartInput {
    if (!this.RestId || !this.StripePlanId || this.DeliveryDay === null) {
      throw new Error(`Cart is missing property '${JSON.stringify(this)}' `)
    }
    return {
      restId: this.RestId,
      paymentMethodId,
      card,
      phone,
      consumerPlan: {
        stripePlanId: this.StripePlanId,
        deliveryDay: this.DeliveryDay,
        renewal,
        cuisines
      },
      deliveryDate: getNextDeliveryDate(this.DeliveryDay).valueOf(),
      destination: {
        name: deliveryName,
        address: {
          address1,
          address2: address2 ? address2 : undefined,
          city,
          state,
          zip,
        },
        instructions,
      },
      meals: this.Meals.reduce<ICartMealInput[]>((groupings, meal) => {
        const groupIndex = groupings.findIndex(group => group.mealId === meal.Id);
        if (groupIndex === -1) {
          groupings.push({
            quantity: 1,
            mealId: meal.Id,
            name: meal.Name
          })
        } else {
          groupings[groupIndex] = {
            ...groupings[groupIndex],
            quantity: groupings[groupIndex].quantity + 1
          }
        }
        return groupings;
      }, [])
    }
  }

}