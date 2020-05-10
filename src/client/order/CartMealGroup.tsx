import { makeStyles, Typography, Grid, Button } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { Variant } from "@material-ui/core/styles/createTypography";

const useStyles = makeStyles(theme => ({
  group: ({ img }: { img?: string }) => ({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: img ? theme.spacing(2) : 0,
  }),
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
  onRemoveMeal?: () => void,
  textSize?: Variant,
}> = ({
  mealId,
  name,
  img,
  quantity,
  onAddMeal,
  onRemoveMeal,
  textSize,
 }) => {
  const classes = useStyles({ img });
  const imgCol = 4;
  const nameCol: 7 | 11 = img ? 7 as 7: 7 + imgCol as 7 | 11;
  return (
    <Grid container key={mealId} className={classes.group} wrap='nowrap'>
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
      {
        img &&
        <Grid item sm={imgCol}>
          <img
            src={img}
            alt={img}
            className={classes.img}
          />
        </Grid>
      }
      <Grid item sm={nameCol}>
        <Typography variant={textSize || 'subtitle1'}>
          {name.toUpperCase()}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default CartMealGroup;