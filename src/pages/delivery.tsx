import { Container, makeStyles, Typography } from "@material-ui/core";
import Faq from "../client/general/Faq";
import { useGetCart } from "../client/global/state/cartState";
import withClientApollo from "../client/utils/withClientApollo";
import Router from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import DeliveryDay from '../client/general/DeliveryDate'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  header: {
    paddingBottom: theme.spacing(4),
  },
  largePaddingBottom: {
    paddingBottom: theme.spacing(4),
  },
  smallPaddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  toggleButtonGroup: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  input: {
    alignSelf: 'stretch',
  },
  row: {
    display: 'flex',
  },
}));

const delivery = () => {
  const classes = useStyles();
  const cart = useGetCart();
  if (!cart && !isServer()) Router.replace(`${menuRoute}`);
  return (
    <>
      <Container className={classes.container}>
        <Typography
          variant='h3'
          color='primary'
          className={classes.header}
        >
          Choose a repeat delivery day
        </Typography>
        <DeliveryDay/>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(delivery);

export const deliveryRoute = '/delivery';