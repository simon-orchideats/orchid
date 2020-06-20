import { Typography, Grid, Container, makeStyles, Hidden } from "@material-ui/core";
import { Fragment } from "react";

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
  whoImg: {
    minHeight: 250,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },
  mediumVerticalMargin: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  verticalMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(5),
  },
  largeVerticalMargin: {
    marginTop: theme.spacing(5),
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
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    textAlign: 'left',
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
  const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <>
      <Typography
        variant='h4'
        className={`${classes.verticalMargin} ${classes.subtitle}`}
      >
        {title}
      </Typography>
      <Typography variant='subtitle1' color='textSecondary'>
        {description}
      </Typography>
    </>
  );
  const MobileBlock: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <div className={`${classes.centered} ${classes.largeBottomMargin}`}>
      <div className={classes.verticalMargin}>
        <TextBlock
          title={title}
          description={description}
        />
      </div>
    </div>
  );
  const Explanation: React.FC<{
    title: string,
    description: string,
    img: string,
    imgLeft: boolean
  }> = ({
    title,
    description,
    img,
    imgLeft,
  }) => {
    const classes = useStyles();
    let left;
    let right;
    if (imgLeft) {
      left = (
        <Grid
          item
          xs={5}
          className={classes.whoImg}
          style={{
            backgroundImage: `url(${img})`,
          }}
        />
      )
      right = (
        <Grid item xs={5}>
          <div className={classes.col}>
            <TextBlock
              title={title}
              description={description}
            />
          </div>
        </Grid>
      )
    } else {
      left = (
        <Grid item xs={12} md={5}>
          <div className={classes.col}>
            <TextBlock
              title={title}
              description={description}
            />
          </div>
        </Grid>
      );
      right = (
        <Grid
          item
          xs={12}
          md={5}
          className={classes.whoImg}
          style={{
            backgroundImage: `url(${img})`,
          }}
        />
      )
    }
    return (
      <>
        {left}
        <Grid item xs={12} md={2}/>
        {right}
      </>
    )
  }

  const explanations = [
    {
      title: 'Neighborhood food',
      description: `
        Food tastes better when cooked by someone you know. Ditch the other meal-plan services with cross-country shipments,
        ice packs, and warehouse cooks. We deliver meals same-day fresh from restaurants down the street.
      `,
      img: '/who-we-are/rest.jpeg',
      imgLeft: true
    },
    {
      title: 'No service charge, ever',
      description: `
        There's no service fee when buying in-store, so why charge one online? Neighbors don't nickle and dime each
        other, so neither do we. Let's redefine ordering food together.
      `,
      img: '/who-we-are/trade.jpg',
      imgLeft: false
    },
  ]
  
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
              <img src='/menu/canteen-dhaba/owner.jpg' className={classes.owner}/>
              <Typography variant='subtitle1'>
                Hanish & Peter
              </Typography>
              <Typography variant='subtitle2'>
                Brothers and owners of Canteen Dhaba + China Spice
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
              <img src='/menu/shaka/owner.jpeg' className={classes.owner}/>
              <Typography variant='subtitle1'>
                Kiersten & Krista
              </Typography>
              <Typography variant='subtitle2'>
                Sisters and owners of Shaka Bowl
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
              <img src='/menu/rumba-cubana/owner.jpg' className={classes.owner} />
              <Typography variant='subtitle1'>
                Alan & Nairelys
              </Typography>
              <Typography variant='subtitle2'>
                Husband and wife and owners of Rumba Cubana
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
      <Typography
        variant='h3'
        className={`${classes.largeVerticalMargin} ${classes.centered} ${classes.shrinker}`}
      >
        The neighborly things
      </Typography>
      <Hidden xsDown>
        <Grid container>
          {explanations.map((e, i) => 
            <Fragment key={i}>
              {i !== 0 && <Grid item xs={12} className={classes.largeVerticalMargin} />}
              <Explanation {...e} />
            </Fragment>
          )}
        </Grid>
      </Hidden>
      <Hidden smUp>
        <Container maxWidth='xs' className={classes.centered}>
          {explanations.map(({ title, description }, i) => 
            <MobileBlock
              key={i}
              title={title}
              description={description}
            />
          )}
        </Container>
      </Hidden>
    </Container>
  )
}

export default whoWeAre;

export const whoWeAreRoute = '/who-we-are';