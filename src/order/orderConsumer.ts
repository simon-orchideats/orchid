import { ICard, Card } from "../card/cardModel";
import { EConsumerProfile } from "../consumer/consumerModel";
import { SignedInUser } from "../utils/apolloUtils";
import { ICartInput } from "./cartModel";

export interface IOrderConsumerProfile extends Omit<EConsumerProfile, 'searchArea' | 'serviceInstructions'> {
  readonly phone: string
  readonly card: ICard
}

export class OrderConsumerProfile {
  static getICopy(orderConsumerProfile: IOrderConsumerProfile) {
    return {
      name: orderConsumerProfile.name,
      email: orderConsumerProfile.email,
      phone: orderConsumerProfile.phone,
      card: Card.getICopy(orderConsumerProfile.card),
    }
  }
}

export interface IOrderConsumer {
  readonly userId: string
  readonly profile: IOrderConsumerProfile
}

export class OrderConsumer {
  static getICopy(oc: IOrderConsumer) {
    return {
      userId: oc.userId,
      profile: OrderConsumerProfile.getICopy(oc.profile)
    }
  }

  static getIOrderConsumer(signedInUser: NonNullable<SignedInUser>, cart: ICartInput) {
    return {
      userId: signedInUser._id,
      profile: {
        name: signedInUser.profile.name,
        email: signedInUser.profile.email,
        phone: cart.phone,
        card: cart.card,
      }
    }
  }
}