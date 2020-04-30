import { makeStyles, Typography, Grid } from "@material-ui/core";

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
  mealId: string,
  name: string,
  img?: string,
  quantity: number,
}> = ({
  mealId,
  name,
  img,
  quantity,
 }) => {
  const classes = useStyles();
  return (
    <Grid container key={mealId} className={classes.group}>
      <Grid item sm={1}>
        <Typography variant='body1'>
          {quantity}
        </Typography>
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