import { makeStyles, IconButton, useTheme, Typography } from "@material-ui/core";
import { DeliveryInput } from "../../../order/deliveryModel";
import CartMealGroup from "../../order/CartMealGroup";
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import React from "react";
import moment from "moment";
import { ConsumerPlan } from "../../../consumer/consumerModel";
import { useMoveMealToNewDeliveryInCart } from "../../global/state/cartState";
import { RestMeals } from "../../../order/cartModel";

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
  orange: {
    color: theme.palette.warning.main,
  },
  emptyDelivery: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(1),
  }
}));

const ScheduleDeliveries: React.FC<{
  deliveries: DeliveryInput[],
  restMeals: RestMeals[],
}> = ({
  deliveries,
  restMeals,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const moveMealToNewDelivery = useMoveMealToNewDeliveryInCart();
  return (
    <>
      {deliveries.map((d, deliveryIndex) => (
        <div
          className={classes.col}
          style={{
            borderLeft: deliveryIndex === 0 ? 0 : `1px solid ${theme.palette.divider}`,
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
              Orchid will ignore this empty delivery for this week, but we will still attempt to use this time when
              scheduling future orders for you
            </Typography>
          :
            Object.values(restMeals[deliveryIndex]).map(restMeal => (
              <>
                <Typography variant='subtitle1' className={`${classes.row} ${classes.paddingBottom}`}>
                  {restMeal.meals[0].RestName}
                </Typography>
                {
                  restMeal.mealCount < 4 &&
                  <Typography
                    variant='body1'
                    className={`${classes.orange} ${classes.paddingBottom}`}
                    align='center'
                  >
                    Minimum 4 meals per restaurant
                  </Typography>
                }
                {restMeal.meals.map(m => (
                  <div key={m.MealId} className={classes.row}>
                    {
                      deliveryIndex !== 0 &&
                      <IconButton onClick={() => {
                        moveMealToNewDelivery(m, deliveryIndex, deliveryIndex - 1)
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
                      deliveryIndex !== deliveries.length - 1 &&
                      <IconButton onClick={() => {
                        moveMealToNewDelivery(m, deliveryIndex, deliveryIndex + 1)
                      }}>
                        <KeyboardArrowRightIcon />
                      </IconButton>
                    }
                  </div>
                ))}
              </>
            ))
          }
        </div>
      ))}
    </>
  )
}

export default ScheduleDeliveries;
