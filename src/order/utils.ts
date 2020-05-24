import { deliveryDay, MIN_DAYS_AHEAD } from './../consumer/consumerModel';
import moment from 'moment';

export const getNextDeliveryDate = (day: deliveryDay | null, start?: number, timezone?: string) => {
  if (day === null) {
    const err = new Error("Cannot get delivery date for 'null' date");
    console.error(err.stack);
    throw err;
  }
  let startDate;
  if (timezone) {
    if (start) {
      startDate = moment(start).tz(timezone);
    } else {
      startDate = moment().tz(timezone);
    }
  } else {
    if (start) {
      startDate = moment(start);
    } else {
      startDate = moment();
    }
  }
  const deliveryDate = moment(startDate).day(day).endOf('day');
  const minDaysAfterStartDate = moment(startDate).add(MIN_DAYS_AHEAD, 'd');
  if (deliveryDate.isAfter(minDaysAfterStartDate)) return deliveryDate;
  const datePlus7 = deliveryDate.add(7, 'd');
  // this is false when the chosen delivery day is earlier in the week
  if (datePlus7.isAfter(minDaysAfterStartDate)) return datePlus7
  return datePlus7.add(7, 'd');
}

export const isDateMinDaysLater = (date: number, startDate = Date.now()) => {
  const minDaysAfterStartDate = moment(startDate).add(MIN_DAYS_AHEAD, 'd');
  return moment(date).isAfter(minDaysAfterStartDate) ? true : false;
}

export const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100