import { Typography, makeStyles, Grid, Container, TextField, FormControlLabel, Checkbox, useMediaQuery, Theme, Button } from "@material-ui/core";
import { useGetCart } from "../client/global/state/cartState";
import withClientApollo from "../client/utils/withClientApollo";
import { isServer } from "../client/utils/isServer";
import Router from 'next/router'
import { menuRoute } from "./menu";
import StickyDrawer from "../client/general/StickyDrawer";
import { useState, useEffect, useRef, createRef } from "react";
import { state } from "../place/addressModel";
import { useTheme } from "@material-ui/styles";
import CardForm from "../client/checkout/CardForm";
import { StripeProvider, Elements, ReactStripeElements, injectStripe } from "react-stripe-elements";
import { RenewalTypes, CuisineType, RenewalType } from "../consumer/consumerModel";
import CheckoutCart from "../client/checkout/CheckoutCart";
import { activeConfig } from "../config";
import { usePlaceOrder } from "../client/order/orderService";
import { useNotify } from "../client/global/state/notificationState";
import { NotificationType } from "../client/notification/notificationModel";
import { Card } from "../card/cardModel";
import Notifier from "../client/notification/Notifier";
import PhoneInput from "../client/general/inputs/PhoneInput";
import { upcomingDeliveriesRoute } from "./consumer/upcoming-deliveries";
import RenewalChooser from '../client/general/RenewalChooser';
import EmailInput from "../client/general/inputs/EmailInput";
import AddressForm from "../client/general/inputs/AddressForm";
import auth0 from 'auth0-js';
import GLogo from "../client/checkout/GLogo";
import { popupSocialAuthCB } from "../utils/auth";
import { useSignUp } from "../consumer/consumerService";

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
  title: {
    paddingTop: theme.spacing(2),
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
  const [deliveryName, setDeliveryName] = useState<string>('namename');
  const [deliveryNameError, setDeliveryNameError] = useState<string>('');
  const validateAddressRef = useRef<() => boolean>();
  const addr1InputRef = createRef<HTMLInputElement>();
  const addr2InputRef = createRef<HTMLInputElement>();
  const cityInputRef = createRef<HTMLInputElement>();
  const zipInputRef = createRef<HTMLInputElement>();
  const [state, setState] = useState<state | ''>('');
  const validatePhoneRef = useRef<() => boolean>();
  const phoneInputRef = createRef<HTMLInputElement>();
  const [deliveryInstructions, setDliveryInstructions] = useState<string>('to my door')
  const [renewal, setRenewal] = useState<RenewalType>(RenewalTypes.Skip)
  const [oneName, setOneName] = useState<boolean>(true);
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [accountName, setAccountName] = useState<string>('simon vuong');
  const [accountNameError, setAccountNameError] = useState<string>('');
  const validateEmailRef = useRef<() => boolean>();
  const emailInputRef = createRef<HTMLInputElement>();
  const [password, setPassword] = useState<string>('password');
  const [passwordError, setPasswordError] = useState<string>('');
  const [placeOrder, placeOrderRes] = usePlaceOrder();
  const [signUp, signUpRes] = useSignUp();
  const validateCuisineRef= useRef<() => boolean>();
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const pm = useRef<stripe.PaymentMethodResponse>();

  useEffect(() => {
    if (placeOrderRes.error) {
      notify('Sorry, something went wrong', NotificationType.error, false);
    }
    if (placeOrderRes.data !== undefined) {
      if (placeOrderRes.data.error) {
        notify(placeOrderRes.data.error, NotificationType.error, false);
      } else {
        Router.push({
          pathname: upcomingDeliveriesRoute,
          query: { confirmation: 'true' },
        })
      }
    }
  }, [placeOrderRes]);

  useEffect(() => {
    if (signUpRes.error) {
      notify('Sorry, something went wrong', NotificationType.error, false);
    }
    if (signUpRes.data !== undefined) {
      if (signUpRes.data.error) {
        notify(signUpRes.data.error, NotificationType.error, false);
      } else {
        if (!cart || !pm.current) {
          const err = new Error(`Cart or paymentMethod empty cart '${cart}' pm '${pm.current}'`);
          console.error(err.stack)
          throw err;
        }
        placeOrder(cart.getCartInput(
          deliveryName,
          addr1InputRef.current!.value,
          addr2InputRef.current!.value,
          cityInputRef.current!.value,
          state as state,
          zipInputRef.current!.value,
          phoneInputRef.current!.value,
          Card.getCardFromStripe(pm.current.paymentMethod!.card),
          pm.current.paymentMethod!.id,
          deliveryInstructions,
          renewal,
          cuisines,
        ));
      }
    }
  }, [signUpRes]);


  if (isServer()) {
    return <Typography>Redirecting...</Typography>
  } else if (!cart) {
    Router.replace(`${menuRoute}`);
    return <Typography>Redirecting...</Typography>
  }
  const validate = () => {
    let isValid = true;
    if (!deliveryName) {
      setDeliveryNameError('Your name is incomplete');
      isValid = false;
    }
    if (!validatePhoneRef.current!()) {
      isValid = false;
    }
    if (!validateAddressRef.current!()) {
      isValid = false;
    }
    if (!accountName) {
      setAccountNameError('Your name is incomplete');
      isValid = false;
    }
    if (!validateEmailRef.current!()) {
      isValid = false;
    }
    if (!password) {
      setPasswordError('Your password is incomplete');
      isValid = false;
    }
    if (!validateCuisineRef.current!()) {
      isValid = false;
    }
    return isValid;
  }
  
  const webAuth = new auth0.WebAuth({
    domain: activeConfig.client.auth.domain,
    clientID: activeConfig.client.auth.clientId
  });
  const google = () => {
    webAuth.popup.authorize({
      domain: activeConfig.client.auth.domain,
      clientId: activeConfig.client.auth.clientId,
      audience: activeConfig.client.auth.audience,
      redirectUri: `${activeConfig.client.app.url}${popupSocialAuthCB}`,
      connection: 'google-oauth2',
      responseType: 'code',
      scope: 'openid profile email offline_access',
    }, (err: auth0.Auth0Error | null, res: auth0.Auth0Result) => {
      if (err) {
        console.error(`Could not social auth. '${JSON.stringify(err)}'`);
        throw err;
      }
      console.log(res);
    });
  }

  const onClickPlaceOrder = async () => {
    if (!stripe) {
      const err = new Error('Stripe not initialized');
      console.error(err.stack);
      throw err;
    }
    if (!cart) {
      const err =  new Error('Cart is null');
      console.error(err.stack);
      throw err;
    }
    if (!elements) {
      const err =  new Error('No elements');
      console.error(err.stack);
      throw err;
    }
    const cardElement = elements.getElement('cardNumber');
    if (!cardElement) {
      const err =  new Error('No card element');
      console.error(err.stack);
      throw err;
    }
    try {
      pm.current = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: accountName },
      });
    } catch (e) {
      const err =  new Error(`Failed to createPaymentMethod for accountName '${accountName}'`);
      console.error(err.stack);
      throw err;
    }
    if (!validate() || pm.current.error) return;
    signUp(emailInputRef.current!.value, accountName, password);
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
            <Grid item xs={12}>
              <AddressForm
                setValidator={(validator: () => boolean) => {
                  validateAddressRef.current = validator;
                }}
                addr1InputRef={addr1InputRef}
                addr2InputRef={addr2InputRef}
                cityInputRef={cityInputRef}
                zipInputRef={zipInputRef}
                state={state}
                setState={setState}
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
              <EmailInput
                inputRef={emailInputRef}
                defaultValue={cart.Email ? cart.Email : ''}
                setValidator={(validator: () => boolean) => {
                  validateEmailRef.current = validator;
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
            <Grid xs={12} item>
              <Typography color='textSecondary' align='center'>
                or
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='outlined'
                onClick={() => google()}
                startIcon={<GLogo />}
              >
                Sign up with google
              </Button>
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
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Next Week
          </Typography>
          <RenewalChooser
            renewal={renewal}
            cuisines = {cuisines}
            validateCuisineRef={validateCuisine => {
              validateCuisineRef.current = validateCuisine;
            }}
            onCuisineChange={cuisines => setCuisines(cuisines)}
            onRenewalChange={renewal => setRenewal(renewal)}
          />
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
        {
          !isMdAndUp &&
          <Grid
            item
            sm={12}
            className={`${classes.inputs} ${classes.title}`}
          >
            <CheckoutCart buttonBottom onPlaceOrder={onClickPlaceOrder} />
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