import { getConsumerService } from './consumerService';
import { ServerResolovers } from '../utils/models';

export const ConsumerQueryResolvers: ServerResolovers = {
  myConsumer: async(_, _args, context) => {
    console.log("myCoonsumer stuff");
    let test = await context.signedInUser;
    console.log(`MYCOOONSUMER RESULTS: ${JSON.stringify(test)}`);
    console.log("BETT");
    return !!test ? {
          
      _id: '123',
plan: {
  stripePlanId: '',
  deliveryDay: 0,
  rewnewal: '',
  cuisines: []
},
card: {
  last4: '',
  expMonth: 0,
  expYear: 0
},
phone: '',
destination: {
  name: '',
  instructions: '',
  address: {
    address1: '',
    city: '',
    state: 'MA',
    zip: ''
  }
}
      }: 'bruh';
  }
}

export const ConsumerMutationResolvers: ServerResolovers = {
  insertEmail: async (
    _root,
    { email }: { email: string },
  ) => {
    return await getConsumerService().insertEmail(email);
  },
}