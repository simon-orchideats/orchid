import { Container, makeStyles, Typography, Button } from "@material-ui/core";
import Faq from "../client/general/Faq";
import { useGetCart, useUpdateDeliveryDay, useUpdateDeliveryTime } from "../client/global/state/cartState";
import withClientApollo from "../client/utils/withClientApollo";
import Link from "next/link";
import Router from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import DeliveryDateChooser from '../client/general/DeliveryDateChooser'
import { getNextDeliveryDate } from '../order/utils';
import { checkoutRoute } from "./checkout";
import { useState } from "react";
import { deliveryDay, deliveryTime, ConsumerPlan } from "../consumer/consumerModel";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  header: {
    paddingBottom: theme.spacing(4),
  },
  smallPaddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  toggleButtonGroup: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  input: {
    alignSelf: 'stretch',
  },
  row: {
    display: 'flex',
  },

}));

const delivery = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const [day, setDay] = useState<deliveryDay>(0);
  const [time, setTime] = useState<deliveryTime>(ConsumerPlan.getDefaultDeliveryTime());
  const updateDeliveryDay = useUpdateDeliveryDay();
  const updateDeliveryTime = useUpdateDeliveryTime();
  if (!cart && !isServer()) Router.replace(`${menuRoute}`);
  return (
    <>
      <Container className={classes.container}>
        <Typography
          variant='h3'
          color='primary'
          className={classes.header}
        >
          Choose a repeat delivery day
        </Typography>
        <DeliveryDateChooser
          day={day}
          onDayChange={day => setDay(day)}
          time={time}
          onTimeChange={time => setTime(time)}
        />
        <div className={`${classes.row} ${classes.smallPaddingBottom}`}>
          <Typography variant='subtitle1'>
            First delivery:&nbsp;
          </Typography>
          <Typography variant='subtitle1'>
            {getNextDeliveryDate(day).format('M/D/YY')}, {ConsumerPlan.getDeliveryTimeStr(time)}
          </Typography>
          <br/>
        </div>
        <div className={`${classes.row} ${classes.smallPaddingBottom}`}>
          <Typography variant='body1' align='center'>
            We'll do our best to meet your delivery schedule and email you if we need to reschedule your order to the next best time.
          </Typography>
        </div>
        <Link href={checkoutRoute}>
          <Button
            variant='contained'
            color='primary'
            fullWidth
            onClick={() => {
              updateDeliveryDay(day);
              updateDeliveryTime(time);
            }}
          >
            Next
          </Button>
        </Link>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(delivery);

export const deliveryRoute = '/delivery';