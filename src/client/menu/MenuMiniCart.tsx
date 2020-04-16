import { makeStyles, Typography, Button, IconButton, Popover, Paper } from "@material-ui/core";
import MenuCart from "./MenuCart";
import Counter from "./Counter";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { useState } from "react";
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
  popper: {
    width: 300,
    padding: theme.spacing(2),
  },
  icon: {
    paddingLeft: 0,
  }
}));

const MenuMiniCart: React.FC<{ hideNext?: boolean }> = ({ hideNext = false }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleHelp = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const isHelperOpen = Boolean(anchorEl);
  if (hideNext) return null;
  return (
    <MenuCart
      render={(
      cart,
      disabled,
      onNext,
      suggestions,
      _summary,
      donationCount,
      incrementDonationCount,
      decrementDonationCount,
    ) => (
      <div className={classes.container}>
        <Popover
          open={isHelperOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)} 
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
              Orchid matches every donation you make from your meal plan. So if you choose the 12 meal plan and
              donate 3 meals, we'll deliver 9 meals to you and 3 meals to a NYC hospital. We'll donate another
              3 meals on us so we can all help our heros on the frontline.
            </Typography>
          </Paper>
        </Popover>
        <IconButton
          color='primary'
          onClick={handleHelp}
          className={classes.icon}
        >
          <HelpOutlineIcon />
        </IconButton>
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
          onClickAdd={incrementDonationCount}
          addIcon={<img src='menu/heartPlus.png' className={classes.heart} alt='heart' />}
        />
        {/* left off here: make this mobile friendly */}
        {(!cart || !cart.Zip) && (
          <Typography variant='body1' className={classes.suggestion}>
            Enter zip to continue
          </Typography>
        )}
        {cart && cart.Zip && suggestions.map(suggestion => 
          <Typography variant='body1' className={classes.suggestion}>
            {suggestion}
          </Typography>
        )}
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