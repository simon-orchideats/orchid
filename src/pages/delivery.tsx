import { Container, makeStyles, Typography, Button, ExpansionPanelSummary, ExpansionPanel, ExpansionPanelDetails } from "@material-ui/core";
import Faq from "../client/general/CommonQuestions";
import withClientApollo from "../client/utils/withClientApollo";
import Router, { useRouter } from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import { useGetCart, useSetScheduleAndAutoDeliveries, useClearCartMeals } from "../client/global/state/cartState";
import { useState, useMemo } from "react";
import { Schedule, deliveryDay, deliveryTime } from "../consumer/consumerModel";
import ScheduleDeliveries from "../client/general/inputs/ScheduledDelivieries";
import Link from "next/link";
import { checkoutRoute } from "./checkout";
import { Cart } from "../order/cartModel";
import PreferredSchedule from "../client/general/PreferredSchedule";
import { useUpdateDeliveries } from "../client/order/orderService";
import { useMutationResponseHandler } from "../utils/apolloUtils";
import { upcomingDeliveriesRoute } from "./consumer/upcoming-deliveries";
import { Order } from "../order/orderModel";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  panel: {
    width: '100%'
  },
  addButton: {
    marginTop: theme.spacing(1),
  },
  nextButton: {
    marginTop: theme.spacing(1),
  },
  col: {
    flexDirection: 'column',
  },
}));

const delivery = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const clearCartMeals = useClearCartMeals();
  // const clearCartMeals = useClearCartMeals();
  const [expanded, setExpanded] = useState<'deliveries' | 'assignments'>('deliveries');
  const [schedules, setSchedules] = useState<Schedule[]>(
    cart && cart.Schedules.length > 0 ? cart.Schedules : [ Schedule.getDefaultSchedule() ]
  );
  const [hasScheduleError, setHasScheduleError] = useState<boolean>(false);
  const urlQuery = useRouter().query;
  const updatingParam = urlQuery.updating;
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const orderId = urlQuery.orderId as string
  const limit = parseFloat(urlQuery.limit as string)
  const setScheduleAndAutoDeliveries = useSetScheduleAndAutoDeliveries();
  const [updateDeliveries, updateDeliveriesRes] = useUpdateDeliveries();
  const updateSchedules = (i: number, day: deliveryDay, time: deliveryTime) => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules[i] = new Schedule({
      day,
      time,
    });
    setSchedules(newSchedules);
  }
  
  useMutationResponseHandler(updateDeliveriesRes, () => {
    clearCartMeals();
    Router.push(upcomingDeliveriesRoute);
  });
  const onUpdateOrder = () => {
    // todo simon: metrics here
    console.log(orderId);
    // todo alvin enable this
    if (cart !== null) updateDeliveries(orderId, Order.getUpdatedDeliveryInput(cart.Deliveries, cart.DonationCount))
  }
  const addSchedule = () => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules.push(Schedule.getDefaultSchedule());
    setSchedules(newSchedules);
  }
  const removeSchedule = (i: number) => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules.splice(i, 1);
    setSchedules(newSchedules);
  }
  const handleExpander = (panel: 'deliveries' | 'assignments') => (_event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    if (isExpanded) setExpanded(panel);
  };
  const setDates = () => {
    setScheduleAndAutoDeliveries(schedules);
    setExpanded('assignments');
  }
  if (!cart) {
    if (!isServer()) Router.replace(`${menuRoute}`);
    return null;
  }
  const allowedDeliveries = useMemo(() => Cart.getAllowedDeliveries(cart.RestMeals), []);
  return (
    <>
      <Container className={classes.container}>
        <ExpansionPanel
          expanded={expanded === 'deliveries'}
          className={classes.panel}
          onChange={handleExpander('deliveries')}
        >
          <ExpansionPanelSummary>
            {
              isUpdating ?
              <div>
                <Typography variant='h4' color='primary'>
                  1. Choose dates for this order
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  These days are only for this order. We disabled days too far past your billing day.
                </Typography>
              </div>
              :
              <div>
                <Typography variant='h4' color='primary'>
                  1. Choose preferred repeat delivery dates
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  Orchid will deliver meals at these times each week
                </Typography>
              </div>
            }
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.col}>
            <PreferredSchedule
              addSchedule={addSchedule}
              allowedDeliveries={allowedDeliveries}
              limit={limit}
              removeSchedule={removeSchedule}
              schedules={schedules}
              updateSchedule={updateSchedules}
            />
            <Button
              variant='contained'
              color='primary'
              fullWidth
              onClick={setDates}
              className={classes.nextButton}
            >
              Next
            </Button>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          expanded={expanded === 'assignments'} 
          className={classes.panel}
          onChange={handleExpander('assignments')}
        >
          <ExpansionPanelSummary>
            <div>
              <Typography variant='h4' color='primary'>
                {
                  isUpdating ? '2. Update the week' : '2. Schedule meals for the first week'
                }
              </Typography>
              {
                isUpdating ?
                <Typography variant='body1' color='textSecondary'>
                  These updates will only affect this order
                </Typography>
                :
                <Typography variant='body1' color='textSecondary'>
                  Orchid will automatically pick <i>next week's</i> meals based on your schedule. You can
                  always edit 2 days prior to your delivery.
                </Typography>
              }
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.col}>
            <ScheduleDeliveries
              deliveries={cart.Deliveries}
              setError={setHasScheduleError}
              movable
            />
            {
              isUpdating ?
              <Button
                variant='contained'
                color='primary'
                fullWidth
                className={classes.nextButton}
                disabled={hasScheduleError}
                onClick={onUpdateOrder}
              >
                Update order
              </Button>
              :
              <Link href={checkoutRoute}>
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  className={classes.nextButton}
                  disabled={hasScheduleError}
                >
                  Next
                </Button>
              </Link>
            }
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(delivery);

export const deliveryRoute = '/delivery';