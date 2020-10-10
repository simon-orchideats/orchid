import { DEFAULT_SERVICE_TYPE, DEFAULT_SERVICE_TIME, ServiceType, Order, ServiceTime, ServiceTypes } from './../../../order/orderModel';
import { ApolloCache } from 'apollo-cache';
import { Cart, ICart } from '../../../order/cartModel';
import { ClientResolver } from './localState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { IMeal } from '../../../rest/mealModel';
import { IOrderMeal, OrderMeal, ICustomization } from '../../../order/orderRestModel';
import { useGetRest, useGetNearbyRests, useDoesRestDeliverToArea } from '../../../rest/restService';
import { Rest, WeekHours } from '../../../rest/restModel';
import { IPlan } from '../../../plan/planModel';
import { IDiscount } from '../../../order/discountModel';

type cartQueryRes = {
  cart: ICart | null
};

export const cartQL = gql`
  type CartRest {
    restId: ID!
    meals: [OrderMeal!]!,
    restName: String!
    discount: Discount
  }
  type CartState {
    rests: OrderRest
    searchArea: String
    serviceDate: String!
    serviceTime: String!
    serviceType: ServiceType!
    stripeProductPriceId: ID
  }
  input PlanInput {
    stripeProductPriceId: String!
    name: PlanName
    numAccounts: Int!
    price: Int!
  }
  extend type Query {
    cart: CartState
  }
  extend type Mutation {
    clearCartMeals: CartState
    addMealToCart(
      meal: MealInput!,
      customizations: [CustomizationInput!]!,
      discount: DiscountInput,
      deliveryFee: Int!,
      restId: ID!,
      restName: String!,
      taxRate: Float!
    ): CartState!
    incrementMealCount(meal: OrderMealInput!): CartState!
    removeMealFromCart(meal: OrderMealInput!): CartState!
    # setCart(order: Order!): CartState!
    # updateDeliveryDay(day: Int!): CartState!
    setServiceDate(date: String!): CartState!
    setServiceTime(time: String!): CartState!
    setServiceType(type: ServiceType!): CartState!
    setSearchArea(addr: String!): CartState!
    setInstruction(meal: OrderMealInput!, instruction: String): CartState!
    setPlan(plan: PlanInput!): CartState!
  }
`

export const cartInitialState: ICart | null = null;

const CART_QUERY = gql`
  query cart {
    cart @client
  }
`

export const useGetCart = () => {
  const queryRes = useQuery<cartQueryRes>(CART_QUERY);
  return (queryRes.data && queryRes.data.cart) ? Cart.getICopy(queryRes.data.cart) : null
  // return {
  //   "rest": {
  //     "deliveryFee": 200,
  //     "meals": [
  //       {
  //         "customizations": [
  //           {
  //             "additionalPrice": 0,
  //             "name": "Medium Well"
  //           }
  //         ],
  //         "description": "Grilled asparagus, fingerling potatoes, peperonata and salsa verde.",
  //         "img": "https://s3-media0.fl.yelpcdn.com/bphoto/_9hrXbP35jrCkzrzJHhxyA/o.jpg",
  //         "instructions": null,
  //         "mealId": "-Fo8mZ0Kb1cqZAujdDbVA",
  //         "name": "Hanger Steak",
  //         "quantity": 1,
  //         "price": 2100,
  //         "tags": [
  //           {
  //             "name": "American",
  //             "type": "cuisine"
  //           },
  //           {
  //             "name": "Protein",
  //             "type": "diet"
  //           },
  //           {
  //             "name": "Mexican",
  //             "type": "cuisine"
  //           },
  //           {
  //             "name": "Cuban",
  //             "type": "cuisine"
  //           },
  //           {
  //             "name": "Keto",
  //             "type": "diet"
  //           },
  //           {
  //             "name": "Spicy",
  //             "type": "flavor"
  //           },
  //           {
  //             "name": "Steak",
  //             "type": "form"
  //           }
  //         ]
  //       }
  //     ],
  //     "restId": "m0ZR5nQBkr8YmTl0u6Ql",
  //     "restName": "Villa Borghese III",
  //     "taxRate": 0.06625
  //   },
  //   "searchArea": "444 Washington Boulevard, Jersey City, NJ, USA",
  //   "serviceDate": "10/3/2020",
  //   "serviceTime": "ThreeFifteenPToThreeFortyFiveP",
  //   "serviceType": "Delivery",
  //   "plan": {
  //     "stripeProductPriceId": "price_1HQl8qIbp99rfpAlksG3aLxd",
  //     "name": "Foodie",
  //     "numAccounts": 1,
  //     "price": 499
  //   }
  // } as ICart
}

export const useGetCartSuggestions = () => {
  const suggestions: string[] = [];
  const queryRes = useQuery<cartQueryRes>(CART_QUERY);
  const cart = (queryRes.data && queryRes.data.cart) ? Cart.getICopy(queryRes.data.cart) : null
  const isAreaWithinDelivery = useDoesRestDeliverToArea(
    cart?.serviceType || null,
    cart?.searchArea || null,
    cart?.rest?.restId || null,
  ).data
  const rest = useGetRest((cart && cart.rest) ? cart.rest.restId : null);
  if (rest.data && cart && cart.rest) {
    const isClosed = Rest.isClosed(rest.data, cart.serviceDate, cart.serviceTime, cart.serviceType);
    if (isClosed) {
      suggestions.push(`${cart.rest.restName} is closed at ${cart.serviceDate}, ${Order.getServiceTimeStr(cart.serviceTime)}`)
    }
    if (rest.data.deliveryMinimum && OrderMeal.getTotalMealCost(cart.rest.meals) < rest.data.deliveryMinimum) {
      suggestions.push(`${cart.rest.restName} delivery minimum is ${rest.data.deliveryMinimum}`)
    }
    // left off here. test this
    if (isAreaWithinDelivery === false) {
      suggestions.push(`${cart.rest.restName} is outside your delivery area`)
    }
  }

  return suggestions;
}

export const useAddMealToCart = (): (
  meal: IMeal,
  customizations: ICustomization[],
  deliveryFee: number,
  discount: IDiscount | null,
  restId: string,
  restName: string,
  taxRate: number
) => void => {
  type vars = {
    meal: IMeal,
    customizations: ICustomization[],
    deliveryFee: number,
    discount: IDiscount | null,
    restId: string,
    restName: string,
    taxRate: number
  };
  const [mutate] = useMutation<any, vars>(gql`
    mutation addMealToCart(
      $meal: MealInput!,
      $customizations: [CustomizationInput!]!
      $deliveryFee: Int!,
      $discount: DiscountInput,
      $restId: ID!,
      $restName: String!,
      $taxRate: Float!
    ) {
      addMealToCart(
        meal: $meal,
        customizations: $customizations,
        deliveryFee: $deliveryFee,
        discount: $discount,
        restId: $restId,
        restName: $restName,
        taxRate: $taxRate
      ) @client
    }
  `);
  return (
    meal: IMeal,
    customizations: ICustomization[],
    deliveryFee: number,
    discount: IDiscount | null,
    restId: string,
    restName: string,
    taxRate: number
  ) => {
    mutate({ 
      variables: {
        meal,
        customizations,
        deliveryFee,
        discount,
        restId,
        restName,
        taxRate
      }
    })
  }
}

export const useIncrementMealCount = (): (meal: IOrderMeal) => void => {
  type vars = { meal: IOrderMeal };
  const [mutate] = useMutation<any, vars>(gql`
    mutation incrementMealCount($meal: OrderMealInput!) {
      incrementMealCount(meal: $meal) @client
    }
  `);
  return (meal: IOrderMeal) => {
    mutate({ variables: { meal } })
  }
}

export const useRemoveMealFromCart = (): (meal: IOrderMeal) => void => {
  type vars = { meal: IOrderMeal };
  const [mutate] = useMutation<any, vars>(gql`
    mutation removeMealFromCart($meal: OrderMealInput!) {
      removeMealFromCart(meal: $meal) @client
    }
  `);
  return (meal: IOrderMeal) => {
    mutate({ variables: { meal } })
  }
}

export const useClearCartMeals = (): () => void => {
  const [mutate] = useMutation(gql`
    mutation clearCartMeals {
      clearCartMeals @client
    }
  `);
  return () => {
    mutate()
  }
}
// export const useSetCart = (): (order: Order) => void => {
//   type vars = { order: Order };
//   const [mutate] = useMutation<any, vars>(gql`
//     mutation setCart($order: Order!) {
//       setCart(order: $order) @client
//     }
//   `);
//   return (order: Order) => {
//     mutate({ variables: { order } })
//   }
// }

// export const useUpdateCartEmail = (): (email: string) => void => {
//   type vars = { email: string };
//   const [mutate] = useMutation<any, vars>(gql`
//     mutation updateCartEmail($email: ID!) {
//       updateCartEmail(email: $email) @client
//     }
//   `);
//   return (email: string) => {
//     mutate({ variables: { email } })
//   }
// }

// export const useUpdateDeliveryDay = (): (day: deliveryDay) => void => {
//   type vars = { day: deliveryDay };
//   const [mutate] = useMutation<any, vars>(gql`
//     mutation updateDeliveryDay($day: Int!) {
//       updateDeliveryDay(day: $day) @client
//     }
//   `);
//   return (day: deliveryDay) => {
//     mutate({ variables: { day } })
//   }
// }

// export const useUpdateDeliveryTime = (): (time: deliveryTime) => void => {
//   type vars = { time: deliveryTime };
//   const [mutate] = useMutation<any, vars>(gql`
//     mutation updateDeliveryTime($time: Int!) {
//       updateDeliveryTime(time: $time) @client
//     }
//   `);
//   return (time: deliveryTime) => {
//     mutate({ variables: { time } })
//   }
// }

export const useSetInstruction = (): (meal: IOrderMeal, instruction: string | null) => void => {
  type vars = { meal: IOrderMeal, instruction: string | null };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setInstruction($meal: OrderMealInput!, $instruction: String) {
      setInstruction(meal: $meal, instruction: $instruction) @client
    }
  `);
  return (meal: IOrderMeal, instruction: string | null) => {
    mutate({ variables: { meal, instruction } })
  }
}


export const useSetServiceDate = (): (date: string) => void => {
  type vars = { date: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setServiceDate($date: String!) {
      setServiceDate(date: $date) @client
    }
  `);
  return (date: string) => {
    mutate({ variables: { date } })
  }
}

export const useSetSearchArea = (): (addr: string) => void => {
  type vars = { addr: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setSearchArea($addr: String!) {
      setSearchArea(addr: $addr) @client
    }
  `);
  return (addr: string) => {
    mutate({ variables: { addr } })
  }
}

export const useSetServiceTime = (): (time: ServiceTime) => void => {
  type vars = { time: ServiceTime };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setServiceTime($time: String!) {
      setServiceTime(time: $time) @client
    }
  `);
  return (time: ServiceTime) => {
    mutate({ variables: { time } })
  }
}

export const useSetServiceType = (): (type: ServiceType) => void => {
  type vars = { type: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setServiceType($type: ServiceType!) {
      setServiceType(type: $type) @client
    }
  `);
  return (type: ServiceType) => {
    mutate({ variables: { type } })
  }
}

export const useSetPlan = (): (plan: IPlan) => void => {
  type vars = { plan: IPlan };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setPlan($plan: PlanInput!) {
      setPlan(plan: $plan) @client
    }
  `);
  return (plan: IPlan) => {
    mutate({ variables: { plan } })
  }
}

type cartMutationResolvers = {
  addMealToCart: ClientResolver<{
    meal: IMeal,
    customizations: ICustomization[],
    deliveryFee: number,
    discount: IDiscount | null,
    restId: string,
    restName: string,
    taxRate: number,
  }, ICart | null>
  incrementMealCount: ClientResolver<{ meal: IOrderMeal }, ICart | null>
  clearCartMeals: ClientResolver<undefined, ICart | null>
  removeMealFromCart: ClientResolver<{ meal: IOrderMeal }, ICart | null>
  // setCart: ClientResolver<{ order: Order, deliveryIndex: number }, ICart | null>
  setSearchArea: ClientResolver<{ addr: string }, ICart | null>
  setInstruction: ClientResolver<{ meal: IOrderMeal, instruction: string }, ICart | null>
  setServiceDate: ClientResolver<{ date: string }, ICart | null>
  setServiceTime: ClientResolver<{ time: ServiceTime }, ICart | null>
  setServiceType: ClientResolver<{ type: ServiceType }, ICart | null>
  setPlan: ClientResolver<{ plan: IPlan }, ICart | null>
}

const updateCartCache = (cache: ApolloCache<any>, cart: ICart | null) => {
  cache.writeQuery({
    query: CART_QUERY,
    data: { cart }
  });
  return cart;
}

const getCart = (cache: ApolloCache<any>) => cache.readQuery<cartQueryRes>({
  query: CART_QUERY
});

export const cartMutationResolvers: cartMutationResolvers = {
  addMealToCart: (_,
    {
      meal,
      customizations,
      deliveryFee,
      discount,
      restId,
      restName,
      taxRate,
    },
    { cache }
  ) => {
    const res = getCart(cache)
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    const newCart = Cart.addMeal(
      res.cart,
      customizations,
      deliveryFee,
      discount,
      meal,
      restId,
      restName,
      taxRate,
    );
    return updateCartCache(cache, newCart);
  },

  clearCartMeals: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, {
      rest: null,
      searchArea: res.cart.searchArea,
      serviceDate: res.cart.serviceDate,
      serviceTime: res.cart.serviceTime,
      serviceType: res.cart.serviceType,
      plan: res.cart.plan,
    });
  },

  incrementMealCount: (_, { meal }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    const newCart = Cart.duplicateMeal(
      res.cart,
      meal,
    );
    return updateCartCache(cache, newCart);
  },

  removeMealFromCart: (_, { meal }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    const newCart = Cart.removeMeal(
      res.cart,
      meal,
    );
    return updateCartCache(cache, newCart);
  },
  
  setInstruction: (_, { meal, instruction }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    const newCart = Cart.setInstruction(
      res.cart,
      meal,
      instruction
    );
    return updateCartCache(cache, newCart);
  },

  setSearchArea: (_, { addr }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, {
        rest: null,
        searchArea: addr,
        serviceDate: Order.getServiceDateStr(new Date()),
        serviceTime: DEFAULT_SERVICE_TIME,
        serviceType: DEFAULT_SERVICE_TYPE,
        plan: null,
      });
    }
    return updateCartCache(cache, {
      rest: res.cart.rest,
      searchArea: addr,
      serviceDate: res.cart.serviceDate,
      serviceTime: res.cart.serviceTime,
      serviceType: res.cart.serviceType,
      plan: res.cart.plan,
    });
  },

  setServiceDate: (_, { date }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, {
      rest: res.cart.rest,
      searchArea: res.cart.searchArea,
      serviceDate: date,
      serviceTime: res.cart.serviceTime,
      serviceType: res.cart.serviceType,
      plan: res.cart.plan,
    });
  },
  
  setServiceTime: (_, { time }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, {
      rest: res.cart.rest,
      searchArea: res.cart.searchArea,
      serviceDate: res.cart.serviceDate,
      serviceTime: time,
      serviceType: res.cart.serviceType,
      plan: res.cart.plan,
    });
  },

  setServiceType: (_, { type }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, {
      rest: res.cart.rest,
      searchArea: res.cart.searchArea,
      serviceDate: res.cart.serviceDate,
      serviceTime: res.cart.serviceTime,
      serviceType: type,
      plan: res.cart.plan,
    });
  },

  setPlan: (_, { plan }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return {
        rest: null,
        searchArea: (res && res.cart) ? res.cart.searchArea : null,
        serviceDate: Order.getServiceDateStr(new Date()),
        serviceTime: DEFAULT_SERVICE_TIME,
        serviceType: DEFAULT_SERVICE_TYPE,
        plan,
      }
    }
    return updateCartCache(cache, {
      rest: res.cart.rest,
      searchArea: res.cart.searchArea,
      serviceDate: res.cart.serviceDate,
      serviceTime: res.cart.serviceTime,
      serviceType: res.cart.serviceType,
      plan,
    });
  }
}