import { Typography, makeStyles, Grid, Container, TextField, FormControlLabel, Checkbox, useMediaQuery, Theme, Button } from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useGetCart } from "../client/global/state/cartState";
import Autocomplete from '@material-ui/lab/Autocomplete';
import withClientApollo from "../client/utils/withClientApollo";
import { isServer } from "../client/utils/isServer";
import Router from 'next/router'
import { menuRoute } from "./menu";
import StickyDrawer from "../client/general/StickyDrawer";
import { useState, useEffect, useRef, createRef } from "react";
import { state, States } from "../place/addressModel";
import { useTheme } from "@material-ui/styles";
import CardForm from "../client/checkout/CardForm";
import { StripeProvider, Elements, ReactStripeElements, injectStripe } from "react-stripe-elements";
import { RenewalTypes, RenewalType, CuisineTypes, CuisineType } from "../consumer/consumerModel";
import CheckoutCart from "../client/checkout/CheckoutCart";
import { activeConfig } from "../config";
import { usePlaceOrder } from "../client/order/orderService";
import { useNotify } from "../client/global/state/notificationState";
import { NotificationType } from "../client/notification/notificationModel";
import { Card } from "../card/cardModel";
import Notifier from "../client/notification/Notifier";
import PhoneInput from "../client/general/inputs/PhoneInput";

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
  stripe,
  elements
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const notify = useNotify();
  const [deliveryName, setDeliveryName] = useState<string>('');
  const [deliveryNameError, setDeliveryNameError] = useState<string>('');
  const [addr1, setAddr1] = useState<string>('19 middle st');
  const [addr1Error, setAddr1Error] = useState<string>('');
  const [addr2, setAddr2] = useState<string>('');
  const [city, setCity] = useState<string>('Boston');
  const [cityError, setCityError] = useState<string>('');
  const [state, setState] = useState<state | ''>('MA');
  const [stateError,setStateError] = useState<string>('');
  const [zip, setZip] = useState<string>(cart && cart.Zip ? cart.Zip : '02127');
  const [zipError, setZipError] = useState<string>('');
  const validatePhoneRef = useRef<() => boolean>();
  const phoneInputRef = createRef<HTMLInputElement>();
  const [deliveryInstructions, setDliveryInstructions] = useState<string>('to my door')
  const [renewal, setRenewal] = useState<RenewalType>(RenewalTypes.Skip)
  const [oneName, setOneName] = useState<boolean>(true);
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [cuisinesError, setCuisinesError] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('simon vuong');
  const [accountNameError, setAccountNameError] = useState<string>('');
  const [email, setEmail] = useState<string>('simon.vuong@yahoo.com');
  const [emailError, setEmailError] = useState<string>('');
  const [password, setPassword] = useState<string>('password');
  const [passwordError, setPasswordError] = useState<string>('');
  const [placeOrder, placeOrderRes] = usePlaceOrder();
  useEffect(() => {
    if (placeOrderRes.error) {
      notify('Sorry, something went wrong', NotificationType.error, false);
    } else if (placeOrderRes.data !== undefined && placeOrderRes.data.error) {
      notify(placeOrderRes.data.error, NotificationType.error, false);
    }
  }, [placeOrderRes])
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  if (isServer()) {
    return <Typography>Redirecting...</Typography>
  } else if (!cart) {
    Router.replace(`/${menuRoute}`);
    return <Typography>Redirecting...</Typography>
  }
  const validate = () => {
    let isValid = true;
    if (!deliveryName) {
      setDeliveryNameError('Your name is incomplete');
      isValid = false;
    }
    if (!addr1) {
      setAddr1Error('Your address is incomplete');
      isValid = false;
    }
    if (!city) {
      setCityError('Your city is incomplete');
      isValid = false;
    }
    if (!zip) {
      setZipError('Your zip is incomplete');
      isValid = false;
    }
    if (!validatePhoneRef.current!()) {
      isValid = false;
    }
    if (!state) {
      setStateError('Your state is incomplete');
      isValid = false;
    }
    if (!accountName) {
      setAccountNameError('Your name is incomplete');
      isValid = false;
    }
    if (!email) {
      setEmailError('Your email is incomplete');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Your password is incomplete');
      isValid = false;
    }
    if (cuisines.length === 0 && renewal === RenewalTypes.Auto) {
      setCuisinesError('Your picks are incomplete');
      isValid = false;
    }
    return isValid;
  }
  const onClickPlaceOrder = async () => {
    if (!stripe) throw new Error('Stripe not initialized');
    if (!cart) throw new Error('Cart is null');
    if (!elements) throw new Error('No elements');
    const cardElement = elements.getElement('cardNumber');
    if (!cardElement) throw new Error('No card element');
    const pm = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: accountName },
    });
    if (!validate() || pm.error) return;
    placeOrder(cart.getCartInput(
      deliveryName,
      addr1,
      addr2,
      city,
      state as state,
      zip,
      phoneInputRef.current!.value,
      Card.getCardFromStripe(pm.paymentMethod!.card),
      pm.paymentMethod!.id,
      deliveryInstructions,
      renewal,
      cuisines,
    ));
  }
  return (
    <Container
      maxWidth='xl'
      className={classes.container}
    >
      <Notifier />
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
                error={!!deliveryNameError}
                helperText={deliveryNameError}
                value={deliveryName}
                onChange={e => {
                  if (oneName) {
                    setAccountName(e.target.value);
                    if (accountNameError) setAccountNameError('');
                  }
                  setDeliveryName(e.target.value);
                  if (deliveryNameError) setDeliveryNameError('');
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
                error={!!addr1Error}
                helperText={addr1Error}
                fullWidth
                value={addr1}
                onChange={e => {
                  setAddr1(e.target.value);
                  if (addr1Error) setAddr1Error('')
                }}
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
                error={!!cityError}
                helperText={cityError}
                fullWidth
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  if (cityError) setCityError('');
                }}
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
                onChange={(_e: any, value: state | null) => {
                  setState(value ? value : '');
                  if (stateError) setStateError('');
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    size='small'
                    label='State'
                    variant='outlined'
                    error={!!stateError}
                    helperText={stateError}
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
                error={!!zipError}
                helperText={zipError}
                fullWidth
                value={zip}
                onChange={e => {
                  setZip(e.target.value);
                  if (zipError) setZipError('');
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <PhoneInput
                inputRef={phoneInputRef}
                defaultValue={'6095138166'}
                setValidator={(validator: () => boolean) => {
                  validatePhoneRef.current = validator;
                }}
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
                error={!!accountNameError}
                helperText={accountNameError}
                value={accountName}
                onChange={e => {
                  if (oneName) {
                    setDeliveryName(e.target.value);
                    if (deliveryNameError) setDeliveryNameError('');
                  }
                  setAccountName(e.target.value);
                  if (accountNameError) setAccountNameError('');
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Email'
                variant='outlined'
                size='small'
                error={!!emailError}
                helperText={emailError}
                fullWidth
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Password'
                type='password'
                variant='outlined'
                size='small'
                error={!!passwordError}
                helperText={passwordError}
                fullWidth
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
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
                <Typography
                  component='p'
                  variant='caption'
                  color='error'
                  className={classes.subtitle}
                >
                  {cuisinesError}
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
                          if (withoutCuisine.length === 0) setCuisinesError('')
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
              <CheckoutCart onPlaceOrder={onClickPlaceOrder} />
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