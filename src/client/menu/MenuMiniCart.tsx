import { makeStyles, Typography, Button } from "@material-ui/core";
import MenuCart from "./MenuCart";

const useStyles = makeStyles(theme => ({
  suggestion: {
    color: theme.palette.warning.main,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const MenuMiniCart: React.FC<{ hideNext?: boolean }> = ({ hideNext = false }) => {
  const classes = useStyles();
  if (hideNext) return null;
  return (
    <MenuCart
      render={(
      cart,
      _sortedPlans,
      disabled,
      onNext,
      _rest,
      suggestion
    ) => (
      <div className={classes.container}>
        <Typography variant='body1' className={classes.suggestion}>
          {cart && cart.Zip ? suggestion : 'Enter zip to continue'}
        </Typography>
        <Button
          disabled={disabled}
          variant='contained'
          color='primary'
          className={classes.button}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    )} />
  )
}

export default MenuMiniCart;