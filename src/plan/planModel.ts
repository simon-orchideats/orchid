export const PLAN_DISCLAIMER = `
  By signing up, you acknowledge that you have read and agree to the Table Terms and Conditions and
  authorize us to charge your default payment method after your 30-day free trial. Your membership 
  continues until cancelled by visiting Your Plan.
`

export type PlanName = 'Foodie' | 'Partner' | 'Community';

export const PlanNames: {
  Foodie: 'Foodie',
  Partner: 'Partner',
  Community: 'Community',
} = {
  Foodie: 'Foodie',
  Partner: 'Partner',
  Community: 'Community',
}

export interface IPlan {
  readonly stripeProductPriceId: string;
  readonly name: PlanName;
  readonly numAccounts: number;
  readonly price: number
}

export class Plan {
  public static getPlan(id: string, products: IPlan[]) {
    return getPlanById(id, products);
  }

  public static getICopy(p: IPlan): IPlan {
    return {
      stripeProductPriceId: p.stripeProductPriceId,
      name: p.name,
      numAccounts: p.numAccounts,
      price: p.price,
    }
  }
}

const getPlanById = (id: string, products: IPlan[]) => {
  const plan = products.find(p => p.stripeProductPriceId === id);
  if (!plan) {
    const err = new Error(`Failed to find plan '${id}'`);
    console.error(err.stack);
    throw err;
  };
  return plan;
}