import { ICartMeal } from './../../../order/cartModel';
import moment from 'moment';
import { EOrder, IUpdateOrderInput } from './../../../order/orderModel';
import { ICartInput } from '../../../order/cartModel';
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
    total: 123,
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
  stripeCustomerId : "customerId",
  profile: {
    name: 'name',
    email: 'email@email.com',
  },
}
const getUpdateOptions = (
  deliveryDate: number,
  meals: ICartMeal[],
  stripePlanId: string | null
): IUpdateOrderInput => ({
  restId: 'restId',
  stripePlanId,
  meals,
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

describe('OrderService', () => {

  // describe('updateOrder logic', () => {
  //   describe('update paid weekN', () => {
  //     it('removes previous weekN invoice if it exists in weekN + 1', () => {
  //     });
  //     describe('upgrade plan 1st time', () => {
  //       // it's possible theres weekN contains weekN-1 invoices and we ignore them from the math.
  //       // those are a done deal
  //       it('creates an invoice in weekN + 1, for weekN, of newplanPrice - (weekNPlanPrice +  weekNInvoices)', () => {
  //       });
  //     });
  //   });
  // });

  describe('UpdateOrder use-cases', () => {
    describe('Update current week', () => {
      const originalInvoicedate = moment('2020-3-11').valueOf();
      const originalDeliveryDate = moment('2020-3-13').valueOf();
      beforeEach(() => {
        initOrderService(
          {
            getSource: jest.fn(() => getTargetorder(
              originalInvoicedate,
              originalDeliveryDate,
            ))
          } as unknown as Client,
          {
            invoices: {
              retrieveUpcoming: jest.fn(() => ({
                lines: {
                  data: [
                    {
                      plan: {
                        amount: 4000 // 4000 cents === $40
                      }
                    }
                  ]
                }
              }))
            }
          } as unknown as Stripe
        );

      });

      // possible immediately after sign-up where delivery date is next week or right after a delivery
      describe('Update before having paid for current week', () => {
        describe('$40 plan to $80 to $150 to $40 to skip to $80', () => {
          it(
            `
              Creates invoices of $40, $110, $0 (no invoice), $-40, $40 to be paid with current week.
              Each subsequent invoice replaces the previous.
            `,
            () => {
              // 3-17
              const newDDate = moment(originalDeliveryDate).add(4, 'd').valueOf();
              // 3-10
              const now = moment(originalInvoicedate).subtract(1, 'd').valueOf();

              const planService40 = {
                getPlan: jest.fn(() => ({
                  weekPrice: 4000,
                }))
              }
              const planService80 = {
                getPlan: jest.fn(() => ({
                  weekPrice: 8000,
                }))
              }
              const planService150 = {
                getPlan: jest.fn(() => ({
                  weekPrice: 15000,
                }))
              }
              const updateOptions = getUpdateOptions(newDDate);
              getOrderService().updateOrder(signedInUser, 'orderId', updateOptions, now);
              
            }
          );
        });
      });

      describe.skip('Update delivery day of current week to 4 days after payment. Then payment day arrives.', () => {
        describe('Current week payment was $40 (base plan) + $40 (adjustment for upgrading plan to $80 before payment)', () => {
          describe('Update current week to $150 then $80 then $40 then skip', () => {
            it(
              `
                Creates invoices of $70, $0 (no invoice), $-40, $-80 to be paid at start of next week.
                Each subsequent invoice replaces the previous.
              `,
              () => {
    
              })
          });
        });
      });

      describe.skip('Current week contains adjustment invoices for previous week and current week and has already been paid', () => {
        describe(
          `Previous week's payment was prevBasePlan + prevAdjustment = 40 + -80 = -40.
          This week's payment was currBasePlan + currAdjustment = 40 + 40 = 80`,
          () => {
            describe('Update current week to skip then $40', () => {
              it('Creates invoices of $-80, $40 to be paid at start of next week. Each subsequent invoice replaces previous.', () => {

              });
            })
          }
        )
      });
    });

    describe.skip('Update next week', () => {
      describe('$40 plan to $80 to $150 to $40 to skip to $80', () => {
        describe('Next week already has adjustment invoices from current week', () => {
          it(
            `
              Creates invoices of $40, $110, $0 (no invoice), $-40, $40 to be paid with next week.
              Each subsequent invoice replaces the previous.
            `,
            () => {
              
            }
          );
        });

        describe(`Next week doesn't have adjustments from current week`, () => {
          it(
            `
              Creates invoices of $40, $110, $0 (no invoice), $-40, $40 to be paid with next week.
              Each subsequent invoice replaces the previous.
            `,
            () => {

            }
          );
        });
      });
    })
  });
});