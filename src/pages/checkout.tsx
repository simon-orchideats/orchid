import { Typography, makeStyles, Grid, Container, useMediaQuery, Theme, Button, FormControlLabel, Checkbox, TextField } from "@material-ui/core";
import { useGetCart } from "../client/global/state/cartState";
import withClientApollo from "../client/utils/withClientApollo";
import { isServer } from "../client/utils/isServer";
import Router from 'next/router'
import { menuRoute } from "./menu";
import StickyDrawer from "../client/general/StickyDrawer";
import React, { useState, useEffect, useRef, createRef } from "react";
import { useTheme } from "@material-ui/styles";
import CardForm from "../client/checkout/CardForm";
import { StripeProvider, Elements, ReactStripeElements, injectStripe } from "react-stripe-elements";
import CheckoutCart from "../client/checkout/CheckoutCart";
import { activeConfig } from "../config";
import { usePlaceOrder } from "../client/order/orderService";
import { useNotify } from "../client/global/state/notificationState";
import { NotificationType } from "../client/notification/notificationModel";
import { Card } from "../card/cardModel";
import Notifier from "../client/notification/Notifier";
import PhoneInput from "../client/general/inputs/PhoneInput";
import EmailInput from "../client/general/inputs/EmailInput";
import GLogo from "../client/checkout/GLogo";
import { useConsumerSignUp, useGoogleSignIn, useGetLazyConsumer, useGetConsumer } from "../consumer/consumerService";
// import { useGetAvailablePlans } from "../plan/planService";
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import TrustSeal from "../client/checkout/TrustSeal";
import BaseInput from "../client/general/inputs/BaseInput";
import { useGetTags } from "../rest/restService";
import { Cart } from "../order/cartModel";
import ServiceTypePicker from "../client/general/inputs/ServiceTypePicker";
import ServiceDateTimePicker from "../client/general/inputs/ServiceDateTimePicker";
import SearchInput from "../client/general/inputs/SearchInput";
import { orderHistoryRoute } from "./consumer/order-history";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  inputs: {
    width: '100%',
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    background: theme.palette.background.paper
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  secureSeal: {
    paddingLeft: theme.spacing(1),
  },
  shield: {
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginTop: -theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
}));

const checkout: React.FC<ReactStripeElements.InjectedStripeProps> = ({
  stripe,
  elements
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const signInGoogle = useGoogleSignIn();
  const notify = useNotify();
  const allTags = useGetTags();
  const [getConsumer] = useGetLazyConsumer();
  const consumer = useGetConsumer();
  const [didPlaceOrder, setDidPlaceOrder] = useState<boolean>(false);
  const addr2InputRef = createRef<HTMLInputElement>();
  const validatePhoneRef = useRef<() => boolean>();
  const phoneInputRef = createRef<HTMLInputElement>();
  const receiveTextsInput = createRef<HTMLInputElement>();
  const [serviceInstructions, setServiceInstructions] = useState<string>('')
  const validateEmailRef = useRef<() => boolean>();
  const emailInputRef = createRef<HTMLInputElement>();
  const accountNameInputRef = createRef<HTMLInputElement>();
  const passwordInputRef = createRef<HTMLInputElement>();
  const [accountNameError, setAccountNameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [receiveTextError, setReceiveTextError] = useState<string>('');
  const [placeOrder, placeOrderRes] = usePlaceOrder();
  const [signUp, signUpRes] = useConsumerSignUp();
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const pm = useRef<stripe.PaymentMethodResponse>();
  // const plans = useGetAvailablePlans();
  // useEffect(() => {
  //   if (router.query.a !== undefined) {
  //     setAmountOff(parseFloat(router.query.a as string));
  //   }
  // }, [router.query.a]);

  useEffect(() => {
    if (placeOrderRes.error) {
      setDidPlaceOrder(false);
      notify('Sorry, something went wrong', NotificationType.error, false);
    }
    if (placeOrderRes.data !== undefined) {
      if (placeOrderRes.data.error) {
        setDidPlaceOrder(false);
        notify(placeOrderRes.data.error, NotificationType.error, false);
      } else {
        Router.push({
          pathname: orderHistoryRoute,
          query: {
            confirmation: 'true',
            clear: 'true',
          },
        })
      }
    }
  }, [placeOrderRes]);

  useEffect(() => {
    if (signUpRes.error) {
      setDidPlaceOrder(false);
      notify('Sorry, something went wrong', NotificationType.error, false);
    }
    if (signUpRes.data !== undefined) {
      if (signUpRes.data.error) {
        setDidPlaceOrder(false);
        notify(signUpRes.data.error, NotificationType.error, false);
      } else {
        if (!cart || !pm.current) {
          const err = new Error(`Cart or paymentMethod empty cart '${cart}' pm '${pm.current}'`);
          console.error(err.stack)
          setDidPlaceOrder(false);
          throw err;
        }
        if (!signUpRes.data.res) {
          const err = new Error('Sign up res is null but has no error');
          console.error(err.stack)
          setDidPlaceOrder(false);
          throw err;
        }
        if (!allTags.data) {
          const err = new Error('No tags');
          console.error(err.stack)
          setDidPlaceOrder(false);
          throw err;
        }
        placeOrder(
          {
            _id: signUpRes.data.res._id,
            name: signUpRes.data.res.profile.name,
            email: signUpRes.data.res.profile.name
          },
          Cart.getCartInput(
            addr2InputRef.current!.value || null,
            cart,
            phoneInputRef.current!.value,
            Card.getCardFromStripe(pm.current.paymentMethod!.card),
            pm.current.paymentMethod!.id,
            serviceInstructions,
            null,
          )
        );
      }
    }
  }, [signUpRes]);

  if (isServer()) {
    return <Typography>Redirecting...</Typography>
  } else if (!cart) {
    Router.replace(menuRoute);
    return <Typography>Redirecting...</Typography>
  }

  const validate = (name?: string, password?: string, canReceiveTexts?: boolean) => {
    let isValid = true;
    if (!canReceiveTexts) {
      setReceiveTextError('Must agree to receive delivery updates')
      isValid = false;
    }
    if (!validatePhoneRef.current!()) {
      isValid = false;
    }
    if (!consumer.data && !name) {
      setAccountNameError('Your name is incomplete');
      isValid = false;
    }
    if (!consumer.data && !validateEmailRef.current!()) {
      isValid = false;
    }
    if (!consumer.data && !password) {
      setPasswordError('Your password is incomplete');
      isValid = false;
    }
    return isValid;
  }
  
  const onClickGoogle = async () => {
    try {
      await signInGoogle();
      getConsumer();
    } catch (e) {
      const err = new Error(`Failed to sign in with google`);
      console.error(err.stack);
      throw err;
    }
  }
  const doPlaceOrder = async (
    name?: string,
    password?: string,
    email?: string,
    addr2?: string,
    phone?: string,
    paymentMethod?: stripe.paymentMethod.PaymentMethod,
  ) => {
    if (!phone || !paymentMethod) {
      const err = new Error(`Undefined inputs ${JSON.stringify({
        phone,
        paymentMethod,
      })}`);
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    // if (!plans.data) {
    //   const err = new Error(`No plans`);
    //   console.error(err.stack);
    //   setDidPlaceOrder(false);
    //   throw err;
    // }
    if (!pm.current) {
      const err = new Error(`No payment method`);
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    if (!allTags.data) {
      const err = new Error('No tags');
      console.error(err.stack)
      setDidPlaceOrder(false);
      throw err;
    }
    if (!consumer || !consumer.data) {
      if (!email) {
        const err = new Error('No email');
        console.error(err.stack);
        setDidPlaceOrder(false);
        throw err;
      }
      if (!name) {
        const err = new Error('No name');
        console.error(err.stack);
        setDidPlaceOrder(false);
        throw err;
      }
      if (!password) {
        const err = new Error('No password');
        console.error(err.stack);
        setDidPlaceOrder(false);
        throw err;
      }
      signUp(email, name, password);
    } else {
      placeOrder(
        {
          _id: consumer.data._id,
          name: consumer.data.profile.name,
          email: consumer.data.profile.name,
        },
        Cart.getCartInput(
          addr2 || null,
          cart,
          phone,
          Card.getCardFromStripe(paymentMethod.card),
          paymentMethod.id,
          serviceInstructions,
          null
        ),
      );
    }
    // sendCheckoutMetrics(
    //   cart,
    //   plans.data,
    //   allTags.data.map(t => t.Name),
    // )
  }

  const onClickPlaceOrder = async (
    name?: string,
    password?: string,
    email?: string,
    addr2?: string,
    phone?: string,
    canReceiveTexts?: boolean,
  ) => {
    if (didPlaceOrder) return;
    setDidPlaceOrder(true);
    if (!validate(name, password, canReceiveTexts)) {
      notify('Please fix errors', NotificationType.error, true);
      setDidPlaceOrder(false);
      return
    };
    if (!stripe) {
      const err = new Error('Stripe not initialized');
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    if (!cart) {
      const err =  new Error('Cart is null');
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    if (!elements) {
      const err =  new Error('No elements');
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    // if (!plans.data) {
    //   const err = new Error(`No plans`);
    //   console.error(err.stack);
    //   setDidPlaceOrder(false);
    //   throw err;
    // }
    const cardElement = elements.getElement('cardNumber');
    if (!cardElement) {
      const err =  new Error('No card element');
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    const billingName = (!consumer || !consumer.data) ? name : consumer.data.profile.name;
    try {
      pm.current = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: billingName },
      });
    } catch (e) {
      const err = new Error(`Failed to createPaymentMethod for accountName '${billingName}'`);
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    if (pm.current.error) {
      const err = new Error(`Failed to generate stripe payment method: ${JSON.stringify(pm.current.error)}`);
      const msg = pm.current.error.message || 'Sorry something went wrong with your card. Please try another card';
      notify(msg, NotificationType.error, false);
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }
    doPlaceOrder(
      name,
      password,
      email,
      addr2,
      phone,
      pm.current.paymentMethod,
    );
  }

  const checkoutCartProps = {
    onPlaceOrder: () => onClickPlaceOrder(
      accountNameInputRef.current?.value,
      passwordInputRef.current?.value,
      emailInputRef.current?.value,
      addr2InputRef.current?.value,
      phoneInputRef.current?.value,
      receiveTextsInput.current?.checked,
    ),
    loading: didPlaceOrder,
  }
  return (
    <Container
      maxWidth='xl'
      className={classes.container}
    >
      <Notifier />
      <Grid container alignItems='stretch'>
        {
          !isMdAndUp &&
          <Grid
            item
            sm={12}
            className={`${classes.inputs} ${classes.title}`}
          >
            <CheckoutCart {...checkoutCartProps} hideCheckout />
          </Grid>
        }
        <Grid
          item
          sm={12}
          md={7}
          lg={8}
          className={classes.inputs}
        >
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Instructions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ServiceTypePicker />
            </Grid>
            <Grid item xs={12}>
              <SearchInput defaultValue={'100 Gold Street, New York, NY, USA'} disableAutoFocus />
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
            >
              <PhoneInput
                inputRef={phoneInputRef}
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
                label='Requests or instructions'
                variant='outlined'
                size='small'
                fullWidth
                value={serviceInstructions}
                onChange={e => setServiceInstructions(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                label='I agree to receives delivery update texts'
                control={
                  <Checkbox
                    color='primary'
                    defaultChecked
                    inputRef={receiveTextsInput}
                    onChange={(_e, checked) => {
                      if (checked) {
                        setReceiveTextError('');
                      } else {
                        setReceiveTextError('Must agree to receive delivery updates')
                      }
                    }}
                  />
                }
              />
              <Typography variant='body1' color='error'>
                {receiveTextError}
              </Typography>
            </Grid>
          </Grid>
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            When
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ServiceDateTimePicker />
            </Grid>
          </Grid>
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Account
          </Typography>
          {
            consumer && consumer.data ?
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='body1'>
                  {consumer.data.profile.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body1'>
                  {consumer.data.profile.email}
                </Typography>
              </Grid>
            </Grid>
            :
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <BaseInput
                  label='Name'
                  error={!!accountNameError}
                  helperText={accountNameError}
                  inputRef={accountNameInputRef}
                  onChange={() => {
                    if (accountNameError) setAccountNameError('');
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <EmailInput
                  inputRef={emailInputRef}
                  defaultValue={''}
                  setValidator={(validator: () => boolean) => {
                    validateEmailRef.current = validator;
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <BaseInput
                  label='Password'
                  type='password'
                  error={!!passwordError}
                  helperText={passwordError}
                  inputRef={passwordInputRef}
                  onChange={() => {
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
                  onClick={onClickGoogle}
                  startIcon={<GLogo />}
                >
                  Sign up with google
                </Button>
              </Grid>
            </Grid>
          }
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Payment
          </Typography>
          <div className={classes.row}>
            <VerifiedUserIcon className={classes.shield} />
            <a href='https://stripe.com/' target='_blank'>
              <img src='/checkout/stripe.png' alt='stripe' />
            </a>
            <div className={classes.secureSeal}>
              <TrustSeal />
            </div>
          </div>
          <CardForm />
        </Grid>
        {
          !isMdAndUp &&
          <Grid
            item
            sm={12}
            className={`${classes.inputs} ${classes.title}`}
          >
            <CheckoutCart
              {...checkoutCartProps}
              hideDeliveries
            />
          </Grid>
        }
        {
          isMdAndUp &&
          <Grid
            item
            md={5}
            lg={4}
          >
            <StickyDrawer>
              <CheckoutCart {...checkoutCartProps} />
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )
}

const CheckoutContainer = withClientApollo(injectStripe(checkout));

export default () => {
  if (isServer()) return null;
  const stripe = window.Stripe(activeConfig.client.stripe.key)
  return (
    <StripeProvider stripe={stripe}>
      <Elements>
        <CheckoutContainer />
      </Elements>
    </StripeProvider>
  )
}

export const checkoutRoute = '/checkout';