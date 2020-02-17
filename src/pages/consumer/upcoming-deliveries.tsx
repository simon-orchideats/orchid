import { makeStyles, Typography, Container, Paper, Divider, Popover, Button } from "@material-ui/core";
import { useRouter } from "next/router";
import { useGetRest } from "../../rest/restService";
import { getNextDeliveryDate } from "../../order/utils";
import withClientApollo from "../../client/utils/withClientApollo";
import Close from '@material-ui/icons/Close';
import { useState, useMemo, useRef, useEffect } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useGetUpcomingOrders } from "../../client/order/orderService";
import { Cart } from "../../order/cartModel";
import { Order } from "../../order/orderModel";
import moment from "moment";
import { Destination } from "../../place/destinationModel";
import CartMealGroup from "../../client/order/CartMealGroup";
import { useGetCart, useClearCartMeals, useSetCart } from "../../client/global/state/cartState";
import Router from 'next/router'
import { menuRoute } from "../menu";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
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
  if (!cartRef.current) throw new Error('Cart is null');
  const res = useGetRest(cartRef.current.RestId);
  const groupedMeals = cartRef.current.Meals;
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
        We sent you a confirmation email
      </Typography>
      <Typography variant='body1'>
        We'll text you the day of your delivery
      </Typography>
      <Typography variant='body1'>
        Deliver on {getNextDeliveryDate(cartRef.current.DeliveryDay).format('M/D/YY')}, 6pm - 9pm
      </Typography>
      <Typography variant='subtitle1'>
        {res.data && res.data.Profile.Name}
      </Typography>
      {groupedMeals && groupedMeals.map(mealGroup => (
        <Typography key={mealGroup.MealId} variant='body1'>
          {mealGroup.quantity} {mealGroup.Name}
        </Typography>
      ))} 
    </Paper>
  )
}

const DestinationPopper: React.FC<{
  destination: Destination
  open: boolean,
  onClose: () => void,
  anchorEl: Element | ((element: Element) => Element) | null | undefined
}> = ({
  destination,
  open,
  onClose,
  anchorEl,
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
          {destination.Name}
        </Typography>
        <Typography variant='body1'>
          {destination.Address.Address1}
        </Typography>
        {
          destination.Address.Address2 &&
          <Typography variant='body1'>
            {destination.Address.Address1}
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

const DeliveryOverview: React.FC<{ order: Order }> = ({ order }) => {
  const classes = useStyles();
  const setCart = useSetCart();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const onClickDestination = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const onEdit = () => {
    setCart(order);
    Router.push(menuRoute);
  }
  const open = !!anchorEl;
  return (
    <Paper className={classes.marginBottom}>
      <div className={`${classes.row} ${classes.overviewSection}`}>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            Deliver on
          </Typography>
          <Typography variant='body1' className={classes.hint}>
            {moment(order.DeliveryDate).format('M/DD/Y')}
          </Typography>
        </div>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            Total
          </Typography>
          <Typography variant='body1' className={classes.hint}>
            {Cart.getMealCount(order.Meals)} meals (${order.MealPrice.toFixed(2)} ea)
          </Typography>
        </div>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            Deliver to
          </Typography>
          <div className={`${classes.row} ${classes.link}`} onClick={onClickDestination}>
            <Typography variant='body1'>
              {order.Destination.Name}
            </Typography>
            <ExpandMoreIcon />
          </div>
        </div>
      </div>
      <Divider />
      <div className={classes.overviewSection}>
        <Typography variant='subtitle1'>
          {order.Rest.Profile.Name}
        </Typography>
        {order.Meals.map(meal => <CartMealGroup key={meal.MealId} mealGroup={meal} />)}
      </div>
      <Divider />
      <div className={`${classes.overviewSection} ${classes.buttons}`}>
        <Button
          variant='outlined'
          color='primary'
          className={classes.skip}
        >
          Skip
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={onEdit}
        >
          Edit meals
        </Button>
      </div>
      <DestinationPopper
        destination={order.Destination}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
      />
    </Paper>
  )
}

const UpcomingDeliveries = () => {
  const classes = useStyles();
  const needsConfirmation = useRouter().query.confirmation;
  const [showConfirmation, setShowConfirmation] = useState(true);
  const orders = useGetUpcomingOrders();
  const OrderOverviews = useMemo(() => ( 
    orders.data && orders.data.map(order => 
      <DeliveryOverview
        key={order.Id}
        order={order}
      />
    )
  ), [orders.data]);
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

export default withClientApollo(UpcomingDeliveries);

export const upcomingDeliveriesRoute = '/consumer/upcoming-deliveries';