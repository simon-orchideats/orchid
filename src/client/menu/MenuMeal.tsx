import React from 'react';
import { Meal } from "../../rest/mealModel";
import { useAddMealToCart, useRemoveMealFromCart } from "../global/state/cartState";
import { makeStyles, Card, CardMedia, CardContent, Typography } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { useState } from "react";
import Counter from './Counter';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  content: {
    paddingRight: 0,
    paddingLeft: 0,
  },
  scaler: ({ meal }: { meal: Meal }) => ({
    width: '100%',
    paddingBottom: meal.Img ? '100%' : undefined,
    paddingTop: meal.Img ? undefined : '100%',
    position: 'relative',
  }),
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  actionBar: {
    display: 'flex',
    marginBottom: theme.spacing(1),
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
  title: {
    lineHeight: 1.5
  },
  originalPrice: {
    color: theme.palette.primary.main
  },
  button: {
    borderRadius: 10,
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
  defaultCount: number
  meal: Meal,
  restId: string,
  restName: string,
}> = ({
  defaultCount,
  meal,
  restId,
  restName
}) => {
  const classes = useStyles({ meal });
  const [count, updateCount] = useState(defaultCount);
  const addMealToCart = useAddMealToCart();
  const removeMealFromCart = useRemoveMealFromCart();
  const onAddMeal = () => {
    updateCount(count + 1);
    addMealToCart(new Meal(meal), restId, restName);
  }
  const onRemoveMeal = () => {
    updateCount(count - 1);
    removeMealFromCart(restId, meal.Id);
  }
  return (
    <Card elevation={0} className={classes.card}>
      <div className={classes.scaler}>
        {
          meal.Img ?
          <CardMedia
            className={classes.img}
            image={meal.Img}
            title={meal.Img}
          />
          :
          <Typography>
            No picture
          </Typography>
        }
      </div>
      <CardContent className={classes.content}>
        <div className={classes.actionBar}>
          <Counter
            subtractDisabled={!count}
            onClickSubtract={onRemoveMeal}
            subtractButtonProps={{
              variant: 'contained',
              className: `${classes.button} ${classes.minusButton}`
            }}
            subractIcon={<RemoveIcon />}
            chipLabel={count}
            chipDisabled={!count}
            onClickAdd={onAddMeal}
            addIcon={<AddIcon />}
            addButtonProps={{
              variant: 'contained',
              color: 'primary',
              className: classes.button
            }}
          />
        </div>
        <Typography
          gutterBottom
          variant='subtitle1'
          className={classes.title}
        >
          {meal.Name.toUpperCase()}
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          {meal.Description}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default React.memo(MenuMeal);