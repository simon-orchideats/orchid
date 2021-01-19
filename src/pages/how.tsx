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
    // textAlign: 'center', 
    marginBottom: theme.spacing(4),
  },
  spacer: {
    marginTop: theme.spacing(3),
  },
  h5: {
    fontWeight: 400,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  arrow: {
    transform: 'scaleX(-1)',
  },
  // tableAlignment: {
  //   textAlign: 'right',
  //   [theme.breakpoints.down('md')]: {
  //     textAlign: 'left'
  //   },
  // },
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
  savingTitle: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      paddingTop: theme.spacing(2)
    },
    fontWeight: 500,
    paddingBottom: theme.spacing(1),
  },
  savings: {
    paddingTop: theme.spacing(3),
  },
  tldr: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: theme.spacing(2),
    alignItems: 'center',
  },
  imgContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  img: {
    width: '100%',
    maxWidth: 450,
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(2)
    },
  },
}))

// const Comparison: React.FC<{
//   table: string,
//   highlight?: boolean,
//   description: string,
//   other: string,
//   callout?: React.ReactNode
// }> = ({
//   table,
//   highlight = false,
//   description,
//   other,
//   callout
// }) => {
//   const classes = useStyles();
//   return (
//     <>
//       <Grid item xs={4}>
//         <Typography
//           variant='body1'
//           className={`${classes.text} ${highlight ? classes.priceHighlight : undefined}`}
//         >
//           {table}
//         </Typography>
//       </Grid>
//       <Grid item xs={4}>
//         <Typography
//           variant='body1'
//           align='center'
//           className={`${classes.text} ${highlight ? classes.priceHighlight : undefined}`}
//         >
//           {description}
//         </Typography>
//       </Grid>
//       <Grid item xs={4}>
//         <div className={classes.adjustableRow}>
//           <Typography
//             variant='body1'
//             className={`${classes.otherAppsAlignment} ${classes.text} ${highlight ? classes.priceHighlight : undefined}`}
//             >
//             {other}
//           </Typography>
//           {callout}
//         </div>
//       </Grid>
//     </>
//   )
// }

const how = () => {
  const classes = useStyles();
  return (
    <>
      <Container maxWidth='lg' className={classes.container}>
        <Typography variant='h4' className={classes.title}>
          How Table has the best deals
        </Typography>
        <Grid container>
          <Grid
            item
            xs={12}
            md={4}
            className={classes.imgContainer}
          >
            <img src='/how/cook.jpg' className={classes.img} />
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
            className={classes.center}
          >
            <Typography
              variant='h5'
              className={classes.savingTitle}
            >
              Saving restaurants $
            </Typography>
            <Typography variant='body1' className={classes.text}>
              Our restaurants used to pay 24-30% commission fees for every DoorDash and UberEats order. Because Table
              charges no commission fees, restaurants can use part of their 24-30% savings to offer you new exclusive
              discounts and lower prices.
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            className={classes.spacer}
          />
          <Grid
            item
            xs={12}
            md={4}
            className={classes.imgContainer}
          >
            <img src='/how/pizza.jpg' className={classes.img} />
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
            className={classes.center}
          >         
            <Typography
              variant='h5'
              className={classes.savingTitle}
            >
              Saving customers $
            </Typography>
            <Typography variant='body1' className={classes.text}>
              DoorDash and UberEats also markup prices and charge high fees to customers to cover the high costs of a
              large, fast, tech-centric delivery fleet. Because Table is a restaurant-fulfilled platform, we are able to
              eliminate all the costs of a “middle man”...meaning lower prices and zero fees.
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
          >         
            <Typography
              variant='h5'
              align='center'
              className={`${classes.savingTitle} ${classes.savings}`}
            >
              All this equals to ~30% lower prices
            </Typography>
          </Grid>
        </Grid>
        <p />
        <Typography variant='h4' className={classes.title}>
          How Table works
        </Typography>
        <Typography variant='body1' className={classes.text}>
          Table is a restaurant-fulfilled platform where restaurants directly handle pickups/deliveries, order fulfillment,
          and customer service. Because we do not charge fees to restaurants or customers nor have any operational costs,
          Table is able to operate from its payment processing fees as well as a future-planned paid membership plan for
          customers wanting additional discounts and special perks (think Costco memberships).
        </Typography>
      </Container>
      <Footer />
    </>
  )
}

export default how;

export const howRoute = '/how';