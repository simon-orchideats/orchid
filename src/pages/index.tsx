import { makeStyles, Typography, Button, Grid, useMediaQuery, Theme, useTheme, Avatar } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { menuRoute } from './menu';
import RestIcon from '@material-ui/icons/RestaurantMenu';
import TodayIcon from '@material-ui/icons/Today';
import Router, { useRouter } from 'next/router';
import { howItWorksRoute } from './how-it-works';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import React from 'react';
import { useGetConsumer, useGetConsumerFromPromo } from '../consumer/consumerService';
import WeekendIcon from '@material-ui/icons/Weekend';
import { welcomePromoAmount, referralMonthDuration } from '../order/promoModel';
import Referral from '../client/general/Referral';

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
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  welcome: {
    [theme.breakpoints.down('lg')]: {
      background: 'linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url(bowls.jpg)',
      backgroundPosition: '50% 75%',
      backgroundSize: 'cover',
    },
    backgroundImage: `url(/bowls.jpg)`,
    backgroundPosition: '50% 75%',
    backgroundSize: 'cover',
    height: 400,
    marginTop: -theme.mixins.navbar.marginBottom
  },
  friends: {
    background: 'linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url(/home/friends.jpeg)',
    backgroundSize: 'cover',
    height: 800,
    backgroundPosition: '50% 50%',
    marginTop: -theme.mixins.navbar.marginBottom,
    marginBottom: theme.spacing(12),
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
    maxWidth: 600 // chosen by inspection
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
    backgroundImage: `url(/home/board.jpeg)`,
    backgroundPosition: '70% 30%',
    backgroundSize: 'cover',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 400,
    padding: theme.spacing(3),
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
      backgroundImage: 'linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url(/home/peach.png)',
      paddingRight: theme.spacing(4),
      alignItems: 'center',
    },
    backgroundImage: `url(/home/peach.png)`,
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
  },
  headerAvatar: {
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    },
  },
  bubbleTip: {
    content: '""',
    position: 'absolute',
    zIndex: 0,
    bottom: 0,
    left: -7,
    height: 20,
    width: 20,
    borderBottomRightRadius: 15,
  },
  bubble: {
    borderRadius: 20,
    padding: '8px 15px',
    position: 'relative',
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
  lowWidth: {
    maxWidth: 200,
  },
  microwave: {
    maxWidth: 135,
    height: 78,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('xs')]: {
      height: 38,
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
  howIcon: {
    fontSize: 90,
    [theme.breakpoints.down('xs')]: {
      fontSize: 59,
    },
  },
  howSubtitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.25rem',
    },
  },
  title: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.50rem',
    },
  },
  promotion: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  bold: {
    fontWeight: 600,
  },
  who: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
    backgroundColor: theme.palette.common.white,    
  },
  referralBottom: {
    marginBottom: theme.mixins.navbar.marginBottom
  }
}));

const Welcome = () => {
  const classes = useStyles();
  const onClick = () => {
    Router.push(menuRoute);
  }
  return (
    <div className={`${classes.welcome} ${classes.centered}`}>
      <div className={classes.welcomeText}>
        <Typography variant='h2' className={classes.welcomeTitle}>
          Potluck, but from restaurants
        </Typography>
        <Typography variant='h4' className={classes.title}>
          A weekly meal plan delivery
        </Typography>
        <Typography variant='subtitle1' className={classes.verticalMargin}>
          Mix n’ match meals at one flat price from different restaurants
        </Typography>
        <Button variant='contained' color='primary' onClick={() => onClick()}>
          Explore Menu
        </Button>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const classes = useStyles();
  const Content: React.FC<{
    title: string,
    description: string,
    img?: string,
    icon?: JSX.Element,
  }> = ({
    title,
    description,
    icon,
    img
  }) => (
    <Grid item xs={12} sm={12} md={3}>
      <div className={classes.centered}>
        {
          img &&
          <img
            src={img}
            alt='logo'
            className={classes.microwave}
          />
        }
        {
          icon && icon
        }
        <Typography variant='h5' className={classes.howSubtitle}>
          {title}
        </Typography>
        <Typography variant='subtitle1' className={`${classes.lowWidth} ${classes.verticalMargin}`}>
          {description}
        </Typography>
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
          icon={<RestIcon className={classes.howIcon} />}
        />
        <Content
          title='Save time'
          description='Tell us a time and day to deliver'
          icon={<TodayIcon className={classes.howIcon}/>}
        />
        <Content
          title='Enjoy'
          description='Eat now, share, or save for later'
          img='home/microwave.png'
        />
        <Content
          title='Subscribe'
          description='Pick meals each week or let us pick'
          icon={<WeekendIcon className={classes.howIcon} />}
        />
      </Grid>
      <Typography variant='subtitle1' className={classes.title}>
        Questions or Comments? Email us at simon@orchideats.com to learn more.
      </Typography>
      <Link href={howItWorksRoute}>
        <Button variant='outlined' color='primary'>Learn More</Button>
      </Link>
    </div>
  );
};

const Plans = withClientApollo(() => {
  const classes = useStyles();
  return (
    <div className={`${classes.plans} ${classes.centered}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        Choose a Plan
      </Typography>
      <Typography variant='h4' className={`${classes.largeBottomMargin} ${classes.centered} ${classes.subtitle}`}>
        Customize a meal plan to fit your lifestyle. Starting at $9.99 per meal
      </Typography>
      <PlanCards />
      <Link href={menuRoute}>
        <Button
          variant='contained'
          color='primary'
          className={classes.largeVerticalMargin}
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
    <div className={`${classes.mediumVerticalMargin} ${classes.centered} ${classes.promotion}`}>
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
            ${classes.largeBottomMargin}
            ${classes.shrinker}
            ${classes.centered}
            ${classes.testimonialsTitle}
        `}>
          What People Say
        </Typography>
        <div className={classes.testimonials}>
          <div className={classes.t0}>
            <Avatar className={classes.avatar} src='/home/alma.png'/>
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <img src='/home/bubble.png' className={classes.bubbleTip}/>
              <div className={classes.testimonialHeader}>
                <Avatar className={classes.headerAvatar} src='/home/alma.png'/>
                <Typography variant='body1' className={classes.bold}>
                  Alma
                </Typography>
              </div>
              <Typography variant='body1'>
                I'm so thankful for this 😭
              </Typography>
              <img src='/home/orchidFood.png' className={classes.orchidFood} />
            </div>
          </div>
          <div className={classes.t1}>
            <Avatar className={classes.avatar} src='/home/josh.jpg'/>
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <img src='/home/bubble.png' className={classes.bubbleTip}/>
              <div className={classes.testimonialHeader}>
                <Avatar className={classes.headerAvatar} src='/home/josh.jpg'/>
                <Typography variant='body1' className={classes.bold}>
                  Josh
                </Typography>
              </div>
              <Typography variant='body1' >
                I do love it, it's honestly a no-brainer, were are tired of having to work, cook and do dishes, so this
                is a great opportunity to support our restaurants plus making things more convenient for us
              </Typography>
            </div>
          </div>
          <div className={classes.t2}>
            <Avatar className={classes.avatar} src='/home/brandon.jpg' />
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <img src='/home/bubble.png' className={classes.bubbleTip}/>
              <div className={classes.testimonialHeader}>
                <Avatar className={classes.headerAvatar} src='/home/brandon.jpg' />
                <Typography variant='body1' className={classes.bold}>
                  Brandon
                </Typography>
              </div>
              <Typography variant='body1' >
                Other apps cost way too much. Even small orders. The delivery and service fees add up. That's why I use Orchid
              </Typography>
            </div>
          </div>
          <div className={classes.t3}>
            <Avatar className={classes.avatar} src='/home/arv.jpg' />
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <img src='/home/bubble.png' className={classes.bubbleTip}/>
              <div className={classes.testimonialHeader}>
                <Avatar className={classes.headerAvatar} src='/home/arv.jpg' />
                <Typography variant='body1' className={classes.bold}>
                  Arvinder
                </Typography>
              </div>
              <Typography variant='body1'>
                It's so convenient. I don't have to think about food
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
      <Plans />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';