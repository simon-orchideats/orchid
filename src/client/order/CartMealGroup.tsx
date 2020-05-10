import { makeStyles, Typography, Grid, Button } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const useStyles = makeStyles(theme => ({
  group: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
  },
  img: {
    width: 55,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
}));

const CartMealGroup: React.FC<{
  mealId: string,
  name: string,
  img?: string,
  quantity: number,
  onAddMeal?: () => void,
  onRemoveMeal?: () => void
}> = ({
  mealId,
  name,
  img,
  quantity,
  onAddMeal,
  onRemoveMeal,
 }) => {
  const classes = useStyles();
  return (
    <Grid container key={mealId} className={classes.group}>
      <Grid
        item
        sm={1}
        className={classes.col}
      >
        {
          onAddMeal &&
          <Button
            size='small'
            variant='text'
            color='primary'
            onClick={onAddMeal}
          >
            <AddIcon />
          </Button>
        }
        <Typography variant='subtitle2'>
          {quantity}
        </Typography>
        {
          onRemoveMeal &&
          <Button
            size='small'
            variant='text'
            onClick={onRemoveMeal}
          >
            <RemoveIcon />
          </Button>
        }
      </Grid>
      <Grid item sm={4}>
        <img
          src={img}
          alt={img}
          className={classes.img}
        />
      </Grid>
      <Grid item sm={7}>
        <Typography variant='subtitle1'>
          {name.toUpperCase()}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default CartMealGroup;