import React, { useState } from 'react';
import { Meal } from "../../rest/mealModel";
import { useAddMealToCart, useRemoveMealFromCart } from "../global/state/cartState";
import { makeStyles, Card, CardMedia, CardContent, Typography, useMediaQuery, useTheme, Theme, Popover, Paper } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Counter from './Counter';
import ShortTextIcon from '@material-ui/icons/ShortText';
import AddBoxIcon from '@material-ui/icons/AddBox';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: 2,
    marginRight: 2,
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  content: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingBottom: `${theme.spacing(1)}px !important`,
    paddingTop: 4,
    [theme.breakpoints.up('md')]: {
      paddingTop: undefined,
    },
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
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
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
  imgAdd: {
    color: theme.palette.common.white
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
  popper: {
    width: 300,
    padding: theme.spacing(2),
  },
  disabledChip: {
    color: theme.palette.text.disabled,
  },
  detail: {
    fontSize: '1rem',
  }
}));

const MenuMeal: React.FC<{
  count: number,
  meal: Meal,
  restId: string,
  restName: string,
  taxRate: number,
}> = ({
  count,
  meal,
  restId,
  restName,
  taxRate
}) => {
  const theme = useTheme<Theme>();
  const classes = useStyles({ meal });
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const [descAnchor, setDescAnchor] = useState<null | HTMLElement>(null);
  const [desc, setDesc] = useState<string>();
  const onClickName = (event: React.MouseEvent<HTMLElement>, mealDesc: string) => {
    if (!isMdAndUp) {
      setDescAnchor(descAnchor ? null : event.currentTarget);
      setDesc(mealDesc || 'No description')
    }
  };
  const isDescOpen = Boolean(descAnchor);
  const addMealToCart = useAddMealToCart();
  const removeMealFromCart = useRemoveMealFromCart();
  const onAddMeal = () => {
    addMealToCart(meal.Id, new Meal(meal), restId, restName, taxRate);
  }
  const onRemoveMeal = () => {
    removeMealFromCart(restId, meal.Id);
  }
  return (
    <Card elevation={0} className={classes.card}>
      <Popover
        open={isDescOpen}
        anchorEl={descAnchor}
        onClose={() => setDescAnchor(null)} 
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Paper className={classes.popper}>
          <Typography variant='body1'>
            {desc}
          </Typography>
        </Paper>
      </Popover>
      <div className={classes.scaler} onClick={onAddMeal}>
        {
          meal.Img ?
          <CardMedia
            className={classes.img}
            image={meal.Img}
            title={meal.Img}
          >
            {!isMdAndUp && <AddBoxIcon className={classes.imgAdd} />}
          </CardMedia>
          :
          <Typography>
            No picture
          </Typography>
        }
      </div>
      <CardContent className={classes.content}>
        {
          isMdAndUp &&
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
        }
        <Typography
          gutterBottom
          variant='subtitle1'
          className={classes.title}
          onClick={e => onClickName(e, meal.Description)}
        >
          {meal.Name.toUpperCase()} {!isMdAndUp && meal.Description && <ShortTextIcon className={classes.detail} />}
        </Typography>
        {
          isMdAndUp &&
          <Typography variant='body2' color='textSecondary'>
            {meal.Description}
          </Typography>
        }
      </CardContent>
    </Card>
  )
}

export default React.memo(MenuMeal);