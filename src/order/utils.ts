import { deliveryDay } from './../consumer/consumerModel';
import moment from 'moment';

export const getNextDeliveryDate = (day: deliveryDay | null, start?: number, timezone?: string) => {
  if (day === null) {
    const err = new Error("Cannot get delivery date for 'null' date");
    console.error(err.stack);
    throw err;
  }
  const startDate =  timezone ? moment(start).tz(timezone) : moment(start);
  const deliveryDate = moment(startDate).day(day).startOf('day');
  const twoDaysAfterStartDate = moment(startDate).add(2, 'd');
  if (deliveryDate.isAfter(twoDaysAfterStartDate)) return deliveryDate;
  const datePlus7 = deliveryDate.add(7, 'd');
  // this is false when the chosen delivery day is earlier in the week
  if (datePlus7.isAfter(twoDaysAfterStartDate)) return datePlus7
  return datePlus7.add(7, 'd');
}

export const isDate2DaysLater = (date: number, startDate = Date.now()) => {
  const twoDaysAfterStartDate = moment(startDate).add(2, 'd');
  return moment(date).isAfter(twoDaysAfterStartDate) ? true : false;
}

export const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100