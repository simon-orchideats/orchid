import { Container, makeStyles, Typography, Button, ExpansionPanelSummary, ExpansionPanel, ExpansionPanelDetails, useTheme, Theme, useMediaQuery } from "@material-ui/core";
import Faq from "../client/general/CommonQuestions";
import withClientApollo from "../client/utils/withClientApollo";
import Router, { useRouter } from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import { useGetCart, useSetScheduleAndAutoDeliveries, useClearCartMeals } from "../client/global/state/cartState";
import { useState, useMemo, useEffect } from "react";
import { Schedule, deliveryDay, deliveryTime } from "../consumer/consumerPlanModel";
import ScheduleDeliveries from "../client/general/inputs/ScheduledDelivieries";
import { checkoutRoute } from "./checkout";
import { Cart } from "../order/cartModel";
import PreferredSchedule from "../client/general/PreferredSchedule";
import { useUpdateDeliveries, useGetOrder } from "../client/order/orderService";
import { useMutationResponseHandler } from "../utils/apolloUtils";
import { upcomingDeliveriesRoute } from "./consumer/upcoming-deliveries";
import moment from "moment";
import { sendRemoveScheduleMetrics, sendUpdateOrderMetrics } from "../client/delivery/deliveryMetrics";
import { useGetAvailablePlans } from "../plan/planService";
import SyncAltIcon from '@material-ui/icons/SyncAlt';
import { welcomePromoAmount, welcomePromoCouponId } from "../order/promoModel";
import Notifier from "../client/notification/Notifier";
import { useNotify } from "../client/global/state/notificationState";
import { NotificationType } from "../client/notification/notificationModel";
import { useGetConsumer } from "../consumer/consumerService";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  row: {
    display: 'flex',
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
  warning: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.warning.dark,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: theme.palette.warning.dark,
  }
}));

const delivery = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const notify = useNotify();
  const consumer = useGetConsumer();
  const clearCartMeals = useClearCartMeals();
  const [expanded, setExpanded] = useState<'deliveries' | 'assignments'>('deliveries');
  const [schedules, setSchedules] = useState<Schedule[]>(
    cart && cart.Schedules.length > 0 ? cart.Schedules : [ Schedule.getDefaultSchedule() ]
  );
  const theme = useTheme<Theme>();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('xs'));
  const plans = useGetAvailablePlans();
  const [hasScheduleError, setHasScheduleError] = useState<boolean>(false);
  const router = useRouter();
  const urlQuery = router.query;
  const updatingParam = urlQuery.updating;
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const orderId = urlQuery.orderId as string
  const order = useGetOrder(orderId);
  const limit = parseFloat(urlQuery.limit as string)
  const start = parseFloat(urlQuery.start as string);
  const startDate = moment(start).format('M/D/YY');
  const endDate = moment(start).add(1, 'w').format('M/D/YY');
  const [setScheduleAndAutoDeliveries, scheduleRes] = useSetScheduleAndAutoDeliveries();
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
  useEffect(() => {
    if (scheduleRes.error) {
      // shouldn't happen
      notify("Sorry couldn't find a new delivery date", NotificationType.error, false);
    }
  }, [scheduleRes]);
  const navToCheckout = () => {
    const pushing = {
      pathname: checkoutRoute
    } as any;
    if (!router.query.p) {
      pushing.query = {
        p: welcomePromoCouponId,
        a: welcomePromoAmount,
      }
    }
    Router.push(pushing);
  }
  const onUpdateOrder = () => {
    if (!cart) {
      const err = new Error('Cart is empty for update order');
      console.error(err.stack);
      throw err;
    }
    if (!plans.data) {
      const err = new Error('No plans');
      console.error(err.stack);
      throw err;
    }
    if (!consumer.data || !consumer.data.Plan) {
      const err = new Error('No consumer plan');
      console.error(err.stack);
      throw err;
    }
    if (!order.data) {
      const err = new Error('No order');
      console.error(err.stack);
      throw err;
    }
    sendUpdateOrderMetrics(cart, order.data, plans.data);
    updateDeliveries(
      orderId, 
      {
        deliveries: cart.Deliveries,
        donationCount: cart.DonationCount ? cart.DonationCount : 0 
      },
      consumer.data.Plan.MealPlans,
      plans.data,
    ) 
  }
  const addSchedule = () => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules.push(Schedule.getDefaultSchedule());
    setSchedules(newSchedules);
  }
  const removeSchedule = (i: number) => {
    const newSchedules = schedules.map(s => new Schedule(s));
    const removed = newSchedules.splice(i, 1);
    sendRemoveScheduleMetrics(removed[0]);
    setSchedules(newSchedules);
  }
  const handleExpander = (panel: 'deliveries' | 'assignments') => (_event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    if (isExpanded) setExpanded(panel);
    if (panel === 'assignments') {
      setScheduleAndAutoDeliveries(schedules, Date.now() >= start ? Date.now() : start);
    }
  };
  const setDates = () => {
    setScheduleAndAutoDeliveries(schedules, Date.now() >= start ? Date.now() : start);
    setExpanded('assignments');
  }
  let step2Title = `2. Schedule meals for ${startDate} - ${endDate}`;
  if (!isUpdating) {
    if (schedules.length === 1) {
      step2Title = '2. Confirm meals';
    } else {
      step2Title = '2. Choose meals for each delivery';
    }
  }
  if (!cart) {
    if (!isServer()) Router.replace(`${menuRoute}`);
    return null;
  }
  const allowedDeliveries = useMemo(() => Cart.getAllowedDeliveries(cart), []);
  const isPreferredScheduleNextDisabled = allowedDeliveries < schedules.length;
  return (
    <>
      <Notifier />
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
                  1. Choose days for week {startDate} - {endDate}
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  These days are only for this order. We disabled days too far past your billing day.
                </Typography>
              </div>
              :
              <div>
                <Typography variant='h4' color='primary'>
                  1. Preferred repeat delivery schedule
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  Meal plans can be edited/skipped up to 2 days before each scheduled delivery
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
              disabled={isPreferredScheduleNextDisabled}
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
          disabled={isPreferredScheduleNextDisabled}
          onChange={handleExpander('assignments')}
        >
          <ExpansionPanelSummary>
            <div>
              <Typography variant='h4' color='primary'>
                {step2Title}
              </Typography>
              {
                isUpdating ?
                <Typography variant='body1' color='textSecondary'>
                  These updates will only affect this order
                </Typography>
                :
                <Typography variant='body1' color='textSecondary'>
                  You can skip/edit meals up to 2 days before each delivery. Cancel your subscription anytime
                </Typography>
              }
              {
                schedules.length > 1 && isSmAndDown &&
                <Typography className={classes.row}>
                  <b>Scroll right to see more</b>&nbsp;<SyncAltIcon />
                </Typography>
              }
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.col}>
            {
              scheduleRes.delays.length > 0 &&
              <div className={classes.warning}>
                <Typography variant='h6'>
                  Deliveries based on your preferred day
                </Typography>
                {
                  scheduleRes.delays.map((d, i) => 
                    <Typography variant='subtitle1' key={i}>
                      {d}
                    </Typography>
                  )
                }
              </div>
            }
            <ScheduleDeliveries
              deliveries={cart.Deliveries}
              isUpdating={isUpdating}
              setError={cart.DonationCount === 0 ? setHasScheduleError : undefined}
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
                <Button
                  variant='contained'
                  color='primary'
                  onClick={navToCheckout}
                  fullWidth
                  className={classes.nextButton}
                  disabled={hasScheduleError}
                >
                  Next
                </Button>
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