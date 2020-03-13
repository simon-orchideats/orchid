import { IRestService } from './../../rests/restService';
import { IConsumerService } from './../../consumer/consumerService';
import { IPlanService } from './../../plans/planService';
import { IGeoService } from './../../place/geoService';
import moment from 'moment';
import { EOrder, IUpdateOrderInput } from './../../../order/orderModel';
import { Client } from '@elastic/elasticsearch';
import { SignedInUser } from '../../utils/models';
import { initOrderService, getOrderService } from '../orderService';
import Stripe from 'stripe';

const getTargetorder = (invoiceDate: number, deliveryDate: number): EOrder  => ({
  cartUpdatedDate: 123,
  consumer: {
    userId: 'userId',
    profile: {
      name: 'name',
      email: 'email@email.com',
      phone: 'phone',
      card: {
        last4: 'last4',
        expMonth: 1,
        expYear: 2020
      },
      destination: {
        name: 'name',
        address: {
          address1: 'address1',
          address2: 'address2',
          city: 'city',
          state: 'NJ',
          zip: 'zip'
        },
        instructions: 'intsructions',
      },
    },
  },
  costs: {
    tax: 123,
    tip: 123,
    mealPrice: 123,
    total: 4000,
    percentFee: 123,
    flatRateFee: 123,
  },
  createdDate: 123,
  invoiceDate,
  deliveryDate,
  rest: {
    restId: 'restId',
    meals: []
  },
  status: 'Open',
  stripeSubscriptionId: 'subscriptionId'
});


const signedInUser: SignedInUser = {
  userId: 'userId',
  stripeSubscriptionId: 'subscriptionId',
  stripeCustomerId: 'stripeCustomerId',
  profile: {
    name: 'name',
    email: 'email@email.com',
  },
}

const getDesc = (dateStr: string) => `Plan Adjustment for payment on ${dateStr}`

const getExpectedInvoice = (amount: number, description: string) => ({
  currency: 'usd',
  customer: signedInUser.stripeCustomerId,
  amount,
  description,
  subscription: signedInUser.stripeSubscriptionId
});

const getUpdateOptions = (
  deliveryDate: number,
  mealCount: number,
): IUpdateOrderInput => ({
  restId: 'restId',
  meals: [{
    mealId: 'mealId',
    name: 'name',
    img: 'img',
    quantity: mealCount
  }],
  phone: 'phone',
  destination: {
    name: 'name',
    address: {
      address1: 'address1',
      address2: 'address2',
      city: 'city',
      state: 'NJ',
      zip: 'zip'
    },
    instructions: 'intsructions',
  },
  deliveryDate,
});

const originalInvoiceDate3DaysBeforeDDate = moment('3-10-2020', 'MM/DD/YYYY').valueOf();
const originalDeliveryDate3DaysAfterIDate = moment('3-13-2020', 'MM/DD/YYYY').valueOf();
const upcomingLineIdCurrAdjustment = 'upcomingLineId';
const prevPlanLineId = 'prevPlanLineId';
const prevAdjustmentLineId = 'prevAdjustmentLineId';

const getElastic = () => ({
  getSource: jest.fn(() => ({
    body: getTargetorder(
      originalInvoiceDate3DaysBeforeDDate,
      originalDeliveryDate3DaysAfterIDate,
    )
  })),
  update: jest.fn(),
} as unknown as Client);

const getStripe = (
  currAdjustmentDesc?: string,
  finalizedAdjustmentDesc?: string,
  oldCurrPlanAmountCents?: number,
  oldCurrAdjustmentCents?: number,
) => ({
  invoices: {
    list: jest.fn(() => ({
      data: [{
        lines: {
          data: [
            {
              id: prevPlanLineId,
              amount: oldCurrPlanAmountCents,
              plan: {},
              description: 'Plan charge'
            },
            {
              id: prevAdjustmentLineId,
              amount: oldCurrAdjustmentCents,
              description: oldCurrAdjustmentCents ? currAdjustmentDesc : undefined
            },
            {
              id: 'finalizedAdjustment',
              amount: 1234,
              description: finalizedAdjustmentDesc
            }
          ]
        }
      }]
    })),
    listUpcomingLineItems: jest.fn(() => ({
      data: [{
        id: 'upcomingPlanLineItem',
        amount: 4000,
        plan: {},
      }]
    }))
  },
  invoiceItems: {
    create: jest.fn(),
    del: jest.fn(),
    list: jest.fn(() => ({
      data: [
        {
          id: upcomingLineIdCurrAdjustment,
          plan: {},
          amount: 4000,
          description: currAdjustmentDesc
        },
      ]
    }))
  }
} as unknown as Stripe)


const getGeoService = () => ({
  getGeocode: jest.fn(() => Promise.resolve({}))
} as unknown as IGeoService);

const getPlanService = () => ({
  getPlanByCount: jest.fn((count: number) => {
    let weekPrice;
    let mealPrice;
    switch (count) {
      case 4:
        weekPrice = 40;
        mealPrice = 11.5;
        break;
      case 8:
        weekPrice = 80
        mealPrice = 10.99
        break;
      case 12:
        weekPrice = 150
        mealPrice = 9.99
        break;
    }
    return Promise.resolve({
      weekPrice,
      mealPrice,
    })
  })
} as unknown as IPlanService);

const getConsumerService = () => ({} as unknown as IConsumerService)

const getRestService = () => ({
  getRest: jest.fn(() => Promise.resolve({
    menu: [{
      _id: 'mealId',
      name: 'name',
      img: 'img',
    }],
  }))
} as unknown as IRestService);

const initOrderServiceWithMocks = (stripe: Stripe) => initOrderService(
  getElastic(),
  stripe,
  getGeoService(),
  getPlanService(),
  getConsumerService(),
  getRestService(),
)

describe('OrderService', () => {
  describe('UpdateOrder', () => {
    it('Can\'t set delivery date to more than 8 days after payment', async () => {
      const stripe = getStripe();
      initOrderServiceWithMocks(stripe);
      const res = await Promise.all([
        getOrderService().updateOrder(
          signedInUser,
          'orderId',
          getUpdateOptions(
            moment(originalDeliveryDate3DaysAfterIDate).add(4, 'd').valueOf(),
            12,
          ),
          originalInvoiceDate3DaysBeforeDDate,
        ),
        getOrderService().updateOrder(
          signedInUser,
          'orderId',
          getUpdateOptions(
            moment(originalDeliveryDate3DaysAfterIDate).add(5, 'd').valueOf(),
            12
          ),
          originalInvoiceDate3DaysBeforeDDate,
        ),
        getOrderService().updateOrder(
          signedInUser,
          'orderId',
          getUpdateOptions(
            moment(originalDeliveryDate3DaysAfterIDate).add(6, 'd').valueOf(),
            12
          ),
          originalInvoiceDate3DaysBeforeDDate,
        ),
      ]);

      expect(res).toEqual([
        {
          res: true,
          error: null,
        },
        {
          res: true,
          error: null,
        },
        {
          res: false,
          error: 'Delivery date cannot exceed 8 days after the payment'
        }
      ])
    });

    /**
     * following test for upgrading current week follows the this scenario
     * 
     * given week, modify week
     * 
     * w1, w1 - upgrade w1 40 -> 80, so gets INVOICED w1 (80 - 40) = 40
     * 
     * w1, w1 - upgrade w1 again to 150, remove targetW1prevInvoice (40) on w1 and reinvoice w1 (150 - 40) = 110
     * 
     * w1, w1 - downgrade w1 all the way to 40, remove targetW1prevInvoice (110) on w1 and reinvoice w1 (40 - 40) = 0;
     * 
     * w1, w1 - skip w1, remove targetW1prevInvoice (110) on w1 and reinvoice w1 (0 - 40) = -40;
     *
     * w1, w1 - upgrade w1 to 80, remove targetW1prevInvoice(0) on w1and reinvoice w1 (80 - 40) = 40
     * 
     * ---------W1 STILL NOT SHIPPED, BUT CUST PAID 80 TOTAL (40(plan) + 40(inv)) ----------
     * 
     * w2, w1 - upgrade w1 to 150, invoice w2 (150 - 80) = 70
     * 
     * w2, w1 - downgrade w1 to 80, remove targetW1prevInvoice(70) on w2, invoice w2 (80 - 80) = 0 (THIS IS RIGHT SINCE THEY ALREADY PAID 80)
     * 
     * w2, w1 - downgrade w1 to 40, remove targetW1prevInvoice(0) w2, invoice w2 (40 - 80) = -40
     * 
     * w2, w1 - skip w1, remove targetW1prevInvoice(-40) invoice w2 (0 - 80) = -80
     * 
     * 
     * --------------- W1 done. final is skip so invoiced -80 to cover overpayment of 80 in w1------------
     * 
     * w2, w2 - upgrade w2 40 -> 150, so gets invoiced w2 150 - 40 = 110
     * 
     * w2, w2 - downgrade w2 150 -> 80, so remove w2 prevInvoice (110) and reinvoice reinvoice w2 (80 - 40) = 40
     *
     * // prev 2 steps are implied in test setup
     *
     * -----------W2 STILL NOT SHIPPED BUT CUST PAID -80 (from w1) + 80 (from w2, 40 + 40 = 80) ------------
     * 
     * // this is correct because customer is invoiced the -80 to counter the 80 in w2.
     * w3, w2 - skip w2, invoice w3 (0 - 80 [80 because w2 payment for w2 stuff [ignoring w1 invoice within w2] is 80]) = -80
     * 
     * // this correct cuz customer's w2 progression is
     * // 40 -> 150 (invoiced for 110) -> 80 (invoiced for 40, paid)-> 0 (invoiced for -80) -> 40.
     * // intutively, consumer paid 80 for w2 already due to 40 -> 80 upgrade. then downgraded to 40, so they're overpaying
     * // by 40 if they downgrade back down to 40
     * w3, w2 - upgrade w2 40, remove w3 prevInvoice (-80) and invoice w3 (40 - 40+40 [40 + 40 because original w2plan + w2's specific modificaiton invoices]) = -40
     *                                                          
     * w3, w3 - upgrade w3 to 80, NO W3 TARGET invoice (only w2), invoice w3 (80 - 40) = 40
     * 
     * --------------W2 SHIPS AND W3 PAID. FINAL W2 = 40, W3 = 80 (40 + 40)
     * 
     */
    describe('Update current week', () => {
      /**
       * possible immediately after sign-up where delivery date is next week or today is right after a delivery. ex:
       * 
       * it's mar 10
       * 1st delivery mar 19
       * 1st bill mar 17
       * 2nd delivery mar 26
       * 2nd bill mar 24
       * 
       * on mar 20, consumer did not pay 2nd bill yet but the 2nd delivery is now the current week
       * 
       */ 
      it(
        `
          before having paid for current week, consumer updates $40 plan to $150 to $40 to skip to $80 to create
          replacing invoices of $40, $110, $0 (no invoice), $-40, $40 to be paid with current week.
        `,
        async () => {
          const newDDate = moment(originalDeliveryDate3DaysAfterIDate).add(4, 'd').valueOf();
          const now = moment(originalInvoiceDate3DaysBeforeDDate).subtract(1, 'd').valueOf();
          const desc = getDesc(moment(originalInvoiceDate3DaysBeforeDDate).format('M/D/YY'));
          const stripe = getStripe(desc, undefined, 0);
          initOrderServiceWithMocks(stripe);
          await Promise.all([
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 12),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 4),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 0),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 8),
              now
            )
          ]);

          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(11000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-4000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(4000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledTimes(3);
          expect(stripe.invoiceItems.del).toHaveBeenCalledTimes(4);
        }
      )
      
      it(
        `
          Update delivery day of current week to 4 days after payment. Then payment day arrives. Current week payment was
          $40 (base plan) + $40 (adjustment for upgrading plan to $80 before payment). Update current week to $150 then
          $80 then $40 then skip. Creates replacing invoices of $70, $0 (no invoice), $-40, $-80 to be paid at start of
          next week.
        `,
        async () => {
          const newDDate = moment(originalDeliveryDate3DaysAfterIDate).add(2, 'd').valueOf();
          const desc = getDesc(moment(originalInvoiceDate3DaysBeforeDDate).format('M/D/YY'));
          const stripe = getStripe(
            desc,
            undefined,
            4000,
            4000,
          );
          initOrderServiceWithMocks(stripe);
          await Promise.all([
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 12),
              originalInvoiceDate3DaysBeforeDDate
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 8),
              originalInvoiceDate3DaysBeforeDDate
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 4),
              originalInvoiceDate3DaysBeforeDDate
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 0),
              originalInvoiceDate3DaysBeforeDDate
            ),
          ]);

          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(7000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-4000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-8000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledTimes(3);
          expect(stripe.invoiceItems.del).toHaveBeenCalledTimes(4);
        }
      )

      it(
        `
          Current week contains adjustment invoices for previous week and current week and has already been paid.
          Previous week's payment was prevBasePlan + prevAdjustment = 40 + -80 = -40. (prev week's costs should be ignored)
          This week's payment was currBasePlan + currAdjustment = 40 + 40 = 80.
          Update current week from 40 to skip then $40.
          Creates replacing invoices of $-80, $40 to be paid at start of next week.
        `,
        async () => {
          const newDDate = moment(originalDeliveryDate3DaysAfterIDate).add(5, 'd').valueOf();
          const now = moment(newDDate).subtract(3, 'd').valueOf();
          const desc = getDesc(moment(originalInvoiceDate3DaysBeforeDDate).format('M/D/YY'));
          const stripe = getStripe(
            desc,
            getDesc(moment(originalInvoiceDate3DaysBeforeDDate).subtract(7, 'd').format('M/D/YY')),
            4000,
            4000,
          );
          initOrderServiceWithMocks(stripe);
          await Promise.all([
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 0),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(newDDate, 4),
              now
            ),
          ]);
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-8000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-4000, desc));
          expect(stripe.invoiceItems.del).toHaveBeenCalledTimes(2);
        }
      )
    });

    describe('Update next week', () => {
      it(
        `
          Next week is the upcoming invoice. Such as when the current week's been paid but not delivered.
          Consumer updates $40 plan to $150 to $40 to skip to $80.
          Creates replacement invoices of $110, $0 (no invoice), $-40, $40 to be paid with next invoice.
        `,
        async () => {
          const now = moment(originalInvoiceDate3DaysBeforeDDate).subtract(7, 'd').valueOf();
          const desc = getDesc(moment(originalInvoiceDate3DaysBeforeDDate).format('M/D/YY'));
          const stripe = getStripe(
            desc,
            `Plan Adjustment for payment on ${moment(now).format('M/D/YY')}`,
          );
          initOrderServiceWithMocks(stripe);
          await Promise.all([
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 12),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 4),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 0),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 8),
              now
            ),
          ]);
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(11000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-4000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(4000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledTimes(3);
          expect(stripe.invoiceItems.del).toHaveBeenCalledTimes(4);
        }
      );

      /**
       * Why is it okay to pay for next week's change with current week's invoice? See scenario below.
       * 
       * given week, modify week
       * 
       * w1, w2 - update w2 40 -> 80, so gets INVOICED for w2 in w1 of (newPlan - originalPlan) = (80 - 40) = $40
       * w1, w2 - update w2 to 150, remove w2 adjustment within w1 invoice. invoice for w2 in w1 of (newPlan - originalPlan) = (150 - 40) = $110
       * 
       * ------------ W1 IS INVOICED. Consumer paid for w1 costs C, and w2 adjustments of $110 ------------
       * 
       * Now upcoming invoice is w2.
       * w2, w2 - update w2 to skip, so invoice w2 in w2 of (newPlan - (originalPlan + prevAdjustment)) = (0 - (40 + 110) = $-150
       * 
       */
      it(
        `
          Next week is NOT the upcoming invoice. Such as when today is immediately after a delivery. After a delivery,
          current week is the upcoming invoice and next week is the upcoming-upcoming delivery.
          Consumer updates $40 plan to $150 to $40 to skip to $80.
          Creates replacement invoices of $110, $0 (no invoice), $-40, $40 to be paid with next invoice.
        `,
        async () => {
          const now = moment(originalDeliveryDate3DaysAfterIDate).subtract(9, 'd').valueOf();
          const desc = getDesc(moment(originalInvoiceDate3DaysBeforeDDate).format('M/D/YY'))
          const stripe = getStripe(desc);
          initOrderServiceWithMocks(stripe);
          await Promise.all([
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 12),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 4),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 0),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 8),
              now
            ),
          ]);
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(11000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-4000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(4000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledTimes(3);
          expect(stripe.invoiceItems.del).toHaveBeenCalledTimes(4);
        }
      )
      it(
        `
          Next week is the upcoming invoice and was previously adjusted for $110.
          Consumer updates from $40 to skip to $40. Creates invoices of $-150, $-110
        `,
        async () => {
          const now = moment(originalDeliveryDate3DaysAfterIDate).subtract(9, 'd').valueOf();
          const desc = getDesc(moment(originalInvoiceDate3DaysBeforeDDate).format('M/D/YY'))
          const stripe = getStripe(
            desc,
            undefined,
            4000,
            11000,
          );
          initOrderServiceWithMocks(stripe);
          await Promise.all([
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 0),
              now
            ),
            getOrderService().updateOrder(
              signedInUser,
              'orderId',
              getUpdateOptions(originalDeliveryDate3DaysAfterIDate, 4),
              now
            ),
          ]);
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-15000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledWith(getExpectedInvoice(-11000, desc));
          expect(stripe.invoiceItems.create).toHaveBeenCalledTimes(2);
          expect(stripe.invoiceItems.del).toHaveBeenCalledTimes(2);
        }
      )
    })
  });
});