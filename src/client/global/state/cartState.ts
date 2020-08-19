import { Hours } from './../../../rest/restModel';
import { DeliveryMeal, DeliveryInput } from './../../../order/deliveryModel';
import { deliveryDay, deliveryTime, Schedule, MealPlan } from './../../../consumer/consumerPlanModel';
import { ApolloCache } from 'apollo-cache';
import { Meal } from '../../../rest/mealModel';
import { Cart } from '../../../order/cartModel';
import { ClientResolver } from './localState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Order } from '../../../order/orderModel';
import moment from 'moment';
import { ApolloError } from 'apollo-client';
import { useMemo } from 'react';
import { ExecutionResult } from '@apollo/react-common';

type cartQueryRes = {
  cart: Cart | null
};

export const cartQL = gql`
  type CartState {
    donationCount: Int!
    deliveries: [DeliveryInput!]!
    schedules: [Schedule!]!
    zip: String
  }
  type AutoDelivery {
    cart: CartState
    delays: [String!]!
  }
  extend type Query {
    cart: CartState
  }
  extend type Mutation {
    clearCartMeals: CartState
    addMealToCart(mealId: String!, meal: Meal!, restId: ID!, restName: String!, taxRate: Float!): CartState!
    setScheduleAndAutoDeliveries(schedules: [Schedule!]!, start: Float): AutoDelivery!
    decrementDonationCount: CartState!
    incrementDonationCount: CartState!
    moveMealToNewDelivery(meal: Meal!, fromDeliveryIndex: Int!, toDeliveryIndex: Int!): CartState!
    removeMealFromCart(restId: ID!, mealId: DeliveryMealInput!): CartState!
    setCart(order: Order!): CartState!
    updateCartPlanId(id: ID!): CartState!
    updateDeliveryDay(day: Int!): CartState!
    updateZip(zip: String!): CartState!
  }
`

export const cartInitialState: Cart | null = null;

const CART_QUERY = gql`
  query cart {
    cart @client
  }
`
type scheduleRes = {
    setScheduleAndAutoDeliveries: {
      delays: string[]
  }
};
export const useSetScheduleAndAutoDeliveries = (): [
  (schedules: Schedule[], start?: number) => Promise<ExecutionResult<scheduleRes>>,
  {
    error: ApolloError | undefined
    delays: string[],
  }
] => {
  type vars = { schedules: Schedule[], start?: number };
  const [mutate, mutation] = useMutation<scheduleRes, vars>(gql`
    mutation setScheduleAndAutoDeliveries($schedules: [Schedule!]!, $start: Float) {
      setScheduleAndAutoDeliveries(schedules: $schedules, start: $start) @client
    }
  `);
  const setScheduleAndAutoDeliveries = (schedules: Schedule[], start?: number) => mutate({ variables: { schedules, start } });
  return useMemo(() => {
    return [
      setScheduleAndAutoDeliveries,
      {
        error: mutation.error,
        delays: mutation.data?.setScheduleAndAutoDeliveries.delays || [],
      }
    ]
  }, [mutation]);
}

export const useGetCart = () => {
  const queryRes = useQuery<cartQueryRes>(CART_QUERY);
  return queryRes.data ? queryRes.data.cart : null
}

export const useDecrementCartDonationCount = () => {
  const [mutate] = useMutation(gql`
    mutation decrementDonationCount {
      decrementDonationCount @client
    }
  `);
  return () => {
    mutate();
  }
}

export const useIncrementCartDonationCount = () => {
  const [mutate] = useMutation(gql`
    mutation incrementDonationCount {
      incrementDonationCount @client
    }
  `);
  return () => {
    mutate();
  }
}

export const useClearCartMeals = () => {
  const [mutate] = useMutation(gql`
    mutation clearCartMeals {
      clearCartMeals @client
    }
  `);
  return () => {
    mutate();
  }
}

export const useAddMealToCart = (): (
  mealId: string,
  meal: Meal | DeliveryMeal,
  choices: string[],
  restId: string,
  restName: string,
  taxRate: number,
  hours: Hours,
) => void => {
  type vars = {
    mealId: string,
    meal: Meal | DeliveryMeal,
    choices: string[],
    restId: string,
    restName: string,
    taxRate: number,
    hours: Hours,
  };
  const [mutate] = useMutation<any, vars>(gql`
    mutation addMealToCart(
      $mealId: String!,
      $meal: Meal!,
      $choices: [String!]!
      $restId: ID!,
      $restName: String!,
      $taxRate: Float!,
      $hours: Hours!,
    ) {
      addMealToCart(
        mealId: $mealId,
        meal: $meal,
        choices: $choices,
        restId: $restId,
        restName: $restName,
        taxRate: $taxRate,
        hours: $hours,
      ) @client
    }
  `);
  return (
    mealId: string,
    meal: Meal | DeliveryMeal,
    choices: string[],
    restId: string,
    restName: string,
    taxRate: number,
    hours: Hours,
  ) => {
    mutate({ 
      variables: {
        mealId,
        meal,
        choices,
        restId,
        restName,
        taxRate,
        hours
      }
    })
  }
}

export const useMoveMealToNewDeliveryInCart = (): (meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number) => void => {
  type vars = { meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number };
  const [mutate] = useMutation<any, vars>(gql`
    mutation moveMealToNewDelivery($meal: ID!, $fromDeliveryIndex: ID!, $toDeliveryIndex: ID!) {
      moveMealToNewDelivery(meal: $meal, fromDeliveryIndex: $fromDeliveryIndex, toDeliveryIndex: $toDeliveryIndex) @client
    }
  `);
  return (meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number) => {
    mutate({ variables: { meal, fromDeliveryIndex, toDeliveryIndex } })
  }
}

export const useRemoveMealFromCart = (): (restId: string, meal: DeliveryMeal) => void => {
  type vars = { restId: string, meal: DeliveryMeal };
  const [mutate] = useMutation<any, vars>(gql`
    mutation removeMealFromCart($restId: ID!, $meal: DeliveryMealInput!) {
      removeMealFromCart(restId: $restId, meal: $meal) @client
    }
  `);
  return (restId: string, meal: DeliveryMeal) => {
    mutate({ variables: { restId, meal } })
  }
}

export const useSetCart = (): (order: Order) => void => {
  type vars = { order: Order };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setCart($order: Order!) {
      setCart(order: $order) @client
    }
  `);
  return (order: Order) => {
    mutate({ variables: { order } })
  }
}

export const useUpdateCartEmail = (): (email: string) => void => {
  type vars = { email: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateCartEmail($email: ID!) {
      updateCartEmail(email: $email) @client
    }
  `);
  return (email: string) => {
    mutate({ variables: { email } })
  }
}

export const useUpdateCartPlanId = (): (id: string) => void => {
  type vars = { id: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateCartPlanId($id: ID!) {
      updateCartPlanId(id: $id) @client
    }
  `);
  return (id: string) => {
    mutate({ variables: { id } })
  }
}

export const useUpdateDeliveryDay = (): (day: deliveryDay) => void => {
  type vars = { day: deliveryDay };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateDeliveryDay($day: Int!) {
      updateDeliveryDay(day: $day) @client
    }
  `);
  return (day: deliveryDay) => {
    mutate({ variables: { day } })
  }
}

export const useUpdateDeliveryTime = (): (time: deliveryTime) => void => {
  type vars = { time: deliveryTime };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateDeliveryTime($time: Int!) {
      updateDeliveryTime(time: $time) @client
    }
  `);
  return (time: deliveryTime) => {
    mutate({ variables: { time } })
  }
}

export const useUpdateZip = (): (zip: string) => void => {
  type vars = { zip: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateZip($zip: Int!) {
      updateZip(zip: $zip) @client
    }
  `);
  return (zip: string) => {
    mutate({ variables: { zip } })
  }
}

type cartMutationResolvers = {
  addMealToCart: ClientResolver<{
    mealId: string,
    meal: Meal | DeliveryMeal,
    choices: string[],
    restId: string,
    restName: string,
    taxRate: number,
    hours: Hours,
  }, Cart | null>
  setScheduleAndAutoDeliveries: ClientResolver<{ schedules: Schedule[], start?: number }, { cart: Cart | null, delays: string[] }>
  clearCartMeals: ClientResolver<undefined, Cart | null>
  decrementDonationCount: ClientResolver<undefined, Cart | null>
  incrementDonationCount: ClientResolver<undefined, Cart | null>
  moveMealToNewDelivery: ClientResolver<{ meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number }, Cart | null>
  removeMealFromCart: ClientResolver<{ restId: string, meal: DeliveryMeal }, Cart | null>
  setCart: ClientResolver<{ order: Order, deliveryIndex: number }, Cart | null>
  updateZip: ClientResolver<{ zip: string }, Cart | null>
}

const updateCartCache = (cache: ApolloCache<any>, cart: Cart | null) => {
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
      mealId,
      meal,
      choices,
      restId,
      restName,
      taxRate,
      hours,
    },
    { cache }
  ) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const newDeliveryMeal = DeliveryMeal.getDeliveryMeal(
        mealId,
        meal,
        choices,
        restId,
        restName,
        taxRate,
        hours,
      );
      const newMealPlans = [new MealPlan({
        stripePlanId: meal.StripePlanId,
        planName: meal.PlanName,
        mealCount: 1
      })];
      return updateCartCache(cache, new Cart({
        donationCount: 0,
        deliveries: [],
        allMeals: [newDeliveryMeal],
        restMeals: {
          [restId]: {
            mealPlans: newMealPlans,
            meals: [newDeliveryMeal],
          }
        },
        schedules: [],
        zip: null,
      }));
    }
    const newCart = res.cart.addMeal(
      mealId,
      meal,
      choices,
      restId,
      restName,
      taxRate,
      hours,
    );
    return updateCartCache(cache, newCart);
  },

  setScheduleAndAutoDeliveries: (_, { schedules, start }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot auto set meals in deliveries from null cart`);
      console.error(err.stack);
      throw err;
    }
    const autos = res.cart.setScheduleAndAutoDeliveries(schedules, start);
    updateCartCache(cache, autos.cart);
    return autos;
  },

  decrementDonationCount: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot decrement donation count from null cart`);
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, new Cart({
      allMeals: res.cart.AllMeals,
      donationCount: res.cart.DonationCount - 1,
      restMeals: res.cart.RestMeals,
      deliveries: res.cart.Deliveries,
      schedules: res.cart.Schedules,
      zip: res.cart.Zip,
    }));
  },

  incrementDonationCount: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        allMeals: [],
        donationCount: 1,
        restMeals: {},
        deliveries: [],
        schedules: [],
        zip: null,
      }));
    }
    return updateCartCache(cache, new Cart({
      allMeals: res.cart.AllMeals,
      donationCount: res.cart.DonationCount + 1,
      restMeals: res.cart.RestMeals,
      deliveries: res.cart.Deliveries,
      schedules: res.cart.Schedules,
      zip: res.cart.Zip,
    }));
  },

  clearCartMeals: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      // possible when you skip an order and there is no cart
      return null;
    }
    return updateCartCache(cache, new Cart({
      allMeals: [],
      donationCount: 0,
      restMeals: {},
      deliveries: [],
      schedules: [],
      zip: res.cart.Zip,
    }));
  },

  moveMealToNewDelivery: (_, { meal, fromDeliveryIndex, toDeliveryIndex }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot move meal '${meal.MealId}' to new delivery from null cart`);
      console.error(err.stack);
      throw err;
    }
    const newCart = res.cart.moveMealToNewDelivery(meal, fromDeliveryIndex, toDeliveryIndex);
    return updateCartCache(cache, newCart);
  },

  removeMealFromCart: (_, { restId, meal }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot remove mealId '${meal.mealId}' from null cart`);
      console.error(err.stack);
      throw err;
    }
    let newCart = res.cart.removeMeal(restId, meal);
    if (Cart.getStandardMealCount(newCart) === 0) {
      newCart = new Cart({
        allMeals: [],
        donationCount: newCart.DonationCount,
        restMeals: {},
        deliveries: [],
        schedules: newCart.schedules,
        zip: newCart.Zip,
      });
    }
    return updateCartCache(cache, newCart);
  },

  setCart: (_, { order }, { cache }) => {
    const newDeliveries: DeliveryInput[] = [];
    let newCart = new Cart({
      allMeals: [],
      donationCount: 0,
      restMeals: {},
      deliveries: [],
      schedules: [],
      zip: null,
    });
    if (!order.isAutoGenerated) {
      order.Deliveries.forEach(d => {
        if (d.Status === 'Confirmed') return;
        d.Meals.forEach(m => {
          for (let i = 0 ; i < m.Quantity; i++) {
            newCart = newCart.addMeal(
              m.MealId,
              m,
              m.Choices,
              m.RestId,
              m.RestName,
              m.TaxRate,
              m.Hours
            );
          }
        });
        newDeliveries.push(d);
      });
    }
    return updateCartCache(cache, new Cart({
      allMeals: newCart.AllMeals,
      donationCount: order.DonationCount,
      restMeals: newCart.RestMeals,
      deliveries: newDeliveries,
      schedules: order.Deliveries.filter(d => d.Status === 'Open').map(d => new Schedule({
        time: d.DeliveryTime,
        day: moment(d.DeliveryDate).day() as deliveryDay,
      })),
      zip: order.Destination.Address.Zip,
    }));
  },

  updateZip: (_, { zip }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        allMeals: [],
        donationCount: 0,
        deliveries: [],
        restMeals: {},
        schedules: [],
        zip,
      }));
    }
    return updateCartCache(cache, new Cart({
      allMeals: res.cart.AllMeals,
      donationCount: res.cart.DonationCount,
      deliveries: res.cart.Deliveries,
      restMeals: res.cart.RestMeals,
      schedules: res.cart.Schedules,
      zip,
    }));
  },
}