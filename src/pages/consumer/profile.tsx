import { Container, Typography, makeStyles, Button, List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { useState, useRef, createRef } from "react";
import PhoneInput from '../../client/general/inputs/PhoneInput'
import AddressForm from '../../client/general/inputs/AddressForm'
import { useRequireConsumer, useUpdateMyProfile } from '../../consumer/consumerService';
import withApollo from "../../client/utils/withPageApollo";
import { state } from "../../place/addressModel";
import CardForm from "../../client/checkout/CardForm";
import { StripeProvider, Elements, ReactStripeElements, injectStripe } from "react-stripe-elements";
import { activeConfig } from "../../config";
import { isServer } from "../../client/utils/isServer";
import { IConsumerProfile } from "../../consumer/consumerModel";
import { Card } from "../../card/cardModel";
import { NotificationType } from "../../client/notification/notificationModel";
import { useNotify } from "../../client/global/state/notificationState";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import Notifier from "../../client/notification/Notifier";
import { sendUpdateAddressMetrics, sendUpdatePhoneMetrics, sendUpdateCardMetrics } from "../../client/consumer/profileMetrics";
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
  const [updateMyProfile, updateProfileRes] = useUpdateMyProfile();
  const notify = useNotify();
  useMutationResponseHandler(updateProfileRes, () => {
    notify('Profile updated', NotificationType.success, false);
  });
  const consumer = useRequireConsumer(profileRoute);
  let consumerAddressLabel = '';
  let consumerCardLabel = '';
  let consumerPhoneLabel = '';
  let consumerNameLabel = '';
  let consumerEmailLabel = '';
  if (!consumer.data && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (consumer.data) {
    if (consumer.data.Profile.Destination) consumerAddressLabel = consumer.data.Profile.Destination.Address.getAddrStr();
    if (consumer.data.Profile.Card) consumerCardLabel = consumer.data.Profile.Card.getHiddenCardStr();
    if (consumer.data.Profile.Phone) consumerPhoneLabel = consumer.data.Profile.Phone;
    if (consumer.data.Profile.Name) consumerNameLabel = consumer.data.Profile.Name;
    if (consumer.data.Profile.Email) consumerEmailLabel = consumer.data.Profile.Email;


  }

  const noConsumerErr = () => {
    const err = new Error(`Consumer does not exist`);
    console.error(err.stack);
    return err;
  }
  const onSavePhone = () => {
    if (!consumer.data) throw noConsumerErr() 
    if (!validatePhoneRef.current!()) return;
    setIsUpdatingPhone(false);
    const updatedProfile: IConsumerProfile = {
      ...consumer.data.profile,
      phone: phoneInputRef.current!.value
    }
    sendUpdatePhoneMetrics();
    updateMyProfile(consumer.data, updatedProfile);
  }
  const onCancelPhone = () => {
    setIsUpdatingPhone(false);
  }
  const onSaveAddr = () => {
    if (!consumer.data) throw noConsumerErr() 
    if (!validateAddressRef.current!()) return;
    setIsUpdatingAddr(false);
    if (state) {
      const updatedProfile: IConsumerProfile = {
        ...consumer.data.profile,
        destination: {
          address: {
            address1: addr1InputRef.current!.value,
            address2: addr2InputRef.current!.value,
            city: cityInputRef.current!.value,
            state,
            zip: zipInputRef.current!.value,
          },
          instructions: consumer.data.Profile.Destination && consumer.data.Profile.Destination.Instructions,
        },
      }
      sendUpdateAddressMetrics();
      updateMyProfile(consumer.data, updatedProfile);
    } else {
      console.error('State is empty')
      throw new Error ('State is empty')
    }
  }
  const onCancelAddr = () => {
    setIsUpdatingAddr(false);
  }
  const onSaveCard = async () => {
    if (!consumer.data) throw noConsumerErr() 
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
        billing_details: { name: consumer.data.Profile.Name },
      });
    } catch (e) {
      const err =  new Error(`Failed to createPaymentMethod for accountName '${consumer.data.Profile.Name}'`);
      console.error(e.stack);
      throw err;
    }
    if (pm.error) {
      const err = new Error(`Failed to generate stripe payment method: ${JSON.stringify(pm.error)}`);
      console.error(err.stack);
      throw err;
    };
    const updatedProfile: IConsumerProfile = {
      ...consumer.data.profile,
      card: Card.getCardFromStripe(pm.paymentMethod!.card),
    }

    sendUpdateCardMetrics();
    updateMyProfile(consumer.data, updatedProfile);
    setIsUpdatingCard(false);
  };
  const onCancelCard = () => {
    setIsUpdatingCard(false);
  }

  return (
    <Container maxWidth='lg' className={classes.container}>
      <Notifier />
      <Typography variant='h3'>
        Profile
      </Typography>
      <List className={classes.list}>
        <ListItem divider disableGutters>
          <Labels
            primary='Name'
            secondary={consumerNameLabel}
          />
        </ListItem>
        <ListItem divider disableGutters>
          <Labels
            primary='Email'
            secondary={consumerEmailLabel}
          />
        </ListItem>
        <ListItem divider disableGutters>
          {
            isUpdatingPhone ?
            <div className={classes.stretch}>
              <PhoneInput
                className={classes.input}
                inputRef={phoneInputRef}
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
                secondary={consumerPhoneLabel}
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