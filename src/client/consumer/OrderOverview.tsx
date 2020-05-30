import { makeStyles, Typography, Paper, Divider, Popover, Grid } from "@material-ui/core";
import { useState } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Order } from "../../order/orderModel";
import { Destination } from "../../place/destinationModel";
import moment from "moment";
import { Consumer } from "../../consumer/consumerModel";

const useStyles = makeStyles(theme => ({
  paddingTop: {
    paddingTop: theme.spacing(2)
  },
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
  referralRow: {
    display: 'flex',
    alignItems: 'center'
  },
  deliverTo: {
    display: 'flex',
  },
  hint: {
    color: theme.palette.text.hint
  },
  link: {
    color: theme.palette.common.link,
    cursor: 'pointer',
  },
  popover: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

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

const OrderOverview: React.FC<{
  consumer: Consumer,
  order: Order,
  action: React.ReactNode,
  scheduleDeliveries: React.ReactNode,
}> = ({
  consumer,
  order,
  action,
  scheduleDeliveries,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const onClickDestination = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const start = moment(order.InvoiceDate).subtract(1, 'w');
  const open = !!anchorEl;
  return (
    <Paper className={classes.marginBottom}>
      <DestinationPopper
        destination={order.Destination}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        name={consumer.Profile.Name}
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
          sm={order.isAutoGenerated ? 6 : 12}
          md={5}
        > 
          <Grid item xs={12}>
            <Typography variant='subtitle1'>
              {`Total for ${start.format('M/D/YY')} - ${moment(order.InvoiceDate).format('M/D/YY')}`}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body1'>
              {
                order.Costs.MealPrices.length > 0 ?
                order.Costs.MealPrices.map(mp => (
                  `${Order.getMealCount(order, mp.PlanName)} meals`
                ))
                :
                '0 meals'
              }
            </Typography>
            <Typography variant='body1'>
              Tax
            </Typography>
            <Typography variant='body1'>
              Delivery
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body1' className={classes.cost}>
              {
                order.Costs.MealPrices.length > 0 ?
                order.Costs.MealPrices.map(mp => (
                  `$${(mp.MealPrice / 100).toFixed(2)} ea`
                ))
                :
                '$0.00'
              }
            </Typography>
            <Typography variant='body1' className={classes.cost}>
              ${(order.Costs.Tax / 100).toFixed(2)}
            </Typography>
            <Typography variant='body1' className={classes.cost}>
              ${(order.Costs.DeliveryFee / 100).toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {
              (order.Costs.Promos.length === 1 || order.Costs.Discounts.length > 0) &&
              <Typography variant='body1' color='primary'>
                <b>Applied discounts</b>
              </Typography>
            }
            {
              order.Costs.Promos.length === 1 &&
              <Typography variant='body1' color='primary'>
                -{order.Costs.Promos[0].AmountOff && `$${(order.Costs.Promos[0].AmountOff / 100).toFixed(2)}`}
              </Typography>
            }
            { 
              order.Costs.Discounts.map((d, i) => (
                <div className={classes.referralRow} key={i}>
                  <Typography variant='body1' color='primary'>
                    -{d.AmountOff !== null && `$${(d.AmountOff / 100).toFixed(2)}`}&nbsp;
                  </Typography>
                  <Typography variant='body2' color='textSecondary'>
                    ({d.Description})
                  </Typography>
                </div>
              ))
            }
          </Grid>
        </Grid>
        {
          order.isAutoGenerated &&
          <Grid
            item
            xs={12}
            sm={6}
            md={2}
          >
            <Typography variant='subtitle1'>
              Orchid meals picked for you
            </Typography>
          </Grid>
        }
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          {
            order.Deliveries.length > 0 &&
            <>
              <Typography variant='subtitle1'>
                Deliver to
              </Typography>
              <div className={`${classes.deliverTo} ${classes.link}`} onClick={onClickDestination}>
                <Typography variant='body1'>
                  {consumer.Profile.Name}
                </Typography>
                <ExpandMoreIcon />
              </div>
            </>
          }
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          md={order.isAutoGenerated ? 2 : 4}
        >
          {action}
        </Grid>
      </Grid>
      <Divider />
      <div className={classes.paddingTop}>
        {scheduleDeliveries}
      </div>
    </Paper>
  )
}

export default OrderOverview;
