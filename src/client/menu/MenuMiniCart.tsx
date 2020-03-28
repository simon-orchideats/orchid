import { makeStyles, Typography, Button } from "@material-ui/core";
import MenuCart from "./MenuCart";
import Counter from "./Counter";

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
    width: '100%'
  },
  heart: {
    height: 24,
  },
}));

const MenuMiniCart: React.FC<{ hideNext?: boolean }> = ({ hideNext = false }) => {
  const classes = useStyles();
  if (hideNext) return null;
  return (
    <MenuCart
      render={(
      cart,
      disabled,
      onNext,
      _rest,
      suggestion,
      donationCount,
      incrementDonationCount,
      decrementDonationCount,
      addDonationDisabled,
    ) => (
      <div className={classes.container}>
        <Counter
          subtractDisabled={!donationCount}
          onClickSubtract={decrementDonationCount}
          subractIcon={
            donationCount ?
            <img src='menu/heartMinus.png' className={classes.heart} alt='heart' />
            :
            <img src='menu/heartMinusDisabled.png' className={classes.heart} alt='heart' />
          }
          chipLabel={donationCount}
          chipDisabled={!donationCount}
          addDisabled={addDonationDisabled}
          onClickAdd={incrementDonationCount}
          addIcon={
            addDonationDisabled ?
            <img src='menu/heartPlusDisabled.png' className={classes.heart} alt='heart' />
            :
            <img src='menu/heartPlus.png' className={classes.heart} alt='heart' />
          }
        />
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