import { makeStyles, Typography, Paper, Divider, Popover, Grid } from "@material-ui/core";
import { useState } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { IOrder, ServiceTypes, Order } from "../../order/orderModel";
import { OrderMeal } from "../../order/orderRestModel";
import CartMealGroup from "../order/CartMealGroup";
import { useGetRest } from "../../rest/restService";
import { Meal } from "../../rest/mealModel";

const useStyles = makeStyles(theme => ({
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  padding: {
    padding: theme.spacing(2),
  },
  cost: {
    fontWeight: 500,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deliverTo: {
    display: 'flex',
  },
  link: {
    color: theme.palette.common.link,
    cursor: 'pointer',
  },
  savings: {
    color: theme.palette.common.green,
    paddingBottom: theme.spacing(1),
  },
  popover: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const DestinationPopper: React.FC<{
  name: string
  order: IOrder
  open: boolean,
  onClose: () => void,
  anchorEl: Element | ((element: Element) => Element) | null | undefined
}> = ({
  name,
  order,
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
          {name}
        </Typography>
        <Typography variant='body1'>
          {order.location.primaryAddr}
        </Typography>
        { 
          order.location.address2 &&
          <Typography variant='body1'>
            {order.location.address2}
          </Typography>
        }
        <Typography variant='body1'>
          {order.serviceInstructions}
        </Typography>
      </Paper>
    </Popover>
  )
}

const OrderOverview: React.FC<{
  order: IOrder,
  showOrderId?: boolean
  showRestDetails?: boolean
}> = ({
  order,
  showOrderId = false,
  showRestDetails = false,
}) => {
  const classes = useStyles();
  const rest = useGetRest(showRestDetails ? order.rest.restId : null)
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const onClickLocation = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const open = !!anchorEl;
  let mealTotal = OrderMeal.getTotalMealCost(order.rest.meals, order.costs.discount?.percentOff);
  const totalBadPrice = Meal.getTotalBadPrice(order.rest.meals);
  const savings = ((totalBadPrice / 100 - mealTotal / 100)).toFixed(2);
  const taxes = Math.round(mealTotal * order.costs.taxRate);
  const total = mealTotal + taxes + order.costs.tip + order.costs.deliveryFee;
  const serviceName = order.serviceType === ServiceTypes.Delivery ? order.consumer.profile.name : order.rest.restName;
  return (
    <Paper className={classes.marginBottom}>
      <DestinationPopper
        order={order}
        name={serviceName}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
      />
      <Grid
        container
        className={`${classes.row} ${classes.padding}`}
        spacing={2}
      >
        <Grid
          item
          container
          xs={12}
          sm={6}
          md={5}
        > 
          <Grid item xs={6}>
            <Typography variant='body1'>
              Meals
            </Typography>
            <Typography variant='body1'>
              Delivery
            </Typography>
            <Typography variant='body1'>
              Tip
            </Typography>
            <Typography variant='body1'>
              Tax
            </Typography>
            <Typography variant='body1'>
              Total
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body1' className={classes.cost}>
              ${(mealTotal / 100).toFixed(2)}
            </Typography>
            <Typography variant='body1' className={classes.cost}>
              ${(order.costs.deliveryFee / 100).toFixed(2)}
            </Typography>
            <Typography variant='body1' className={classes.cost}>
              ${(order.costs.tip / 100).toFixed(2)}
            </Typography>
            <Typography variant='body1' className={classes.cost}>
              ${(taxes / 100).toFixed(2)}
            </Typography>
            <Typography variant='body1' className={classes.cost}>
              <b>${(total / 100).toFixed(2)}</b>
            </Typography>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Typography variant='subtitle1'>
            {Order.getServiceMonthDay(order.serviceDate)}
          </Typography>
          <Typography variant='subtitle1'>
            {Order.getServiceTimeStr(order.serviceTime)}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
        >
          <Typography variant='subtitle1'>
            {order.serviceType}
          </Typography>
          <div className={`${classes.deliverTo} ${classes.link}`} onClick={onClickLocation}>
            <Typography variant='body1'>
              {serviceName}
            </Typography>
            <ExpandMoreIcon />
          </div>
        </Grid>
      </Grid>
      <Divider />
      {
        showOrderId &&
        <Typography variant='body1'>
          order id: {order._id}
        </Typography>
      }
      {
        showRestDetails && rest.data &&
        <>
          <Typography variant='body1'>
            {rest.data.profile.phone}
          </Typography>
          <Typography variant='body1'>
            {rest.data.location.primaryAddr}
          </Typography>
        </>
      }
      <div className={classes.padding}>
        <Typography variant='h6'>
          {order.rest.restName}
        </Typography>
        <Typography variant='body1' className={classes.savings}>
        {order.costs.discount?.percentOff && <b>{order.costs.discount.percentOff}% sale, </b>}<b>Saving ${savings}</b>
        </Typography>
        {order.rest.meals.map(m => (
          <div key={OrderMeal.getKey(m)} className={classes.row}>
            <CartMealGroup
              disableEditing
              m={m}
              percentDiscount={order.costs.discount?.percentOff || undefined}
            />
          </div>
        ))}
      </div>
    </Paper>
  )
}

export default OrderOverview;
