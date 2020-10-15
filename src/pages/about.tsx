import { makeStyles, Container, Typography } from '@material-ui/core';
import Footer from '../client/general/Footer';

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center', 
    marginBottom: theme.spacing(4),
  },
  shrinker: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.75rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.15rem',
    },
  },
  title: {
    paddingBottom: theme.spacing(8),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
      fontWeight: 500,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.50rem',
    },
    fontWeight: 500,
  },
  text: {
    fontSize: '1.25rem',
  },
  fees: {
    width: '100%',
  },
  plus: {
    fontSize: 40,
  },
  paddingTop: {
    paddingTop: theme.spacing(4),
  },
  tldr: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
  },
  img: {
    width: 200
  },
}))

const about = () => {
  const classes = useStyles();
  return (
    <>
      <Container maxWidth='lg' className={classes.container}>
        <Typography variant='h2' className={`${classes.shrinker} ${classes.title}`}>
          We're the cheapest food app
        </Typography>
        <Typography variant='h4'>
          Table offers the lowest possible prices and no services fees. Our partnering restaurants can afford this
          because we take 0 commissions.
        </Typography>
        <Typography variant='h3' className={`${classes.shrinker} ${classes.title} ${classes.paddinTop}`}>
          Stop getting robbed by other apps
        </Typography>
        <img src='/plans/fees-sample.png' className={classes.fees} />
        <p />
        <Typography variant='h4' className={classes.paddingTop}>
          TL;DR
        </Typography>
        <div className={classes.tldr}>
          <img src='/plans/cost.png' className={classes.img} />
          <p className={classes.plus}>+</p>
          <img src='/plans/logos.png' className={classes.img} />
          <p className={classes.plus}>=</p>
          <img src='/logo-trans.png' className={classes.img} />
        </div>
      </Container>
      <Footer />
    </>
  )
}

export default about;

export const aboutRoute = '/about';