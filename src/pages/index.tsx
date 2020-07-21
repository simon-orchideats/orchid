import { makeStyles, Typography, Button, Grid, useMediaQuery, Theme, useTheme, Avatar, Hidden } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { menuRoute } from './menu';
import Router, { useRouter } from 'next/router';
import { howItWorksRoute } from './how-it-works';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import React from 'react';
import { useGetConsumer, useGetConsumerFromPromo } from '../consumer/consumerService';
import { welcomePromoAmount, referralMonthDuration } from '../order/promoModel';
import Referral from '../client/general/Referral';
import { Carousel } from 'react-responsive-carousel';

const useStyles = makeStyles(theme => ({
  avatar: {
    marginTop: -10,
    marginLeft: -50,
    position: 'absolute',
    height: 75,
    width: 75,
    zIndex: 1,
    [theme.breakpoints.down('md')]: {
      height: 60,
      width: 60,
      marginLeft: -45,
    },
    [theme.breakpoints.down(500)]: {
      height: 40,
      width: 40,
      marginLeft: -25,
    },
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    },
  },
  check: {
    width: 32,
    [theme.breakpoints.down('sm')]: {
      width: 28
    },
    [theme.breakpoints.down('xs')]: {
      width: 22
    },
  },
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  carouselRow: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  welcome: {
    [theme.breakpoints.down('lg')]: {
      background: 'linear-gradient(rgba(255,252,241,.5), rgba(255,252,241,.5)), url(/home/yellow-plating.png)',
      backgroundPosition: '50% 75%',
      backgroundSize: 'cover',
    },
    backgroundImage: `url(/home/yellow-plating.png)`,
    backgroundPosition: '50% 60%',
    backgroundSize: 'cover',
    height: 410,
    marginTop: -theme.mixins.navbar.marginBottom
  },
  welcomeTitle: {
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: '3.25rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '3rem',
    },
  },
  welcomeText: {
    maxWidth: 600, // chosen by inspection
    minWidth: 375,
    [theme.breakpoints.down('sm')]: {
      paddingBottom: 50,
    },
  },
  verticalMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  topMargin: {
    marginTop: theme.spacing(1),
  },
  mediumVerticalMargin: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(5),
  },
  largeVerticalMargin: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  plans: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 100,
    backgroundImage: 'url(/home/friends.png)',
    backgroundPosition: '50% 60%',
    backgroundSize: 'cover',
    height: 750,
    paddingBottom: 32,
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      paddingTop: 50, // determined by inspection
    },
    [theme.breakpoints.down('sm')]: {
      height: 900,
    }
  },
  testimonialsTitle: {
    [theme.breakpoints.down(1250)]: {
      paddingLeft: '0px !important',
    },
    [theme.breakpoints.down(1600)]: {
      paddingLeft: 400,
    },
    paddingLeft: 100,
  },
  testimonialsContainer: {
    [theme.breakpoints.down(1200)]: {
      paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.down(1450)]: {
      paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.down('lg')]: {
      backgroundImage: 'linear-gradient(rgba(255,252,241,.5), rgba(255,252,241,.5)), url(/home/yellow-peach.png)',
      paddingRight: theme.spacing(4),
      alignItems: 'center',
    },
    backgroundImage: `url(/home/yellow-peach.png)`,
    backgroundPosition: '20% 50%',
    backgroundSize: 'cover',
    display: 'flex',
    alignItems: 'flex-end',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 600,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
  orchidFood: {
    width: '100%',
  },
  testimonial: {
    textAlign: 'left',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    maxWidth: 350,
    borderRadius: 20,
    borderStyle: 'solid',
    alignItems: 'flex-start',
    backgroundColor: theme.palette.common.white,
    borderColor: theme.palette.text.primary,
    [theme.breakpoints.down('md')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(2),
    },
    position: 'relative',
  },
  testimonials: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
    },
  },
  subtitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.35rem'
    },
  },
  testimonialHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  headerAvatar: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    },
  },
  t0: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 200,
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      marginBottom: 0,
    },
  },
  t1: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 200,
    [theme.breakpoints.down('md')]: {
      marginLeft: -55,
      marginTop: theme.spacing(3),
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
    },
  },
  t2: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 210,
    marginLeft: -200,
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(3),
      marginLeft: 80,
      marginBottom: 0,
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
      marginBottom: 0,
    },
  },
  t3: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: -100,
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(3),
      marginLeft: -60,
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: 0,
    },
  },
  quote: {
    height: 20
  },
  lowWidth: {
    maxWidth: 200,
  },
  icon: {
    maxWidth: 85,
    height: 85,
    marginBottom: theme.spacing(1),
  },
  arrow: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(5),
      transform: 'rotate(-90deg) scaleX(-1)',
      height: 50,
      marginLeft: theme.spacing(1),
      marginBottom: 0,
    },
  },
  shrinker: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.75rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.15rem',
    },
  },
  whySubtitle: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
      fontWeight: 400,
    },
  },
  howSubtitle: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
  },
  title: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
      fontWeight: 500,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.50rem',
    },
  },
  plansTitle: {
    backgroundColor: theme.palette.common.white,
    marginBottom: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    borderStyle: 'solid',
    borderColor: '#ed8d81',
  },
  promotion: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  bold: {
    fontWeight: 600,
  },
  owner: {
    width: 150,
    height: 150,
    backgroundSize: 'cover',
  },
  who: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
    backgroundColor: theme.palette.common.white,
  },
  referralBottom: {
    marginBottom: theme.mixins.navbar.marginBottom
  },
  cloud: {
    width: 180,
    minHeight: 70,
    background: theme.palette.common.white,
    borderRadius: 100,
    position: 'relative',
    '&::before': {
      top: -20,
      right: 95,
      width: 60,
      height: 60,
      borderRadius: 200,
      content: '" "',
      position: 'absolute',
      background: theme.palette.common.white,
      zIndex: 1,
    },
    '&::after': {
      top: -30,
      left: 70,
      width: 80,
      height: 80,
      borderRadius: 100,
      content: '" "',
      position: 'absolute',
      background: theme.palette.common.white,
      zIndex: 1,
    },
  },
  cloudText: {
    position: 'absolute',
    zIndex: 2,
  },
  marginLeft: {
    marginLeft: theme.spacing(1),
  }
}));

const Welcome = () => {
  const classes = useStyles();
  const onClick = () => {
    Router.push(menuRoute);
  }
  return (
    <div className={`${classes.welcome} ${classes.centered}`}>
      <Grid container alignItems='center'>
        <Hidden smDown>
          <Grid
            item
            md={4}
            className={classes.centered}
          >
            <div className={classes.cloud}>
              <Typography variant='h5' className={classes.cloudText}>
                Free weekly delivery
              </Typography>
            </div>
          </Grid>
        </Hidden>
        <Grid
          item
          xs={12}
          md={4}
          className={classes.centered}
        >
          <div className={classes.welcomeText}>
            <Typography variant='h2' className={classes.welcomeTitle}>
              Restaurants
            </Typography>
            <Typography variant='h2' className={`${classes.welcomeTitle} ${classes.largeBottomMargin}`}>
              in your fridge
            </Typography>
            <Typography variant='h5' className={`${classes.title}`}>
              A meal plan subscription to restaurants
            </Typography>
            <Button
              variant='contained'
              color='primary'
              onClick={() => onClick()}
              size='large'
            >
              Explore Menu
            </Button>
          </div>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
        >
          <Grid container>
            <Grid
              item
              xs={6}
              md={12}
              className={classes.centered}
            >
              <div className={classes.cloud}>
                <Typography variant='h5' className={classes.cloudText}>
                  One low, flat price
                </Typography>
              </div>
            </Grid>
            <Grid
              item
              xs={6}
              md={12}
              className={classes.centered}
            >
              <Hidden mdUp>
                <div className={classes.cloud}>
                  <Typography variant='h5' className={classes.cloudText}>
                    Free weekly delivery
                  </Typography>
                </div>
              </Hidden>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const Why = () => {
  const classes = useStyles();
  const Content: React.FC<{
    badTitle: string
    goodTitle: string
    img: string,
  }> = ({
    badTitle,
    goodTitle,
    img
  }) => (
    <div className={`${classes.centered} ${classes.verticalMargin}`}>
      {
        img &&
        <img
          src={img}
          alt='logo'
          className={classes.icon}
        />
      }
      <Typography variant='h5' className={classes.whySubtitle}>
        ❌&nbsp;{badTitle}
      </Typography>
      <Typography variant='h5' className={classes.whySubtitle}>
        {<img
          src='/home/check.png'
          alt='check'
          className={classes.check}
        />}
        &nbsp;
        {goodTitle}
      </Typography>
    </div>
  )
  return (
    <div className={`${classes.largeVerticalMargin} ${classes.centered}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        Why Orchid?
      </Typography>
      <Grid
        container
        className={classes.verticalMargin}
      >
        <Grid
          item
          className={classes.centered}
          xs={12} 
          sm={12}
          md={4}
        >
          <Content
            badTitle='You order 3+ deliveries a week'
            goodTitle='Subscribe & save'
            img='home/piggy-bank.svg'
          />
        </Grid>
        <Grid
          item
          className={classes.centered}
          xs={12} 
          sm={12}
          md={4}
        >
          <Content
            badTitle='You hate waiting for delivery'
            goodTitle='Just heat it up'
            img='home/buffet.svg'
          />
        </Grid>
        <Grid
          item
          className={classes.centered}
          xs={12} 
          sm={12}
          md={4}
        >
          <Content
            badTitle='You & roomies argue on what to eat'
            goodTitle="Mix n' match restaurants"
            img='home/eat.svg'
          />
        </Grid>
      </Grid>
      <Link href={menuRoute}>
        <Button
          className={classes.topMargin}
          variant='contained'
          color='primary'
          size='large'
        >
          Start mixing
        </Button>
      </Link>
    </div>
  );
};

const Slider = () => {
  const classes = useStyles();
  return (
    <>
      <Typography variant='h3' className={`${classes.title} ${classes.centered}`}>
        Our partners
      </Typography>
      <Carousel
        className={classes.topMargin}
        autoPlay
        infiniteLoop
        showArrows
        showStatus={false}
        interval={5000}
      >
        <div className={classes.carouselRow}>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/china-meal.jpg)" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/canteen-owner.jpg)" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              China Spice by Hanish & Peter
            </Typography>
          </div>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/gypsy-meal.jpg)" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/gypsy-owner.png" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              Gypsy Grill by Moudy
            </Typography>
          </div>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/marg-meal.jpg" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/marg-owner.jpg" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              Margherita's by Matt
            </Typography>
          </div>
        </div>
        <div className={classes.carouselRow}>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/greens-meal.jpg" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/quality-greens-owner.jpg" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              Quality Greens Kitchen by Steven
            </Typography>
          </div>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/rumba-meal.jpg" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/rumba-owner.jpg" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              Rumba Cubana by ALan & Nairelys
            </Typography>
          </div>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/shaka-meal.jpg" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/shaka-owner.jpeg" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              Shaka Bowl by Kiersten & Krista
            </Typography>
          </div>
        </div>
        <div className={classes.carouselRow}>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/taq-meal.jpg" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/taq-owner.png" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              La Taqueria Downtown by Andrea & Phil
            </Typography>
          </div>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/tonys-meal.jpg" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/tonys-owner.jpg" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              Tony Boloney's by Mike
            </Typography>
          </div>
          <div>
            <div className={classes.row}>
              <div style={{ backgroundImage: "url(/home/wurst-meal.jpg" }} className={classes.owner} />
              <div style={{ backgroundImage: "url(/home/wurst-owner.jpg" }} className={classes.owner} />
            </div>
            <Typography variant='h6'>
              Würstbar by Aaron
            </Typography>
          </div>
        </div>
      </Carousel>
    </>
  )
}

const HowItWorks = () => {
  const classes = useStyles();
  const Content: React.FC<{
    title: string,
    description: string,
    img: string,
  }> = ({
    title,
    description,
    img
  }) => (
    <Grid
      item
      xs={12}
      sm={12}
      md={4}
    >
      <div className={`${classes.verticalMargin} ${classes.row}`}>
        <img
          src={img}
          alt='logo'
          className={classes.icon}
        />
        <div className={classes.marginLeft}>
          <Typography variant='h5' className={classes.howSubtitle}>
            {title}
          </Typography>
          <Typography variant='subtitle1' className={`${classes.lowWidth} ${classes.verticalMargin}`}>
            {description}
          </Typography>
        </div>
      </div>
    </Grid>
  )
  return (
    <div className={`${classes.largeVerticalMargin} ${classes.centered}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        How it Works
      </Typography>
      <Grid container className={classes.verticalMargin}>
        <Content
          title="Mix n' Match"
          description='Pick meals from different restaurants'
          img='home/mix.png'
        />
        <Content
          title='Enjoy'
          description='Eat fresh meals now or save for later'
          img='home/microwave2.png'
        />
        <Content
          title='Subscribe'
          description='Tell when and what to deliver each week'
          img='home/calendar.png'
        />
      </Grid>
      <Link href={howItWorksRoute}>
        <Button
          variant='contained'
          color='primary'
          size='large'
        >
          Learn More
        </Button>
      </Link>
    </div>
  );
};

const Plans = withClientApollo(() => {
  const classes = useStyles();
  return (
    <div className={`${classes.plans}`}>
      <div className={`${classes.plansTitle} ${classes.centered}`}>
        <Typography variant='h3' className={`${classes.shrinker} ${classes.title}`}>
          Weekly Plans
        </Typography>
        <Typography variant='h6'>
          Change, skip, cancel anytime
        </Typography>
      </div>
      <PlanCards />
      <Link href={menuRoute}>
        <Button
          className={`${classes.topMargin} ${classes.centered}`}
          variant='contained'
          color='primary'
          size='large'
        >
          SEE MENU
        </Button>
      </Link>
    </div>
  )
});

const Promotion = withClientApollo(() => {
  const classes = useStyles();
  const consumer = useGetConsumer();
  const theme = useTheme<Theme>();
  const router = useRouter();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));
  const a = router.query.a as string;
  const p = router.query.p as string;
  const res = useGetConsumerFromPromo(p);
  const referralDollars = a ? parseFloat(a) / 100 : 0;
  const consumerData = consumer.data;
  if (consumerData && consumerData.Plan) return null;
  const name = res.name;
  if (name) {
    const referral = referralDollars * 4 * referralMonthDuration;
    const fName = name.split(' ')[0].toLowerCase();
    return (
      <div className={`${classes.mediumVerticalMargin} ${classes.centered} ${classes.promotion}`}>
        <Typography variant={isSmAndDown ? 'h5' : 'h4'} className={classes.bold}>
          Welcome from {fName.charAt(0).toUpperCase() + fName.slice(1)}!
        </Typography>
        <Typography variant={isSmAndDown ? 'h5' : 'h4'} className={classes.bold}>
          ${referral} off your first month, auto applied at checkout
        </Typography>
      </div>
    )
  }
  const basePromoAmount = ((welcomePromoAmount * 4 * referralMonthDuration) / 100);
  return (
    <div className={`${classes.centered} ${classes.promotion}`}>
      <Typography variant={isSmAndDown ? 'h5' : 'h4'} className={classes.bold}>
        Get ${basePromoAmount} off! Limited time only
      </Typography>
      <Typography variant='body2' className={classes.topMargin}>
        Promotion over your first month, auto applied at checkout
      </Typography>
    </div>
  );
});

const ReferralWelcome = withClientApollo(() => {
  const classes = useStyles();
  const consumer = useGetConsumer();
  const consumerData = consumer.data;
  if (!consumerData || !consumerData.Plan) return null;
  return (
    <div className={classes.referralBottom}>
      <Referral />
    </div>
  )
});

const Testimonials = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.testimonialsContainer}`}>
      <div>
        <Typography
          variant='h3'
          className={`
            ${classes.title}
            ${classes.largeBottomMargin}
            ${classes.shrinker}
            ${classes.centered}
            ${classes.testimonialsTitle}
        `}>
          What People Say
        </Typography>
        <div className={classes.testimonials}>
          <div className={classes.t0}>
            <Avatar className={classes.avatar} src='/home/alma.png' />
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <div className={classes.testimonialHeader}>
                <div>
                  <Avatar className={classes.headerAvatar} src='/home/alma.png' />
                  <Typography variant='body1' className={classes.bold}>
                    Alma
                  </Typography>
                </div>
                <Typography variant='body1'>
                  May 15
                </Typography>
              </div>
              <Typography variant='body1' className={classes.bold}>
                "I'm so thankful for this 😭"
              </Typography>
              <Typography variant='body1'>
                It's like Christmas every Tuesday
              </Typography>
              <img src='/home/orchidFood.png' className={classes.orchidFood} />
            </div>
          </div>
          <div className={classes.t1}>
            <Avatar className={classes.avatar} src='/home/josh.jpg' />
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <div className={classes.testimonialHeader}>
                <div>
                  <Avatar className={classes.headerAvatar} src='/home/josh.jpg' />
                  <Typography variant='body1' className={classes.bold}>
                    Josh
                  </Typography>
                </div>
                <Typography variant='body1'>
                  June 23
                </Typography>
              </div>
              <Typography variant='body1' className={classes.bold}>
                "It's honestly a no-brainer"
              </Typography>
              <Typography variant='body1' >
                I do love it. We're tired of having to work, cook and do dishes, so this
                is a great opportunity to support our restaurants plus making things more convenient for us
              </Typography>
            </div>
          </div>
          <div className={classes.t2}>
            <Avatar className={classes.avatar} src='/home/brandon.jpg' />
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <div className={classes.testimonialHeader}>
                <div>
                  <Avatar className={classes.headerAvatar} src='/home/brandon.jpg' />
                  <Typography variant='body1' className={classes.bold}>
                    Brandon
                  </Typography>
                </div>
                <Typography variant='body1'>
                  March 24
                </Typography>
              </div>
              <Typography variant='body1'className={classes.bold}>
                "Other apps cost way too much"
              </Typography>
              <Typography variant='body1'>
                Even small orders. The delivery and service fees add up. That's why I use Orchid
              </Typography>
            </div>
          </div>
          <div className={classes.t3}>
            <Avatar className={classes.avatar} src='/home/arv.jpg' />
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <div className={classes.testimonialHeader}>
                <div>
                  <Avatar className={classes.headerAvatar} src='/home/arv.jpg' />
                  <Typography variant='body1' className={classes.bold}>
                    Arvinder
                  </Typography>
                </div>
                <Typography variant='body1'>
                  June 4
                </Typography>
              </div>
              <Typography variant='body1' className={classes.bold}>
                "It's so convenient"
              </Typography>
              <Typography variant='body1'>
                I don't have to think about food
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <>
      <ReferralWelcome />
      <Welcome />
      <Promotion />
      <Why />
      <Slider />
      <Plans />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';