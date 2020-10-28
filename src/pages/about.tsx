import { makeStyles, Container, Typography, Grid } from '@material-ui/core';
import Footer from '../client/general/Footer';
import ForwardIcon from '@material-ui/icons/Forward';

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
  h5: {
    fontWeight: 400,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  arrow: {
    transform: 'scaleX(-1)',
  },
  tableAlignment: {
    textAlign: 'right',
    [theme.breakpoints.down('md')]: {
      textAlign: 'left'
    },
  },
  otherAppsAlignment: {
    textAlign: 'left',
    [theme.breakpoints.down('md')]: {
      textAlign: 'right'
    },
  },
  adjustableRow: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
  },
  priceHighlight: {
    fontWeight: 600,
  },
  callout: {
    color: theme.palette.common.red,
    fontWeight: 600,
    [theme.breakpoints.down('md')]: {
      display: 'none'
    },
  },
  text: {
    fontSize: '1.25rem',
  },
  plus: {
    fontSize: '2rem',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  tldr: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    alignItems: 'center',
  },
  img: {
    width: '25vw',
    maxWidth: 250,
  },
}))

const Comparison: React.FC<{
  table: string,
  highlight?: boolean,
  description: string,
  other: string,
  callout?: React.ReactNode
}> = ({
  table,
  highlight = false,
  description,
  other,
  callout
}) => {
  const classes = useStyles();
  return (
    <>
      <Grid item xs={4}>
        <Typography
          variant='body1'
          className={`${classes.tableAlignment} ${classes.text} ${highlight ? classes.priceHighlight : undefined}`}
        >
          {table}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography
          variant='body1'
          align='center'
          className={`${classes.text} ${highlight ? classes.priceHighlight : undefined}`}
        >
          {description}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <div className={classes.adjustableRow}>
          <Typography
            variant='body1'
            className={`${classes.otherAppsAlignment} ${classes.text} ${highlight ? classes.priceHighlight : undefined}`}
            >
            {other}
          </Typography>
          {callout}
        </div>
      </Grid>
    </>
  )
}

const about = () => {
  const classes = useStyles();
  return (
    <>
      <Container maxWidth='lg' className={classes.container}>
        <Typography variant='h4' className={classes.title}>
          Saving everyone money
        </Typography>
        <Typography variant='body1' className={classes.text}>
          Table's mission is to save the most money possible for both our customers and restaurants. We're tired of them
          both being ripped off by insane fees and commissions from 3rd party apps. By eliminating all these, we're able
          to give savings by offering:
        </Typography>
        <p />
        <Typography variant='h5' className={classes.h5}>
          - No markups
        </Typography>
        <Typography variant='h5' className={classes.h5}>
          - No service fees
        </Typography>
        <Typography variant='h5' className={classes.h5}>
          - Exclusive discounts
        </Typography>
        <p />
        <Grid container>
          <Grid item xs={4}>
            <Typography
              variant='h6'
              className={classes.tableAlignment}
            >
              Table
            </Typography>
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={4}>
            <Typography variant='h6' className={classes.otherAppsAlignment}>
              Other Apps
            </Typography>
          </Grid>
          <Comparison
            highlight
            table='37.35'
            description='Subtotal'
            other='40.09'
            callout={
              <div className={classes.row}>
                <ForwardIcon className={`${classes.arrow} ${classes.callout} ${classes.text}`} />
                <Typography variant='body1' className={`${classes.text} ${classes.callout}`} >
                  10% MARKUP
                </Typography>
              </div>
            }
          />
          <Comparison 
            table='3.74'
            description='Our discount'
            other=''
          />
          <Comparison 
            highlight
            table='33.61'
            description='Restaurant earns'
            other='30.55'
          />
          <Comparison 
            table='1.99'
            description='Delivery fee'
            other='1.99'
          />
          <Comparison
            highlight
            table='FREE'
            description='Service Fee'
            other='5.35'
            callout={
              <div className={classes.row}>
                <ForwardIcon className={`${classes.arrow} ${classes.callout} ${classes.text}`} />
                <Typography variant='body1' className={`${classes.text} ${classes.callout}`} >
                  WTF?
                </Typography>
              </div>
            }
          />
          <Comparison 
            table='3.16'
            description='Taxes'
            other='4.61'
          />
          <Comparison 
            highlight
            table='38.76'
            description='Total'
            other='30.55'
          />
        </Grid>
        <p />
        <Typography variant='h4' className={classes.title}>
          How Does Table Make Money?
        </Typography>
        <Typography variant='body1' className={classes.text}>
          Table operates through a membership plan just like Costco. Customers pay as low as $1.49/month to access
          Table’s rock bottom pricing 
        </Typography>
        <div className={classes.tldr}>
          <img src='/about/cost.jpg' className={classes.img} />
          <p className={classes.plus}>+</p>
          <img src='/home/logos.png' className={classes.img} />
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