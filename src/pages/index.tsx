import { makeStyles, Typography, Button, Grid, useMediaQuery, Theme, useTheme, Avatar } from '@material-ui/core';
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
      background: 'linear-gradient(rgba(255,252,241,.5), rgba(255,252,241,.5)), url(/home/yellow-plating.png)',
      backgroundPosition: '50% 75%',
      backgroundSize: 'cover',
    },
    backgroundImage: `url(/home/yellow-plating.png)`,
    backgroundPosition: '50% 60%',
    backgroundSize: 'cover',
    height: 400,
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
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 200,
    backgroundImage: 'url(/home/friends.png)',
    backgroundPosition: '50% 60%',
    backgroundSize: 'cover',
    height: 900,
    paddingBottom: 32,
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(4),
      height: 650,
    },
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
  lowWidth: {
    maxWidth: 200,
  },
  icon: {
    maxWidth: 135,
    height: 78,
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
  howIcon: {
    fontSize: 90,
    [theme.breakpoints.down('xs')]: {
      fontSize: 59,
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
      fontWeight: 400,
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
    paddingBottom: theme.spacing(4),
    fontWeight: 500,
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
          Restaurants
        </Typography>
        <Typography variant='h2' className={classes.welcomeTitle}>
          in your fridge
        </Typography>
        <Typography variant='h4' className={`${classes.title} ${classes.topMargin}`}>
          A weekly meal plan delivery
        </Typography>
        <Typography variant='subtitle1' className={classes.verticalMargin}>
          Mix n’ match meals in 1 delivery from different restaurants
        </Typography>
        <Button variant='contained' color='primary' onClick={() => onClick()}>
          Explore Menu
        </Button>
      </div>
    </div>
  );
};

const Why = () => {
  const classes = useStyles();
  const Content: React.FC<{
    emoji: string
    title: string,
    img: string,
  }> = ({
    emoji,
    title,
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
        {title}&nbsp;{emoji}
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
          container
          item
          xs={12} 
          sm={12}
          md={4}
        >
          <Grid
            item
            xs={4}
            md={12}
          >
            <Content
              // title="Do you order 3+ deliveries a week?"
              emoji='❌'
              title="You order 3+ deliveries a week"
              img='home/money.png'
            />
          </Grid>
          <Grid
            item 
            xs={4}
            md={12}
          >
            <img
              src='/home/down.svg'
              alt='logo'
              className={`${classes.icon} ${classes.arrow}`}
            />
          </Grid>
          <Grid
            item
            xs={4}
            md={12}
          >
            <Content
              emoji='🙌'
              title='Subscribe & save'
              img='home/piggy-bank.svg'
            />
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={12} 
          sm={12}
          md={4}
        >
          <Grid
            item
            xs={4}
            md={12}
          >
            <Content
              emoji='❌'
              // title='Do you hate waiting for delivery?'
              title='You hate waiting for delivery'
              img='home/snail.png'
            />
          </Grid>
          <Grid
            item 
            xs={4}
            md={12}
          >
            <img
              src='/home/down.svg'
              alt='logo'
              className={`${classes.icon} ${classes.arrow}`}
            />
          </Grid>
            <Grid
              item
              xs={4}
              md={12}
            >
            <Content
              emoji='🙌'
              title="Just heat it up"
              img='home/omelette.png'
            />
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={12} 
          sm={12}
          md={4}
        >
          <Grid
            item
            xs={4}
            md={12}
          >
            <Content
              emoji='❌'
              // title='Do you & roomies argue on what to eat?'
              title='You & roomies argue on what to eat'
              img='home/argue.png'
            />
          </Grid>
          <Grid
            item 
            xs={4}
            md={12}
          >
            <img
              src='/home/down.svg'
              alt='logo'
              className={`${classes.icon} ${classes.arrow}`}
            />
          </Grid>
          <Grid
            item
            xs={4}
            md={12}
          >
            <Content
              emoji='🙌'
              title="Mix n' match restaurants"
              img='home/eat.svg'
            />
          </Grid>
        </Grid>
      </Grid>
      <Link href={menuRoute}>
        <Button
          className={classes.topMargin}
          variant='contained'
          color='primary'
        >
          Start mixing
        </Button>
      </Link>
    </div>
  );
};

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
      md={3}
    >
      <div className={`${classes.verticalMargin} ${classes.centered}`}>
        <img
          src={img}
          alt='logo'
          className={classes.icon}
        />
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
          img='home/mix.png'
        />
        <Content
          title='Save time'
          description='Tell us a time and day to deliver'
          img='home/calendar.png'
        />
        <Content
          title='Enjoy'
          description='Eat some now and some later'
          img='home/microwave.png'
        />
        <Content
          title='Subscribe'
          description='Pick meals each week or let us pick'
          img='home/sofa.png'
        />
      </Grid>
      <Typography variant='subtitle1' className={classes.title}>
        Questions or comments? Email us at simon@orchideats.com
      </Typography>
      <Link href={howItWorksRoute}>
        <Button variant='contained' color='primary'>Learn More</Button>
      </Link>
    </div>
  );
};

const Plans = withClientApollo(() => {
  const classes = useStyles();
  return (
    <div className={`${classes.plans}`}>
      <Typography variant='h3' className={`${classes.shrinker} ${classes.plansTitle} ${classes.centered} ${classes.title}`}>
        Choose a Plan
      </Typography>
      <PlanCards />
      <Link href={menuRoute}>
        <Button
          className={`${classes.topMargin} ${classes.centered}`}
          variant='contained'
          color='primary'
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
                <Avatar className={classes.headerAvatar} src='/home/alma.png' />
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
            <Avatar className={classes.avatar} src='/home/josh.jpg' />
            <div className={`${classes.testimonial} ${classes.centered}`}>
              <div className={classes.testimonialHeader}>
                <Avatar className={classes.headerAvatar} src='/home/josh.jpg' />
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
      <Why />
      <Plans />
      <HowItWorks />
      <Testimonials />
      <Footer />
      <div>Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
      Icons made by <a href="https://www.flaticon.com/authors/flat-icons" title="Flat Icons">Flat Icons</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
      <div>Icons made by <a href="https://www.flaticon.com/free-icon/meal_1919230" title="Nikita Golubev">Nikita Golubev</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
      <div>Icons made by <a href="https://www.flaticon.com/authors/good-ware" title="Good Ware">Good Ware</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
      <div>Icons made by <a href="https://www.flaticon.com/authors/bqlqn" title="bqlqn">bqlqn</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    </>
  )
}

export default Index;

export const indexRoute = '/';