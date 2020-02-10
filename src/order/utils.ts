import { deliveryDay } from './../consumer/consumerModel';
import moment from 'moment';

export const getNextDeliveryDate = (day: deliveryDay | null) => {
  if (day === null) throw new Error("Cannot get delivery date for 'null' date");
  const date = moment().day(day);
  const twoDaysAfterToday = moment().add(3, 'd');
  if (moment(date).isSameOrAfter(twoDaysAfterToday)) return date;
  return (date.day(day + 7));
}