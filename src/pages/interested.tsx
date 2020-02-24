import { Container, makeStyles, Typography } from "@material-ui/core";
import Faq from "../client/general/Faq";
import withClientApollo from "../client/utils/withClientApollo";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: theme.spacing(4),
    background: 'none',
    height: 350,
    justifyContent: 'center'
  },
  header: {
    paddingBottom: theme.spacing(3),
  },
}));

const interested = () => {
  const classes = useStyles();
  return (
    <>
      <Container className={classes.container}>
        <Typography
          variant='h3'
          color='primary'
          className={classes.header}
        >
          Thank you for your interest
        </Typography>
        <Typography variant='h6'>
          We are still growing Orchid. We'll send an email when it's ready.
        </Typography>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(interested);

export const interestedRoute = '/interested';