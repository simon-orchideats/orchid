import { makeStyles, IconButton, useTheme, Typography } from "@material-ui/core";
import { DeliveryInput } from "../../../order/deliveryModel";
import CartMealGroup from "../../order/CartMealGroup";
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import React from "react";
import moment from "moment";
import { ConsumerPlan } from "../../../consumer/consumerModel";
import { useMoveMealToNewDeliveryInCart } from "../../global/state/cartState";

const useStyles = makeStyles(theme => ({
  col: {
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    minWidth: 300
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  colHeader: {
    paddingBottom: theme.spacing(3),
  },
  emptyDelivery: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const ScheduleDeliveries: React.FC<{
  deliveries: DeliveryInput[]
}> = ({
  deliveries,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const moveMealToNewDelivery = useMoveMealToNewDeliveryInCart();
  return (
    <>
      {deliveries.map((d, i) => (
        <div
          className={classes.col}
          style={{
            borderLeft: i === 0 ? 0 : `1px solid ${theme.palette.divider}`,
          }}>
          <Typography variant='h6' className={classes.colHeader}>
            {moment(d.DeliveryDate).format('ddd M/D')}, {ConsumerPlan.getDeliveryTimeStr(d.DeliveryTime)}
          </Typography>
          {
          d.Meals.length === 0 ?
            <Typography
              align='center'
              variant='body1'
              className={classes.emptyDelivery}
            >
              This is an empty delivery. Orchid will still prefer this time when scheduling future orders for you
            </Typography>
          :
            d.Meals.map(m => (
              <div key={m.MealId} className={classes.row}>
                {
                  i !== 0 &&
                  <IconButton onClick={() => {
                    moveMealToNewDelivery(m, i, i - 1)
                  }}>
                    <KeyboardArrowLeftIcon />
                  </IconButton>
                }
                <CartMealGroup
                  mealId={m.MealId}
                  name={m.Name}
                  img={m.Img}
                  quantity={m.Quantity}
                />
                {
                  i !== deliveries.length - 1 &&
                  <IconButton onClick={() => {
                    moveMealToNewDelivery(m, i, i + 1)
                  }}>
                    <KeyboardArrowRightIcon />
                  </IconButton>
                }
              </div>
            ))
          }
        </div>
      ))}
    </>
  )
}

export default ScheduleDeliveries;
