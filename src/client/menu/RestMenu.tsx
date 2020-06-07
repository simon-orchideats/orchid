import React from 'react';
import { makeStyles, Typography, Grid, Paper } from "@material-ui/core";
import { Rest } from "../../rest/restModel";
import MenuMeal from "./MenuMeal";
import { Meal } from '../../rest/mealModel';
import { TagTypes } from '../../rest/tagModel';

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

const isMealInFilter = (meal: Meal, cuisines: string[]) => {
  let mealIsInCuisineFilter = false;
  for (let i = 0; i < cuisines.length; i++) {
    for (let j = 0; j < meal.Tags.length; j++) {
      const tag = meal.Tags[j];
      if (tag.Type === TagTypes.Cuisine && tag.Name === cuisines[i]) {
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
  cuisinesFilter: string[],
  rest: Rest
}> = ({
  cuisinesFilter,
  rest
}) => {
  const classes = useStyles();
  const meals = rest.Menu.map(meal => {
    const isInFilter = isMealInFilter(meal, cuisinesFilter);
    if (!isInFilter) return null;
    if (!meal.isActive) return null;
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
  return true;
});
