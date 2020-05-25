import { ConsumerQueryResolvers, ConsumerMutationResolvers } from './server/consumer/consumerResolver';
import { ConsumerPlanQL } from './server/consumer/consumerPlanQL';
import { DestinationQL } from './server/place/destinationQL';
import { AddressQL } from './server/place/addressQL';
import { CardQL } from './server/card/cardQL';
import { LocationQL } from './server/place/locationQL';
import { RestQueryResolvers } from './server/rests/restResolvers';
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
    myUpcomingOrders: [Order!]!
    nearbyRests(cityOrZip: String): [Rest!]!
    rest(restId: ID!): Rest!
    order(orderId: ID!): Order!
    myConsumer: Consumer
  }
`

const mutation = gql`
  type BoolRes {
    res: Boolean!
    error: String
  }
  type Mutation {
    cancelSubscription: BoolRes!
    placeOrder(cart: CartInput!): ConsumerRes!
    getPromo(promoCode: String!, phone: String! fullAddr: String!): PromoRes!
    addMarketingEmail(email: String!): BoolRes!
    signUp(email: String!, name: String!, pass: String!): ConsumerRes!
    skipDelivery(orderId: ID!, deliveryIndex: Int!): BoolRes!
    updateDeliveries(orderId: ID!, updateOptions: UpdateDeliveryInput!): BoolRes!
    removeDonations(orderId: ID!): BoolRes!
    updateMyPlan(plan: ConsumerPlanInput!): ConsumerRes!
    updateMyProfile(profile: ConsumerProfileInput!, paymentMethodId: String): ConsumerRes!
  }
`

const gqlSchema = gql`
  schema {
    query: Query
    mutation: Mutation
  }
`

const typeDefs = [
  ConsumerPlanQL,
  AddressQL,
  CardQL,
  ConsumerQL,
  OrderQL,
  DestinationQL,
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
    ConsumerMutationResolvers
  ),
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
