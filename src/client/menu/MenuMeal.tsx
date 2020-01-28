import { Meal } from "../../rest/mealModel";
import { useGetCart, useAddMealToCart, useRemoveMealFromCart } from "../global/state/cartState";
import { makeStyles, Card, CardMedia, CardContent, Button, Chip, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { useState } from "react";

const useStyles = makeStyles(theme => ({
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

const MenuMeal: React.FC<{
  meal: Meal,
  restId: string,
}> = ({
  meal,
  restId
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const cartMeal = cart && cart.Meals.filter(m => m.Id === meal.Id);
  const defaultCount = cartMeal ? cartMeal.length : 0;
  const [count, updateCount] = useState(defaultCount);
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
            disabled={cart && cart.RestId ? cart.RestId !== restId : false}
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

export default MenuMeal;