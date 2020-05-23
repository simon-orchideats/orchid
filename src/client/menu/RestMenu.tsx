import React from 'react';
import { makeStyles, Typography, Grid, Paper } from "@material-ui/core";
import { Rest } from "../../rest/restModel";
import MenuMeal from "./MenuMeal";
import { DeliveryMeal } from '../../order/deliveryModel';
import { CuisineType } from '../../consumer/consumerModel';
import { Meal } from '../../rest/mealModel';

const useStyles = makeStyles(theme => ({
  summary: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: 4,
    paddingRight: 4,
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(3),
    },
  },
  paper: {
    marginTop: theme.spacing(2),
  },
  meals: {
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(1, 3, 3),
    },
  },
}));

const isMealInFilter = (meal: Meal, cuisines: CuisineType[]) => {
  let mealIsInCuisineFilter = false;
  for (let i = 0; i < cuisines.length; i++) {
    for (let j = 0; j < meal.Tags.length; j++) {
      if (meal.Tags[j] === cuisines[i]) {
        mealIsInCuisineFilter = true;
        break;
      }
      if (mealIsInCuisineFilter) {
        break;
      }
    }
  }
  return mealIsInCuisineFilter;
}

const RestMenu: React.FC<{
  cartMeals?: DeliveryMeal[],
  cuisinesFilter: CuisineType[],
  rest: Rest
}> = ({
  cartMeals,
  cuisinesFilter,
  rest
}) => {
  const classes = useStyles();
  const meals = rest.Menu.map(meal => {
    const isInFilter = isMealInFilter(meal, cuisinesFilter);
    if (!isInFilter) return null;
    let count = 0;
    if (cartMeals) {
      const index = cartMeals.findIndex(cartMeal => cartMeal.MealId === meal.Id);
      if (index >= 0) count = cartMeals[index].Quantity;
    }
    return (
      <Grid
        item
        key={meal.Id}
        xs={4}
        sm={4}
      >
        <MenuMeal
          restId={rest.Id}
          restName={rest.Profile.Name}
          meal={meal} 
          count={count}
          taxRate={rest.TaxRate}
        />
      </Grid>
    )
  });
  if (meals.every(m => m === null)) return null;
  return (
    <Paper className={classes.paper}>
      <div className={classes.summary}>
        <Typography variant='h4'>
          {rest.Profile.Name}
        </Typography>
        <Typography variant='subtitle1' color='textSecondary'>
          {`${rest.Location.Address.Address1}, ${rest.Location.Address.City}`}
        </Typography>
      </div>
      <Grid container className={classes.meals}>
        {meals}
      </Grid>
    </Paper>
  )
}

export default React.memo(RestMenu, (prevProps, nextProps) => {
  if (prevProps.rest.Id !== nextProps.rest.Id) return false;
  const prevRestMeals = prevProps.rest.Menu.map(meal => 
    isMealInFilter(meal, prevProps.cuisinesFilter) ? meal.Id : null,
  ).sort();
  const nextRestMeals = nextProps.rest.Menu.map(meal =>
    isMealInFilter(meal, nextProps.cuisinesFilter) ? meal.Id : null,
  ).sort();
  const areEqual = prevRestMeals.length === nextRestMeals.length
    && prevRestMeals.every((mealId, index) => mealId === nextRestMeals[index]);
  if (!areEqual) return false;
  const prevCartMeals = prevProps.cartMeals;
  const nextCartMeals = nextProps.cartMeals;
  if (!prevCartMeals && !nextCartMeals) return true;
  if (!prevCartMeals && nextCartMeals) return false;
  if (prevCartMeals && !nextCartMeals) return false;
  // should not happen, but added to make typescript happy
  if (!prevCartMeals || !nextCartMeals) return false;
  for (let i = 0; i < prevCartMeals.length; i++) {
    for (let j = 0; j < prevRestMeals.length; j++) {
      const mealInNextCart = nextCartMeals.find(deliveryMeal => prevRestMeals.includes(deliveryMeal.MealId));
      if (prevCartMeals[i].MealId === prevRestMeals[j]) {
        if (!mealInNextCart || mealInNextCart.Quantity < prevCartMeals[i].Quantity || mealInNextCart.Quantity > prevCartMeals[i].Quantity) {
          return false;
        }
      } else {
        if (mealInNextCart) {
          return false;
        }
      }
    }
  }
  for (let i = 0; i < prevCartMeals.length; i++) {
    if (!nextCartMeals.find(m => m.equals(prevCartMeals[i]))) return false;
  }
  return true;
});
