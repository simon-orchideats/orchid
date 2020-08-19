import { makeStyles, Typography, Button, Grid, useMediaQuery, Theme, useTheme, Avatar, Hidden, GridList, GridListTile, GridListTileBar, Container } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { menuRoute } from './menu';
import Router from 'next/router';
import { howItWorksRoute } from './how-it-works';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import React from 'react';
import { useGetConsumer } from '../consumer/consumerService';
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
  titleBar: {
    background: 'rgba(255, 255, 255, 0.9)',
    height: 60,
    [theme.breakpoints.down('sm')]: {
      height: 40
    },
    [theme.breakpoints.down('xs')]: {
      height: 20
    },
  },
  title: {
    paddingBottom: theme.spacing(6),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
      fontWeight: 500,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.50rem',
    },
  },
  titleWrap: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  titleBarText: {
    color: theme.palette.text.primary,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    [theme.breakpoints.down(1080)]: {
      backgroundSize: 1080,
    },
    [theme.breakpoints.down('md')]: {
      backgroundPosition: '36% 60%',
    },
    [theme.breakpoints.down('sm')]: {
      backgroundSize: 960,
    },
    [theme.breakpoints.down('xs')]: {
      background: 'linear-gradient(rgba(255,252,241,0), rgba(255,252,241,0)), url(/home/yellow-plating-mobile.png)',
      backgroundPosition: '0% 100%',
      backgroundSize: 'cover',
      justifyContent: 'flex-start',
    },
    backgroundImage: `url(/home/yellow-plating-desk.png)`,
    backgroundPosition: '50% 60%',
    backgroundSize: 'cover',
    marginTop: -theme.mixins.navbar.marginBottom,
    minHeight: 475,
    height: 700,
    // - the promo banner then the top margin of how-it-works
    maxHeight: `calc(100vh - ${theme.mixins.toolbar.height}px - 115.5px - 150px)`,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      maxHeight: `calc(100vh - ${(theme.mixins.toolbar as any)[theme.mixins.customToolbar.toolbarLandscapeQuery].height}px - 115.5px - 150px)`,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      maxHeight: `calc(100vh - ${(theme.mixins.toolbar as any)[theme.mixins.customToolbar.toolbarWidthQuery].height}px - 115.5px - 150px)`,
    },
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: '4rem',
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: '3.5rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.8rem',
    },
  },
  welcomeSub: {
    textAlign: 'center',
    paddingBottom: theme.spacing(2),
    maxWidth: 150,
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
      fontWeight: 500,
    },
    [theme.breakpoints.down('xs')]: {
      maxWidth: 200,
      fontSize: '1.50rem',
    },
  },
  welcomeText: {
    maxWidth: 600, // chosen by inspection
    minWidth: 320,
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(4),
      paddingBottom: 50,
      justifyContent: 'flex-start',
      maxWidth: 300,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(6),
      maxWidth: 400,
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
  bottomMargin: {
    marginBottom: theme.spacing(3),
  },
  largeVerticalMargin: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  plans: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 50,
    backgroundImage: 'url(/home/plans.png)',
    backgroundPosition: '50% 60%',
    backgroundSize: 'cover',
    height: 750,
    paddingBottom: 32,
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      paddingTop: 50, // determined by inspection
    },
    [theme.breakpoints.down('sm')]: {
      height: 1000,
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
  why: {
    minHeight: 400,
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
  },
  tableFood: {
    width: '100%',
  },
  sample: {
    backgroundColor: theme.palette.common.white,
    minHeight: 400,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
  },
  sampleImg: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(0),
    },
    paddingLeft: theme.spacing(2),
    width: '100%'
  },
  sampleTitle: {
    [theme.breakpoints.down('sm')]: {
      paddingBottom: theme.spacing(1),
    },
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
  lowWidth: {
    maxWidth: 200,
  },
  icon: {
    maxWidth: 85,
    height: 85,
    marginBottom: theme.spacing(1),
  },
  shrinker: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.75rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.15rem',
    },
  },
  subtitle: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
  },
  ctaButton: {
    marginTop: theme.spacing(4),
  },
  weeklyPlans: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
      fontWeight: 500,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.50rem',
    },
  },
  partners: {
    backgroundColor: theme.palette.common.white,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(2),
  },
  partnersContainer: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  plansTitle: {
    backgroundColor: theme.palette.common.white,
    marginBottom: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    borderStyle: 'solid',
    borderColor: theme.palette.common.pink,
  },
  promotion: {
    backgroundColor: theme.palette.common.pink,
    color: theme.palette.common.white,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  moneyBack: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  bold: {
    fontWeight: 600,
  },
  how: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    minHeight: 400,
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
  stretch: {
    width: '100%',
    height: '100%',
    [theme.breakpoints.down('sm')]: {
      transform: 'none',
      left: 'auto',
      top: 0,
    },
  },
}));

const Welcome = () => {
  const classes = useStyles();
  const onClick = () => {
    Router.push(menuRoute);
  }
  return (
    <div className={classes.welcome}>
      <div className={classes.welcomeText}>
        <Typography variant='h3' className={classes.welcomeTitle}>
          Mix & match
        </Typography>
        <Typography variant='h3' className={`${classes.welcomeTitle}`}>
          restaurants
        </Typography>
        <Typography variant='h3' className={`${classes.welcomeTitle} ${classes.bottomMargin}`}>
          Easy & Affordable
        </Typography>
        <Grid container>
          <Grid item xs={6}>
            <div className={classes.centered}>
              <Typography variant='h4' className={`${classes.welcomeSub}`}>
                😍 Free weekly delivery
              </Typography>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.centered}>
              <Typography variant='h4' className={`${classes.welcomeSub}`}>
                🙏 No service charge
              </Typography>
            </div>
          </Grid>
        </Grid>
        <Button
          variant='contained'
          color='primary'
          onClick={() => onClick()}
          size='large'
        >
          Explore Menu
        </Button>
      </div>
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
      <Typography variant='h5' className={classes.subtitle}>
        ❌&nbsp;{badTitle}
      </Typography>
      <Typography variant='h5' className={classes.subtitle}>
        <img
          src='/home/check.png'
          alt='check'
          className={classes.check}
        />
        &nbsp;
        {goodTitle}
      </Typography>
    </div>
  )
  return (
    <div className={`${classes.why} ${classes.largeVerticalMargin} ${classes.centered}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        Why Table?
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
            badTitle='You order 2+ deliveries a week'
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
            goodTitle='Save time & just reheat'
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
            goodTitle="Everyone gets what they want"
            img='home/eat.svg'
          />
        </Grid>
      </Grid>
      <Link href={menuRoute}>
        <Button
          className={classes.ctaButton}
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
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));
  const isLg = useMediaQuery(theme.breakpoints.down('lg'));
  const Slide: React.FC<{
    ownerImg: string,
    title: string,
    subtitle: string,
    m1: string,
    m2: string,
    m3: string,
    m4: string,
    m5: string,
    m6: string
  }> = ({
    ownerImg,
    title,
    subtitle,
    m1,
    m2,
    m3,
    m4,
    m5,
    m6,
  }) => {
      const owner = (
        <>
          <img src={ownerImg} className={classes.stretch} />
          <GridListTileBar
            className={classes.titleBar}
            classes={{
              titleWrap: classes.titleWrap
            }}
            title={
              <Typography
                variant={isSm ? 'body1' : 'h5'}
                className={classes.titleBarText}
              >
                {title}
              </Typography>
            }
            subtitle={
              !isSm &&
              <Typography
                variant={'h6'}
                className={classes.titleBarText}
              >
                {subtitle}
              </Typography>
            }
          />
        </>
      )
      let height: 'auto' | number;
      if (isSm) {
        height = 'auto';
      } else if (isMd) {
        height = 215;
      } else if (isLg) {
        height = 250;
      } else {
        height = 275;
      }
      return (
        <Grid container>
          <Grid
            item
            md={4}
          >
            <Hidden smDown>
              <GridList
                cols={1}
                cellHeight={height}
                className={classes.stretch}
              >
                <GridListTile rows={2}>
                  {owner}
                </GridListTile>
              </GridList>
            </Hidden>
          </Grid>
          <Grid item md={8} sm={12}>
            <GridList cols={3} cellHeight={height}>
              <GridListTile>
                {isSm ? owner : <img src={m1} className={classes.stretch} />}
              </GridListTile>
              <GridListTile>
                <img src={m2} className={classes.stretch} />
              </GridListTile>
              <GridListTile>
                <img src={m3} className={classes.stretch} />
              </GridListTile>
              <GridListTile>
                <img src={m4} className={classes.stretch} />
              </GridListTile>
              <GridListTile>
                <img src={m5} className={classes.stretch} />
              </GridListTile>
              <GridListTile>
                <img src={m6} className={classes.stretch} />
              </GridListTile>
            </GridList>
          </Grid>
        </Grid>
      );
    }
  return (
    <div className={`${classes.partners}`}>
      <Container maxWidth='xl' className={classes.partnersContainer}>
        <Typography variant='h3' className={`${classes.title} ${classes.centered}`}>
          Featured Partners
        </Typography>
        <Carousel
          className={classes.topMargin}
          autoPlay
          stopOnHover
          infiniteLoop
          showArrows
          showThumbs={false}
          dynamicHeight={false}
          swipeable={false}
          showStatus={false}
          interval={5000}
          transitionTime={300}
          swipeScrollTolerance={500}
        >
          <Slide
            ownerImg='/home/canteen/owner.jpg'
            title='Hanish & Peter'
            subtitle='Canteen Desi Dhaba owners'
            m1='/home/canteen/baigan-bartha.jpg'
            m2='/home/canteen/butter-chicken.jpg'
            m3='/home/canteen/chicken-biryani.jpg'
            m4='/home/canteen/chicken-tikka.jpg'
            m5='/home/canteen/lamb-rogan-josh.jpg'
            m6='/home/canteen/paneer-tikka-masala.jpg'
          />
          <Slide
            ownerImg='/home/greens/owner.jpg'
            title='Steven'
            subtitle='Quality Greens Kitchen owner'
            m1='/home/greens/avo-salad.jpg'
            m2='/home/greens/umami-crunch.jpg'
            m3='/home/greens/grilled-organic-tofu.jpg'
            m4='/home/greens/kale-caesar.jpg'
            m5='/home/greens/rosemary-roasted-chicken.jpg'
            m6='/home/greens/vegetable-trio.jpg'
          />
          <Slide
            ownerImg='/home/gypsy/owner.png'
            title='Moudy'
            subtitle='Gypsy Grill owner'
            m1='/home/gypsy/chicken-kabob-sandwhich.jpg'
            m2='/home/gypsy/chicken-shawarma.jpg'
            m3='/home/gypsy/fattoush.jpg'
            m4='/home/gypsy/feta.jpg'
            m5='/home/gypsy/lamb-beef-shawafel.jpg'
            m6='/home/gypsy/m1.jpg'
          />
          <Slide
            ownerImg='/home/marg/owner.jpg'
            title='Matt'
            subtitle="Margherita's owner"
            m1='/home/marg/eggplant-parm.jpg'
            m2='/home/marg/m1.jpg'
            m3='/home/marg/meatball-parm.jpg'
            m4='/home/marg/penne-vodka.jpg'
            m5='/home/marg/sausage-peppers.jpg'
            m6='/home/marg/rigatoni-meat.jpg'
          />
          <Slide
            ownerImg='/home/rumba/owner.jpg'
            title='Alan & Nairelys'
            subtitle="Rumba Cubana owners"
            m1='/home/rumba/el-revolico.jpg'
            m2='/home/rumba/fritas.jpg'
            m3='/home/rumba/ropa-vieja.jpg'
            m4='/home/rumba/rumba-meal.jpg'
            m5='/home/rumba/sandwich-cubano.jpg'
            m6='/home/rumba/trio-de-empanadas.jpg'
          />
          <Slide
            ownerImg='/home/shaka/owner.jpeg'
            title='Kiersten & Krista'
            subtitle="Shaka Bowl owners"
            m1='/home/shaka/earth.jpg'
            m2='/home/shaka/hilo.jpg'
            m3='/home/shaka/kong.jpg'
            m4='/home/shaka/molokai-cacao.jpg'
            m5='/home/shaka/ono.jpg'
            m6='/home/shaka/big-island.jpg'
          />
          <Slide
            ownerImg='/home/taqueria/owner.png'
            title='Andrea & Phil'
            subtitle="La Taqueria owner"
            m1='/home/taqueria/barbocoa-taco.png'
            m2='/home/taqueria/bistec-quesadilla.jpg'
            m3='/home/taqueria/chorizo-quesadilla.jpg'
            m4='/home/taqueria/flauta-plate.png'
            m5='/home/taqueria/pescado-taco.png'
            m6='/home/taqueria/taq-meal.jpg'
          />
          <Slide
            ownerImg='/home/tonys/owner.jpg'
            title='Mike'
            subtitle="Tony Boloney's owner"
            m1='/home/tonys/aloo-fries.jpg'
            m2='/home/tonys/casino.jpg'
            m3='/home/tonys/general.jpg'
            m4='/home/tonys/magic-fries.jpg'
            m5='/home/tonys/tonys-meal.jpg'
            m6='/home/tonys/winger.jpg'
          />
          <Slide
            ownerImg='/home/wurst/owner.jpg'
            title='Aaron'
            subtitle="Würstbar owner"
            m1='/home/wurst/blue-nose.jpg'
            m2='/home/wurst/haus-brat.jpg'
            m3='/home/wurst/haus-poutine.jpg'
            m4='/home/wurst/king-brat.jpg'
            m5='/home/wurst/king-marcus.jpg'
            m6='/home/wurst/the-general.jpg'
          />
        </Carousel>
      </Container>
    </div>
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
      md={3}
    >
      <div className={`${classes.verticalMargin} ${classes.centered}`}>
        <img
          src={img}
          alt='logo'
          className={classes.icon}
        />
        <Typography variant='h5' className={classes.subtitle}>
          {title}
        </Typography>
        <Typography variant='subtitle1' className={`${classes.lowWidth} ${classes.verticalMargin}`}>
          {description}
        </Typography>
      </div>
    </Grid>
  )
  return (
    <div className={`${classes.largeVerticalMargin} ${classes.centered} ${classes.how}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        How it Works
      </Typography>
      <Grid
        container
        className={classes.verticalMargin}
      >
        <Content
          title="Mix n' Match"
          description='Pick meals from different restaurants'
          img='home/mix.png'
        />
        <Content
          title='Set combined delivery'
          description='Choose a time & day for weekly deliveries'
          img='how-it-works/delivery-man.png'
        />
        <Content
          title='Eat whenever'
          description='Eat meals throughout the week'
          img='home/refrigerator.png'
        />
        <Content
          title="Subscribe"
          description="Skip weeks, pick future meals, or let us pick"
          img='home/calendar.png'
        />
      </Grid>
      <Link href={howItWorksRoute}>
        <Button
          className={classes.ctaButton}
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
        <Typography variant='h3' className={`${classes.shrinker} ${classes.weeklyPlans}`}>
          Subscribe & Save
        </Typography>
        <Typography variant='h6'>
          Change, skip, cancel anytime
        </Typography>
      </div>
      <PlanCards />
      <Link href={menuRoute}>
        <Button
          className={`${classes.ctaButton} ${classes.centered}`}
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
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));
  const consumerData = consumer.data;
  if (consumerData && consumerData.Plan) return null;
  const basePromoAmount = ((welcomePromoAmount * 4 * referralMonthDuration) / 100);
  return (
    <div className={`${classes.centered} ${classes.promotion}`}>
      <Typography variant={isSmAndDown ? 'h5' : 'h4'} className={classes.bold}>
        ${basePromoAmount} off your 1st month!
      </Typography>
      <Typography variant={isSmAndDown ? 'h6' : 'h5'} className={classes.bold}>
        Auto applied at checkout
      </Typography>
    </div>
  );
});

const MoneyBack = () => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <div className={`${classes.centered} ${classes.moneyBack}`}>
      <Typography variant={isSmAndDown ? 'h5' : 'h4'} className={classes.bold}>
        100% money back guaranteed
      </Typography>
    </div>
  );
};

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

const Sample = () => {
  const classes = useStyles();
  return (
    <div className={classes.sample}>
      <Container maxWidth='xl'>
        <Grid container justify='center'>
          <Grid
            item
            sm={12} 
            md={4}
            className={classes.centered}
          >
            <Typography
              variant='h3'
              className={`
                ${classes.title}
                ${classes.shrinker}
                ${classes.sampleTitle}
              `}
            >
              Local meal plan subscription
            </Typography>
            <Typography
              variant='h5'
              className={`
                ${classes.subtitle}
                ${classes.sampleTitle}
                ${classes.verticalMargin}
              `}
            >
              Restaurants in your fridge, delivered together
            </Typography>
          </Grid>
          <Grid
            item
            sm={12}
            md={8}
            className={classes.centered}
          >
            <img src='/home/sample2.jpg' className={classes.sampleImg} />
          </Grid>
        </Grid>
      </Container>

    </div>
  )
}

const Testimonials = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.testimonialsContainer}`}>
      <div>
        <Typography
          variant='h3'
          className={`
            ${classes.title}
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
              <img src='/home/sample.jpg' className={classes.tableFood} />
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
              <Typography variant='body1' className={classes.bold}>
                "Other apps cost way too much"
              </Typography>
              <Typography variant='body1'>
                Even small orders. The delivery and service fees add up. That's why I use Table
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
      <Sample />
      <HowItWorks />
      <Plans />
      <MoneyBack />
      <Why />
      <Slider />
      <Testimonials />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';