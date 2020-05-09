import { makeStyles, Typography, Container, Paper, Divider, Popover, useTheme, useMediaQuery, Theme, Grid, Button } from "@material-ui/core";
import { useRouter } from "next/router";
import Close from '@material-ui/icons/Close';
import { useState, useMemo, useRef, useEffect } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useGetUpcomingOrders, useSkipDelivery, useRemoveDonations } from "../../client/order/orderService";
import { Order } from "../../order/orderModel";
import { Destination } from "../../place/destinationModel";
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
import { Consumer } from "../../consumer/consumerModel";
import { deliveryRoute } from "../delivery";
import { useGetAvailablePlans } from "../../plan/planService";
import { sendSkipDeliveryMetrics, sendRemoveDonationMetrics } from "../../client/consumer/upcomingDeliveriesMetrics";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  needsCartContainer: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  deliveries: {
    paddingTop: theme.spacing(2),
    display: 'flex',
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
  popover: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  img: {
    width: 30,
    marginLeft: theme.spacing(1),
  },
  donation: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  close: {
    cursor: 'pointer'
  },
  hint: {
    color: theme.palette.text.hint
  },
  link: {
    color: theme.palette.common.link,
    cursor: 'pointer',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
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
        2 days before their delivery.
      </Typography>
      <Typography variant='body1'>
        You can review and edit your order below. We'll text you a day before with a specific ETA and also on the day of
        your delivery.
      </Typography>
    </Paper>
  )
}

const DestinationPopper: React.FC<{
  destination: Destination
  open: boolean,
  onClose: () => void,
  anchorEl: Element | ((element: Element) => Element) | null | undefined
  name: string
}> = ({
  destination,
  open,
  onClose,
  anchorEl,
  name,
}) => {
  const classes = useStyles();
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Paper className={classes.popover}>
        <Typography variant='subtitle1'>
          {name}
        </Typography>
        <Typography variant='body1'>
          {destination.Address.Address1}
        </Typography>
        {
          destination.Address.Address2 &&
          <Typography variant='body1'>
            {destination.Address.Address2}
          </Typography>
        }
        <Typography variant='body1'>
          {destination.Address.City}, {destination.Address.State} {destination.Address.Zip}
        </Typography>
        <Typography variant='body1'>
          {destination.Instructions}
        </Typography>
      </Paper>
    </Popover>
  )
}

const DeliveryOverview: React.FC<{
  consumer: Consumer,
  order: Order,
  isUpdating: boolean,
}> = ({
  consumer,
  order,
  isUpdating,
}) => {
  const classes = useStyles();
  const setCart = useSetCart();
  const notify = useNotify();
  const clearCartMeals = useClearCartMeals();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [skipDelivery, skipDeliveryRes] = useSkipDelivery();
  const [removeDonations, removeDonationsRes] = useRemoveDonations();
  const plansRes = useGetAvailablePlans();
  const plans = plansRes.data;
  useMutationResponseHandler(removeDonationsRes, () => {
    Router.replace(upcomingDeliveriesRoute)
    notify('Donations Removed', NotificationType.success, true);
    clearCartMeals();
  });
  useMutationResponseHandler(skipDeliveryRes, () => {
    Router.replace(upcomingDeliveriesRoute)
    notify('Delivery Skipped', NotificationType.success, true);
    clearCartMeals();
  });
  const onClickDestination = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  let canEdit = !order.StripeInvoiceId
    && Date.now() <= moment(order.InvoiceDate).startOf('d').valueOf()
    && !!consumer.Plan

  const start = moment(order.InvoiceDate).subtract(1, 'w');
  const query = {
    updating: 'true',
    orderId: order.Id,
    limit: moment(order.InvoiceDate).add(3, 'd').startOf('d').valueOf(),
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
  const onRemoveDonations = () => {
    if (!plans) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
    sendRemoveDonationMetrics(order);
    removeDonations(order, plans);
  }
  const open = !!anchorEl;
  return (
    <Paper className={classes.marginBottom}>
      <Notifier />
      <DestinationPopper
        destination={order.Destination}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        name={consumer.Profile.Name}
      />
      <div className={`${classes.row} ${classes.padding}`}>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            {
            order.StripeInvoiceId ?
              'Paid'
            :
              `Total for ${start.format('M/D/YY')} - ${moment(order.InvoiceDate).format('M/D/YY')}`
            }
          </Typography>
          <Typography variant='body1' className={classes.hint}>
            {
              order.Costs.MealPrices.length > 0 ?
              order.Costs.MealPrices.map(mp => (
                `${Order.getMealCount(order, mp.PlanName)} meals (${(mp.MealPrice / 100).toFixed(2)} ea)`
              ))
              :
              '0 meals'
            }
          </Typography>
        </div>
        <div className={classes.column}>
          {
            order.Deliveries.length > 0 &&
            <>
              <Typography variant='subtitle1'>
                Deliver to
              </Typography>
              <div className={`${classes.row} ${classes.link}`} onClick={onClickDestination}>
                <Typography variant='body1'>
                  {consumer.Profile.Name}
                </Typography>
                <ExpandMoreIcon />
              </div>
            </>
          }
        </div>
        <div className={classes.column}>
          {
            canEdit && !isUpdating &&
            <Button
              variant='contained'
              color='primary'
              onClick={onEdit}
            >
              Edit deliveries
            </Button>
          }
          {
            canEdit && isUpdating &&
            <Button
              variant='contained'
              color='primary'
              onClick={onSchedule}
            >
              Schedule deliveries
            </Button>
          }
        </div>
      </div>
      <Divider />
      {
        order.DonationCount > 0 &&
        <div className={classes.donation}>
          <Typography variant='h6'>
            {order.DonationCount} donations
          </Typography>
          <img
            src='/heartHand.png'
            alt='heartHand'
            className={classes.img}
          />
           <Button
            className={classes.link}
            onClick={onRemoveDonations}
          >
            Remove all donations
          </Button>
        </div>
      }
      <div className={classes.paddingTop}>
        <ScheduleDeliveries
          deliveries={order.Deliveries}
          onSkip={onSkip}
          isUpdating={isUpdating}
        />
      </div>
    </Paper>
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
  const OrderOverviews = useMemo(() => {
    if (orders.loading) {
      return <Typography variant='body1'>Loading...</Typography>
    }
    if (orders.data && orders.data.length === 0) {
      return <Typography variant='subtitle1'>No upcoming deliveries. Place an order through menu first.</Typography>
    }
    return consumerData && orders.data && orders.data.map(order => 
      <DeliveryOverview
        key={order.Id}
        order={order}
        isUpdating={isUpdating}
        consumer={consumerData}
      />
    )
  }, [orders.data, orders.loading, consumerData, isUpdating, cart]);

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
      {OrderOverviews}
    </Container>
  );
}

export default withApollo(UpcomingDeliveries);

export const upcomingDeliveriesRoute = '/consumer/upcoming-deliveries';