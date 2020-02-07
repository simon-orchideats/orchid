import { ICard } from './../card/cardModel';
import { IDestination } from './../place/destinationModel';
import { deliveryDay, IConsumerPlan, RenewalType, CuisineType } from './../consumer/consumerModel';
import { IMeal, Meal } from '../rest/mealModel';
import { state } from '../place/addressModel';

export interface ICart {
  readonly meals: IMeal[];
  readonly restId: string | null;
  readonly planId: string | null;
  readonly deliveryDay: deliveryDay | null;
  readonly zip: string | null;
}

export interface ICartInput {
  readonly restId: string
  readonly card: ICard
  readonly consumerPlan: IConsumerPlan
  readonly meals: IMeal[],
  readonly destination: IDestination
  readonly deliveryDate: number
};

export class Cart implements ICart {
  readonly meals: Meal[]
  readonly restId: string | null
  readonly planId: string | null
  readonly deliveryDay: deliveryDay | null
  readonly zip: string | null;

  constructor(cart: ICart) {
    this.meals = cart.meals.map(meal => new Meal(meal));
    this.restId = cart.restId;
    this.planId = cart.planId;
    this.deliveryDay = cart.deliveryDay;
    this.zip = cart.zip;
  }

  public get DeliveryDay() { return this.deliveryDay }
  public get Meals() { return this.meals }
  public get PlanId() { return this.planId }
  public get RestId() { return this.restId }
  public get Zip() { return this.zip }

  public getGroupedMeals() {
    return this.meals.reduce<{
      count: number,
      meal: Meal,
    }[]>((groupings, meal) => {
      const groupIndex = groupings.findIndex(group => group.meal.Id === meal.Id);
      if (groupIndex === -1) {
        groupings.push({
          count: 1,
          meal,
        })
      } else {
        groupings[groupIndex].count++;
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
    instructions: string,
    renewal: RenewalType,
    cuisines: CuisineType[],
  ) {
    if (!this.RestId || !this.PlanId || this.DeliveryDay === null) {
      throw new Error(`Cart is missing property '${JSON.stringify(this)}' `)
    }
    return {
      restId: this.RestId,
      card,
      consumerPlan: {
        planId: this.PlanId,
        deliveryDay: this.DeliveryDay,
        renewal,
        cuisines
      },
      deliveryDate: 123,
      destination: {
        name: deliveryName,
        address: {
          address1,
          address2,
          city,
          state,
          zip,
        },
        phone,
        instructions,
      },
      meals: this.Meals,
    }
  }

}