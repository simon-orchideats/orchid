import { Typography, makeStyles, Grid, Container, useMediaQuery, Theme, Button, FormControlLabel, Checkbox, InputAdornment, TextField } from "@material-ui/core";
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
import { Card, ICard } from "../card/cardModel";
import Notifier from "../client/notification/Notifier";
import PhoneInput from "../client/general/inputs/PhoneInput";
import EmailInput from "../client/general/inputs/EmailInput";
import GLogo from "../client/checkout/GLogo";
import { useConsumerSignUp, useGoogleSignIn, useEmailSignIn, useGetConsumer, useGetLazyConsumer } from "../consumer/consumerService";
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import TrustSeal from "../client/checkout/TrustSeal";
import BaseInput from "../client/general/inputs/BaseInput";
import { useGetTags, useGetRest } from "../rest/restService";
import { Cart } from "../order/cartModel";
import ServiceTypePicker from "../client/general/inputs/ServiceTypePicker";
import ServiceDateTimePicker from "../client/general/inputs/ServiceDateTimePicker";
import SearchAreaInput from "../client/general/inputs/SearchAreaInput";
import { orderHistoryRoute } from "./consumer/order-history";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { OrderMeal } from "../order/orderRestModel";
import { ServiceTypes, Order } from "../order/orderModel";
import { analyticsService, events } from "../client/utils/analyticsService";
import { IPlan, defaultPlanName } from "../plan/planModel";
import { useGetAvailablePlans } from "../plan/planService";

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
  customTip: {
    width: 115,
  },
  marginTop: {
    marginTop: theme.spacing(1),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginTop: -theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  link: {
    color: theme.palette.common.link,
    borderColor: theme.palette.common.link
  },
  edit: {
    color: theme.palette.common.link,
  },
  toggleButtonGroup: {
    width: '100%',
  },
  customTipSection: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  checkbox: {
    color: theme.palette.primary.dark
  },
  emailSignIn: {
    height: '100%'
  },
}));

type checkoutCard = {
  id: string | null,
  card: ICard,
}
type staticTip = 0.15 | 0.20 | 0.25 | 0.30 | null;
const defaultTip = 0.20;

const calculateTip = (mealTotal: number, staticTip: staticTip, customTip?: number) => {
  let tip = 0;
  if (customTip) {
    tip = customTip * 100
  }
  if (staticTip) {
    tip = Math.round(mealTotal * staticTip)
  }
  return tip;
}

const checkout: React.FC<ReactStripeElements.InjectedStripeProps> = ({
  stripe,
  elements
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const signInGoogle = useGoogleSignIn();
  const signInEmail = useEmailSignIn();
  const notify = useNotify();
  const allTags = useGetTags();
  const [tip, setTip] = useState<number>(
    calculateTip(
      (cart && cart.rest) ? OrderMeal.getTotalMealCost(cart.rest.meals, cart.rest.discount?.percentOff) : 0,
      defaultTip,
      0,
    )
  );
  const [getConsumer] = useGetLazyConsumer();
  const consumer = useGetConsumer('network-only');
  const [didPlaceOrder, setDidPlaceOrder] = useState<boolean>(false);
  const [staticTip, setStaticTip] = useState<staticTip>(defaultTip);
  const rest = useGetRest(cart?.rest?.restId || null)
  const customTipRef = createRef<HTMLInputElement>();
  const addr2InputRef = createRef<HTMLInputElement>();
  const instructionsInputRef = createRef<HTMLInputElement>();
  const validatePhoneRef = useRef<() => boolean>();
  const phoneInputRef = createRef<HTMLInputElement>();
  const receiveTextsInput = createRef<HTMLInputElement>();
  const validateEmailRef = useRef<() => boolean>();
  const emailInputRef = createRef<HTMLInputElement>();
  const accountNameInputRef = createRef<HTMLInputElement>();
  const passwordInputRef = createRef<HTMLInputElement>();
  const [accountNameError, setAccountNameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [receiveTextError, setReceiveTextError] = useState<string>('');
  const plans = useGetAvailablePlans();
  const [plan, setPlan] = useState<IPlan | null>(cart ? cart.plan : null);
  const [placeOrder, placeOrderRes] = usePlaceOrder();
  const [signUp, signUpRes] = useConsumerSignUp();
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const pm = useRef<stripe.PaymentMethodResponse>();
  const [isUsingSavedCard, setIsUsingSavedCard] = useState<boolean>(false);
  const [defaultPhone, setDefaultPhone] = useState<string | undefined>();
  const [defaultApt, setDefaultApt] = useState<string | undefined>();
  const [defaultInstructions, setDefaultInstructions] = useState<string | undefined>();
  const [isUpdatingInstructions, setIsUpdatingInstructions] = useState<boolean>(false);
  const [isUpdatingWhen, setIsUpdatingWhen] = useState<boolean>(false);

  useEffect(() => {
    if (plans.data && !plan && !consumer.data?.plan) {
      const defaultPlan = plans.data?.find(p => p.name === defaultPlanName);
      if (!defaultPlan) {
        const err = new Error(`Missing '${defaultPlanName}'`);
        console.error(err.stack);
        throw err;
      }
      setPlan(defaultPlan)
    }
  }, [plans.data, plan, consumer.data?.plan])

  useEffect(() => {
    setDefaultPhone(consumer.data?.profile.phone || undefined);
    setDefaultApt(consumer.data?.profile.searchArea?.address2 || undefined);
    setDefaultInstructions(consumer.data?.profile.serviceInstructions || undefined);
    setIsUsingSavedCard(consumer.data?.profile.card ? true : false);
  }, [
    consumer.data?.profile,
  ]);

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
          },
        });
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
        let stripeProductPriceId = null;
        if (!consumer.data?.plan) {
          if (!plan) {
            const err = new Error('Missing plan');
            console.error(err.stack);
            setDidPlaceOrder(false);
            throw err;
          }
          stripeProductPriceId = plan.stripeProductPriceId
        }
        placeOrder(
          {
            _id: signUpRes.data.res._id,
            name: signUpRes.data.res.profile.name,
            email: signUpRes.data.res.profile.name
          },
          Cart.getCartInput(
            addr2InputRef.current?.value || null,
            cart,
            phoneInputRef.current!.value,
            Card.getCardFromStripe(pm.current.paymentMethod!.card),
            pm.current.paymentMethod!.id,
            instructionsInputRef.current?.value || null,
            stripeProductPriceId,
            tip,
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
  const onChooseTip = (tip: staticTip) => {
    setStaticTip(tip);
    setTip(calculateTip(
      cart.rest ? OrderMeal.getTotalMealCost(cart.rest.meals, cart.rest.discount?.percentOff) : 0,
      tip,
      0,
    ))
    if (customTipRef.current) {
      customTipRef.current.value = '';
    }
  }
  const customTipChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.target.value === '') return;
    setTip(calculateTip(
      cart.rest ? OrderMeal.getTotalMealCost(cart.rest.meals, cart.rest.discount?.percentOff) : 0,
      null,
      parseInt(e.target.value),
    ))
    setStaticTip(null);
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
  const onClickEmail = async () => {
    try {
      await signInEmail();
      getConsumer();
    } catch (e) {
      const err = new Error(`Failed to sign in with email`);
      console.error(err.stack);
      throw err;
    }
  }

  const doPlaceOrder = async (
    checkoutCard: checkoutCard,
    name?: string,
    password?: string,
    email?: string,
    addr2?: string,
    phone?: string,
    serviceInstructions?: string,
  ) => {
    if (!phone) {
      const err = new Error('Undefined phone');
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
      let stripeProductPriceId = null;
      if (!consumer.data.plan) {
        if (!plan) {
          const err = new Error('Missing plan');
          console.error(err.stack);
          setDidPlaceOrder(false);
          throw err;
        }
        stripeProductPriceId = plan.stripeProductPriceId
      }
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
          checkoutCard.card,
          checkoutCard.id,
          serviceInstructions || null,
          stripeProductPriceId,
          tip,
        ),
      );
    }
    analyticsService.trackEvent(events.CHECKEDOUT);
  }

  const onClickPlaceOrder = async (
    name?: string,
    password?: string,
    email?: string,
    addr2?: string,
    phone?: string,
    canReceiveTexts?: boolean,
    instructions?: string,
  ) => {
    if (didPlaceOrder) return;
    setDidPlaceOrder(true);
    if (!validate(name, password, canReceiveTexts)) {
      notify('Please fix errors', NotificationType.error, true);
      setDidPlaceOrder(false);
      return
    };
    if (!cart) {
      const err =  new Error('Cart is null');
      console.error(err.stack);
      setDidPlaceOrder(false);
      throw err;
    }

    let card: checkoutCard;
    if (!isUsingSavedCard) {
      const billingName = (!consumer || !consumer.data) ? name : consumer.data.profile.name;
      try {
        if (!stripe) {
          const err = new Error('Stripe not initialized');
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
        const cardElement = elements.getElement('cardNumber');
        if (!cardElement) {
          const err =  new Error('No card element');
          console.error(err.stack);
          setDidPlaceOrder(false);
          throw err;
        }
        pm.current = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: { name: billingName },
        });
        if (pm.current.error) {
          const err = new Error(`Failed to generate stripe payment method: ${JSON.stringify(pm.current.error)}`);
          const msg = pm.current.error.message || 'Sorry something went wrong with your card. Please try another card';
          notify(msg, NotificationType.error, false);
          console.error(err.stack);
          setDidPlaceOrder(false);
          throw err;
        }
        if (!pm.current.paymentMethod) {
          const err = new Error(`Stripe missing paymentMethod`);
          console.error(err.stack);
          setDidPlaceOrder(false);
          throw err;
        }
        card = {
          id: pm.current.paymentMethod!.id,
          card: Card.getCardFromStripe(pm.current.paymentMethod!.card)
        };
      } catch (e) {
        const err = new Error(`Failed to createPaymentMethod for accountName '${billingName}'`);
        console.error(err.stack);
        setDidPlaceOrder(false);
        throw err;
      }

    } else {
      if (!consumer.data?.profile.card) {
        const err = new Error('Missing card');
        console.error(err.stack);
        throw err;
      }
      card = {
        id: null,
        card: consumer.data.profile.card,
      }
    }

    doPlaceOrder(
      card,
      name,
      password,
      email,
      addr2,
      phone,
      instructions,
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
      instructionsInputRef.current?.value
    ),
    tip,
    loading: didPlaceOrder,
    plan: plan || undefined 
  }

  let deliveryLabel: string = cart.serviceType;
  if (cart.serviceType === ServiceTypes.Pickup && rest.data) {
    deliveryLabel = deliveryLabel + ` at ${rest.data.location.primaryAddr}`;
  } else {
    deliveryLabel = deliveryLabel + ` to ${cart.searchArea}`;
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
            className={classes.title}
          >
            Instructions
          </Typography>
          <Grid container spacing={2}>
            {
              isUpdatingInstructions ?
                <>
                  <Grid item xs={12}>
                    <ServiceTypePicker />
                  </Grid>
                  {
                    cart.serviceType === ServiceTypes.Delivery &&
                    <Grid item xs={12}>
                      <SearchAreaInput defaultValue={cart.searchArea ? cart.searchArea : undefined} disableAutoFocus />
                    </Grid>
                  }
                </>
                :
                <>
                  <Grid
                    item
                    xs={12}
                  >
                    <Typography variant='body1'>
                      {deliveryLabel}
                      <Button className={classes.edit} onClick={() => setIsUpdatingInstructions(true)}>
                        Edit
                      </Button>
                    </Typography>
                  </Grid>
                </>
            }
            {
              cart.serviceType === ServiceTypes.Delivery &&
              <Grid item xs={12}>
                <BaseInput
                  key={defaultApt}
                  defaultValue={defaultApt}
                  label='Apt #'
                  inputRef={addr2InputRef}
                />
              </Grid>
            }
            <Grid
              item
              xs={12}
              md={6}
            >
              <PhoneInput
                key={defaultPhone}
                defaultValue={defaultPhone}
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
              <BaseInput
                key={defaultInstructions}
                defaultValue={defaultInstructions}
                label='Requests or instructions'
                inputRef={instructionsInputRef}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                label='I agree to receive delivery update texts'
                control={
                  <Checkbox
                    defaultChecked
                    color='default'
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
            className={classes.title}
          >
            When
          </Typography>
          <Grid container spacing={2}>
            {
              isUpdatingWhen ?
                <Grid item xs={12}>
                  <ServiceDateTimePicker />
                </Grid>
              :
              <>
                <Grid
                  item
                  xs={12}
                >
                  <Typography variant='body1'>
                    {
                      Order.getServiceTimeStr(cart.serviceTime) === 'ASAP' ?
                      'ASAP'
                      :
                      `${Order.getServiceMonthDay(cart.serviceDate)} ${Order.getServiceTimeStr(cart.serviceTime)}`
                    }
                    <Button className={classes.edit} onClick={() => setIsUpdatingWhen(true)}>
                      Edit
                    </Button>
                  </Typography>
                </Grid>
              </>
            }
          </Grid>
          <Typography
            variant='h6'
            className={classes.title}
          >
            {(consumer && consumer.data) ? 'Account' : 'Sign up'}
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
              <Grid item xs={6}>
                <Button
                  variant='outlined'
                  color='inherit'
                  onClick={onClickGoogle}
                  startIcon={<GLogo />}
                >
                  Google sign in
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant='outlined'
                  color='inherit'
                  className={classes.emailSignIn}
                  onClick={onClickEmail}
                >
                  Email sign in
                </Button>
              </Grid>
              <Grid xs={12} item>
                <Typography color='textSecondary' align='center'>
                  or
                </Typography>
              </Grid>
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
            </Grid>
          }
          <Typography
            variant='h6'
            className={classes.title}
          >
            Payment
          </Typography>
          {
            isUsingSavedCard ?
              <Grid container>
                <Grid item xs={6}>
                  <Typography variant='body1'>
                    {Card.getHiddenCardStr(consumer.data!.profile.card!)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant='outlined'
                    className={classes.link}
                    onClick={() => setIsUsingSavedCard(false)}
                  >
                    Use new card
                  </Button>
                </Grid>
              </Grid>
            :
              <>
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
                {
                  consumer.data?.profile.card &&
                  <Button
                    variant='outlined'
                    className={`${classes.link} ${classes.marginTop}`}
                    onClick={() => setIsUsingSavedCard(true)}
                  >
                    Use saved card
                  </Button>
                }
              </>
          }
          <Typography
            variant='h6'
            className={classes.title}
          >
            Tip
          </Typography>
          <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
              <ToggleButtonGroup
                exclusive
                className={classes.toggleButtonGroup}
                value={staticTip}
                onChange={(_e, tip) => onChooseTip(tip)}
              >
                <ToggleButton value={0.15}>
                  15%
                </ToggleButton>
                <ToggleButton value={0.20}>
                  20%
                </ToggleButton>
                <ToggleButton value={0.25}>
                  25%
                </ToggleButton>
                <ToggleButton value={0.30}>
                  30%
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item sm={6} xs={12}>
              <div className={classes.customTipSection}>
                <Typography variant='body1' className={classes.customTip}>
                  Custom tip
                </Typography>
                <TextField
                  type='number'
                  fullWidth
                  inputRef={customTipRef}
                  onChange={e => customTipChange(e)}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                  }}
                />
              </div>
            </Grid>
          </Grid>
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

const CheckoutContainerWithStripe = () => {
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

export default CheckoutContainerWithStripe;

export const checkoutRoute = '/checkout';