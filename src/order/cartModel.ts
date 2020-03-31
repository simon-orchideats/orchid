import { getNextDeliveryDate } from './utils';
import { ICard } from '../card/cardModel';
import { IDestination } from '../place/destinationModel';
import { deliveryDay, IConsumerPlan, CuisineType, deliveryTime } from '../consumer/consumerModel';
import { IMeal, Meal } from '../rest/mealModel';
import { state } from '../place/addressModel';

export type ICartMeal = {
  readonly mealId: string
  readonly name: string
  readonly img?: string
  readonly quantity: number
  // todo: enable these
  // readonly isVegan: boolean
  // readonly isVegetarian: boolean
  // readonly restId: string
  // readonly deliveryDate: number
  // readonly deliveryTime: deliveryTime
}

export class CartMeal implements ICartMeal {
  readonly mealId: string;
  readonly img?: string;
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
  readonly restId: string | null // null for all donations as cart
  readonly paymentMethodId: string
  readonly card: ICard
  readonly consumerPlan: IConsumerPlan
  readonly meals: ICartMeal[]
  readonly donationCount: number
  readonly phone: string
  readonly destination: IDestination
  readonly deliveryDate: number
};

export interface ICart {
  readonly donationCount: number
  readonly meals: ICartMeal[];
  readonly restId: string | null;
  readonly restName: string | null;
  readonly stripePlanId: string | null;
  readonly deliveryDay: deliveryDay | null;
  readonly zip: string | null;
  readonly deliveryTime: deliveryTime | null;
}

export class Cart implements ICart {
  readonly donationCount: number
  readonly meals: CartMeal[]
  readonly restId: string | null
  readonly restName: string | null
  readonly stripePlanId: string | null
  readonly deliveryDay: deliveryDay | null
  readonly zip: string | null;
  readonly deliveryTime: deliveryTime | null;

  constructor(cart: ICart) {
    this.donationCount = cart.donationCount;
    this.meals = cart.meals.map(meal => new CartMeal(meal));
    this.restId = cart.restId;
    this.restName = cart.restName;
    this.stripePlanId = cart.stripePlanId;
    this.deliveryDay = cart.deliveryDay;
    this.zip = cart.zip;
    this.deliveryTime = cart.deliveryTime;
  }

  public get DeliveryDay() { return this.deliveryDay }
  public get DeliveryTime() { return this.deliveryTime }
  public get DonationCount() { return this.donationCount }
  public get Meals() { return this.meals }
  public get StripePlanId() { return this.stripePlanId }
  public get RestId() { return this.restId }
  public get RestName() { return this.restName }
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
    address1: string,
    address2: string | null,
    city: string,
    state: state,
    zip: string,
    phone: string,
    card: ICard,
    paymentMethodId: string,
    instructions: string,
    cuisines: CuisineType[],
  ): ICartInput {
    if (!this.StripePlanId || this.DeliveryDay === null || this.DeliveryTime === null) {
      const err = new Error(`Cart is missing property '${JSON.stringify(this)}'`);
      console.error(err.stack);
      throw err;
    }
    return {
      donationCount: this.donationCount,
      restId: this.RestId,
      paymentMethodId,
      card,
      phone,
      consumerPlan: {
        stripePlanId: this.StripePlanId,
        deliveryDay: this.DeliveryDay,
        deliveryTime: this.DeliveryTime,
        cuisines,
      },
      deliveryDate: getNextDeliveryDate(this.DeliveryDay).valueOf(),
      destination: {
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