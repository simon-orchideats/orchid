import { getNextDeliveryDate } from './utils';
import { ICard } from '../card/cardModel';
import { IDestination } from '../place/destinationModel';
import { deliveryDay, IConsumerPlan, RenewalType, CuisineType } from '../consumer/consumerModel';
import { IMeal, Meal } from '../rest/mealModel';
import { state } from '../place/addressModel';

export type ICartMeal = {
  readonly mealId: string
  readonly name: string
  readonly img: string
  readonly quantity: number
}

export class CartMeal implements ICartMeal {
  readonly mealId: string;
  readonly img: string;
  readonly name: string;
  readonly quantity: number

  constructor(meal: ICartMeal) {
    this.mealId = meal.mealId;
    this.img = meal.img;
    this.name = meal.name;
    this.quantity = meal.quantity
  }

  public get MealId() { return this.mealId }
  public get Img() { return this.img }
  public get Name() { return this.name }
  public get Quantity() { return this.quantity }

  static getCartMeal(meal: IMeal, quantity: number = 1) {
    return new CartMeal({
      mealId: meal._id,
      img: meal.img,
      name: meal.name,
      quantity,
    });
  }

  static getICopy(meal: ICartMeal): ICartMeal {
    return {
      ...meal
    }
  }
}

export interface ICartInput {
  readonly restId: string
  readonly paymentMethodId: string
  readonly card: ICard
  readonly consumerPlan: IConsumerPlan
  readonly meals: ICartMeal[]
  readonly phone: string//shared
  readonly destination: IDestination
  readonly deliveryDate: number
};

export interface ICart {
  readonly meals: ICartMeal[];
  readonly restId: string | null;
  readonly stripePlanId: string | null;
  readonly deliveryDay: deliveryDay | null;
  readonly zip: string | null;
  readonly email: string | null;
}

export class Cart implements ICart {
  readonly meals: CartMeal[]
  readonly restId: string | null
  readonly stripePlanId: string | null
  readonly deliveryDay: deliveryDay | null
  readonly zip: string | null;
  readonly email: string | null;

  constructor(cart: ICart) {
    this.meals = cart.meals.map(meal => new CartMeal(meal));
    this.restId = cart.restId;
    this.stripePlanId = cart.stripePlanId;
    this.deliveryDay = cart.deliveryDay;
    this.zip = cart.zip;
    this.email = cart.email;
  }

  public get DeliveryDay() { return this.deliveryDay }
  public get Email() { return this.email }
  public get Meals() { return this.meals }
  public get StripePlanId() { return this.stripePlanId }
  public get RestId() { return this.restId }
  public get Zip() { return this.zip }

  public static getCartMeals(meals: IMeal[]) {
    return meals.reduce<CartMeal[]>((groupings, meal) => {
      const groupIndex = groupings.findIndex(group => group.MealId === meal._id);
      if (groupIndex === -1) {
        groupings.push(CartMeal.getCartMeal(meal));
      } else {
        groupings[groupIndex] = new CartMeal({
          ...groupings[groupIndex],
          quantity: groupings[groupIndex].quantity + 1
        })
      }
      return groupings;
    }, [])
  }

  public static getMealCount(meals: ICartMeal[]) {
    return meals.reduce<number>((sum, meal) => sum + meal.quantity, 0);
  }

  public addMeal(newMeal: Meal) {
    const newCart = new Cart(this);
    const index = newCart.Meals.findIndex(meal => meal.MealId === newMeal.Id);
    if (index === -1) {
      newCart.meals.push(CartMeal.getCartMeal(newMeal));
    } else {
      newCart.meals[index] = CartMeal.getCartMeal(newMeal, newCart.Meals[index].Quantity + 1);
    }
    return newCart;
  }

  public removeMeal(mealId: string) {
    const newCart = new Cart(this);
    const index = newCart.Meals.findIndex(meal => meal.MealId === mealId);
    if (index === -1) {
      const err = new Error(`MealId '${mealId}' not found in cart`);
      console.error(err.stack);
      throw err;
    }
    const targetMeal = newCart.Meals[index];
    if (targetMeal.Quantity === 1) {
      newCart.Meals.splice(index, 1);
    } else {
      newCart.Meals[index] = new CartMeal({
        ...targetMeal,
        quantity: targetMeal.Quantity - 1,
      })
    }
    return newCart;
  }

  public getCartInput(
    deliveryName: string,
    address1: string,
    address2: string | null,
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
      const err = new Error(`Cart is missing property '${JSON.stringify(this)}'`);
      console.error(err.stack);
      throw err;
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
      meals: this.Meals,
    }
  }

}