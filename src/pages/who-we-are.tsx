import { Typography, Grid, Container, makeStyles, Hidden } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  owner: {
    height: 200,
    width: 200,
  },
  grove: {
    maxWidth: 800,
  },
  smReview: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: 190,
  },
  review: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: 200,
  },
  mdReview: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: 160,
  },
  mediumVerticalMargin: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(5),
  },
  subtitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.35rem'
    },
  },
  reasons: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    background: theme.palette.common.white,
    marginTop: -theme.mixins.navbar.marginBottom
  },
  people: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: 250,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  shrinker: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.75rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.15rem',
    },
  },
  regularShrinker: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },
}));

const whoWeAre = () => {
  const classes = useStyles();
  const title = (
    <>
      <Typography
        variant='h3'
        className={`${classes.largeBottomMargin} ${classes.centered} ${classes.shrinker}`}
      >
        Who we are
      </Typography>
      <Typography variant='h4' className={`${classes.largeBottomMargin} ${classes.centered} ${classes.subtitle}`}>
        We believe in connecting the community through food
      </Typography>
    </>
  )
  return (
    <Container maxWidth='xl' className={`${classes.reasons} ${classes.centered}`}>
      <Container maxWidth='lg' className={`${classes.centered}`}>
        {title}
        <Typography
          variant='h6'
          align='left'
          className={classes.regularShrinker}
        >
          We used to know our neighbors. We used to know the chefs who cooked our food. But in today's busy lifestyle,
          we lost touch. We want our food now, and if it's not perfect, we leave a bad review. We forget these are moms and
          pops and brothers and sisters trying their best.
        </Typography>
        <Hidden xsDown mdUp>
          <img src='/who-we-are/mdReview.png' className={classes.mdReview} />
        </Hidden>
        <Hidden smDown>
          <img src='/who-we-are/review.png' className={classes.review} />
        </Hidden>
        <Hidden smUp mdUp>
          <img src='/who-we-are/smallReview.png' className={classes.smReview} />
        </Hidden>
        <Typography
          variant='h6' 
          align='left' 
          className={classes.regularShrinker}
        >
          This isn't how we treat neighbors. Food doesn't cook and deliver itself. Every step is made possible by the
          community. Orchid brings back humanity in every bite by putting people first.
        </Typography>
        <Grid
          container
          spacing={3}
          className={classes.mediumVerticalMargin}
        >
          <Grid
            item
            className={classes.row}
            xs={12}
            md={4}
          >
            <div className={classes.people}>
              <img src='/who-we-are/canteen.jpg' className={classes.owner}/>
              <Typography variant='subtitle1'>
                Hanish & Peter
              </Typography>
              <Typography variant='subtitle2'>
                Brothers of Canteen Dhaba + China Spice
              </Typography>
            </div>
          </Grid>
          <Grid
            item
            className={classes.row}
            xs={12}
            md={4}
          >
            <div className={classes.people}>
              <img src='/who-we-are/shaka.jpeg' className={classes.owner}/>
              <Typography variant='subtitle1'>
                Kiersten & Krista
              </Typography>
              <Typography variant='subtitle2'>
                Sisters of Shaka Bowl
              </Typography>
            </div>
          </Grid>
          <Grid
            item
            className={classes.row}
            xs={12}
            md={4}
          >
            <div className={classes.people}>
              <img src='/who-we-are/rumba.jpg' className={classes.owner} />
              <Typography variant='subtitle1'>
                Alan & Nairelys
              </Typography>
              <Typography variant='subtitle2'>
                Husband and wife of Rumba Cubana
              </Typography>
            </div>
          </Grid>
        </Grid>
        <Typography
          variant='h6'
          className={`${classes.mediumVerticalMargin} ${classes.regularShrinker}`}
          align='left'
        >
          Connecting people through food guides everything we do. We're not a food company. We're a people company.
          Putting a name to a restaurant is only step 1. We envision a community where strangers become
          friends through food.
        </Typography>
        <img src='/who-we-are/grove.jpeg' className={`${classes.grove} ${classes.mediumVerticalMargin}`} />
      </Container>
    </Container>
  )
}

export default whoWeAre;

export const whoWeAreRoute = '/who-we-are';