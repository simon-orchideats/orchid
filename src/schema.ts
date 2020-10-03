import { ConsumerQueryResolvers, ConsumerMutationResolvers } from './server/consumer/consumerResolver';
import { AddressQL } from './server/place/addressQL';
import { CardQL } from './server/card/cardQL';
import { LocationQL } from './server/place/locationQL';
import { RestQueryResolvers, RestMutationResolvers } from './server/rests/restResolvers';
import { RestQL } from './server/rests/restQL';
import { PlanQueryResolvers } from './server/plans/planResolvers';
import { merge } from 'lodash';
import { gql, makeExecutableSchema } from 'apollo-server';
import { PlanQL } from './server/plans/planQL';
import { OrderMutationResolvers, OrderQueryResolvers } from './server/orders/orderResolvers';
import { ConsumerQL } from './server/consumer/consumerQL';
import { OrderQL } from './server/orders/orderQL';

const query = gql`
  type Query {
    availablePlans: [Plan!]!
    # allPaidOrders: [Order!]!
    # allUpcomingOrders: [Order!]!
    allTags: [Tag!]! 
    # myUpcomingOrders: [Order!]!
    myPaidOrders: [Order!]!
    # myRewards: Rewards!
    # mySpent: Spent!
    nearbyRests(
      addr: String!,
      from: String!,
      to: String!
      serviceDay: ServiceDay!,
      serviceType: ServiceType!,
    ): [Rest!]!
    rest(restId: ID!): Rest!
    sharedAccounts: [String!]!
    # order(orderId: ID!): Order!
    # consumerFromReferral(promoCode: ID!): String!
    myConsumer: Consumer

    # baddies
    allPaidOrders: String
    allUpcomingOrders: String
    myUpcomingOrders: String
    myRewards:String
    mySpent: String
    order(orderId: ID!): String
    consumerFromReferral(promoCode: ID!): String!
  }
`

const mutation = gql`
  type BoolRes {
    res: Boolean!
    error: String
  }
  type Mutation {
    addAccountToPlan(addedEmail: String!): BoolRes!
    # addRest(rest: RestInput!): BoolRes!
    # cancelSubscription: BoolRes!
    placeOrder(cart: CartInput!): ConsumerRes!
    # getPromo(promoCode: String!, phone: String! fullAddr: String!): PromoRes!
    removeAccountFromPlan(removedEmail: String!): BoolRes!
    signUp(email: String!, name: String!, pass: String!): ConsumerRes!
    # skipDelivery(orderId: ID!, deliveryIndex: Int!): BoolRes!
    # updateDeliveries(orderId: ID!, updateOptions: UpdateDeliveryInput!): BoolRes!
    # removeDonations(orderId: ID!): BoolRes!
    # updateMyPlan(plan: ConsumerPlanInput!): ConsumerRes!
    updateMyProfile(profile: ConsumerProfileInput!, paymentMethodId: String): ConsumerRes!


    
    # baddies
    addRest(rest: RestInput!): String!
    cancelSubscription: String!
    getPromo(promoCode: String!, phone: String! fullAddr: String!): String!
    skipDelivery(orderId: ID!, deliveryIndex: Int!): String!
    updateDeliveries(orderId: ID!, updateOptions: String!): String!
    removeDonations(orderId: ID!): String!
    updateMyPlan(plan: String!): ConsumerRes!
  }
`

const gqlSchema = gql`
  schema {
    query: Query
    mutation: Mutation
  }
`

const typeDefs = [
  AddressQL,
  CardQL,
  ConsumerQL,
  OrderQL,
  LocationQL,
  PlanQL,
  RestQL,
  query,
  mutation,
  gqlSchema,
];

const resolvers = {
  Query: merge(
    RestQueryResolvers,
    PlanQueryResolvers,
    OrderQueryResolvers,
    ConsumerQueryResolvers,
  ),
  Mutation: merge(
    OrderMutationResolvers,
    ConsumerMutationResolvers,
    RestMutationResolvers,
  ),
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
