import { Container, makeStyles, Typography, Button } from "@material-ui/core";
import Faq from "../client/general/Faq";
import { useGetCart, useUpdateDeliveryDay } from "../client/global/state/cartState";
import withClientApollo from "../client/utils/withClientApollo";
import Link from "next/link";
import Router from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import DeliveryDateChooser from '../client/general/DeliveryDateChooser'
import { getNextDeliveryDate } from '../order/utils';
import { checkoutRoute } from "./checkout";
import { useState } from "react";
import { deliveryDay } from "../consumer/consumerModel";

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
  const updateDeliveryDay = useUpdateDeliveryDay();
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
        <DeliveryDateChooser day={day} onDayChange={day => setDay(day)}/>
        <div className={`${classes.row} ${classes.smallPaddingBottom}`}>
          <Typography variant='subtitle1'>
            First delivery:&nbsp;
          </Typography>
          <Typography variant='subtitle1'>
            {getNextDeliveryDate(day).format('M/D/YY')}, 3pm - 7pm
          </Typography>
        </div>
        <Link href={checkoutRoute}>
          <Button
            variant='contained'
            color='primary'
            fullWidth
            onClick={() => updateDeliveryDay(day)}
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