import { deliveryDay } from './../consumer/consumerModel';
import moment from 'moment';

export const getNextDeliveryDate = (day: deliveryDay | null) => {
  if (day === null) {
    const err = new Error("Cannot get delivery date for 'null' date");
    console.error(err.stack);
    throw err;
  }
  const date = moment().day(day);
  const twoDaysAfterToday = moment().add(2, 'd');
  if (date.isAfter(twoDaysAfterToday)) return date;
  const datePlus7 = date.add(7, 'd');
  // this is false when the chosen delivery day is earlier in the week
  if (datePlus7.isAfter(twoDaysAfterToday)) return datePlus7
  return datePlus7.add(7, 'd');
}

export const isDate2DaysLater = (date: number, today = Date.now()) => {
  const twoDaysAfterToday = moment(today).add(2, 'd');
  return moment(date).isAfter(twoDaysAfterToday) ? true : false;
}