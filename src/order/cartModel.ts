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
  readonly img: string
  readonly quantity: number
}

export class CartMealInput implements ICartMealInput {
  readonly mealId: string;
  readonly img: string;
  readonly name: string;
  readonly quantity: number

  constructor(meal: ICartMealInput) {
    this.mealId = meal.mealId;
    this.img = meal.img;
    this.name = meal.name;
    this.quantity = meal.quantity
  }

  public get MealId() { return this.mealId }
  public get Img() { return this.img }
  public get Name() { return this.name }
  public get Quantity() { return this.quantity }
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

  public static getCartMealInputs(meals: IMeal[]) {
    return meals.reduce<CartMealInput[]>((groupings, meal) => {
      const groupIndex = groupings.findIndex(group => group.MealId === meal._id);
      if (groupIndex === -1) {
        groupings.push(new CartMealInput({
          quantity: 1,
          img: meal.img,
          mealId: meal._id,
          name: meal.name
        }));
      } else {
        groupings[groupIndex] = new CartMealInput({
          ...groupings[groupIndex],
          quantity: groupings[groupIndex].quantity + 1
        })
      }
      return groupings;
    }, [])
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
        cuisines,
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
      meals: Cart.getCartMealInputs(this.Meals)
    }
  }

}