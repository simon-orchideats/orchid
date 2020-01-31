import { Typography, makeStyles, Grid, Container, TextField, FormControlLabel, Checkbox, MenuItem, useMediaQuery, Theme, Button } from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useGetCart } from "../client/global/state/cartState";
import withClientApollo from "../client/utils/withClientApollo";
import { isServer } from "../client/utils/isServer";
import Router from 'next/router'
import { menuRoute } from "./menu";
import StickyDrawer from "../client/reused/StickyDrawer";
import { useState } from "react";
import { state, States } from "../location/addressModel";
import { useTheme } from "@material-ui/styles";
import CardForm from "../client/checkout/CardForm";
import { StripeProvider, Elements } from "react-stripe-elements";
import { RenewalTypes, RenewalType, CuisineTypes, CuisineType } from "../consumer/consumerModel";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  inputs: {
    marginTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    background: theme.palette.background.paper
  },
  toggleButtonGroup: {
    width: '100%',
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  subtitle: {
    marginTop: -theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const checkout = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const [state, setState] = useState<state>();
  const [renewal, setRenewal] = useState<RenewalType>(RenewalTypes.Auto)
  const [oneName, setOneName] = useState<boolean>(true);
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  if (!cart && !isServer()) Router.replace(`/${menuRoute}`);
  return (
    <Container
      maxWidth='xl'
      className={classes.container}
    >
      <Grid container alignItems='stretch'>
        <Grid
          item
          sm={12}
          md={8}
          lg={9}
          className={classes.inputs}
        >
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Delivery Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label='Name'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={oneName}
                    onChange={(_, checked) => setOneName(checked)}
                    color='primary'
                  />
                }
                label='Delivery name is same as account name'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Address'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Apt, suite, floor'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='City'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label='State'
                fullWidth
                size='small'
                value={state || ''}
                onChange={e => setState(e.target.value as state)}
                variant='outlined'
              >
                {Object.values<state>(States).map(state => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label='Zip'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Phone'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Delivery instructions'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
          </Grid>
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Account
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label='Name'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Email'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Password'
                type='password'
                variant='outlined'
                size='small'
                fullWidth
              />
            </Grid>
          </Grid>
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Payment
          </Typography>
          <CardForm />
          <Grid container>
            <Grid item xs={12}>
              <Typography
                variant='h6'
                color='primary'
                className={classes.title}
              >
                Next Week
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle2' className={classes.subtitle}>
                How do you want to handle meals for next week?
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <ToggleButtonGroup
                className={classes.toggleButtonGroup}
                size='small'
                exclusive
                value={renewal}
                onChange={(_, rt: RenewalType) => {
                  // rt === null when selecting button
                  if (rt === null) return;
                  setRenewal(rt)
                }}
              >
                <ToggleButton value={RenewalTypes.Auto}>
                  Pick for me
                </ToggleButton>
                <ToggleButton value={RenewalTypes.Skip}>
                  Skip them
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          {
            renewal === RenewalTypes.Auto &&
            <Grid container>
              <Grid item xs={12}>
                <Typography
                  variant='h6'
                  color='primary'
                  className={classes.title}
                >
                  What foods would you like in your meal plan?
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle2' className={classes.subtitle}>
                  We only pick 1 restaurant per week
                </Typography>
              </Grid>
              <Grid container spacing={2}>
                {Object.values<CuisineType>(CuisineTypes).map(cuisine => {
                  const withoutCuisine = cuisines.filter(c => cuisine !== c);
                  const isSelected = withoutCuisine.length !== cuisines.length;
                  return (
                    <Grid
                      key={cuisine}
                      item
                      xs={6}
                      sm={4}
                      lg={3}
                    >
                      <Button
                        fullWidth
                        color='primary'
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => {
                          if (isSelected) {
                            setCuisines(withoutCuisine);
                            return;
                          }
                          setCuisines([...cuisines, cuisine]);
                        }}
                      >
                        {cuisine}
                      </Button>
                    </Grid>
                  )
                })}
              </Grid>
            </Grid>
          }
        </Grid>
        {
          isMdAndUp &&
          <Grid
            item
            md={4}
            lg={3}
          >
            <StickyDrawer>
              <div>yoyo</div>
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )
}

const CheckoutContainer = withClientApollo(checkout);

export default () => {
  let stripe = null
  if (!isServer()) {
    stripe = window.Stripe('pk_test_Ij3KCwOSq0LycG5DEcpvULGp00kyRcst9h')
  }
  return (
    <StripeProvider stripe={stripe}>
      <Elements>
        <CheckoutContainer />
      </Elements>
    </StripeProvider>
  )
}

export const checkoutRoute = 'checkout';