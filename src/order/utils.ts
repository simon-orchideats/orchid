import { deliveryDay } from './../consumer/consumerModel';
import moment from 'moment';

export const getNextDeliveryDate = (day: deliveryDay | null) => {
  if (day === null) throw new Error("Cannot get delivery date for 'null' date");
  const date = moment().day(day);
  const twoDaysAfterToday = moment().add(2, 'd');
  if (date.isAfter(twoDaysAfterToday)) return date;
  return (date.day(day + 7));
}

export const isDate2DaysLater = (date: number) => {
  const twoDaysAfterToday = moment().add(2, 'd');
  return moment(date).isAfter(twoDaysAfterToday) ? true : false;
}