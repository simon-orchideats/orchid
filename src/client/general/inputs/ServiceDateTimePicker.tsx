import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Typography } from '@material-ui/core';
import { DateTimePicker, LocalizationProvider } from "@material-ui/pickers";
import DateFnsUtils from '@material-ui/pickers/adapter/date-fns';
import { ServiceTimes, Order } from '../../../order/orderModel';
import { useSetServiceTime, useSetServiceDate, useGetCart } from '../../global/state/cartState';
import addDays from 'date-fns/addDays'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';

const useStyles = makeStyles(theme => ({
  or: {
    padding: theme.spacing(1),
  },
  outlinedPrimary: {
    border: `1px solid ${theme.palette.divider}!important`,
    backgroundColor: `${theme.palette.common.white} !important`,
    color: theme.palette.text.primary,
    fontWeight: 400,
  },
  toggleButtonGroup: {
    width: '100%',
  },
}));

const ServiceDateTimePicker: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const setCartServiceTime = useSetServiceTime();
  const setCartServiceDate = useSetServiceDate();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const isAsap = cart && cart.serviceTime === ServiceTimes.ASAP
  return (
    <>
      <ToggleButtonGroup
        className={classes.toggleButtonGroup}
        exclusive
        value={isAsap ? ServiceTimes.ASAP : null}
        onChange={() => {
          if (!isAsap) {
            setDate(null);
            setCartServiceTime(ServiceTimes.ASAP);
            setCartServiceDate(Order.getServiceDateStr(new Date()));
          }
        }}
      >
        <ToggleButton value={ServiceTimes.ASAP}>
          {ServiceTimes.ASAP} {isAsap && '✔'}
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography
        color='textSecondary'
        className={classes.or}
        align='center'
      >
        or
      </Typography>
      <LocalizationProvider dateAdapter={DateFnsUtils}>
        <DateTimePicker
          label='Schedule'
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={date}
          onChange={(d: Date | null) => {
            if (d === null) return;
            if (d.getMinutes() % 15 !== 0) return;
            console.log(d.toLocaleString());
            const serviceTime = Order.getServiceTime(d);
            setDate(d);
            setCartServiceTime(serviceTime);
            setCartServiceDate(Order.getServiceDateStr(d));
          }}
          maxDate={addDays(new Date(), 7)}
          onError={console.error}
          minutesStep={15}
          disablePast
          disableCloseOnSelect
          shouldDisableTime={(time, clockType) => {
            return clockType === 'minutes' && time % 15 !== 0
          }}
          showToolbar={false}
          renderInput={props => (
            <TextField
              {...props}
              fullWidth
              inputProps={{
                ...props.inputProps,
                value: isAsap ? '' : `${cart!.serviceDate} ${Order.getServiceTimeStr(cart!.serviceTime)}`,
                readOnly: true
              }}
              onClick={() => setOpen(true)}
              variant='outlined'
            />
          )}
        />
      </LocalizationProvider>
    </>
  );
}

export default ServiceDateTimePicker;
