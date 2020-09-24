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
  readonly stripePriceId: string;
  readonly name: PlanName;
  readonly numAccounts: number;
  readonly price: number
}

export class Plan {
  public static getProduct(id: string, products: IPlan[]) {
    return getProductById(id, products);
  }

  public static getICopy(p: IPlan) {
    return {
      stripePriceId: p.stripePriceId,
      name: p.name,
      numAccounts: p.numAccounts,
      price: p.price,
    }
  }
}

const getProductById = (id: string, products: IPlan[]) => {
  const plan = products.find(p => p.stripePriceId === id);
  if (!plan) {
    const err = new Error(`Failed to find plan '${id}'`);
    console.error(err.stack);
    throw err;
  };
  return plan;
}