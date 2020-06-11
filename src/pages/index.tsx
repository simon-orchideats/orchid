import { makeStyles, Typography, Button, Grid, Container, Hidden, useMediaQuery, Theme, useTheme } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { menuRoute } from './menu';
import RestIcon from '@material-ui/icons/RestaurantMenu';
import TodayIcon from '@material-ui/icons/Today';
import Router from 'next/router';
import { howItWorksRoute } from './how-it-works';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import React, { Fragment } from 'react';
import { useGetConsumer } from '../consumer/consumerService';
import WeekendIcon from '@material-ui/icons/Weekend';
import MoneyOffIcon from '@material-ui/icons/MoneyOff';
import { welcomePromoAmount, autoPickPromoAmount, referralMonthDuration } from '../order/promoModel';
import Referral from '../client/general/Referral';

const useStyles = makeStyles(theme => ({
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  whoImg: {
    minHeight: 250,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
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
  subtitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.65rem'
    },
  },
  reasons: {
    background: 'none',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  lowWidth: {
    maxWidth: 150,
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
    paddingBottom: theme.spacing(2)
  },
  promotion: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  emailInput: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      marginBottom: theme.spacing(2),
    },
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

const Welcome = withClientApollo(() => {
  const classes = useStyles();
  const onClick = () => {
    Router.push(menuRoute);
  }
  return (
    <div className={`${classes.welcome} ${classes.centered}`}>
      <div className={classes.welcomeText}>
        <Typography variant='h2' className={classes.welcomeTitle}>
          Your week, catered.
        </Typography>
        <Typography variant='h4' className={classes.title}>
          redefine the way you eat
        </Typography>
        <Typography variant='subtitle1' className={classes.mediumVerticalMargin}>
          Weekly meal subscriptions from local restaurants starting at $9.99
        </Typography>
        <Button variant='contained' color='primary' onClick={() => onClick()}>
          START SAVING
        </Button>
      </div>
    </div>
  );
});

const HowItWorks = () => {
  const classes = useStyles();
  // const theme = useTheme();
  // const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
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
    <Grid item xs={12} sm={12} md={2}>
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
        <Grid item xs={12} sm={1} md={1} />
        <Content
          title='Mix and Match'
          description='Pick meals from any restaurant'
          icon={<RestIcon className={classes.howIcon} />}
        />
        <Content
          title='Affordable'
          description='Save 26-38% vs other apps'
          icon={<MoneyOffIcon className={classes.howIcon} />}
        />
        <Content
          title='Save time'
          description='Tell us when to deliver'
          icon={<TodayIcon className={classes.howIcon}/>}
        />
        <Content
          title='Flexible'
          description='Eat now, share, or save for later'
          img='home/microwave.png'
        />
        <Content
          title='Relax'
          description='Pick new meals or let us do it for you'
          icon={<WeekendIcon className={classes.howIcon} />}
        />
        <Grid item xs={12} sm={1} md={1} />
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

const Benefits = () => {
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
          <div className={classes.row}>
            <TextBlock
              title={title}
              description={description}
            />
          </div>
        </Grid>
      )
    } else {
      left = (
        <Grid item xs={5}>
          <div className={classes.row}>
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
          xs={5}
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
        <Grid item xs={2}/>
        {right}
      </>
    )
  }

  const explanations = [
    {
      title: 'Neighborhood food',
      description: `
        Food tastes better when cooked by somone you know. Ditch cross-country shipments, ice packs, and warehouse cooks
        from other meal plans. We deliver meals same-day fresh from local restaurants down the street.
      `,
      img: 'home/rest.jpeg',
      imgLeft: false,
    },
    {
      title: 'Come home to a warm meal',
      description: `
      Few things express love like coming home to a warm meal after a long day. No more waiting for a delivery or
      stressing over what to cook. Enjoy a meal right away.
      `,
      img: '/home/sharing.jpeg',
      imgLeft: true
    },
    {
      title: 'No service charge, ever',
      description: `
        There's no service fee when buying in-store, so why charge one online? Neighbors don't nickle and dime each
        other, so neither do we. Let's redefine ordering food online together.
      `,
      img: 'home/trade.jpg',
      imgLeft: false
    },
    {
      title: 'Save 26-38%',
      description: `
        Cooking 1 meal is inefficient. That's why we offer meal plans over single
        meals. You get bulk savings and a free weekly delivery. Save with each meal at $9.99 vs $16.00 after fees on
        other food apps.
      `,
      img: 'home/bulk.jpg',
      imgLeft: true
    },
  ]
  
  const title = (
    <>
      <Typography
        variant='h2'
        className={`${classes.largeBottomMargin} ${classes.centered} ${classes.shrinker}`}
      >
        Who we are
      </Typography>
      <Typography variant='h4' className={`${classes.largeBottomMargin} ${classes.centered} ${classes.subtitle}`}>
        We believe in connecting the community through food.
      </Typography>
    </>
  )
  return (
    <>
      <Hidden xsDown implementation='js'>
        <Container maxWidth='xl' className={`${classes.largeVerticalMargin} ${classes.reasons} ${classes.centered}`}>
          {title}
          <Grid container>
            {explanations.map((e, i) => 
              <Fragment key={i}>
                {i !== 0 && <Grid item xs={12} className={classes.largeVerticalMargin} />}
                <Explanation {...e} />
              </Fragment>
            )}
          </Grid>
        </Container>
      </Hidden>
      <Hidden smUp implementation='js'>
        <Container maxWidth='xs' className={`${classes.centered} ${classes.reasons} ${classes.largeVerticalMargin}`}>
          {title}
          {explanations.map(({ title, description }, i) => 
            <MobileBlock
              key={i}
              title={title}
              description={description}
            />
          )}
        </Container>
      </Hidden>
    </>
  )
}

const Promotion = withClientApollo(() => {
  const classes = useStyles();
  const consumer = useGetConsumer();
  const theme = useTheme<Theme>();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));
  const consumerData = consumer.data;
  if (consumerData && consumerData.Plan) return null;
  const autoAmount = (2 * autoPickPromoAmount / 100);
  const basePromoAmount = ((welcomePromoAmount * 4 * referralMonthDuration) / 100);
  const promoAmount = basePromoAmount + autoAmount;
  return (
    <div className={`${classes.mediumVerticalMargin} ${classes.centered} ${classes.promotion}`}>
      <Typography variant={isSmAndDown ? 'h5' : 'h4'} className={classes.bold}>
        ${promoAmount} off your first month, auto applied at checkout! 
      </Typography>
      <Typography variant='body2' className={classes.topMargin}>
        *${(welcomePromoAmount / 100)} off 4 weeks. ${autoAmount} applied on weeks 3 & 4 when you
        let Orchid pick your meals.
      </Typography>
      <Typography variant='body2' className={classes.topMargin}>
        Skipping or canceling terminates discounts
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

const Index = () => {
  return (
    <>
      <ReferralWelcome />
      <Welcome />
      <Promotion />
      <HowItWorks />
      <Plans />
      <Benefits />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';