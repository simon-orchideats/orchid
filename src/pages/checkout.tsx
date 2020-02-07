import { Typography, makeStyles, Grid, Container, TextField, FormControlLabel, Checkbox, useMediaQuery, Theme, Button } from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useGetCart } from "../client/global/state/cartState";
import Autocomplete from '@material-ui/lab/Autocomplete';
import withClientApollo from "../client/utils/withClientApollo";
import { isServer } from "../client/utils/isServer";
import Router from 'next/router'
import { menuRoute } from "./menu";
import StickyDrawer from "../client/reused/StickyDrawer";
import { useState } from "react";
import { state, States } from "../location/addressModel";
import { useTheme } from "@material-ui/styles";
import CardForm from "../client/checkout/CardForm";
import { StripeProvider, Elements, ReactStripeElements, injectStripe } from "react-stripe-elements";
import { RenewalTypes, RenewalType, CuisineTypes, CuisineType } from "../consumer/consumerModel";
import CheckoutCart from "../client/checkout/CheckoutCart";
import { activeConfig } from "../config";
import { useNotify } from "../client/global/state/notificationState";
import { NotificationType } from "../client/notification/notificationModel";

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

const checkout: React.FC<ReactStripeElements.InjectedStripeProps> = ({
  stripe
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const notify = useNotify();
  const [deliveryName, setDeliveryName] = useState<string>('')
  const [addr1, setAddr1] = useState<string>('')
  const [addr2, setAddr2] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [zip, setZip] = useState<string>(cart && cart.Zip ? cart.Zip : '');
  const [phone, setPhone] = useState<string>('');
  const [deliveryInstructions, setDliveryInstructions] = useState<string>('')
  const [state, setState] = useState<state | ''>();
  const [renewal, setRenewal] = useState<RenewalType>(RenewalTypes.Auto)
  const [oneName, setOneName] = useState<boolean>(true);
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [accountName, setAccountName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const onPlaceOrder = async () => {
    if (!stripe) throw new Error('Stripe not initialized');
    const res = await stripe.createToken({ name: accountName });
    if (res.error) {
      const msg = `Could not process card. '${res.error.message}'`;
      notify(msg, NotificationType.error, false);
      return;
      // todo: add a logrocket exception instead of throwing error
      // throw new Error(msg);
    };
    const cardTok = res.token!.id;
    console.log(cardTok);
  }
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
                value={deliveryName}
                onChange={e => {
                  if (oneName) setAccountName(e.target.value);
                  setDeliveryName(e.target.value)
                }}
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
            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                label='Address'
                variant='outlined'
                size='small'
                fullWidth
                value={addr1}
                onChange={e => setAddr1(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                label='Apt, suite, floor'
                variant='outlined'
                size='small'
                fullWidth
                value={addr2}
                onChange={e => setAddr2(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                label='City'
                variant='outlined'
                size='small'
                fullWidth
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={3}
            >
              <Autocomplete
                options={Object.values<state>(States)}
                value={state || '' as state}
                onChange={(_e: any, value: state | null) => setState(value ? value : '')}
                renderInput={params => (
                  <TextField
                    {...params}
                    size='small'
                    label='State'
                    variant='outlined'
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={3}
            >
              <TextField
                label='Zip'
                variant='outlined'
                size='small'
                fullWidth
                value={zip}
                onChange={e => setZip(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                label='Phone'
                variant='outlined'
                size='small'
                fullWidth
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <TextField
                label='Delivery instructions'
                variant='outlined'
                size='small'
                fullWidth
                value={deliveryInstructions}
                onChange={e => setDliveryInstructions(e.target.value)}
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
                value={accountName}
                onChange={e => {
                  if (oneName) setDeliveryName(e.target.value);
                  setAccountName(e.target.value)
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Email'
                variant='outlined'
                size='small'
                fullWidth
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Password'
                type='password'
                variant='outlined'
                size='small'
                fullWidth
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              <CheckoutCart onPlaceOrder={onPlaceOrder} />
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )
}

const CheckoutContainer = withClientApollo(injectStripe(checkout));

export default () => {
  let stripe = null;
  if (!isServer()) {
    stripe = window.Stripe(activeConfig.client.stripe.key)
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