import { Card, CardMedia, CardContent, Typography, makeStyles, Grid, Button, Container, Chip } from "@material-ui/core";
import AddIcon from '@material-ui/icons/add';
import RemoveIcon from '@material-ui/icons/remove';
import { CSSProperties } from "@material-ui/styles";
import { useState } from "react";
import { useAddMealToCart, useGetCart, useRemoveMealFromCart } from "../client/global/state/cart/cartState";
import { Meal } from "../rest/mealModel";
import withApollo from "../client/utils/withPageApollo";
import { Cart } from "../cart/cartModel";
import { useGetNearbyRests, useGetRest } from "../rest/restService";
import { Rest } from "../rest/restModel";

const useMenuItemStyles = makeStyles(theme => ({
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  scaler: {
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
  },
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  actionBar: {
    display: 'flex',
  },
  minusButton: {
    backgroundColor: `${theme.palette.grey[600]}`,
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
    },
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
    },
  },
  button: {
    flex: 0.15,
    boxShadow: 'none',
    color: `${theme.palette.common.white} !important`,
    minWidth: theme.spacing(4),
  },
  chip: {
    flex: 1,
    fontSize: '1.2rem',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  disabledChip: {
    color: theme.palette.text.disabled,
  }
}));

const MenuItem: React.FC<{
  meal: Meal,
  restId: string,
}> = ({
  meal,
  restId
}) => {
  const classes = useMenuItemStyles();
  const [count, updateCount] = useState(0);
  const addMealToCart = useAddMealToCart();
  const removeMealFromCart = useRemoveMealFromCart();
  const onAddMeal = () => {
    updateCount(count + 1);
    addMealToCart(new Meal(meal), restId);
  }
  const onRemoveMeal = () => {
    updateCount(count - 1);
    removeMealFromCart(meal.Id);
  }
  return (
    <Card elevation={0} className={classes.card}>
      <div className={classes.scaler}>
        <CardMedia
          className={classes.img}
          image={meal.Img}
          title={meal.Img}
        />
      </div>
      <CardContent>
        <div className={classes.actionBar}>
          <Button
            size='small'
            variant='contained'
            disabled={!count}
            className={`${classes.button} ${classes.minusButton}`}
            onClick={() => onRemoveMeal()}
          >
            <RemoveIcon />
          </Button>
          <Chip
            className={classes.chip}
            disabled={!count}
            label={count}
            variant='outlined'
            classes={{
              disabled: classes.disabledChip
            }}
          />
          <Button
            size='small'
            variant='contained'
            color='primary'
            className={classes.button}
            onClick={() => onAddMeal()}
          >
            <AddIcon />
          </Button>
        </div>
        <Typography gutterBottom variant='subtitle1'>
          {meal.Name.toUpperCase()}
        </Typography>
      </CardContent>
    </Card>
  )
}

const useRestMenuStyles = makeStyles(theme => ({
  restTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
  },
}))

const RestMenu: React.FC<{
  rest: Rest
}> = ({
  rest,
}) => {
  const classes = useRestMenuStyles();
  return (
    <>
      <Typography variant='h4' className={classes.restTitle}>
        {rest.Profile.Name}
      </Typography>
      <Grid container>
        {rest.Menu.map(meal => (
          <Grid
            item
            key={meal.Id}
            xs={6}
            sm={4}
            md={3}
          >
            <MenuItem restId={rest.Id} meal={meal} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

const useSideCartStyles = makeStyles(theme => ({
  group: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
  },
  img: {
    width: 50,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  title: {
    paddingBottom: theme.spacing(1)
  }
}));

const SideCart: React.FC<{
  cart: Cart | null
}> = ({
  cart
}) => {
  const classes = useSideCartStyles();
  const rest = useGetRest(cart ? cart.RestId : null);
  type mealGroup = {
    count: number,
    meal: Meal,
  }
  const groupedMeals = cart && cart.Meals.reduce<mealGroup[]>((groupings, meal) => {
    const groupIndex = groupings.findIndex(group => group.meal.Id === meal.Id);
    if (groupIndex === -1) {
      groupings.push({
        count: 1,
        meal,
      })
    } else {
      groupings[groupIndex].count++;
    }
    return groupings;
  }, []);
  return (
    <>
      <Typography
        variant='h6'
        color='primary'
        className={classes.title}
      >
        {rest.data ? `Meals from ${rest.data.Profile.Name}` : 'Your meals'}
      </Typography>
      {groupedMeals && groupedMeals.map(mealGroup => (
        <div key={mealGroup.meal.Id} className={classes.group}>
          <Typography variant='body1'>
            {mealGroup.count}
          </Typography>
          <img
            src={mealGroup.meal.Img}
            alt={mealGroup.meal.Img}
            className={classes.img}
          />
          <Typography variant='subtitle1'>
            {mealGroup.meal.Name.toUpperCase()}
          </Typography>
        </div>
      ))}
    </>
  )
}

const useMenuStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
    height: `calc(100vh - ${theme.mixins.toolbar.height}px)`,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarLandscapeQuery]! as CSSProperties).height}px)`
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarWidthQuery]! as CSSProperties).height}px)`
    }
  },
  gridContainer: {
    height: '100%'
  },
  menu: {
    paddingLeft: theme.spacing(1),
    height: '100%',
    overflowY: 'scroll',
  },
  cart: {
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
}));

const menu = () => {
  const classes = useMenuStyles();
  const cart = useGetCart();
  const rests = useGetNearbyRests('12345');
  return (
    <Container
      maxWidth='lg'
      disableGutters
      className={classes.container}
    >
      <Grid
        container
        alignItems='stretch'
        className={classes.gridContainer}
      >
        <Grid
          item
          xs={9}
          className={classes.menu}
        >
          {rests && rests.data && rests.data.map(rest => <RestMenu key={rest.Id} rest={rest} />)}
        </Grid>
        <Grid
          item
          xs={3}
          className={classes.cart}
        >
          <SideCart cart={cart} />
        </Grid>
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = 'menu';