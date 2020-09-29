import { SignedInUser } from './../utils/apolloUtils';
import { ICartInput } from './cartModel';
import { ELocation, ILocation, Location } from './../place/locationModel';
import { ICost, Cost } from './costModel';
import { IOrderRest, OrderRest } from './orderRestModel';
import { OrderConsumer, IOrderConsumer } from './orderConsumer';
import { ERest } from '../rest/restModel';

export type ServiceTime =  
'ASAP'
| 'TwelveAToTwelveThirtyA' | 'TwelveFifteenAToTwelveFortyFiveA' | 'TwelveThirtyAToOneA' | 'TwelveFortyFiveAToOneFifteenA'
| 'OneAToOneThirtyA' | 'OneFifteenAToOneFortyFiveA' | 'OneThirtyAToTwoA' | 'OneFortyFiveAToTwoFifteenA'
| 'TwoAToTwoThirtyA' | 'TwoFifteenAToTwoFortyFiveA' | 'TwoThirtyAToThreeA' | 'TwoFortyFiveAToThreeFifteenA'
| 'ThreeAToThreeThirtyA' | 'ThreeFifteenAToThreeFortyFiveA' | 'ThreeThirtyAToFourA' | 'ThreeFortyFiveAToFourFifteenA'
| 'FourAToFourThirtyA' | 'FourFifteenAToFourFortyFiveA' | 'FourThirtyAToFiveA' | 'FourFortyFiveAToFiveFifteenA'
| 'FiveAToFiveThirtyA' | 'FiveFifteenAToFiveFortyFiveA' | 'FiveThirtyAToSixA' | 'FiveFortyFiveAToSixFifteenA'
| 'SixAToSixThirtyA' | 'SixFifteenAToSixFortyFiveA' | 'SixThirtyAToSevenA' | 'SixFortyFiveAToSevenFifteenA'
| 'SevenAToSevenThirtyA' | 'SevenFifteenAToSevenFortyFiveA' | 'SevenThirtyAToEightA' | 'SevenFortyFiveAToEightFifteenA'
| 'EightAToEightThirtyA' | 'EightFifteenAToEightFortyFiveA' | 'EightThirtyAToNineA' | 'EightFortyFiveAToNineFifteenA'
| 'NineAToNineThirtyA' | 'NineFifteenAToNineFortyFiveA' | 'NineThirtyAToTenA' | 'NineFortyFiveAToTenFifteenA'
| 'TenAToTenThirtyA' | 'TenFifteenAToTenFortyFiveA' | 'TenThirtyAToElevenA' | 'TenFortyFiveAToElevenFifteenA'
| 'ElevenAToElevenThirtyA' | 'ElevenFifteenAToElevenFortyFiveA' | 'ElevenThirtyAToTwelveP' | 'ElevenFortyFiveAToTwelveFifteenP'
| 'TwelvePToTwelveThirtyP' | 'TwelveFifteenPToTwelveFortyFiveP' | 'TwelveThirtyPToOneP' | 'TwelveFortyFivePToOneFifteenP'
| 'OnePToOneThirtyP' | 'OneFifteenPToOneFortyFiveP' | 'OneThirtyPToTwoP' | 'OneFortyFivePToTwoFifteenP'
| 'TwoPToTwoThirtyP' | 'TwoFifteenPToTwoFortyFiveP' | 'TwoThirtyPToThreeP' | 'TwoFortyFivePToThreeFifteenP'
| 'ThreePToThreeThirtyP' | 'ThreeFifteenPToThreeFortyFiveP' | 'ThreeThirtyPToFourP' | 'ThreeFortyFivePToFourFifteenP'
| 'FourPToFourThirtyP' | 'FourFifteenPToFourFortyFiveP' | 'FourThirtyPToFiveP' | 'FourFortyFivePToFiveFifteenP'
| 'FivePToFiveThirtyP' | 'FiveFifteenPToFiveFortyFiveP' | 'FiveThirtyPToSixP' | 'FiveFortyFivePToSixFifteenP'
| 'SixPToSixThirtyP' | 'SixFifteenPToSixFortyFiveP' | 'SixThirtyPToSevenP' | 'SixFortyFivePToSevenFifteenP'
| 'SevenPToSevenThirtyP' | 'SevenFifteenPToSevenFortyFiveP' | 'SevenThirtyPToEightP' | 'SevenFortyFivePToEightFifteenP'
| 'EightPToEightThirtyP' | 'EightFifteenPToEightFortyFiveP' | 'EightThirtyPToNineP' | 'EightFortyFivePToNineFifteenP'
| 'NinePToNineThirtyP' | 'NineFifteenPToNineFortyFiveP' | 'NineThirtyPToTenP' | 'NineFortyFivePToTenFifteenP'
| 'TenPToTenThirtyP' | 'TenFifteenPToTenFortyFiveP' | 'TenThirtyPToElevenP' | 'TenFortyFivePToElevenFifteenP'
| 'ElevenPToElevenThirtyP' | 'ElevenFifteenPToElevenFortyFiveP' | 'ElevenThirtyPToTwelveA' | 'ElevenFortyFivePToTwelveFifteenA'

export const ServiceTimes: {
  ASAP: 'ASAP'
  TwelveAToTwelveThirtyA: 'TwelveAToTwelveThirtyA'
  TwelveFifteenAToTwelveFortyFiveA: 'TwelveFifteenAToTwelveFortyFiveA'
  TwelveThirtyAToOneA: 'TwelveThirtyAToOneA'
  TwelveFortyFiveAToOneFifteenA: 'TwelveFortyFiveAToOneFifteenA'
  OneAToOneThirtyA: 'OneAToOneThirtyA'
  OneFifteenAToOneFortyFiveA: 'OneFifteenAToOneFortyFiveA'
  OneThirtyAToTwoA: 'OneThirtyAToTwoA'
  OneFortyFiveAToTwoFifteenA: 'OneFortyFiveAToTwoFifteenA'
  TwoAToTwoThirtyA: 'TwoAToTwoThirtyA'
  TwoFifteenAToTwoFortyFiveA: 'TwoFifteenAToTwoFortyFiveA'
  TwoThirtyAToThreeA: 'TwoThirtyAToThreeA'
  TwoFortyFiveAToThreeFifteenA: 'TwoFortyFiveAToThreeFifteenA'
  ThreeAToThreeThirtyA: 'ThreeAToThreeThirtyA'
  ThreeFifteenAToThreeFortyFiveA: 'ThreeFifteenAToThreeFortyFiveA'
  ThreeThirtyAToFourA: 'ThreeThirtyAToFourA'
  ThreeFortyFiveAToFourFifteenA: 'ThreeFortyFiveAToFourFifteenA'
  FourAToFourThirtyA: 'FourAToFourThirtyA'
  FourFifteenAToFourFortyFiveA: 'FourFifteenAToFourFortyFiveA'
  FourThirtyAToFiveA: 'FourThirtyAToFiveA'
  FourFortyFiveAToFiveFifteenA: 'FourFortyFiveAToFiveFifteenA'
  FiveAToFiveThirtyA: 'FiveAToFiveThirtyA'
  FiveFifteenAToFiveFortyFiveA: 'FiveFifteenAToFiveFortyFiveA'
  FiveThirtyAToSixA: 'FiveThirtyAToSixA'
  FiveFortyFiveAToSixFifteenA: 'FiveFortyFiveAToSixFifteenA'
  SixAToSixThirtyA: 'SixAToSixThirtyA'
  SixFifteenAToSixFortyFiveA: 'SixFifteenAToSixFortyFiveA'
  SixThirtyAToSevenA: 'SixThirtyAToSevenA'
  SixFortyFiveAToSevenFifteenA: 'SixFortyFiveAToSevenFifteenA'
  SevenAToSevenThirtyA: 'SevenAToSevenThirtyA'
  SevenFifteenAToSevenFortyFiveA: 'SevenFifteenAToSevenFortyFiveA'
  SevenThirtyAToEightA: 'SevenThirtyAToEightA'
  SevenFortyFiveAToEightFifteenA: 'SevenFortyFiveAToEightFifteenA'
  EightAToEightThirtyA: 'EightAToEightThirtyA'
  EightFifteenAToEightFortyFiveA: 'EightFifteenAToEightFortyFiveA'
  EightThirtyAToNineA: 'EightThirtyAToNineA'
  EightFortyFiveAToNineFifteenA: 'EightFortyFiveAToNineFifteenA'
  NineAToNineThirtyA: 'NineAToNineThirtyA'
  NineFifteenAToNineFortyFiveA: 'NineFifteenAToNineFortyFiveA'
  NineThirtyAToTenA: 'NineThirtyAToTenA'
  NineFortyFiveAToTenFifteenA: 'NineFortyFiveAToTenFifteenA'
  TenAToTenThirtyA: 'TenAToTenThirtyA'
  TenFifteenAToTenFortyFiveA: 'TenFifteenAToTenFortyFiveA'
  TenThirtyAToElevenA: 'TenThirtyAToElevenA'
  TenFortyFiveAToElevenFifteenA: 'TenFortyFiveAToElevenFifteenA'
  ElevenAToElevenThirtyA: 'ElevenAToElevenThirtyA'
  ElevenFifteenAToElevenFortyFiveA: 'ElevenFifteenAToElevenFortyFiveA'
  ElevenThirtyAToTwelveP: 'ElevenThirtyAToTwelveP'
  ElevenFortyFiveAToTwelveFifteenP: 'ElevenFortyFiveAToTwelveFifteenP'
  TwelvePToTwelveThirtyP: 'TwelvePToTwelveThirtyP'
  TwelveFifteenPToTwelveFortyFiveP: 'TwelveFifteenPToTwelveFortyFiveP'
  TwelveThirtyPToOneP: 'TwelveThirtyPToOneP'
  TwelveFortyFivePToOneFifteenP: 'TwelveFortyFivePToOneFifteenP'
  OnePToOneThirtyP: 'OnePToOneThirtyP'
  OneFifteenPToOneFortyFiveP: 'OneFifteenPToOneFortyFiveP'
  OneThirtyPToTwoP: 'OneThirtyPToTwoP'
  OneFortyFivePToTwoFifteenP: 'OneFortyFivePToTwoFifteenP'
  TwoPToTwoThirtyP: 'TwoPToTwoThirtyP'
  TwoFifteenPToTwoFortyFiveP: 'TwoFifteenPToTwoFortyFiveP'
  TwoThirtyPToThreeP: 'TwoThirtyPToThreeP'
  TwoFortyFivePToThreeFifteenP: 'TwoFortyFivePToThreeFifteenP'
  ThreePToThreeThirtyP: 'ThreePToThreeThirtyP'
  ThreeFifteenPToThreeFortyFiveP: 'ThreeFifteenPToThreeFortyFiveP'
  ThreeThirtyPToFourP: 'ThreeThirtyPToFourP'
  ThreeFortyFivePToFourFifteenP: 'ThreeFortyFivePToFourFifteenP'
  FourPToFourThirtyP: 'FourPToFourThirtyP'
  FourFifteenPToFourFortyFiveP: 'FourFifteenPToFourFortyFiveP'
  FourThirtyPToFiveP: 'FourThirtyPToFiveP'
  FourFortyFivePToFiveFifteenP: 'FourFortyFivePToFiveFifteenP'
  FivePToFiveThirtyP: 'FivePToFiveThirtyP'
  FiveFifteenPToFiveFortyFiveP: 'FiveFifteenPToFiveFortyFiveP'
  FiveThirtyPToSixP: 'FiveThirtyPToSixP'
  FiveFortyFivePToSixFifteenP: 'FiveFortyFivePToSixFifteenP'
  SixPToSixThirtyP: 'SixPToSixThirtyP'
  SixFifteenPToSixFortyFiveP: 'SixFifteenPToSixFortyFiveP'
  SixThirtyPToSevenP: 'SixThirtyPToSevenP'
  SixFortyFivePToSevenFifteenP: 'SixFortyFivePToSevenFifteenP'
  SevenPToSevenThirtyP: 'SevenPToSevenThirtyP'
  SevenFifteenPToSevenFortyFiveP: 'SevenFifteenPToSevenFortyFiveP'
  SevenThirtyPToEightP: 'SevenThirtyPToEightP'
  SevenFortyFivePToEightFifteenP: 'SevenFortyFivePToEightFifteenP'
  EightPToEightThirtyP: 'EightPToEightThirtyP'
  EightFifteenPToEightFortyFiveP: 'EightFifteenPToEightFortyFiveP'
  EightThirtyPToNineP: 'EightThirtyPToNineP'
  EightFortyFivePToNineFifteenP: 'EightFortyFivePToNineFifteenP'
  NinePToNineThirtyP: 'NinePToNineThirtyP'
  NineFifteenPToNineFortyFiveP: 'NineFifteenPToNineFortyFiveP'
  NineThirtyPToTenP: 'NineThirtyPToTenP'
  NineFortyFivePToTenFifteenP: 'NineFortyFivePToTenFifteenP'
  TenPToTenThirtyP: 'TenPToTenThirtyP'
  TenFifteenPToTenFortyFiveP: 'TenFifteenPToTenFortyFiveP'
  TenThirtyPToElevenP: 'TenThirtyPToElevenP'
  TenFortyFivePToElevenFifteenP: 'TenFortyFivePToElevenFifteenP'
  ElevenPToElevenThirtyP: 'ElevenPToElevenThirtyP'
  ElevenFifteenPToElevenFortyFiveP: 'ElevenFifteenPToElevenFortyFiveP'
  ElevenThirtyPToTwelveA: 'ElevenThirtyPToTwelveA'
  ElevenFortyFivePToTwelveFifteenA: 'ElevenFortyFivePToTwelveFifteenA'
} = {
  ASAP: 'ASAP',
  TwelveAToTwelveThirtyA: 'TwelveAToTwelveThirtyA',
  TwelveFifteenAToTwelveFortyFiveA: 'TwelveFifteenAToTwelveFortyFiveA',
  TwelveThirtyAToOneA: 'TwelveThirtyAToOneA',
  TwelveFortyFiveAToOneFifteenA: 'TwelveFortyFiveAToOneFifteenA',
  OneAToOneThirtyA: 'OneAToOneThirtyA',
  OneFifteenAToOneFortyFiveA: 'OneFifteenAToOneFortyFiveA',
  OneThirtyAToTwoA: 'OneThirtyAToTwoA',
  OneFortyFiveAToTwoFifteenA: 'OneFortyFiveAToTwoFifteenA',
  TwoAToTwoThirtyA: 'TwoAToTwoThirtyA',
  TwoFifteenAToTwoFortyFiveA: 'TwoFifteenAToTwoFortyFiveA',
  TwoThirtyAToThreeA: 'TwoThirtyAToThreeA',
  TwoFortyFiveAToThreeFifteenA: 'TwoFortyFiveAToThreeFifteenA',
  ThreeAToThreeThirtyA: 'ThreeAToThreeThirtyA',
  ThreeFifteenAToThreeFortyFiveA: 'ThreeFifteenAToThreeFortyFiveA',
  ThreeThirtyAToFourA: 'ThreeThirtyAToFourA',
  ThreeFortyFiveAToFourFifteenA: 'ThreeFortyFiveAToFourFifteenA',
  FourAToFourThirtyA: 'FourAToFourThirtyA',
  FourFifteenAToFourFortyFiveA: 'FourFifteenAToFourFortyFiveA',
  FourThirtyAToFiveA: 'FourThirtyAToFiveA',
  FourFortyFiveAToFiveFifteenA: 'FourFortyFiveAToFiveFifteenA',
  FiveAToFiveThirtyA: 'FiveAToFiveThirtyA',
  FiveFifteenAToFiveFortyFiveA: 'FiveFifteenAToFiveFortyFiveA',
  FiveThirtyAToSixA: 'FiveThirtyAToSixA',
  FiveFortyFiveAToSixFifteenA: 'FiveFortyFiveAToSixFifteenA',
  SixAToSixThirtyA: 'SixAToSixThirtyA',
  SixFifteenAToSixFortyFiveA: 'SixFifteenAToSixFortyFiveA',
  SixThirtyAToSevenA: 'SixThirtyAToSevenA',
  SixFortyFiveAToSevenFifteenA: 'SixFortyFiveAToSevenFifteenA',
  SevenAToSevenThirtyA: 'SevenAToSevenThirtyA',
  SevenFifteenAToSevenFortyFiveA: 'SevenFifteenAToSevenFortyFiveA',
  SevenThirtyAToEightA: 'SevenThirtyAToEightA',
  SevenFortyFiveAToEightFifteenA: 'SevenFortyFiveAToEightFifteenA',
  EightAToEightThirtyA: 'EightAToEightThirtyA',
  EightFifteenAToEightFortyFiveA: 'EightFifteenAToEightFortyFiveA',
  EightThirtyAToNineA: 'EightThirtyAToNineA',
  EightFortyFiveAToNineFifteenA: 'EightFortyFiveAToNineFifteenA',
  NineAToNineThirtyA: 'NineAToNineThirtyA',
  NineFifteenAToNineFortyFiveA: 'NineFifteenAToNineFortyFiveA',
  NineThirtyAToTenA: 'NineThirtyAToTenA',
  NineFortyFiveAToTenFifteenA: 'NineFortyFiveAToTenFifteenA',
  TenAToTenThirtyA: 'TenAToTenThirtyA',
  TenFifteenAToTenFortyFiveA: 'TenFifteenAToTenFortyFiveA',
  TenThirtyAToElevenA: 'TenThirtyAToElevenA',
  TenFortyFiveAToElevenFifteenA: 'TenFortyFiveAToElevenFifteenA',
  ElevenAToElevenThirtyA: 'ElevenAToElevenThirtyA',
  ElevenFifteenAToElevenFortyFiveA: 'ElevenFifteenAToElevenFortyFiveA',
  ElevenThirtyAToTwelveP: 'ElevenThirtyAToTwelveP',
  ElevenFortyFiveAToTwelveFifteenP: 'ElevenFortyFiveAToTwelveFifteenP',
  TwelvePToTwelveThirtyP: 'TwelvePToTwelveThirtyP',
  TwelveFifteenPToTwelveFortyFiveP: 'TwelveFifteenPToTwelveFortyFiveP',
  TwelveThirtyPToOneP: 'TwelveThirtyPToOneP',
  TwelveFortyFivePToOneFifteenP: 'TwelveFortyFivePToOneFifteenP',
  OnePToOneThirtyP: 'OnePToOneThirtyP',
  OneFifteenPToOneFortyFiveP: 'OneFifteenPToOneFortyFiveP',
  OneThirtyPToTwoP: 'OneThirtyPToTwoP',
  OneFortyFivePToTwoFifteenP: 'OneFortyFivePToTwoFifteenP',
  TwoPToTwoThirtyP: 'TwoPToTwoThirtyP',
  TwoFifteenPToTwoFortyFiveP: 'TwoFifteenPToTwoFortyFiveP',
  TwoThirtyPToThreeP: 'TwoThirtyPToThreeP',
  TwoFortyFivePToThreeFifteenP: 'TwoFortyFivePToThreeFifteenP',
  ThreePToThreeThirtyP: 'ThreePToThreeThirtyP',
  ThreeFifteenPToThreeFortyFiveP: 'ThreeFifteenPToThreeFortyFiveP',
  ThreeThirtyPToFourP: 'ThreeThirtyPToFourP',
  ThreeFortyFivePToFourFifteenP: 'ThreeFortyFivePToFourFifteenP',
  FourPToFourThirtyP: 'FourPToFourThirtyP',
  FourFifteenPToFourFortyFiveP: 'FourFifteenPToFourFortyFiveP',
  FourThirtyPToFiveP: 'FourThirtyPToFiveP',
  FourFortyFivePToFiveFifteenP: 'FourFortyFivePToFiveFifteenP',
  FivePToFiveThirtyP: 'FivePToFiveThirtyP',
  FiveFifteenPToFiveFortyFiveP: 'FiveFifteenPToFiveFortyFiveP',
  FiveThirtyPToSixP: 'FiveThirtyPToSixP',
  FiveFortyFivePToSixFifteenP: 'FiveFortyFivePToSixFifteenP',
  SixPToSixThirtyP: 'SixPToSixThirtyP',
  SixFifteenPToSixFortyFiveP: 'SixFifteenPToSixFortyFiveP',
  SixThirtyPToSevenP: 'SixThirtyPToSevenP',
  SixFortyFivePToSevenFifteenP: 'SixFortyFivePToSevenFifteenP',
  SevenPToSevenThirtyP: 'SevenPToSevenThirtyP',
  SevenFifteenPToSevenFortyFiveP: 'SevenFifteenPToSevenFortyFiveP',
  SevenThirtyPToEightP: 'SevenThirtyPToEightP',
  SevenFortyFivePToEightFifteenP: 'SevenFortyFivePToEightFifteenP',
  EightPToEightThirtyP: 'EightPToEightThirtyP',
  EightFifteenPToEightFortyFiveP: 'EightFifteenPToEightFortyFiveP',
  EightThirtyPToNineP: 'EightThirtyPToNineP',
  EightFortyFivePToNineFifteenP: 'EightFortyFivePToNineFifteenP',
  NinePToNineThirtyP: 'NinePToNineThirtyP',
  NineFifteenPToNineFortyFiveP: 'NineFifteenPToNineFortyFiveP',
  NineThirtyPToTenP: 'NineThirtyPToTenP',
  NineFortyFivePToTenFifteenP: 'NineFortyFivePToTenFifteenP',
  TenPToTenThirtyP: 'TenPToTenThirtyP',
  TenFifteenPToTenFortyFiveP: 'TenFifteenPToTenFortyFiveP',
  TenThirtyPToElevenP: 'TenThirtyPToElevenP',
  TenFortyFivePToElevenFifteenP: 'TenFortyFivePToElevenFifteenP',
  ElevenPToElevenThirtyP: 'ElevenPToElevenThirtyP',
  ElevenFifteenPToElevenFortyFiveP: 'ElevenFifteenPToElevenFortyFiveP',
  ElevenThirtyPToTwelveA: 'ElevenThirtyPToTwelveA',
  ElevenFortyFivePToTwelveFifteenA: 'ElevenFortyFivePToTwelveFifteenA',
}

export const DEFAULT_SERVICE_TIME = 'ASAP';

export type ServiceType = 'Pickup' | 'Delivery';

export const ServiceTypes: {
  Pickup: 'Pickup',
  Delivery: 'Delivery',
} = {
  Pickup: 'Pickup',
  Delivery: 'Delivery',
}

export const DEFAULT_SERVICE_TYPE = ServiceTypes.Delivery;

export interface EOrder {
  readonly cartUpdatedDate: number
  readonly consumer: IOrderConsumer
  readonly costs: ICost
  readonly createdDate: number
  // either the destination of the delivery or the pick up location
  readonly location: ELocation
  readonly serviceDate: string
  readonly serviceInstructions: string
  readonly serviceTime: ServiceTime
  readonly serviceType: ServiceType
  readonly rest: IOrderRest
  readonly stripePaymentId: string | null
}

export interface IOrder extends Omit<EOrder, 'location' | 'createdDate'> {
  readonly location: ILocation
  readonly _id: string
}

export class Order {
  // todo pivot maybe implement this
  static addTypenames(order: IOrder) {
    // //@ts-ignore
    // order.destination.address.__typename = 'Address';
    // //@ts-ignore
    // order.destination.__typename = 'Destination';
    // order.deliveries.forEach(d => {
    //   //@ts-ignore
    //   d.__typename = 'Delivery';
    //   d.meals.forEach(m => {
    //     //@ts-ignore
    //     m.__typename = 'DeliveryMeal';
    //     m.tags.forEach(t => {
    //       //@ts-ignore
    //       t.__typename = 'Tag'
    //     })
    //     //@ts-ignore
    //     m.hours.__typename = 'Hours';
    //     m.hours.M.forEach(h => {
    //       // @ts-ignore
    //       h.__typename = 'DayHours';
    //     });
    //     m.hours.T.forEach(h => {
    //       // @ts-ignore
    //       h.__typename = 'DayHours';
    //     });
    //     m.hours.W.forEach(h => {
    //       // @ts-ignore
    //       h.__typename = 'DayHours';
    //     });
    //     m.hours.Th.forEach(h => {
    //       // @ts-ignore
    //       h.__typename = 'DayHours';
    //     });
    //     m.hours.F.forEach(h => {
    //       // @ts-ignore
    //       h.__typename = 'DayHours';
    //     });
    //     m.hours.Sa.forEach(h => {
    //       // @ts-ignore
    //       h.__typename = 'DayHours';
    //     });
    //     m.hours.Su.forEach(h => {
    //       // @ts-ignore
    //       h.__typename = 'DayHours';
    //     });
    //   });
    // });
    // // @ts-ignore
    // order.costs.__typename = 'Costs';
    // order.costs.mealPrices.forEach(mp => {
    //   //@ts-ignore
    //   mp.__typename = 'MealPrice';
    // });
    // order.costs.discounts.forEach(d => {
    //   //@ts-ignore
    //   d.__typename = 'Discount';
    // });
    // order.costs.promos.forEach(p => {
    //   //@ts-ignore
    //   p.__typename = 'Promo';
    // });
    // //@ts-ignore
    // order.__typename = 'Order';
    return order;
  }

  static getICopy(order: IOrder): IOrder {
    return {
      costs: Cost.getICopy(order.costs),
      consumer: OrderConsumer.getICopy(order.consumer),
      cartUpdatedDate: order.cartUpdatedDate,
      location: order.location && Location.getICopy(order.location),
      _id: order._id,
      serviceDate: order.serviceDate,
      serviceInstructions: order.serviceInstructions,
      serviceTime: order.serviceTime,
      serviceType: order.serviceType,
      rest: order.rest,
      stripePaymentId: order.stripePaymentId,
    }
  }

  static getEOrder(
    signedInUser: NonNullable<SignedInUser>,
    searchArea: ELocation,
    cart: ICartInput,
    rest: Pick<ERest, 'stripeRestId' | 'location'>,
    stripePaymentId: string,
  ): EOrder {
    const date = Date.now();
    return {
      cartUpdatedDate: date,
      consumer: OrderConsumer.getIOrderConsumer(signedInUser, cart),
      costs: Cost.getICost(cart.cartOrder.rest),
      createdDate: date,
      location: cart.cartOrder.serviceType === ServiceTypes.Pickup ?
        rest.location
      :
        searchArea,
      serviceDate: cart.cartOrder.serviceDate,
      serviceInstructions: cart.cartOrder.serviceInstructions,
      serviceTime: cart.cartOrder.serviceTime,
      serviceType: cart.cartOrder.serviceType,
      rest: OrderRest.getIOrderRest(cart.cartOrder.rest),
      stripePaymentId,
    }
  }

  static getIOrderFromEOrder(_id: string, order: EOrder): IOrder {
    return Order.getICopy({
      ...order,
      _id,
    })
  }

  static getServiceDateStr(d: Date): string {
    return d.toLocaleDateString('en-US', {
      // weekday: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
  }

  static getServiceTime(d: Date): ServiceTime {
    const m = d.getMinutes();
    let err;
    const errStr = `No valid service time for ${d.toLocaleTimeString()}`;
    switch (d.getHours()) {
      case 0:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.TwelveAToTwelveThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.TwelveAToTwelveThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.TwelveAToTwelveThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.TwelveFifteenAToTwelveFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.TwelveFifteenAToTwelveFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.TwelveFifteenAToTwelveFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.TwelveThirtyAToOneA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.TwelveThirtyAToOneA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.TwelveThirtyAToOneA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.TwelveFortyFiveAToOneFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.TwelveFortyFiveAToOneFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.TwelveFortyFiveAToOneFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 1:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.OneAToOneThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.OneAToOneThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.OneAToOneThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.OneFifteenAToOneFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.OneFifteenAToOneFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.OneFifteenAToOneFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.OneThirtyAToTwoA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.OneThirtyAToTwoA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.OneThirtyAToTwoA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.OneFortyFiveAToTwoFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.OneFortyFiveAToTwoFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.OneFortyFiveAToTwoFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 2:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.TwoAToTwoThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.TwoAToTwoThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.TwoAToTwoThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.TwoFifteenAToTwoFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.TwoFifteenAToTwoFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.TwoFifteenAToTwoFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.TwoThirtyAToThreeA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.TwoThirtyAToThreeA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.TwoThirtyAToThreeA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.TwoFortyFiveAToThreeFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.TwoFortyFiveAToThreeFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.TwoFortyFiveAToThreeFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 3:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.ThreeAToThreeThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.ThreeAToThreeThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.ThreeAToThreeThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.ThreeFifteenAToThreeFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.ThreeFifteenAToThreeFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.ThreeFifteenAToThreeFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.ThreeThirtyAToFourA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.ThreeThirtyAToFourA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.ThreeThirtyAToFourA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.ThreeFortyFiveAToFourFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.ThreeFortyFiveAToFourFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.ThreeFortyFiveAToFourFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 4:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.FourAToFourThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.FourAToFourThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.FourAToFourThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.FourFifteenAToFourFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.FourFifteenAToFourFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.FourFifteenAToFourFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.FourThirtyAToFiveA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.FourThirtyAToFiveA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.FourThirtyAToFiveA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.FourFortyFiveAToFiveFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.FourFortyFiveAToFiveFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.FourFortyFiveAToFiveFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 5:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.FiveAToFiveThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.FiveAToFiveThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.FiveAToFiveThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.FiveFifteenAToFiveFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.FiveFifteenAToFiveFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.FiveFifteenAToFiveFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.FiveThirtyAToSixA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.FiveThirtyAToSixA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.FiveThirtyAToSixA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.FiveFortyFiveAToSixFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.FiveFortyFiveAToSixFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.FiveFortyFiveAToSixFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 6:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.SixAToSixThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.SixAToSixThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.SixAToSixThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.SixFifteenAToSixFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.SixFifteenAToSixFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.SixFifteenAToSixFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.SixThirtyAToSevenA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.SixThirtyAToSevenA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.SixThirtyAToSevenA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.SixFortyFiveAToSevenFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.SixFortyFiveAToSevenFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.SixFortyFiveAToSevenFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 7:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.SevenAToSevenThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.SevenAToSevenThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.SevenAToSevenThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.SevenFifteenAToSevenFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.SevenFifteenAToSevenFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.SevenFifteenAToSevenFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.SevenThirtyAToEightA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.SevenThirtyAToEightA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.SevenThirtyAToEightA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.SevenFortyFiveAToEightFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.SevenFortyFiveAToEightFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.SevenFortyFiveAToEightFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 8:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.EightAToEightThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.EightAToEightThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.EightAToEightThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.EightFifteenAToEightFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.EightFifteenAToEightFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.EightFifteenAToEightFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.EightThirtyAToNineA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.EightThirtyAToNineA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.EightThirtyAToNineA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.EightFortyFiveAToNineFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.EightFortyFiveAToNineFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.EightFortyFiveAToNineFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 9:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.NineAToNineThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.NineAToNineThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.NineAToNineThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.NineFifteenAToNineFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.NineFifteenAToNineFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.NineFifteenAToNineFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.NineThirtyAToTenA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.NineThirtyAToTenA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.NineThirtyAToTenA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.NineFortyFiveAToTenFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.NineFortyFiveAToTenFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.NineFortyFiveAToTenFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 10:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.TenAToTenThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.TenAToTenThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.TenAToTenThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.TenFifteenAToTenFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.TenFifteenAToTenFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.TenFifteenAToTenFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.TenThirtyAToElevenA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.TenThirtyAToElevenA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.TenThirtyAToElevenA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.TenFortyFiveAToElevenFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.TenFortyFiveAToElevenFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.TenFortyFiveAToElevenFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 11:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.ElevenAToElevenThirtyA;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.ElevenAToElevenThirtyA;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.ElevenAToElevenThirtyA;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.ElevenFifteenAToElevenFortyFiveA;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.ElevenFifteenAToElevenFortyFiveA;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.ElevenFifteenAToElevenFortyFiveA;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.ElevenThirtyAToTwelveP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.ElevenThirtyAToTwelveP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.ElevenThirtyAToTwelveP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.ElevenFortyFiveAToTwelveFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.ElevenFortyFiveAToTwelveFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.ElevenFortyFiveAToTwelveFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 12:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.TwelvePToTwelveThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.TwelvePToTwelveThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.TwelvePToTwelveThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.TwelveFifteenPToTwelveFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.TwelveFifteenPToTwelveFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.TwelveFifteenPToTwelveFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.TwelveThirtyPToOneP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.TwelveThirtyPToOneP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.TwelveThirtyPToOneP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.TwelveFortyFivePToOneFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.TwelveFortyFivePToOneFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.TwelveFortyFivePToOneFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 13:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.OnePToOneThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.OnePToOneThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.OnePToOneThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.OneFifteenPToOneFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.OneFifteenPToOneFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.OneFifteenPToOneFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.OneThirtyPToTwoP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.OneThirtyPToTwoP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.OneThirtyPToTwoP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.OneFortyFivePToTwoFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.OneFortyFivePToTwoFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.OneFortyFivePToTwoFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 14:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.TwoPToTwoThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.TwoPToTwoThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.TwoPToTwoThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.TwoFifteenPToTwoFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.TwoFifteenPToTwoFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.TwoFifteenPToTwoFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.TwoThirtyPToThreeP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.TwoThirtyPToThreeP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.TwoThirtyPToThreeP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.TwoFortyFivePToThreeFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.TwoFortyFivePToThreeFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.TwoFortyFivePToThreeFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 15:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.ThreePToThreeThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.ThreePToThreeThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.ThreePToThreeThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.ThreeFifteenPToThreeFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.ThreeFifteenPToThreeFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.ThreeFifteenPToThreeFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.ThreeThirtyPToFourP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.ThreeThirtyPToFourP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.ThreeThirtyPToFourP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.ThreeFortyFivePToFourFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.ThreeFortyFivePToFourFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.ThreeFortyFivePToFourFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 16:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.FourPToFourThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.FourPToFourThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.FourPToFourThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.FourFifteenPToFourFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.FourFifteenPToFourFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.FourFifteenPToFourFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.FourThirtyPToFiveP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.FourThirtyPToFiveP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.FourThirtyPToFiveP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.FourFortyFivePToFiveFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.FourFortyFivePToFiveFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.FourFortyFivePToFiveFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 17:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.FivePToFiveThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.FivePToFiveThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.FivePToFiveThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.FiveFifteenPToFiveFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.FiveFifteenPToFiveFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.FiveFifteenPToFiveFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.FiveThirtyPToSixP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.FiveThirtyPToSixP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.FiveThirtyPToSixP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.FiveFortyFivePToSixFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.FiveFortyFivePToSixFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.FiveFortyFivePToSixFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 18:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.SixPToSixThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.SixPToSixThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.SixPToSixThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.SixFifteenPToSixFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.SixFifteenPToSixFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.SixFifteenPToSixFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.SixThirtyPToSevenP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.SixThirtyPToSevenP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.SixThirtyPToSevenP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.SixFortyFivePToSevenFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.SixFortyFivePToSevenFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.SixFortyFivePToSevenFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 19:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.SevenPToSevenThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.SevenPToSevenThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.SevenPToSevenThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.SevenFifteenPToSevenFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.SevenFifteenPToSevenFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.SevenFifteenPToSevenFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.SevenThirtyPToEightP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.SevenThirtyPToEightP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.SevenThirtyPToEightP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.SevenFortyFivePToEightFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.SevenFortyFivePToEightFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.SevenFortyFivePToEightFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 20:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.EightPToEightThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.EightPToEightThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.EightPToEightThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.EightFifteenPToEightFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.EightFifteenPToEightFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.EightFifteenPToEightFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.EightThirtyPToNineP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.EightThirtyPToNineP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.EightThirtyPToNineP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.EightFortyFivePToNineFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.EightFortyFivePToNineFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.EightFortyFivePToNineFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 21:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.NinePToNineThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.NinePToNineThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.NinePToNineThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.NineFifteenPToNineFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.NineFifteenPToNineFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.NineFifteenPToNineFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.NineThirtyPToTenP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.NineThirtyPToTenP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.NineThirtyPToTenP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.NineFortyFivePToTenFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.NineFortyFivePToTenFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.NineFortyFivePToTenFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 22:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.TenPToTenThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.TenPToTenThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.TenPToTenThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.TenFifteenPToTenFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.TenFifteenPToTenFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.TenFifteenPToTenFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.TenThirtyPToElevenP;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.TenThirtyPToElevenP;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.TenThirtyPToElevenP;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.TenFortyFivePToElevenFifteenP;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.TenFortyFivePToElevenFifteenP;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.TenFortyFivePToElevenFifteenP;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      case 23:
        if (m >= 0 && m <= 4) {
          return ServiceTimes.ElevenPToElevenThirtyP;
        } else if (m >= 5 && m <= 9) {
          return ServiceTimes.ElevenPToElevenThirtyP;
        } else if (m >= 10 && m <= 14) {
          return ServiceTimes.ElevenPToElevenThirtyP;
        } else if (m >= 15 && m <= 19) {
          return ServiceTimes.ElevenFifteenPToElevenFortyFiveP;
        } else if (m >= 20 && m <= 24) {
          return ServiceTimes.ElevenFifteenPToElevenFortyFiveP;
        } else if (m >= 25 && m <= 29) {
          return ServiceTimes.ElevenFifteenPToElevenFortyFiveP;
        } else if (m >= 30 && m <= 34) {
          return ServiceTimes.ElevenThirtyPToTwelveA;
        } else if (m >= 35 && m <= 39) {
          return ServiceTimes.ElevenThirtyPToTwelveA;
        } else if (m >= 40 && m <= 44) {
          return ServiceTimes.ElevenThirtyPToTwelveA;
        } else if (m >= 45 && m <= 50) {
          return ServiceTimes.ElevenFortyFivePToTwelveFifteenA;
        } else if (m >= 50 && m <= 54) {
          return ServiceTimes.ElevenFortyFivePToTwelveFifteenA;
        } else if (m >= 55 && m <= 59) {
          return ServiceTimes.ElevenFortyFivePToTwelveFifteenA;
        }
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
      default:
        err = new Error(errStr);
        console.error(err.stack);
        throw err;
    }
  }

  static getServiceTimeStr(t: ServiceTime): string {
    switch(t) {
      case ServiceTimes.ASAP: return 'ASAP'
      case ServiceTimes.TwelveAToTwelveThirtyA: return '12:00a - 12:30a'
      case ServiceTimes.TwelveFifteenAToTwelveFortyFiveA: return '12:15a - 12:45a'
      case ServiceTimes.TwelveThirtyAToOneA: return '12:30a - 1:30a'
      case ServiceTimes.TwelveFortyFiveAToOneFifteenA: return '12:45a - 1:15a'
      case ServiceTimes.OneAToOneThirtyA: return '1:00a - 1:30a'
      case ServiceTimes.OneFifteenAToOneFortyFiveA: return '1:15a - 1:45a'
      case ServiceTimes.OneThirtyAToTwoA: return '1:30a - 2:00a'
      case ServiceTimes.OneFortyFiveAToTwoFifteenA: return '1:45a - 2:15a'
      case ServiceTimes.TwoAToTwoThirtyA: return '2:00a - 2:30a'
      case ServiceTimes.TwoFifteenAToTwoFortyFiveA: return '2:15a - 2:45a'
      case ServiceTimes.TwoThirtyAToThreeA: return '2:30a - 3:00a'
      case ServiceTimes.TwoFortyFiveAToThreeFifteenA: return '2:45a - 3:15a'
      case ServiceTimes.ThreeAToThreeThirtyA: return '3:00a - 3:30a'
      case ServiceTimes.ThreeFifteenAToThreeFortyFiveA: return '3:15a - 3:45a'
      case ServiceTimes.ThreeThirtyAToFourA: return '3:30a - 4:00a'
      case ServiceTimes.ThreeFortyFiveAToFourFifteenA: return '3:45a - 4:15a'
      case ServiceTimes.FourAToFourThirtyA: return '4:00a - 4:30a'
      case ServiceTimes.FourFifteenAToFourFortyFiveA: return '4:15a - 4:45a'
      case ServiceTimes.FourThirtyAToFiveA: return '4:30a - 5:00a'
      case ServiceTimes.FourFortyFiveAToFiveFifteenA: return '4:45a - 5:15a'
      case ServiceTimes.FiveAToFiveThirtyA: return '5:00a - 5:30a'
      case ServiceTimes.FiveFifteenAToFiveFortyFiveA: return '5:15a - 5:45a'
      case ServiceTimes.FiveThirtyAToSixA: return '5:30a - 6:00a'
      case ServiceTimes.FiveFortyFiveAToSixFifteenA: return '5:45a - 6:15a'
      case ServiceTimes.SixAToSixThirtyA: return '6:00a - 6:30a'
      case ServiceTimes.SixFifteenAToSixFortyFiveA: return '6:15a - 6:45a'
      case ServiceTimes.SixThirtyAToSevenA: return '6:30a - 7:00a'
      case ServiceTimes.SixFortyFiveAToSevenFifteenA: return '6:45a - 7:15a'
      case ServiceTimes.SevenAToSevenThirtyA: return '7:00a - 7:30a'
      case ServiceTimes.SevenFifteenAToSevenFortyFiveA: return '7:15a - 7:45a'
      case ServiceTimes.SevenThirtyAToEightA: return '7:30a - 8:00a'
      case ServiceTimes.SevenFortyFiveAToEightFifteenA: return '7:45a - 8:15a'
      case ServiceTimes.EightAToEightThirtyA: return '8:00a - 8:30a'
      case ServiceTimes.EightFifteenAToEightFortyFiveA: return '8:15a - 8:45'
      case ServiceTimes.EightThirtyAToNineA: return '8:30a - 9:00a'
      case ServiceTimes.EightFortyFiveAToNineFifteenA: return '8:45a - 9:15a'
      case ServiceTimes.NineAToNineThirtyA: return '9:00a - 9:30a'
      case ServiceTimes.NineFifteenAToNineFortyFiveA: return '9:15a - 9:45a'
      case ServiceTimes.NineThirtyAToTenA: return '9:30a - 10:00a'
      case ServiceTimes.NineFortyFiveAToTenFifteenA: return '9:45a - 10:15a'
      case ServiceTimes.TenAToTenThirtyA: return '10:00a - 10:30a'
      case ServiceTimes.TenFifteenAToTenFortyFiveA: return '10:15a - 10:45a'
      case ServiceTimes.TenThirtyAToElevenA: return '10:30a - 11:00a'
      case ServiceTimes.TenFortyFiveAToElevenFifteenA: return '10:45a - 11:15a'
      case ServiceTimes.ElevenAToElevenThirtyA: return '11:00a - 11:30a'
      case ServiceTimes.ElevenFifteenAToElevenFortyFiveA: return '11:15a - 11:45a'
      case ServiceTimes.ElevenThirtyAToTwelveP: return '11:30a - 12:00p'
      case ServiceTimes.ElevenFortyFiveAToTwelveFifteenP: return '11:45a - 12:15p'
      case ServiceTimes.TwelvePToTwelveThirtyP: return '12:00p - 12:30p'
      case ServiceTimes.TwelveFifteenPToTwelveFortyFiveP: return '12:15p - 12:45p'
      case ServiceTimes.TwelveThirtyPToOneP: return '12:30p - 1:00p'
      case ServiceTimes.TwelveFortyFivePToOneFifteenP: return '12:45p - 1:15p'
      case ServiceTimes.OnePToOneThirtyP: return '1:00p - 1:30p'
      case ServiceTimes.OneFifteenPToOneFortyFiveP: return '1:15p - 1:45p'
      case ServiceTimes.OneThirtyPToTwoP: return '1:30p - 2:00p'
      case ServiceTimes.OneFortyFivePToTwoFifteenP: return '1:45p - 2:15p'
      case ServiceTimes.TwoPToTwoThirtyP: return '2:00p - 2:30p'
      case ServiceTimes.TwoFifteenPToTwoFortyFiveP: return '2:15p - 2:45p'
      case ServiceTimes.TwoThirtyPToThreeP: return '2:30p - 3:00p'
      case ServiceTimes.TwoFortyFivePToThreeFifteenP: return '2:45p - 3:15p'
      case ServiceTimes.ThreePToThreeThirtyP: return '3:00p - 3:30p'
      case ServiceTimes.ThreeFifteenPToThreeFortyFiveP: return '3:15p - 3:45p'
      case ServiceTimes.ThreeThirtyPToFourP: return '3:30p - 4:00p'
      case ServiceTimes.ThreeFortyFivePToFourFifteenP: return '3:45p - 4:15p'
      case ServiceTimes.FourPToFourThirtyP: return '4:00p - 4:30p'
      case ServiceTimes.FourFifteenPToFourFortyFiveP: return '4:15p - 4:45p'
      case ServiceTimes.FourThirtyPToFiveP: return '4:30p - 5:00p'
      case ServiceTimes.FourFortyFivePToFiveFifteenP: return '4:45p - 5:15p'
      case ServiceTimes.FivePToFiveThirtyP: return '5:00p - 5:30p'
      case ServiceTimes.FiveFifteenPToFiveFortyFiveP: return '5:15p - 5:45p'
      case ServiceTimes.FiveThirtyPToSixP: return '5:30p - 6:00p'
      case ServiceTimes.FiveFortyFivePToSixFifteenP: return '5:45p - 6:15p'
      case ServiceTimes.SixPToSixThirtyP: return '6:00p - 6:30p'
      case ServiceTimes.SixFifteenPToSixFortyFiveP: return '6:15p - 6:45p'
      case ServiceTimes.SixThirtyPToSevenP: return '6:30p - 7:00p'
      case ServiceTimes.SixFortyFivePToSevenFifteenP: return '6:45p - 7:15p'
      case ServiceTimes.SevenPToSevenThirtyP: return '7:00p - 7:30p'
      case ServiceTimes.SevenFifteenPToSevenFortyFiveP: return '7:15p - 7:45p'
      case ServiceTimes.SevenThirtyPToEightP: return '7:30p - 8:00p'
      case ServiceTimes.SevenFortyFivePToEightFifteenP: return '7:45p - 8:15p'
      case ServiceTimes.EightPToEightThirtyP: return '8:00p - 8:30p'
      case ServiceTimes.EightFifteenPToEightFortyFiveP: return '8:15p - 8:45p'
      case ServiceTimes.EightThirtyPToNineP: return '8:30p - 9:00p'
      case ServiceTimes.EightFortyFivePToNineFifteenP: return '8:45p - 9:15p'
      case ServiceTimes.NinePToNineThirtyP: return '9:00p - 9:30p'
      case ServiceTimes.NineFifteenPToNineFortyFiveP: return '9:15p - 9:45p'
      case ServiceTimes.NineThirtyPToTenP: return '9:30p - 10:00p'
      case ServiceTimes.NineFortyFivePToTenFifteenP: return  '9:45p - 10:15p'
      case ServiceTimes.TenPToTenThirtyP: return '10:00p - 10:30p'
      case ServiceTimes.TenFifteenPToTenFortyFiveP: return '10:15p - 10:45p'
      case ServiceTimes.TenThirtyPToElevenP: return '10:30p - 11:00p'
      case ServiceTimes.TenFortyFivePToElevenFifteenP: return '10:45p - 11:15p'
      case ServiceTimes.ElevenPToElevenThirtyP: return '11:00p - 11:30p'
      case ServiceTimes.ElevenFifteenPToElevenFortyFiveP: return '11:15p - 11:45p'
      case ServiceTimes.ElevenThirtyPToTwelveA: return '11:30p - 12:00p'
      case ServiceTimes.ElevenFortyFivePToTwelveFifteenA: return '11:45p - 12:15p'
      default:
        const err = new Error(`Unsupported ServiceTime ${t}`);
        console.error(err.stack);
        throw err;
    } 
  };

  static get24HourStr(t: ServiceTime): {
    from: string
    to: string
  } {
    switch(t) {
      case ServiceTimes.ASAP:
        const str = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return {
          from: str,
          to: str,
        }
      case ServiceTimes.TwelveAToTwelveThirtyA: return { from: '00:00', to: '00:30' }
      case ServiceTimes.TwelveFifteenAToTwelveFortyFiveA: return { from: '00:15', to: '00:45' }
      case ServiceTimes.TwelveThirtyAToOneA: return { from: '00:30', to: '01:30' }
      case ServiceTimes.TwelveFortyFiveAToOneFifteenA: return { from: '00:45', to: '01:15' }
      case ServiceTimes.OneAToOneThirtyA: return  { from: '01:00', to: '01:30' }
      case ServiceTimes.OneFifteenAToOneFortyFiveA: return { from: '01:15', to: '01:45' }
      case ServiceTimes.OneThirtyAToTwoA: return { from: '01:30', to: '02:00' }
      case ServiceTimes.OneFortyFiveAToTwoFifteenA: return { from: '01:45', to: '02:15' }
      case ServiceTimes.TwoAToTwoThirtyA: return { from: '02:00', to: '02:30' }
      case ServiceTimes.TwoFifteenAToTwoFortyFiveA: return { from: '02:15', to: '02:45' }
      case ServiceTimes.TwoThirtyAToThreeA: return { from: '02:30', to: '03:00' }
      case ServiceTimes.TwoFortyFiveAToThreeFifteenA: return { from: '02:45', to: '03:15' }
      case ServiceTimes.ThreeAToThreeThirtyA: return { from: '03:00', to: '03:30' }
      case ServiceTimes.ThreeFifteenAToThreeFortyFiveA: return { from: '03:15', to: '03:45' }
      case ServiceTimes.ThreeThirtyAToFourA: return { from: '03:30', to: '04:00' }
      case ServiceTimes.ThreeFortyFiveAToFourFifteenA: return { from: '03:45', to: '04:15' }
      case ServiceTimes.FourAToFourThirtyA: return { from: '04:00', to: '04:30' }
      case ServiceTimes.FourFifteenAToFourFortyFiveA: return { from: '04:15', to: '04:45' }
      case ServiceTimes.FourThirtyAToFiveA: return { from: '04:30', to: '05:00' }
      case ServiceTimes.FourFortyFiveAToFiveFifteenA: return { from: '04:45', to: '05:15' }
      case ServiceTimes.FiveAToFiveThirtyA: return { from: '05:00', to: '05:30' }
      case ServiceTimes.FiveFifteenAToFiveFortyFiveA: return { from: '05:15', to: '05:45' }
      case ServiceTimes.FiveThirtyAToSixA: return { from: '05:30', to: '06:00' }
      case ServiceTimes.FiveFortyFiveAToSixFifteenA: return { from: '05:45', to: '06:15' }
      case ServiceTimes.SixAToSixThirtyA: return { from: '06:00', to: '06:30' }
      case ServiceTimes.SixFifteenAToSixFortyFiveA: return { from: '06:15', to: '06:45' }
      case ServiceTimes.SixThirtyAToSevenA: return { from: '06:30', to: '07:00' }
      case ServiceTimes.SixFortyFiveAToSevenFifteenA: return { from: '06:45', to: '07:15' }
      case ServiceTimes.SevenAToSevenThirtyA: return { from: '07:00', to: '07:30' }
      case ServiceTimes.SevenFifteenAToSevenFortyFiveA: return { from: '07:15', to: '07:45' }
      case ServiceTimes.SevenThirtyAToEightA: return { from: '07:30', to: '08:00' }
      case ServiceTimes.SevenFortyFiveAToEightFifteenA: return { from: '07:45', to: '08:15' }
      case ServiceTimes.EightAToEightThirtyA: return { from: '08:00', to: '08:30' }
      case ServiceTimes.EightFifteenAToEightFortyFiveA: return { from: '08:15', to: '08:45' }
      case ServiceTimes.EightThirtyAToNineA: return { from: '08:30', to: '09:00' }
      case ServiceTimes.EightFortyFiveAToNineFifteenA: return { from: '08:45', to: '09:15' }
      case ServiceTimes.NineAToNineThirtyA: return { from: '09:00', to: '09:30' }
      case ServiceTimes.NineFifteenAToNineFortyFiveA: return { from: '09:15', to: '09:45' }
      case ServiceTimes.NineThirtyAToTenA: return { from: '09:30', to: '10:00' }
      case ServiceTimes.NineFortyFiveAToTenFifteenA: return { from: '09:45', to: '10:15' }
      case ServiceTimes.TenAToTenThirtyA: return { from: '10:00', to: '10:30' }
      case ServiceTimes.TenFifteenAToTenFortyFiveA: return { from: '10:15', to: '10:45' }
      case ServiceTimes.TenThirtyAToElevenA: return { from: '10:30', to: '11:00' }
      case ServiceTimes.TenFortyFiveAToElevenFifteenA: return { from: '10:45', to: '11:15' }
      case ServiceTimes.ElevenAToElevenThirtyA: return { from: '11:00', to: '11:30' }
      case ServiceTimes.ElevenFifteenAToElevenFortyFiveA: return { from: '11:15', to: '11:45' }
      case ServiceTimes.ElevenThirtyAToTwelveP: return { from: '11:30', to: '12:00' }
      case ServiceTimes.ElevenFortyFiveAToTwelveFifteenP: return { from: '11:45', to: '12:15' }
      case ServiceTimes.TwelvePToTwelveThirtyP: return { from: '12:00', to: '12:30' }
      case ServiceTimes.TwelveFifteenPToTwelveFortyFiveP: return { from: '12:15', to: '12:45' }
      case ServiceTimes.TwelveThirtyPToOneP: return { from: '12:30', to: '13:00' }
      case ServiceTimes.TwelveFortyFivePToOneFifteenP: return { from: '12:45', to: '13:15' }
      case ServiceTimes.OnePToOneThirtyP: return { from: '13:00', to: '13:30' }
      case ServiceTimes.OneFifteenPToOneFortyFiveP: return { from: '13:15', to: '13:45' }
      case ServiceTimes.OneThirtyPToTwoP: return { from: '13:30', to: '14:00' }
      case ServiceTimes.OneFortyFivePToTwoFifteenP: return { from: '13:45', to: '14:15' }
      case ServiceTimes.TwoPToTwoThirtyP: return { from: '14:00', to: '14:30' }
      case ServiceTimes.TwoFifteenPToTwoFortyFiveP: return { from: '14:15', to: '14:45' }
      case ServiceTimes.TwoThirtyPToThreeP: return { from: '14:30', to: '15:00' }
      case ServiceTimes.TwoFortyFivePToThreeFifteenP: return { from: '14:45', to: '15:15' }
      case ServiceTimes.ThreePToThreeThirtyP: return { from: '15:00', to: '15:30' }
      case ServiceTimes.ThreeFifteenPToThreeFortyFiveP: return { from: '15:15', to: '15:45' }
      case ServiceTimes.ThreeThirtyPToFourP: return { from: '15:30', to: '16:00' }
      case ServiceTimes.ThreeFortyFivePToFourFifteenP: return { from: '15:45', to: '16:15' }
      case ServiceTimes.FourPToFourThirtyP: return { from: '16:00', to: '16:30' }
      case ServiceTimes.FourFifteenPToFourFortyFiveP: return { from: '16:15', to: '16:45' }
      case ServiceTimes.FourThirtyPToFiveP: return { from: '16:30', to: '17:00' }
      case ServiceTimes.FourFortyFivePToFiveFifteenP: return  { from: '16:45', to: '17:15' }
      case ServiceTimes.FivePToFiveThirtyP: return { from: '17:00', to: '17:30' }
      case ServiceTimes.FiveFifteenPToFiveFortyFiveP: return { from: '17:15', to: '17:45' }
      case ServiceTimes.FiveThirtyPToSixP: return { from: '17:30', to: '18:00' }
      case ServiceTimes.FiveFortyFivePToSixFifteenP: return { from: '17:45', to: '18:15' }
      case ServiceTimes.SixPToSixThirtyP: return { from: '18:00', to: '18:30' }
      case ServiceTimes.SixFifteenPToSixFortyFiveP: return { from: '18:15', to: '18:45' }
      case ServiceTimes.SixThirtyPToSevenP: return { from: '18:30', to: '19:00' }
      case ServiceTimes.SixFortyFivePToSevenFifteenP: return { from: '18:45', to: '19:15' }
      case ServiceTimes.SevenPToSevenThirtyP: return { from: '19:00', to: '19:30' }
      case ServiceTimes.SevenFifteenPToSevenFortyFiveP: return { from: '19:15', to: '19:45' }
      case ServiceTimes.SevenThirtyPToEightP: return { from: '19:30', to: '20:00' }
      case ServiceTimes.SevenFortyFivePToEightFifteenP: return { from: '19:45', to: '20:15' }
      case ServiceTimes.EightPToEightThirtyP: return { from: '20:00', to: '20:30' }
      case ServiceTimes.EightFifteenPToEightFortyFiveP: return { from: '20:15', to: '20:45' }
      case ServiceTimes.EightThirtyPToNineP: return { from: '20:30', to: '21:00' }
      case ServiceTimes.EightFortyFivePToNineFifteenP: return { from: '20:45', to: '21:15' }
      case ServiceTimes.NinePToNineThirtyP: return { from: '21:00', to: '21:30' }
      case ServiceTimes.NineFifteenPToNineFortyFiveP: return { from: '21:15', to: '21:45' }
      case ServiceTimes.NineThirtyPToTenP: return { from: '21:30', to: '22:00' }
      case ServiceTimes.NineFortyFivePToTenFifteenP: return  { from: '21:45', to: '22:15' }
      case ServiceTimes.TenPToTenThirtyP: return { from: '22:00', to: '22:30' }
      case ServiceTimes.TenFifteenPToTenFortyFiveP: return { from: '22:15', to: '22:45' }
      case ServiceTimes.TenThirtyPToElevenP: return { from: '22:30', to: '23:00' }
      case ServiceTimes.TenFortyFivePToElevenFifteenP: return { from: '22:45', to: '23:15' }
      case ServiceTimes.ElevenPToElevenThirtyP: return { from: '23:00', to: '23:30' }
      case ServiceTimes.ElevenFifteenPToElevenFortyFiveP: return { from: '23:15', to: '23:45' }
      case ServiceTimes.ElevenThirtyPToTwelveA: return { from: '23:30', to: '00:00' }
      case ServiceTimes.ElevenFortyFivePToTwelveFifteenA: return { from: '23:45', to: '00:15' }
      default:
        const err = new Error(`Unsupported ServiceTime ${t}`);
        console.error(err.stack);
        throw err;
    } 
  }
}