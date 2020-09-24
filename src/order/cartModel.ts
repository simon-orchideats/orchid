import { ICard } from '../card/cardModel';
import { ServiceType, ServiceTime } from './orderModel';
import { IOrderRest, IOrderMeal, OrderMeal } from './orderRestModel';
import { IMeal } from '../rest/mealModel';

export interface ICartInput {
  readonly address2: string | null
  readonly paymentMethodId: string
  readonly card: ICard
  readonly stripeProductPriceId: string | null 
  readonly phone: string
  readonly searchArea: string
  readonly cartOrder: {
    readonly rest: ICartRest,
    readonly serviceDate: string,
    // again, just always save this....
    readonly serviceInstructions: string 
    readonly serviceTime: ServiceTime
    readonly serviceType: ServiceType
  }
};

export interface ICartRest extends Omit<IOrderRest, 'stripeRestId'> {
  taxRate: number,
  deliveryFee: number,
}

export class CartRest {
  static addMeal(
    mealToAdd: IOrderMeal,
    cartRest: ICartRest | null,
    deliveryFee: number,
    restId: string,
    restName: string,
    taxRate: number,
  ): ICartRest {
    if (!cartRest) {
      return {
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
    console.log('CartRest setInstruction', copyRest);
    return copyRest;
  }
}


export interface ICart {
  readonly rest: ICartRest | null
  readonly searchArea: string
  readonly serviceDate: string
  readonly serviceTime: ServiceTime
  readonly serviceType: ServiceType
}


export class Cart {

  public static getICopy(c: ICart) {
    return {
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
    choices: string[],
    deliveryFee: number,
    newMeal: IMeal,
    restId: string,
    restName: string,
    taxRate: number,
  ): ICart {
    const meal: IOrderMeal = OrderMeal.getIOrderMealFromIMeal(choices, null, newMeal);
    return {
      rest: CartRest.addMeal(
        meal,
        cart.rest,
        deliveryFee,
        restId,
        restName,
        taxRate
      ),
      searchArea: cart.searchArea,
      serviceDate: cart.serviceDate,
      serviceTime: cart.serviceTime,
      serviceType: cart.serviceType,
    }
  }

  static getCartInput(
    address2: string | null,
    cart: ICart,
    phone: string,
    card: ICard,
    paymentMethodId: string,
    serviceInstructions: string,
    stripeProductPriceId: string | null,
  ): ICartInput {
    if (!cart.rest) {
      const err = new Error('Cart missing rest');
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
      }
    }
  }


  static removeMeal(
    cart: ICart,
    m: IOrderMeal,
  ) {
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
    }
  }

  public static duplicateMeal(
    cart: ICart,
    m: IOrderMeal,
  ) {
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
    }
  }
  
  public static setInstruction(
    cart: ICart,
    m: IOrderMeal,
    instructions: string | null
  ) {
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
    }
  }
}