import { IPlan } from './../plan/planModel';
import { ICard } from '../card/cardModel';
import { ServiceType, ServiceTime } from './orderModel';
import { IOrderRest, IOrderMeal, OrderMeal, ICustomization } from './orderRestModel';
import { IMeal } from '../rest/mealModel';
import { IDiscount, Discount } from './discountModel';

export const AVERAGE_MARKUP_PERCENTAGE = 28;

export interface ICartInput {
  readonly address2: string | null
  readonly paymentMethodId: string | null
  readonly card: ICard
  readonly stripeProductPriceId: string | null 
  readonly phone: string
  readonly searchArea: string
  readonly tip: number
  readonly cartOrder: {
    readonly rest: ICartRest,
    readonly serviceDate: string,
    readonly serviceInstructions: string | null
    readonly serviceTime: ServiceTime
    readonly serviceType: ServiceType
  }
};

export interface ICartRest extends IOrderRest {
  readonly discount: IDiscount | null
  readonly taxRate: number,
  readonly deliveryFee: number,
}

export class CartRest {
  static addMeal(
    mealToAdd: IOrderMeal,
    cartRest: ICartRest | null,
    deliveryFee: number,
    discount: IDiscount | null,
    restId: string,
    restName: string,
    taxRate: number,
  ): ICartRest {
    if (!cartRest) {
      return {
        discount,
        deliveryFee,
        meals: [mealToAdd],
        restId,
        restName,
        taxRate,
      }
    }
    if (restId !== cartRest.restId || restName !== cartRest.restName) {
      const err = new Error(`Adding new rest '${restId}' '${restName}'to existing orderRest '${cartRest.restId}' '${cartRest.restName}'`);
      console.error(err.stack);
      throw err;
    }
    let didFindMeal = false;
    const newMeals = cartRest.meals.map(m => {
      if (OrderMeal.equals(mealToAdd, m)) {
        didFindMeal = true;
        return OrderMeal.incrementQuantity(m);
      }
      return m;
    });
    if (!didFindMeal) newMeals.push(mealToAdd);
    return {
      ...CartRest.getICopy(cartRest),
      meals: newMeals
    }
  }

  static duplicateMeal(
    cartRest: ICartRest,
    dupeMeal: IOrderMeal,
  ): ICartRest {
    const copyRest = CartRest.getICopy(cartRest);
    const i = copyRest.meals.findIndex(m => OrderMeal.equals(m, dupeMeal));
    if (i === -1) {
      const err = new Error(`Meal '${JSON.stringify(dupeMeal)}' not found in cart for duplicating`);
      console.error(err.stack);
      throw err;
    }
    copyRest.meals[i] = OrderMeal.incrementQuantity(copyRest.meals[i]);
    return copyRest;
  }

  static getICopy(r: ICartRest): ICartRest {
    return {
      deliveryFee: r.deliveryFee,
      discount: r.discount ? Discount.getICopy(r.discount) : null,
      meals: r.meals.map(m => OrderMeal.getICopy(m)),
      restId: r.restId,
      restName: r.restName,
      taxRate: r.taxRate,
    }
  }
  
  static getNumMeals(r: ICartRest): number {
    return r.meals.reduce((sum, m) => sum + m.quantity, 0);
  }

  static removeMeal(
    cartRest: ICartRest,
    removalMeal: IOrderMeal,
  ): ICartRest | null {
    const copyRest = CartRest.getICopy(cartRest);
    const i = copyRest.meals.findIndex(m => OrderMeal.equals(m, removalMeal));
    if (i === -1) {
      const err = new Error(`Removal meal '${JSON.stringify(removalMeal)}' not found in cart`);
      console.error(err.stack);
      throw err;
    }
    if (copyRest.meals[i].quantity === 1) {
      if (copyRest.meals.length === 1) {
        return null
      } else {
        copyRest.meals.splice(i, 1);
        return copyRest;
      }
    } else {
      copyRest.meals[i] = OrderMeal.decrementQuantity(copyRest.meals[i]);
      return copyRest;
    }
  }

  static setInstruction(cartRest: ICartRest, targetMeal: IOrderMeal, instruction: string | null) {
    const copyRest = CartRest.getICopy(cartRest);
    const i = copyRest.meals.findIndex(m => OrderMeal.equals(m, targetMeal));
    if (i === -1) {
      const err = new Error(`Removal meal '${JSON.stringify(targetMeal)}' not found in cart`);
      console.error(err.stack);
      throw err;
    }
    copyRest.meals[i] = OrderMeal.setInstructions(targetMeal, instruction);
    return copyRest;
  }
}

export interface ICart {
  readonly plan: IPlan | null
  readonly rest: ICartRest | null
  readonly searchArea: string | null
  readonly serviceDate: string
  readonly serviceTime: ServiceTime
  readonly serviceType: ServiceType
}

export class Cart {

  public static getICopy(c: ICart): ICart {
    return {
      plan: c.plan,
      rest: c.rest && CartRest.getICopy(c.rest),
      searchArea: c.searchArea,
      serviceDate: c.serviceDate,
      serviceTime: c.serviceTime,
      serviceType: c.serviceType,
    }
  }

  public static getNumMeals(cart: ICart) {
    return cart.rest ? CartRest.getNumMeals(cart.rest) : 0;
  }

  public static addMeal(
    cart: ICart,
    customizations: ICustomization[],
    deliveryFee: number,
    discount: IDiscount | null,
    newMeal: IMeal,
    restId: string,
    restName: string,
    taxRate: number,
  ): ICart {
    const meal: IOrderMeal = OrderMeal.getIOrderMealFromIMeal(customizations, null, newMeal);
    return {
      rest: CartRest.addMeal(
        meal,
        cart.rest,
        deliveryFee,
        discount,
        restId,
        restName,
        taxRate
      ),
      searchArea: cart.searchArea,
      serviceDate: cart.serviceDate,
      serviceTime: cart.serviceTime,
      serviceType: cart.serviceType,
      plan: cart.plan,
    }
  }

  static getCartInput(
    address2: string | null,
    cart: ICart,
    phone: string,
    card: ICard,
    paymentMethodId: string | null,
    serviceInstructions: string | null,
    stripeProductPriceId: string | null,
    tip: number,
  ): ICartInput {
    if (!cart.rest) {
      const err = new Error('Cart missing rest');
      console.error(err.stack);
      throw err;
    }
    if (!cart.searchArea) {
      const err = new Error('Cart missing searchArea');
      console.error(err.stack);
      throw err;
    }
    return {
      address2,
      paymentMethodId,
      card,
      stripeProductPriceId,
      phone,
      searchArea: cart.searchArea,
      cartOrder: {
        rest: cart.rest,
        serviceDate: cart.serviceDate,
        // again, just always save this....
        serviceInstructions, 
        serviceTime: cart.serviceTime,
        serviceType: cart.serviceType
      },
      tip,
    }
  }


  static removeMeal(
    cart: ICart,
    m: IOrderMeal,
  ): ICart {
    if (!cart.rest) {
      const err = new Error(`Cart rest is null`);
      console.error(err.stack);
      throw err;
    }
    return {
      rest: CartRest.removeMeal(
        cart.rest,
        m,
      ),
      searchArea: cart.searchArea,
      serviceDate: cart.serviceDate,
      serviceTime: cart.serviceTime,
      serviceType: cart.serviceType,
      plan: cart.plan,
    }
  }

  public static duplicateMeal(
    cart: ICart,
    m: IOrderMeal,
  ): ICart {
    if (!cart.rest) {
      const err = new Error(`Cart rest is null`);
      console.error(err.stack);
      throw err;
    }
    return {
      rest: CartRest.duplicateMeal(
        cart.rest,
        m,
      ),
      searchArea: cart.searchArea,
      serviceDate: cart.serviceDate,
      serviceTime: cart.serviceTime,
      serviceType: cart.serviceType,
      plan: cart.plan,
    }
  }
  
  public static setInstruction(
    cart: ICart,
    m: IOrderMeal,
    instructions: string | null
  ): ICart {
    if (!cart.rest) {
      const err = new Error(`Cart rest is null`);
      console.error(err.stack);
      throw err;
    }
    return {
      rest: CartRest.setInstruction(
        cart.rest,
        m,
        instructions
      ),
      searchArea: cart.searchArea,
      serviceDate: cart.serviceDate,
      serviceTime: cart.serviceTime,
      serviceType: cart.serviceType,
      plan: cart.plan,
    }
  }
}