import React, { useState } from 'react';
import { makeStyles, Typography, Grid, Paper, Avatar, Popover, Button } from "@material-ui/core";
import { IRest } from "../../rest/restModel";
import MenuMeal from "./MenuMeal";
import { useGetCart } from '../global/state/cartState';
import { ServiceTypes } from '../../order/orderModel';
import { analyticsService, events } from '../utils/analyticsService';

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
  signature: {
    padding: theme.spacing(2),
  },
  fullMenu: {
    paddingLeft: 4,
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(4),
    },
  },
}));

// const isMealInFilter = (meal: IMeal, cuisines: string[]) => {
//   return intersectionWith(meal.tags, cuisines, (t, c) => t.name === c).length > 0;
//   // let mealIsInCuisineFilter = false;
//   // for (let i = 0; i < cuisines.length; i++) {
//   //   for (let j = 0; j < meal.tags.length; j++) {
//   //     const tag = meal.tags[j];
//   //     if (tag.type === TagTypes.Cuisine && tag.name === cuisines[i]) {
//   //       mealIsInCuisineFilter = true;
//   //       break;
//   //     }
//   //     if (mealIsInCuisineFilter) {
//   //       break;
//   //     }
//   //   }
//   // }
//   // return mealIsInCuisineFilter;
// }

const RestMenu: React.FC<{
  rest: IRest,
}> = ({
  rest,
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const [descAnchor, setDescAnchor] = useState<null | HTMLElement>(null);
  const onClickContent = (event: React.MouseEvent<HTMLElement>) => {
    analyticsService.trackEvent(events.OPENED_SEE_FULL_MENU);
    setDescAnchor(descAnchor ? null : event.currentTarget);
  };
  const meals = rest.featured.map(meal => {
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
          {
            cart?.serviceType === ServiceTypes.Pickup &&
            <Grid item xs={12}>
              <Typography variant='body1'>
                {rest.location.primaryAddr}
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
      <Popover
        open={Boolean(descAnchor)}
        anchorEl={descAnchor}
        onClose={() => setDescAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper className={classes.signature}>
          <Typography variant='body1'>
            We only offer signature dishes. Full menu coming soon.
          </Typography>
        </Paper>
      </Popover>
      <Grid container className={classes.meals}>
        {meals}
      </Grid>
      <Button
        variant='text'
        onClick={e => onClickContent(e)}
        className={classes.fullMenu}
        color='inherit'
      >
        Full menu
      </Button>
    </Paper>
  )
}

export default RestMenu;

