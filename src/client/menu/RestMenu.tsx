import React from 'react';
import { makeStyles, Typography, Grid, Paper, Avatar } from "@material-ui/core";
import { IRest } from "../../rest/restModel";
import MenuMeal from "./MenuMeal";
import { IMeal } from '../../rest/mealModel';
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
  profile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  },
  profilePic: {
    marginRight: theme.spacing(1),
    width: 60,
    height: 60,
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

const isMealInFilter = (meal: IMeal, cuisines: string[]) => {
  let mealIsInCuisineFilter = false;
  for (let i = 0; i < cuisines.length; i++) {
    for (let j = 0; j < meal.tags.length; j++) {
      const tag = meal.tags[j];
      if (tag.type === TagTypes.Cuisine && tag.name === cuisines[i]) {
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
  rest: IRest,
}> = ({
  cuisinesFilter,
  rest,
}) => {
  const classes = useStyles();
  const meals = rest.featured.map(meal => {
    const isInFilter = isMealInFilter(meal, cuisinesFilter);
    if (!isInFilter) return null;
    if (!meal.isActive) return null;
    return (
      <Grid
        item
        key={meal._id}
        xs={4}
        sm={4}
        md={3}
      >
        <MenuMeal
          meal={meal}
          discount={rest.discount}
          deliveryFee={rest.deliveryFee}
          restId={rest._id}
          restName={rest.profile.name}
          taxRate={rest.taxRate}
        />
      </Grid>
    )
  });
  if (meals.every(m => m === null)) return null;
  return (
    <Paper className={classes.paper}>
      <div className={classes.summary}>
        <Grid
          container
          alignItems='center'
          justifyContent='space-between'
        >
            {
              rest.profile.actor ?
              <>
                <Grid
                  item
                  md={8}
                  sm={12}
                >
                  <Typography variant='h4'>
                    {rest.profile.name}
                  </Typography>
                </Grid>
                <Grid
                  item
                  md={4}
                  sm={12}
                >
                  <div className={classes.profile}>
                    <Avatar src={rest.profile.actorImg} className={classes.profilePic} />
                    <Typography variant='body1' color='textSecondary'>
                      by&nbsp;
                    </Typography>
                    <Typography variant='h6'>
                      {rest.profile.actor}
                    </Typography>
                  </div>
                </Grid>
              </>
            :
              <Grid item xs={12}>
                <Typography variant='h4'>
                  {rest.profile.name}
                </Typography>
              </Grid>
            }
          </Grid>
        <Typography
          variant='subtitle1'
          color='textSecondary'
        >
          {rest.profile.story}
        </Typography>
      </div>
      <Grid container className={classes.meals}>
        {meals}
      </Grid>
    </Paper>
  )
}

export default React.memo(RestMenu, (prevProps, nextProps) => {
  if (prevProps.rest._id !== nextProps.rest._id) return false;
  const prevRestMeals = prevProps.rest.featured.map(meal => 
    isMealInFilter(meal, prevProps.cuisinesFilter) ? meal._id : null,
  ).sort();
  const nextRestMeals = nextProps.rest.featured.map(meal =>
    isMealInFilter(meal, nextProps.cuisinesFilter) ? meal._id : null,
  ).sort();
  const areEqual = prevRestMeals.length === nextRestMeals.length
    && prevRestMeals.every((mealId, index) => mealId === nextRestMeals[index]);
  if (!areEqual) return false;
  return true;
});
