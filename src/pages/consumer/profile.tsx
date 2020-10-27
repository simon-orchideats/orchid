import { Container, Typography, makeStyles, Button, List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { useState, useRef, createRef } from "react";
import PhoneInput from '../../client/general/inputs/PhoneInput'
import { useRequireConsumer, useUpdateMyProfile } from '../../consumer/consumerService';
import withApollo from "../../client/utils/withPageApollo";
import CardForm from "../../client/checkout/CardForm";
import { StripeProvider, Elements, ReactStripeElements, injectStripe } from "react-stripe-elements";
import { activeConfig } from "../../config";
import { isServer } from "../../client/utils/isServer";
import { IConsumerProfileInput } from "../../consumer/consumerModel";
import { Card } from "../../card/cardModel";
import { NotificationType } from "../../client/notification/notificationModel";
import { useNotify } from "../../client/global/state/notificationState";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import Notifier from "../../client/notification/Notifier";
import BaseInput from "../../client/general/inputs/BaseInput";
import SearchAreaInput from "../../client/general/inputs/SearchAreaInput";
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
  secondary: React.ReactNode,
}> = ({
  primary,
  secondary,
}) => (
  <ListItemText
    primary={primary}
    primaryTypographyProps={{
      variant: 'h6',
      color: 'inherit'
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
  const addr2InputRef = createRef<HTMLInputElement>();
  const instructionsInputRef = createRef<HTMLInputElement>();
  const [searchArea, setSearchArea] = useState<string>('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isUpdatingAddr, setIsUpdatingAddr] = useState(false);
  const [isUpdatingInstructions, setIsUpdatingInstructions] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [updateMyProfile, updateProfileRes] = useUpdateMyProfile();
  const notify = useNotify();
  useMutationResponseHandler(updateProfileRes, () => {
    notify('Profile updated', NotificationType.success, false);
  });
  const consumer = useRequireConsumer(profileRoute);
  let consumerAddressLabel = '';
  let consumerAddress2Label = '';
  let consumerCardLabel = '';
  let consumerPhoneLabel = '';
  let consumerNameLabel = '';
  let consumerEmailLabel = '';
  let instructionsLabel: string | null = '';
  const consumerData = consumer.data;
  if (!consumerData && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (consumerData) {
    if (consumerData.profile.searchArea?.primaryAddr) consumerAddressLabel = consumerData.profile.searchArea.primaryAddr;
    if (consumerData.profile.searchArea?.address2) consumerAddress2Label = consumerData.profile.searchArea.address2;
    if (consumerData.profile.card) consumerCardLabel = Card.getHiddenCardStr(consumerData.profile.card);
    if (consumerData.profile.phone) consumerPhoneLabel = consumerData.profile.phone;
    if (consumerData.profile.name) consumerNameLabel = consumerData.profile.name;
    if (consumerData.profile.email) consumerEmailLabel = consumerData.profile.email;
    if (consumerData.profile.serviceInstructions) instructionsLabel = consumerData.profile.serviceInstructions;
  }

  const noConsumerErr = () => {
    const err = new Error(`Consumer does not exist`);
    console.error(err.stack);
    return err;
  }
  const onSavePhone = () => {
    if (!consumerData) throw noConsumerErr() 
    if (!validatePhoneRef.current!()) return;
    setIsUpdatingPhone(false);
    const updatedProfile: IConsumerProfileInput = {
      ...consumerData.profile as IConsumerProfileInput,
      phone: phoneInputRef.current!.value
    }
    updateMyProfile(consumerData, updatedProfile);
  }
  const onCancelPhone = () => {
    setIsUpdatingPhone(false);
  }
  const onSaveAddr = () => {
    if (!consumerData) throw noConsumerErr();
    if (!searchArea) return;
    setIsUpdatingAddr(false);
    const updatedProfile: IConsumerProfileInput = {
      ...consumerData.profile as IConsumerProfileInput,
      searchArea: {
        primaryAddr: searchArea,
        address2: addr2InputRef.current!.value,
      },
    }
    updateMyProfile(consumerData, updatedProfile);
  }
  const onCancelAddr = () => {
    setIsUpdatingAddr(false);
  }
  const onSaveCard = async () => {
    if (!consumerData) throw noConsumerErr() 
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
        billing_details: { name: consumerData.profile.name },
      });
    } catch (e) {
      const err =  new Error(`Failed to createPaymentMethod for accountName '${consumerData.profile.name}'`);
      console.error(e.stack);
      throw err;
    }
    if (pm.error) {
      const err = new Error(`Failed to generate stripe payment method: ${JSON.stringify(pm.error)}`);
      console.error(err.stack);
      throw err;
    };
    const updatedProfile: IConsumerProfileInput = {
      ...consumerData.profile as IConsumerProfileInput,
      card: Card.getCardFromStripe(pm.paymentMethod!.card),
    }

    updateMyProfile(consumerData, updatedProfile, pm.paymentMethod!.id);
    setIsUpdatingCard(false);
  };
  const onCancelCard = () => {
    setIsUpdatingCard(false);
  }
  
  const onSaveInstructions = () => {
    if (!consumerData) throw noConsumerErr();
    setIsUpdatingInstructions(false);
    const updatedProfile: IConsumerProfileInput = {
      ...consumerData.profile as IConsumerProfileInput,
      serviceInstructions: instructionsInputRef.current!.value
    }
    updateMyProfile(consumerData, updatedProfile);
  }
  const onCancelInstructions = () => {
    setIsUpdatingInstructions(false);
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
                {
                  consumerPhoneLabel && 
                  <Button className={classes.link} onClick={() => setIsUpdatingPhone(true)}>
                    Edit
                  </Button>
                }
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
                {
                  consumerCardLabel && 
                  <Button className={classes.link} onClick={() => setIsUpdatingCard(true)}>
                    Edit
                  </Button>
                }
              </ListItemSecondaryAction>
            </>
          }
        </ListItem>
        <ListItem divider disableGutters>
        {
          isUpdatingAddr ?
          <div className={classes.stretch}>
            <div className={classes.input}>
              <SearchAreaInput onSelect={(addr: string) => setSearchArea(addr)} />
            </div>
            <div className={classes.input}>
              <BaseInput label='Apt #' inputRef={addr2InputRef} />
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
              secondary={
                <div>
                  <Typography variant='body1'>
                    {consumerAddressLabel}
                  </Typography>
                  <Typography variant='body1'>
                    {consumerAddress2Label}
                  </Typography>
                </div>
              }
            />
            <ListItemSecondaryAction>
              {
                consumerAddressLabel &&
                <Button className={classes.link} onClick={() => setIsUpdatingAddr(true)}>
                  Edit
                </Button>
              }
            </ListItemSecondaryAction>
          </>
        }
        </ListItem>
        <ListItem disableGutters>
          {
            isUpdatingInstructions ?
            <div className={classes.stretch}>
              <BaseInput
                className={classes.input}
                inputRef={instructionsInputRef}
              />
              <div className={classes.buttons}>
                <Button
                  className={classes.save}
                  onClick={onSaveInstructions}
                  variant='contained'
                  color='primary'
                >
                  Save
                </Button>
                <Button
                  onClick={onCancelInstructions}
                  variant='outlined'
                  color='inherit'
                >
                  Cancel
                </Button>
              </div>
            </div>
            :
            <>
              <Labels
                primary='Special requests or instructions'
                secondary={instructionsLabel ? instructionsLabel : ''}
              />
              <ListItemSecondaryAction>
                {
                  consumerAddressLabel &&
                  <Button className={classes.link} onClick={() => setIsUpdatingInstructions(true)}>
                    Edit
                  </Button>
                }
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