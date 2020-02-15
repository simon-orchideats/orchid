import { makeStyles, Typography, Grid } from "@material-ui/core";
import { CartMealInput } from "../../order/cartModel";

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
}));

const CartMealGroup: React.FC<{
  mealGroup: CartMealInput
}> = ({ mealGroup }) => {
  const classes = useStyles();
  return (
    <Grid container key={mealGroup.MealId} className={classes.group}>
      <Grid item sm={1}>
        <Typography variant='body1'>
          {mealGroup.Quantity}
        </Typography>
      </Grid>
      <Grid item sm={4}>
        <img
          src={mealGroup.Img}
          alt={mealGroup.Img}
          className={classes.img}
        />
      </Grid>
      <Grid item sm={7}>
        <Typography variant='subtitle1'>
          {mealGroup.Name.toUpperCase()}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default CartMealGroup;