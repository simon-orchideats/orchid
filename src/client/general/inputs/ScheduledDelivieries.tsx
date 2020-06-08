import { makeStyles, IconButton, useTheme, Typography, Button } from "@material-ui/core";
import { DeliveryInput, Delivery, DeliveryMeal } from "../../../order/deliveryModel";
import CartMealGroup from "../../order/CartMealGroup";
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import React from "react";
import { Schedule } from "../../../consumer/consumerPlanModel";
import { useMoveMealToNewDeliveryInCart } from "../../global/state/cartState";
import { Cart } from "../../../order/cartModel";
import { MIN_MEALS } from "../../../plan/planModel";

const useStyles = makeStyles(theme => ({
  col: {
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    minWidth: 300,
    maxWidth: 500,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  colHeader: {
    paddingBottom: theme.spacing(2),
    width: '100%'
  },
  orange: {
    color: theme.palette.warning.main,
  },
  emptyDelivery: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    maxWidth: 300,
  },
  paddingBottom: {
    paddingBottom: theme.spacing(1),
  },
  fullWidth: {
    width: '100%',
  },
  scheduleDeliveries: {
    minHeight: 600,
    maxHeight: 800,
    overflow: 'scroll',
    display: 'flex',
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const ScheduleDeliveries: React.FC<{
  deliveries: Array<DeliveryInput | Delivery>
  isUpdating?: boolean
  movable?: boolean
  onSkip?: (deliveryIndex: number) => void,
  setError?: (err: boolean) => void,
}> = ({
  deliveries,
  isUpdating = false,
  movable = false,
  onSkip,
  setError,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const moveMealToNewDelivery = useMoveMealToNewDeliveryInCart();
  const restMealsPerDelivery = Cart.getRestMealsPerDelivery(deliveries);
  const moveMeal = (meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number) => {
    moveMealToNewDelivery(
      meal,
      fromDeliveryIndex,
      toDeliveryIndex
    );
  }
  
  let hasError = false;
  if (setError) {
    for (let i = 0; i < deliveries.length; i++) {
      if (Cart.getNumMeals(deliveries[i].Meals) < MIN_MEALS) {
        hasError = true;
        break;
      }
      if (hasError) break;
    }
    setError(hasError);
  }
  return (
    <div className={classes.scheduleDeliveries}>
      {deliveries.map((d, deliveryIndex) => (
        <div
          key={deliveryIndex}
          className={classes.col}
          style={{
            borderLeft: deliveryIndex === 0 ? 0 : `1px solid ${theme.palette.divider}`,
            paddingRight: movable ? undefined : theme.spacing(2),
            paddingLeft: movable ? undefined : theme.spacing(2),
          }}>
          <div className={classes.colHeader}>
            <Typography variant='h6' align='center'>
              {Schedule.getDateTimeStr(d.DeliveryDate, d.DeliveryTime)}
            </Typography>
            {
              'Status' in d && d.Status === 'Open' && onSkip && !isUpdating &&
              <Button
                variant='outlined'
                color='primary'
                fullWidth
                className={classes.button}
                onClick={() => onSkip(deliveryIndex)}
              >
                Skip
              </Button>
            }
            {
              'Status' in d && d.Status !== 'Open' &&
              <Typography variant='body1' align='center'>
                (Delivery {d.Status.toLowerCase()})
              </Typography>
            }
            {
              !('Status' in d) && setError && Cart.getNumMeals(d.Meals) < MIN_MEALS &&
              <Typography
                variant='body1'
                className={`${classes.orange} ${classes.paddingBottom}`}
                align='center'
              >
                Minimum {MIN_MEALS} meals per delivery
              </Typography>
            }
          </div>
          {
            d.Meals.length === 0 ?
            <Typography
              align='center'
              variant='body1'
              className={classes.emptyDelivery}
            >
              {
                isUpdating ?
                  'Orchid will ignore this empty delivery'
                :
                  `Orchid will ignore this empty delivery for this week, but we will still attempt to use this time when
                  scheduling future orders for you`
              }
            </Typography>
          :
            Object.values(restMealsPerDelivery[deliveryIndex]).map((restMeal, rIndex) => (
              <div
                key={rIndex}
                className={classes.fullWidth}
                style={{
                  opacity: ('Status' in d && d.Status !== 'Open') ? 0.30 : 1
                }}
              >
                <Typography variant='subtitle1' className={`${classes.row} ${classes.paddingBottom}`}>
                  {restMeal.meals[0].RestName}
                </Typography>
                {restMeal.meals.map(m => (
                  <div key={m.IdKey} className={classes.row}>
                    {
                      deliveryIndex !== 0 && movable &&
                      <IconButton onClick={() => moveMeal(m, deliveryIndex, deliveryIndex - 1)}>
                        <KeyboardArrowLeftIcon />
                      </IconButton>
                    }
                    <CartMealGroup
                      choices={m.Choices}
                      name={m.Name}
                      img={m.Img}
                      quantity={m.Quantity}
                    />
                    {
                      deliveryIndex !== deliveries.length - 1 && movable &&
                      <IconButton onClick={() => moveMeal(m, deliveryIndex, deliveryIndex + 1)}>
                        <KeyboardArrowRightIcon />
                      </IconButton>
                    }
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      ))}
    </div>
  )
}

export default ScheduleDeliveries;
