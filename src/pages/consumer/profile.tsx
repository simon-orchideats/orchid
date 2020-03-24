import { Container, Typography, makeStyles, Button, List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { useState, useRef, createRef } from "react";
import PhoneInput from '../../client/general/inputs/PhoneInput'
import AddressForm from '../../client/general/inputs/AddressForm'
import  { useRequireConsumer, useUpdateConsumer } from '../../consumer/consumerService';
import withApollo from "../../client/utils/withPageApollo";
import { state } from "../../place/addressModel";
import CardForm from "../../client/checkout/CardForm";
import { StripeProvider, Elements, ReactStripeElements, injectStripe } from "react-stripe-elements";
import { activeConfig } from "../../config";
import { isServer } from "../../client/utils/isServer";
import { IConsumer } from "../../consumer/consumerModel";
import { Card } from "../../card/cardModel";
const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  list: {
    marginTop: theme.spacing(3),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    background: theme.palette.background.paper
  },
  buttons: {
    display: 'flex',
  },
  save: {
    marginRight: theme.spacing(1),
  },
  input: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  link: {
    color: theme.palette.common.link,
  },
  stretch: {
    width: '100%'
  },
}));

const Labels: React.FC<{
  primary: string,
  secondary: string,
}> = ({
  primary,
  secondary,
}) => (
  <ListItemText
    primary={primary}
    primaryTypographyProps={{
      variant: 'h6',
      color: 'primary'
    }}
    secondary={secondary}
    secondaryTypographyProps={{
      variant: 'body1',
    }}
  />
)

const profile: React.FC<ReactStripeElements.InjectedStripeProps> = ({
  stripe,
  elements,
}) => {
  const classes = useStyles();
  const validatePhoneRef = useRef<() => boolean>();
  const phoneInputRef = createRef<HTMLInputElement>();
  const validateAddressRef = useRef<() => boolean>();
  const addr1InputRef = createRef<HTMLInputElement>();
  const addr2InputRef = createRef<HTMLInputElement>();
  const cityInputRef = createRef<HTMLInputElement>();
  const zipInputRef = createRef<HTMLInputElement>();
  const [state, setState] = useState<state | ''>('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isUpdatingAddr, setIsUpdatingAddr] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [updateConsumer] = useUpdateConsumer();
  let consumerAddressLabel ='';
  let consumerCardLabel ='';
  const consumer = useRequireConsumer(profileRoute);
  if (!consumer.data && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  // creates Address label based on consumer
  if (consumer.data && consumer.data.Profile.destination && consumer.data.Profile.destination.address) {
    const addressInfo = consumer.data.Profile.destination.Address
    const address1 = addressInfo.address1;
    const address2 = addressInfo.address2;
    const city = addressInfo.city;
    const zip = addressInfo.zip; 
    consumerAddressLabel = `${address1} ${address2} ${city} ${zip}`
  } 
  // creates card label based on consumer
  if (consumer.data && consumer.data.Profile.card) {
    const card = consumer.data.Profile.card;
    const Last4 = card.Last4;
    const expMonth = card.expMonth;
    const expYear = card.expYear;
    consumerCardLabel = `${Last4} ${expMonth}/${expYear}`
  }
  const onSavePhone = () => {
    if (!validatePhoneRef.current!()) return;
    setIsUpdatingPhone(false);
    const updatedConsumer: IConsumer = {
      _id: consumer.data!._id,
      plan: consumer.data!.plan,
      profile: {
        name: consumer.data!.profile.name,
        email: consumer.data!.profile.email,
        card: consumer.data!.profile.card,
        destination: consumer.data!.profile.destination,
        phone: phoneInputRef.current!.value
      },
      stripeSubscriptionId: consumer.data!.stripeSubscriptionId,
      stripeCustomerId: consumer.data!.stripeCustomerId
    }
    updateConsumer(updatedConsumer);
  }
  const onCancelPhone = () => {
    setIsUpdatingPhone(false);
  }
  const onSaveAddr = () => {
    if (!validateAddressRef.current!()) return;
    setIsUpdatingAddr(false);
     const updatedConsumer: IConsumer = {
      _id: consumer.data!._id,
      plan: consumer.data!.plan,
      profile: {
        name: consumer.data!.profile.name,
        email: consumer.data!.profile.email,
        card: consumer.data!.profile.card,
        destination: {
          address: {
            address1: addr1InputRef.current!.value,
            address2: addr2InputRef.current!.value,
            city: cityInputRef.current!.value,
            state: state,
            zip: zipInputRef.current!.value,
          },
          name: consumer.data!.profile.destination && consumer.data!.profile.destination.name,
          instructions: consumer.data!.profile.destination && consumer.data!.profile.destination.instructions,

        },
        phone: consumer.data!.profile.phone
      },
      stripeSubscriptionId: consumer.data!.stripeSubscriptionId,
      stripeCustomerId: consumer.data!.stripeCustomerId
    }
    updateConsumer(updatedConsumer);
  }
  const onCancelAddr = () => {
    setIsUpdatingAddr(false);
  }
  const onSaveCard = async () => {
    if (!stripe) {
      const err = new Error('Stripe not initialized');
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
    let pm
    try {
      pm = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        // billing_details: { name: accountName },
      });
    } catch (e) {
      // const err =  new Error(`Failed to createPaymentMethod for accountName '${accountName}'`);
      console.error(e.stack);
      throw e;
    }
    if (pm.error) return;
    const updatedConsumer: IConsumer = {
      _id: consumer.data!._id,
      plan: consumer.data!.plan,
      profile: {
        name: consumer.data!.profile.name,
        email: consumer.data!.profile.email,
        card: Card.getCardFromStripe(pm.paymentMethod!.card),
        destination: consumer.data!.profile.destination,
        phone: consumer.data!.profile.phone
      },
      stripeSubscriptionId: consumer.data!.stripeSubscriptionId,
      stripeCustomerId: consumer.data!.stripeCustomerId
    }
    updateConsumer(updatedConsumer);
    setIsUpdatingCard(false);
  };
  const onCancelCard = () => {
    setIsUpdatingCard(false);
  }

  return (
    <>
      <Container maxWidth='lg' className={classes.container}>
        <Typography variant='h3'>
          Profile
        </Typography>
        <List className={classes.list}>
          <ListItem divider disableGutters>
            <Labels
              primary='Name'
              secondary='Simon Vuong'
            />
          </ListItem>
          <ListItem divider disableGutters>
            <Labels
              primary='Email'
              secondary='simon.vuong@yahoo.com'
            />
          </ListItem>
          <ListItem divider disableGutters>
            <Labels
              primary='Password'
              secondary='*************'
            />
          </ListItem>
          <ListItem divider disableGutters>
            {
              isUpdatingPhone ?
              <div className={classes.stretch}>
                <PhoneInput
                  className={classes.input}
                  inputRef={phoneInputRef}
                  defaultValue={consumer.data?.profile.phone}
                  setValidator={(validator: () => boolean) => {
                    validatePhoneRef.current = validator;
                  }}
                />
                <div className={classes.buttons}>
                  <Button
                    className={classes.save}
                    onClick={onSavePhone}
                    variant='contained'
                    color='primary'
                  >
                    Save
                  </Button>
                  <Button
                    onClick={onCancelPhone}
                    variant='outlined'
                    color='primary'
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              :
              <>
                <Labels
                  primary='Phone'
                  secondary={consumer.data?.profile.phone ? consumer.data?.profile.phone : '' }
                />
                <ListItemSecondaryAction>
                  <Button className={classes.link} onClick={() => setIsUpdatingPhone(true)}>
                    Edit
                  </Button>
                </ListItemSecondaryAction>
              </>
            }
          </ListItem>
          <ListItem divider disableGutters>
            {
              isUpdatingCard ?
              <div className={classes.stretch}>
                <div className={classes.input}>
                  <CardForm />
                </div>
                <div className={classes.buttons}>
                  <Button
                    className={classes.save}
                    onClick={onSaveCard}
                    variant='contained'
                    color='primary'
                  >
                    Save
                  </Button>
                  <Button
                    onClick={onCancelCard}
                    variant='outlined'
                    color='primary'
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              :
              <>
                <Labels
                  primary='Payment'
                  secondary={consumerCardLabel}
                />
                <ListItemSecondaryAction>
                  <Button className={classes.link} onClick={() => setIsUpdatingCard(true)}>
                    Edit
                  </Button>
                </ListItemSecondaryAction>
              </>
            }
          </ListItem>
          <ListItem disableGutters>
          {
            isUpdatingAddr ?
            <div className={classes.stretch}>
              <div className={classes.input}>
                <AddressForm
                  setValidator={validator => {
                    validateAddressRef.current = validator;
                  }}
                  addr1InputRef={addr1InputRef}
                  addr2InputRef={addr2InputRef}
                  cityInputRef={cityInputRef}
                  zipInputRef={zipInputRef}
                  state={state}
                  setState={setState}
                />
              </div>
              <div className={classes.buttons}>
                <Button
                  className={classes.save}
                  onClick={onSaveAddr}
                  variant='contained'
                  color='primary'
                >
                  Save
                </Button>
                <Button
                  onClick={onCancelAddr}
                  variant='outlined'
                  color='primary'
                >
                  Cancel
                </Button>
              </div>
            </div>
            :
            <>
              <Labels
                primary='Address'
                secondary={consumerAddressLabel}
              />
              <ListItemSecondaryAction>
                <Button className={classes.link} onClick={() => setIsUpdatingAddr(true)}>
                  Edit
                </Button>
              </ListItemSecondaryAction>
            </>
          }
          </ListItem>
        </List>
      </Container>
    </>
  )
}

const ProfileWithStripe = injectStripe(profile);

const ProfileContainer = () => {
  let stripe = null;
  if (!isServer()) {
    stripe = window.Stripe(activeConfig.client.stripe.key)
  }
  return (
    <StripeProvider stripe={stripe}>
      <Elements>
        <ProfileWithStripe />
      </Elements>
    </StripeProvider>
  )
}

export default withApollo(ProfileContainer);

export const profileRoute = '/consumer/profile';