import { Container, Typography, makeStyles, Button, List, ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { useState, useRef, createRef, useEffect } from "react";
import PhoneInput from '../../client/general/inputs/PhoneInput'
import  { useRequireConsumer } from '../../consumer/consumerService';
import withApollo from "../../client/utils/withPageApollo";
import { useSetConsumerState } from "../../client/global/state/consumerState";

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
  }
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

const profile = () => {
  const classes = useStyles();
  const validatePhoneRef = useRef<() => boolean>();
  const phoneInputRef = createRef<HTMLInputElement>();
  const [phoneLabel, setPhoneLabel] = useState<string>('609-513-8166')
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const consumer = useRequireConsumer(profileRoute);
  if (!consumer.data && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  console.log('profile');
  console.log(consumer.data);
  // let cache = useSetConsumerState(); 
  // console.log("cache");
  // if(consumer.data)
  // cache(consumer.data);
  
  const onSavePhone = () => {
    if (!validatePhoneRef.current!()) return;
    setIsUpdatingPhone(false);
    setPhoneLabel(phoneInputRef.current!.value);
  }
  const onCancelPhone = () => {
    setIsUpdatingPhone(false);
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
              <div>
                <PhoneInput
                  className={classes.input}
                  inputRef={phoneInputRef}
                  defaultValue={phoneLabel}
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
                  secondary={phoneLabel}
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
            <Labels
              primary='Payment'
              secondary='**** 10/24 123'
            />
            <ListItemSecondaryAction>
              <Button className={classes.link}>
                Edit
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem disableGutters>
            <Labels
              primary='Address'
              secondary='19 Middle st boston ma 02127'
            />
            <ListItemSecondaryAction>
              <Button className={classes.link}>
                Edit
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Container>
    </>
  )
}

export default withApollo(profile); 

export const profileRoute = '/consumer/profile';