import React from 'react';
import { makeStyles, Typography, Grid, Paper } from "@material-ui/core";
import { Rest } from "../../rest/restModel";
import MenuMeal from "./MenuMeal";
import { DeliveryMeal } from '../../order/deliveryModel';

const useStyles = makeStyles(theme => ({
  summary: {
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  paper: {
    marginTop: theme.spacing(2),
  },
  meals: {
    padding: theme.spacing(1, 3, 3),
  },
}))

const RestMenu: React.FC<{
  cartMeals?: DeliveryMeal[]
  rest: Rest
}> = ({
  cartMeals,
  rest
}) => {
  const classes = useStyles();
  const meals = rest.Menu.map(meal => {
    let count = 0;
    if (cartMeals) {
      const index = cartMeals.findIndex(cartMeal => cartMeal.MealId === meal.Id);
      if (index >= 0) count = cartMeals[index].Quantity;
    }
    return (
      <Grid
        item
        key={meal.Id}
        xs={6}
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
  })
  return (
    <Paper className={classes.paper}>
      <div className={classes.summary}>
        <Typography variant='h4'>
          {rest.Profile.Name}
        </Typography>
        <Typography variant='subtitle1' color='textSecondary'>
          {rest.Location.Address.getAddrStr()}
        </Typography>
        <Typography variant='subtitle1' color='textSecondary'>
          {rest.Profile.Phone}
        </Typography>
      </div>
      <Grid container className={classes.meals}>
        {meals}
      </Grid>
    </Paper>
  )
}

export default React.memo(RestMenu, (prevProps, nextProps) => {
  if (prevProps.rest === nextProps.rest) {
    const prevCartMeals = prevProps.cartMeals;
    const nextCartMeals = nextProps.cartMeals;
    if (!prevCartMeals && !nextCartMeals) return true;
    if (!prevCartMeals && nextCartMeals) return false;
    if (prevCartMeals && !nextCartMeals) return false;
    // should not happen, but added to make typescript happy
    if (!prevCartMeals || !nextCartMeals) return false;

    if (prevCartMeals.length === 0 && nextCartMeals.length === 0) return true;
    if (prevCartMeals.length !== nextCartMeals.length) return false;
    for (let i = 0; i < prevCartMeals.length; i++) {
      if (!nextCartMeals.find(m => m.equals(prevCartMeals[i]))) return false;
    }
  }
  return false;
});
