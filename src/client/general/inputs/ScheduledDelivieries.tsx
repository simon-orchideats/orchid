import { makeStyles, IconButton, useTheme, Typography } from "@material-ui/core";
import { DeliveryInput, Delivery, DeliveryMeal } from "../../../order/deliveryModel";
import CartMealGroup from "../../order/CartMealGroup";
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import React from "react";
import moment from "moment";
import { ConsumerPlan } from "../../../consumer/consumerModel";
import { useMoveMealToNewDeliveryInCart } from "../../global/state/cartState";
import { RestMeals } from "../../../order/cartModel";
import { MIN_MEALS } from "../../../plan/planModel";

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
  },
  colHeader: {
    paddingBottom: theme.spacing(2),
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
  },
  fullWidth: {
    width: '100%',
  }
}));

const ScheduleDeliveries: React.FC<{
  deliveries: Array<DeliveryInput | Delivery>
  editable?: boolean
  onChange?: (hasError: boolean) => void
}> = ({
  deliveries,
  editable = false,
  onChange,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const restMealsPerDelivery: RestMeals[] = deliveries.map(deliveryInput => deliveryInput.meals.reduce<RestMeals>((groupings, meal) => {
    const restMeals = groupings[meal.RestId];
    if (restMeals) {
      const mealIndex = restMeals.meals.findIndex(m => m.MealId === meal.MealId);
      if (mealIndex === -1) {
        restMeals.mealCount += meal.Quantity;
        restMeals.meals.push(meal);
      } else {
        restMeals.mealCount += meal.Quantity;
        restMeals.meals[mealIndex] = new DeliveryMeal({
          ...restMeals.meals[mealIndex],
          quantity: restMeals.meals[mealIndex].Quantity + meal.Quantity,
        })
      }
    } else {
      groupings[meal.RestId] = {
        mealCount: meal.Quantity,
        meals: [meal]
      };
    }
    return groupings;
  }, {}));
  const moveMeal = (meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number) => {
    moveMealToNewDelivery(
      meal,
      fromDeliveryIndex,
      toDeliveryIndex
    );
    if (onChange) {
      const toDestination = restMealsPerDelivery[toDeliveryIndex][meal.RestId];
      if (restMealsPerDelivery[fromDeliveryIndex][meal.RestId].mealCount < 4) {
        onChange(false);
      } else if (toDestination && toDestination.mealCount < 4) {
        onChange(false);
      } else {
        onChange(true);
      }
    }
  }
  const moveMealToNewDelivery = useMoveMealToNewDeliveryInCart();
  return (
    <>
      {deliveries.map((d, deliveryIndex) => (
        <div
          className={classes.col}
          style={{
            borderLeft: deliveryIndex === 0 ? 0 : `1px solid ${theme.palette.divider}`,
          }}>
          <div className={classes.colHeader}>
            <Typography variant='h6'>
              {moment(d.DeliveryDate).format('ddd M/D')}, {ConsumerPlan.getDeliveryTimeStr(d.DeliveryTime)}
            </Typography>
            {
              'Status' in d && d.Status !== 'Open' &&
              <Typography variant='body1' align='center'>
                (Delivery {d.Status.toLowerCase()})
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
              Orchid will ignore this empty delivery for this week, but we will still attempt to use this time when
              scheduling future orders for you
            </Typography>
          :
            Object.values(restMealsPerDelivery[deliveryIndex]).map(restMeal => (
              <div
                className={classes.fullWidth}
                style={{
                  opacity: ('Status' in d && d.Status !== 'Open') ? 0.30 : 1
                }}
              >
                <Typography variant='subtitle1' className={`${classes.row} ${classes.paddingBottom}`}>
                  {restMeal.meals[0].RestName}
                </Typography>
                {
                  restMeal.mealCount < MIN_MEALS &&
                  <Typography
                    variant='body1'
                    className={`${classes.orange} ${classes.paddingBottom}`}
                    align='center'
                  >
                    Minimum {MIN_MEALS} meals per restaurant
                  </Typography>
                }
                {restMeal.meals.map(m => (
                  <div key={m.MealId} className={classes.row}>
                    {
                      deliveryIndex !== 0 && editable &&
                      <IconButton onClick={() => moveMeal(m, deliveryIndex, deliveryIndex - 1)}>
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
                      deliveryIndex !== deliveries.length - 1 && editable &&
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
    </>
  )
}

export default ScheduleDeliveries;
