import { DeliveryMeal, DeliveryInput } from './../../../order/deliveryModel';
import { deliveryDay, deliveryTime, Schedule, MealPlan } from './../../../consumer/consumerModel';
import { ApolloCache } from 'apollo-cache';
import { Meal } from '../../../rest/mealModel';
import { Cart, RestMeals } from '../../../order/cartModel';
import { ClientResolver } from './localState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Order } from '../../../order/orderModel';
import moment from 'moment';

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
  extend type Query {
    cart: CartState
  }
  extend type Mutation {
    clearCartMeals: CartState
    addMealToCart(mealId: String!, meal: Meal!, restId: ID!, restName: String!, taxRate: Float!): CartState!
    setScheduleAndAutoDeliveries(schedules: [Schedule!]!, start: Float): CartState!
    decrementDonationCount: CartState!
    incrementDonationCount: CartState!
    moveMealToNewDelivery(meal: Meal!, fromDeliveryIndex: Int!, toDeliveryIndex: Int!): CartState!
    removeMealFromCart(restId: ID!, mealId: ID!): CartState!
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

export const useSetScheduleAndAutoDeliveries = (): (schedules: Schedule[], start?: number) => void => {
  type vars = { schedules: Schedule[], start?: number };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setScheduleAndAutoDeliveries($schedules: [Schedule!]!, $start: Float) {
      setScheduleAndAutoDeliveries(schedules: $schedules, start: $start) @client
    }
  `);
  return (schedules: Schedule[], start?: number) => {
    mutate({ variables: { schedules, start } })
  }
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
  taxRate: number
) => void => {
  type vars = {
    mealId: string,
    meal: Meal | DeliveryMeal,
    choices: string[],
    restId: string,
    restName: string,
    taxRate: number
  };
  const [mutate] = useMutation<any, vars>(gql`
    mutation addMealToCart(
      $mealId: String!,
      $meal: Meal!,
      $choices: [String!]!
      $restId: ID!,
      $restName: String!,
      $taxRate: Float!
    ) {
      addMealToCart(
        mealId: $mealId,
        meal: $meal,
        choices: $choices,
        restId: $restId,
        restName: $restName,
        taxRate: $taxRate
      ) @client
    }
  `);
  return (
    mealId: string,
    meal: Meal | DeliveryMeal,
    choices: string[],
    restId: string,
    restName: string,
    taxRate: number
  ) => {
    mutate({ 
      variables: {
        mealId,
        meal,
        choices,
        restId,
        restName,
        taxRate
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

export const useRemoveMealFromCart = (): (restId: string, mealId: string) => void => {
  type vars = { restId: string, mealId: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation removeMealFromCart($restId: ID!, $mealId: ID!) {
      removeMealFromCart(restId: $restId, mealId: $mealId) @client
    }
  `);
  return (restId: string, mealId: string) => {
    mutate({ variables: { restId, mealId } })
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
    taxRate: number
  }, Cart | null>
  setScheduleAndAutoDeliveries: ClientResolver<{ schedules: Schedule[], start?: number }, Cart | null>
  clearCartMeals: ClientResolver<undefined, Cart | null>
  decrementDonationCount: ClientResolver<undefined, Cart | null>
  incrementDonationCount: ClientResolver<undefined, Cart | null>
  moveMealToNewDelivery: ClientResolver<{ meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number }, Cart | null>
  removeMealFromCart: ClientResolver<{ restId: string, mealId: string }, Cart | null>
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
      taxRate
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
        taxRate
      );
      const newMealPlans = [new MealPlan({
        stripePlanId: meal.StripePlanId,
        planName: meal.PlanName,
        mealCount: 1
      })];
      return updateCartCache(cache, new Cart({
        donationCount: 0,
        deliveries: [],
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
      taxRate
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
    const newCart = res.cart.setScheduleAndAutoDeliveries(schedules, start);
    return updateCartCache(cache, newCart);
  },

  decrementDonationCount: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot decrement donation count from null cart`);
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, new Cart({
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
        donationCount: 1,
        restMeals: {},
        deliveries: [],
        schedules: [],
        zip: null,
      }));
    }
    return updateCartCache(cache, new Cart({
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

  removeMealFromCart: (_, { restId, mealId }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot remove mealId '${mealId}' from null cart`);
      console.error(err.stack);
      throw err;
    }
    let newCart = res.cart.removeMeal(restId, mealId);
    if (Cart.getStandardMealCount(newCart) === 0) {
      newCart = new Cart({
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
    const restMeals: RestMeals = {};
    const newDeliveries: DeliveryInput[] = [];
    order.Deliveries.forEach(d => {
      if (d.Status === 'Confirmed') return;
      d.Meals.forEach(m => Cart.addMealToRestMeals(restMeals, m));
      newDeliveries.push(d);
    });
    return updateCartCache(cache, new Cart({
      donationCount: order.DonationCount,
      restMeals,
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
        donationCount: 0,
        deliveries: [],
        restMeals: {},
        schedules: [],
        zip,
      }));
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount,
      deliveries: res.cart.Deliveries,
      restMeals: res.cart.RestMeals,
      schedules: res.cart.Schedules,
      zip,
    }));
  },
}