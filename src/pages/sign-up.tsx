import { makeStyles, Typography, Button, TextField, Paper } from "@material-ui/core";
import Faq from "../client/general/Faq";
import Router from "next/router";
import { interestedRoute } from "./interested";

const useStyles = makeStyles(theme => ({
  container: {
    backgroundImage: `url(sign-up/carrots.jpg)`,
    backgroundPosition: '50% 75%',
    backgroundSize: 'cover',
    height: 500,
    marginTop: -theme.mixins.navbar.marginBottom,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paper: {
    width: 500,
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
  },
  bottomPadding: {
    paddingBottom: theme.spacing(2),
  },
}));

const signUp = () => {
  const classes = useStyles();
  const onNext = () => {
    console.log('yo');
    Router.push(interestedRoute);
  }
  return (
    <>
      <div className={classes.container}>
        <Paper className={classes.paper} elevation={0}>
          <Typography
            variant='h4'
            color='primary'
            className={classes.bottomPadding}
          >
            Sign up
          </Typography>
          <TextField
            label='Email'
            variant='outlined'
            size='small'
            fullWidth
            className={classes.bottomPadding}
          />
          <Button
            variant='contained'
            color='primary'
            fullWidth
            onClick={onNext}
          >
            Next
          </Button>
        </Paper>
      </div>
      <Faq />
    </>
  )
}

export default signUp;

export const signUpRoute = '/sign-up';