import { makeStyles, Typography, Container, Paper, Divider, Popover, Button, useTheme, useMediaQuery, Theme, Grid } from "@material-ui/core";
import { useRouter } from "next/router";
import Close from '@material-ui/icons/Close';
import { useState, useMemo, useRef, useEffect } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useGetUpcomingOrders, useUpdateOrder } from "../../client/order/orderService";
import { Cart } from "../../order/cartModel";
import { Order } from "../../order/orderModel";
// import moment from "moment";
import { Destination } from "../../place/destinationModel";
import CartMealGroup from "../../client/order/CartMealGroup";
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
import { Plan } from "../../plan/planModel";
import { useGetAvailablePlans } from "../../plan/planService";
// import { sendSkippedOrderMetrics } from "../../client/consumer/upcomingDeliveriesMetrics";
import { isServer } from "../../client/utils/isServer";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import ScheduleDeliveries from "../../client/general/inputs/ScheduledDelivieries";
// import { ConsumerPlan } from "../../consumer/consumerModel";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  needsCartContainer: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  confirmation: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderColor: theme.palette.primary.main
  },
  overviewSection: {
    padding: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
  skip:{
    marginRight: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end'
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
  // const groupedMeals = cartRef.current ? cartRef.current.RestMeals : [];
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
        You will be billed a week from today, based on the number of meals confirmed. A delivery's meals are confirmed
        2 days before its delivery.
      </Typography>
      <Typography variant='body1'>
        We'll text you the day of your delivery
      </Typography>
      <Typography variant='body1'>
        You can review your order below. Feel free to edit your meals before they're confirmed.
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
  cart?: Cart
  isUpdating: boolean
  name: string
  order: Order
}> = ({
  cart,
  isUpdating,
  name,
  order,
}) => {
  const classes = useStyles();
  const setCart = useSetCart();
  const notify = useNotify();
  const clearCartMeals = useClearCartMeals();
  const plans = useGetAvailablePlans();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [updateOrder, updateOrderRes] = useUpdateOrder();
  const orderMealCount = Order.getMealCount(order);
  useMutationResponseHandler(updateOrderRes, () => {
    Router.replace(upcomingDeliveriesRoute)
    notify('Order updated', NotificationType.success, true);
    clearCartMeals();
  });
  const onClickDestination = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const onEdit = () => {
    if (!plans.data) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
    setCart(order);
    Router.push({
      pathname: menuRoute,
      query: { updating: 'true' }
    });
  };
  const onUpdateOrder = () => {
    if (!plans.data) {
      const err = new Error('No plans');
      console.error(err.stack);
      throw err;
    }
    if (!cart) {
      const err = new Error('No cart');
      console.error(err.stack);
      throw err;
    }
    const cartMealCount = cart.getMealCount();
    const planMealPrice = Plan.getMealPrice(cartMealCount, plans.data);
    if (!planMealPrice) {
      const err = new Error('No cart meal price');
      console.error(err.stack);
      throw err;
    }
    // todo simon: use this
    // sendEditOrderMetrics(
    //   order,
    //   order.MealPrice && Plan.getMealCountFromMealPrice(order.MealPrice, plans.data),
    //   cart,
    //   planMealPrice,
    //   planMealCount,
    //   cart.RestName ? cart.RestName : undefined
    // );
    updateOrder(order._id, Order.getUpdatedOrderInput(order, cart));
  }
  // const onSkip = () => {
  //   if (!order.MealPrice) {
  //     const err = new Error('No meal price');
  //     console.error(err.stack);
  //     throw err;
  //   }
  //   if (!plans.data) {
  //     const err = new Error('No plans');
  //     console.error(err.stack);
  //     throw err;
  //   }
  //   sendSkippedOrderMetrics(
  //     order,
  //     order.MealPrice,
  //     Plan.getMealCountFromMealPrice(order.MealPrice, plans.data),
  //   );
  //   updateOrder(order._id, Order.getUpdatedOrderInput(order));
  // }
  let isAllDeliveriesSkipped = true;
  let isAllDeliveriesConfirmed = true;

  order.Deliveries.forEach(d => {
    if (d.Status === 'Open') {
      isAllDeliveriesSkipped = false;
      isAllDeliveriesConfirmed = false;
    } else if (d.Status === 'Confirmed') {
      isAllDeliveriesSkipped = false;
    } else if (d.Status === 'Skipped') {
      isAllDeliveriesConfirmed = false;
    }
  });

  let buttons;
  if (isUpdating) {
    buttons = (
      <Button
        variant='contained'
        color='primary'
        onClick={onUpdateOrder}
      >
        Update order
      </Button>
    )
  } else if (!isAllDeliveriesConfirmed) {
    buttons = (
      <>
        {
          !isAllDeliveriesSkipped &&
          <Button
            variant='outlined'
            color='primary'
            className={classes.skip}
            // onClick={onSkip}
          >
            {order.DonationCount === orderMealCount ? 'Cancel Donation' : 'Skip unconfirmed deliveries'}
          </Button>
        }
        <Button
          variant='contained'
          color='primary'
          onClick={onEdit}
        >
          Edit unconfirmed meals
        </Button>
      </>
    )
  } else {
    buttons = (
      <Typography variant='body1' color='primary'>
        All deliveries have been placed with their restaurants
      </Typography>
    )
  }

  const open = !!anchorEl;
  return (
    <Paper className={classes.marginBottom}>
      <Notifier />
      <div className={`${classes.row} ${classes.overviewSection}`}>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            Total
          </Typography>
          <Typography variant='body1' className={classes.hint}>
            {
              orderMealCount > 0?
              `${orderMealCount} meals (${order.MealPrice.toFixed(2)} ea)`
              :
              '0 meals'
            }
          </Typography>
        </div>
        <div className={classes.column}>
          {
            order.Deliveries.length > 1 &&
            <>
              <Typography variant='subtitle1'>
                Deliver to
              </Typography>
              <div className={`${classes.row} ${classes.link}`} onClick={onClickDestination}>
                <Typography variant='body1'>
                  {name}
                </Typography>
                <ExpandMoreIcon />
              </div>
            </>
          }
        </div>
      </div>
      <Divider />
      {
        <div className={classes.overviewSection}>
          {
            order.DonationCount > 0 &&
            <CartMealGroup
              mealId='donations'
              name='Donation'
              img='/heartHand.png'
              quantity={order.DonationCount}
            />
          }
          <ScheduleDeliveries deliveries={order.Deliveries} />
        </div>
      }
      <Divider />
      <div className={`${classes.overviewSection} ${classes.buttons}`}>
        {buttons}
      </div>
      <DestinationPopper
        destination={order.Destination}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        name={name}
      />
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
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const needsCart = isUpdating && showCart;
  const OrderOverviews = useMemo(() => {
    if (orders.loading) {
      return <Typography variant='body1'>Loading...</Typography>
    }
    if (orders.data && orders.data.length === 0) {
      return <Typography variant='subtitle1'>No upcoming deliveries. Place an order through menu first.</Typography>
    }
    return consumer.data && orders.data && orders.data.map(order => 
      <DeliveryOverview
        key={order.Id}
        order={order}
        isUpdating={isUpdating}
        name={consumer.data!.Profile.Name}
        cart={cart ? cart : undefined}
      />
    )
  }, [orders.data, orders.loading, consumer.data, isUpdating, cart]);

  if (needsCart && !cart) {
    const err = new Error('Needs cart, but no cart');
    console.warn(err.stack);
    if (!isServer()) Router.replace(upcomingDeliveriesRoute);
    return null;
  }
  if (!consumer.data && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (!consumer.data) {
    if (consumer.loading) return <Typography>Loading...</Typography>
    console.error('No consumer data', consumer.error);
    return <Typography>Error</Typography>
  }
  if (needsCart) {
    return (
      <Container maxWidth='lg' className={classes.needsCartContainer}>
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
    <Container maxWidth='lg' className={classes.container}>
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