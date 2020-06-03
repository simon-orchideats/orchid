import { makeStyles, Typography, Container, Paper, useTheme, useMediaQuery, Theme, Grid, Button } from "@material-ui/core";
import { useRouter } from "next/router";
import Close from '@material-ui/icons/Close';
import { useState, useRef, useEffect } from "react";
import { useGetUpcomingOrders, useSkipDelivery } from "../../client/order/orderService";
import { Order } from "../../order/orderModel";
import { useGetCart, useClearCartMeals, useSetCart } from "../../client/global/state/cartState";
import Router from 'next/router'
import { menuRoute } from "../menu";
import withApollo from "../../client/utils/withPageApollo";
import { useRequireConsumer } from "../../consumer/consumerService";
import StickyDrawer from "../../client/general/StickyDrawer";
import SideMenuCart from "../../client/menu/SideMenuCart";
import Notifier from "../../client/notification/Notifier";
import { useNotify } from "../../client/global/state/notificationState";
import { NotificationType } from "../../client/notification/notificationModel";
import { isServer } from "../../client/utils/isServer";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import ScheduleDeliveries from "../../client/general/inputs/ScheduledDelivieries";
import moment from "moment";
import { Consumer, MIN_DAYS_AHEAD } from "../../consumer/consumerModel";
import { MIN_DAYS_AHEAD } from "../../consumer/consumerPlanModel";
import { deliveryRoute } from "../delivery";
import { useGetAvailablePlans } from "../../plan/planService";
import { sendSkipDeliveryMetrics } from "../../client/consumer/upcomingDeliveriesMetrics";
import { referralFriendAmount, referralSelfAmount, referralMonthDuration, autoPickPromoAmount } from "../../order/promoModel";
import OrderOverview from "../../client/consumer/OrderOverview";
import { activeConfig } from "../../config";
import WithClickToCopy from "../../client/general/WithClickToCopy";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  needsCartContainer: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  paddingTop: {
    paddingTop: theme.spacing(2)
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  confirmation: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderColor: theme.palette.primary.main
  },
  padding: {
    padding: theme.spacing(2),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  close: {
    cursor: 'pointer'
  },
}));

const Confirmation: React.FC<{
  onClose: () => void
}> = ({
  onClose,
}) => {
  const cart = useGetCart();
  const cartRef = useRef(cart);
  const clearCartMeals = useClearCartMeals();
  useEffect(() => clearCartMeals(), []);
  if (!cartRef.current) {
    const err = Error('Cart is null');
    console.warn(err.stack);
    if (!isServer()) Router.replace(upcomingDeliveriesRoute);
    return null;
  }
  const classes = useStyles();
  return (
    <Paper variant='outlined' className={classes.confirmation}>
      <div className={classes.row}>
        <Typography variant='h6' color='primary'>
          Thank you, your delivery has been scheduled
        </Typography>
        <Close className={classes.close} onClick={onClose} />
      </div>
      <Typography variant='body1'>
        You will be billed a week from today, based on the number of meals confirmed. Meals are confirmed
        1 day before their delivery.
      </Typography>
      <Typography variant='body1'>
        You can review and edit your order below. We'll text you a day before with a specific ETA and also on the day of
        your delivery.
      </Typography>
    </Paper>
  )
}

const UpcomingDeliveryOverview: React.FC<{
  consumer: Consumer,
  order: Order,
  isUpdating: boolean,
}> = ({
  consumer,
  order,
  isUpdating,
}) => {
  const setCart = useSetCart();
  const notify = useNotify();
  const clearCartMeals = useClearCartMeals();
  const [skipDelivery, skipDeliveryRes] = useSkipDelivery();
  const plansRes = useGetAvailablePlans();
  const plans = plansRes.data;
  useMutationResponseHandler(skipDeliveryRes, () => {
    Router.replace(upcomingDeliveriesRoute)
    notify('Delivery Skipped', NotificationType.success, true);
    clearCartMeals();
  });
  let canEdit = !order.StripeInvoiceId
    && Date.now() <= moment(order.InvoiceDate).startOf('d').valueOf()
    && !!consumer.Plan

  const start = moment(order.InvoiceDate).subtract(1, 'w');
  const query = {
    updating: 'true',
    orderId: order.Id,
    limit: moment(order.InvoiceDate).add(MIN_DAYS_AHEAD + 1, 'd').startOf('d').valueOf(),
    start: start.startOf('d').valueOf(),
  };
  const onEdit = () => {
    setCart(order);
    Router.push({
      pathname: menuRoute,
      query,
    });
  };
  const onSchedule = () => {
    Router.push({
      pathname: deliveryRoute,
      query,
    });
  };
  const onSkip = (deliveryIndex: number) => {
    if (!plans) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
    sendSkipDeliveryMetrics(order, deliveryIndex);
    skipDelivery(order, deliveryIndex, plans);
  }
  let action = null;
  if (canEdit) {
    if (isUpdating) {
      action = (
        <Button
          variant='contained'
          color='primary'
          onClick={onSchedule}
        >
          Schedule deliveries
        </Button>
      )
    } else {
      action = (
        <Button
          variant='contained'
          color='primary'
          onClick={onEdit}
        >
          Edit deliveries
        </Button>
      )
    }
  }
  return (
    <>
      <Notifier />
      <OrderOverview
        consumer={consumer}
        order={order}
        action={action}
        scheduleDeliveries={
          <ScheduleDeliveries
            deliveries={order.Deliveries}
            onSkip={onSkip}
            isUpdating={isUpdating}
          />
        }
      />
    </>
  )
}

const UpcomingDeliveries = () => {
  const classes = useStyles();
  const needsConfirmation = useRouter().query.confirmation;
  const [showConfirmation, setShowConfirmation] = useState(true);
  const updatingParam = useRouter().query.updating;
  const [showCart] = useState(true);
  const cart = useGetCart();
  const orders = useGetUpcomingOrders();
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const consumer = useRequireConsumer(upcomingDeliveriesRoute);
  const consumerData = consumer.data;
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const needsCart = isUpdating && showCart;
  let OrderOverviews;
  if (orders.loading) {
    OrderOverviews = <Typography variant='body1'>Loading...</Typography>
  } else if (orders.data && orders.data.length === 0) {
    OrderOverviews = <Typography variant='subtitle1'>No upcoming deliveries. Place an order through menu first.</Typography>
  } else {
    OrderOverviews = consumerData && orders.data && orders.data.map(order => 
      <UpcomingDeliveryOverview
        key={order.Id}
        order={order}
        isUpdating={isUpdating}
        consumer={consumerData}
      />
    )
  }

  if (needsCart && !cart) {
    const err = new Error('Needs cart, but no cart');
    console.warn(err.stack);
    if (!isServer()) Router.replace(upcomingDeliveriesRoute);
    return null;
  }
  if (!consumerData && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (!consumerData) {
    if (consumer.loading) return <Typography>Loading...</Typography>
    console.error('No consumer data', consumer.error);
    return <Typography>Error</Typography>
  }
  const referralLink = `${activeConfig.client.app.url.replace('https://', '')}?p=${consumerData.Plan?.ReferralCode}&a=${referralFriendAmount}`
  const friendAmount = referralFriendAmount * 4 * referralMonthDuration;
  const referral = (
    <Paper className={`${classes.padding} ${classes.marginBottom}`}>
      <Typography variant='h6' className={classes.marginBottom}>
        Refer a friend. You Get ${(referralSelfAmount * 4 * referralMonthDuration / 100).toFixed(2)} off and they get
        ${(friendAmount / 100).toFixed(2)} off
      </Typography>
      <Typography variant='h6' className={classes.marginBottom}>
        Friends get another ${(2 * autoPickPromoAmount / 100).toFixed(2)} on the last 2 weeks when they
        let Orchid pick their meals
      </Typography>
      <WithClickToCopy 
        render={onCopy =>
          <Typography
            variant='h6'
            className={classes.marginBottom}
            onClick={() => onCopy(referralLink)}
          >
            When they checkout with your link&nbsp;
            <b>
              {referralLink}
            </b>
          </Typography>
        }
      />
    </Paper>
  );
  if (needsCart) {
    return (
      <Container maxWidth='xl' className={classes.needsCartContainer}>
        <Grid container alignItems='stretch'>
          <Grid
            item
            sm={12}
            md={9}
            lg={8}
          >
            <Typography variant='h3' className={`${classes.marginBottom} ${classes.paddingTop}`}>
              Upcoming deliveries
            </Typography>
            {referral}
            {OrderOverviews}
          </Grid>
          {
            isMdAndUp &&
            <Grid
              item
              md={3}
              lg={4}
            >
              <StickyDrawer>
                <SideMenuCart hideNext />
              </StickyDrawer>
            </Grid>
          }
        </Grid>
      </Container>
    )
  }
  return (
    <Container maxWidth='xl' className={classes.container}>
      {
        needsConfirmation 
        && needsConfirmation === 'true'
        && showConfirmation
        && <Confirmation onClose={() => setShowConfirmation(false)} />
      }
      <Typography variant='h3' className={classes.marginBottom}>
        Upcoming deliveries
      </Typography>
      {referral}
      {OrderOverviews}
    </Container>
  );
}

export default withApollo(UpcomingDeliveries);

export const upcomingDeliveriesRoute = '/consumer/upcoming-deliveries';