import { Card, CardMedia, CardContent, Typography, makeStyles, Grid, Button, Container, Chip } from "@material-ui/core";
import AddIcon from '@material-ui/icons/add';
import RemoveIcon from '@material-ui/icons/remove';
import { CSSProperties } from "@material-ui/styles";
import { useState } from "react";
import { useAddMealToCart, useGetCart } from "../client/global/state/cart/cartState";
import { Meal, IMeal } from "../meal/mealModel";
import withApollo from "../client/utils/withPageApollo";

const useStyles = makeStyles(theme => ({
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
  scaler: {
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
  },
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionBar: {
    display: 'flex',
  },
  restTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
  },
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    height: '100%'
  },
  cart: {
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(3),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  menu: {
    paddingLeft: theme.spacing(1),
    height: '100%',
    overflowY: 'scroll',
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
}))

const MenuItem: React.FC<IMeal> = ({
  _id,
  img,
  name,
}) => {
  const classes = useStyles();
  const [count, updateCount] = useState(0);
  const addMealToCart = useAddMealToCart();
  const onAddMeal = () => {
    updateCount(count + 1);
    addMealToCart(new Meal({
      _id,
      img,
      name,
    }));
  }
  return (
    <Grid item xs={6} sm={4} md={3}>
      <Card elevation={0} className={classes.card}>
        <div className={classes.scaler}>
          <CardMedia
            className={classes.img}
            image={img}
            title={img}
          />
        </div>
        <CardContent>
          <div className={classes.actionBar}>
            <Button
              size='small'
              variant='contained'
              disabled={!count}
              className={`${classes.button} ${classes.minusButton}`}
              onClick={() => updateCount(count - 1)}
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
            {name.toUpperCase()}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}

const PlanMenu: React.FC = () => {
  return (
    <Grid container>
      <MenuItem
        _id='1'
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        _id='2'
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        _id='3'
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        _id='4'
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        _id='5'
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        _id='6'
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        _id='7'
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
    </Grid>
  )
}

const RestMenu: React.FC<{
  name: string,
}> = ({
  name
}) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant='h4' className={classes.restTitle}>
        {name}
      </Typography>
      <PlanMenu />
    </>
  )
}

const menu = () => {
  const classes = useStyles();
  const cart = useGetCart();
  return (
    <Container maxWidth='lg' disableGutters className={classes.container}>
      <Grid container alignItems='stretch' className={classes.gridContainer}>
        <Grid item xs={9} className={classes.menu}>
          <RestMenu name='Domo' />
          <RestMenu name='Bar and grille' />
          <RestMenu name='Kingstons' />
        </Grid>
        <Grid item xs={3} className={classes.cart}>
          <Typography variant='h6'>
            Your meals
          </Typography>
          {cart && cart.Meals.map((meal, index) => (
            <Typography key={index}>
              {meal.Name}
            </Typography>
          ))}
        </Grid>
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = 'menu';