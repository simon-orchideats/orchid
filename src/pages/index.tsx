import { makeStyles, Typography, Button, Grid, useMediaQuery, Theme, useTheme, Avatar, Hidden, GridList, GridListTile, GridListTileBar } from '@material-ui/core';
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
    justifyContent: 'center',
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
  welcomeSub: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
      fontWeight: 500,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.50rem',
    },
  },
  ctaButton: {
    marginTop: theme.spacing(4),
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
  cloud: {
    display: 'flex',
    alignItems: 'center',
    width: 180,
    minHeight: 80,
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
  },
  stretch: {
    width: '100%',
    height: '100%'
  },
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
          <Grid item md={1}/>
          <Grid
            item
            md={3}
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
            <Typography variant='h5' className={`${classes.welcomeSub}`}>
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
          md={3}
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
        <Grid item md={1} xs={12} />
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
    <div className={`${classes.why} ${classes.largeVerticalMargin} ${classes.centered}`}>
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
            badTitle='You order out $40 each week'
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
            !isSm &&
            <Typography
              variant='h5'
              className={classes.titleBarText}
            >
              {title}
            </Typography>
          }
          subtitle={
            <Typography
              variant={isSm ? 'body1' : 'h6'}
              className={classes.titleBarText}
            >
              {!isSm && 'from '}{subtitle}
            </Typography>
          }
        />
      </>
    )
    return (
      <Grid container>
        <Grid
          item
          md={4}
        >
          <Hidden smDown>
            <GridList
              cols={1}
              cellHeight='auto'
              className={classes.stretch}
            >
              <GridListTile rows={2}>
                {owner}
              </GridListTile>
            </GridList>
          </Hidden>
        </Grid>
        <Grid item md={8} sm={12}>
          <GridList cols={3} cellHeight='auto'>
            <GridListTile>
              {isSm ? owner : <img src={m1} />}
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
          subtitle='Canteen Desi Dhaba'
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
          subtitle='Quality Greens Kitchen'
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
          subtitle='Gypsy Grill'
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
          subtitle="Margherita's"
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
          subtitle="Rumba Cubana"
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
          subtitle="Shaka Bowl"
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
          subtitle="La Taqueria"
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
          subtitle="Tony Boloney's"
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
          subtitle="Würstbar"
          m1='/home/wurst/blue-nose.jpg'
          m2='/home/wurst/haus-brat.jpg'
          m3='/home/wurst/haus-poutine.jpg'
          m4='/home/wurst/king-brat.jpg'
          m5='/home/wurst/king-marcus.jpg'
          m6='/home/wurst/the-general.jpg'
        />
      </Carousel>
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
    <div className={`${classes.largeVerticalMargin} ${classes.centered} ${classes.how}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        How it Works
      </Typography>
      <Grid container className={classes.verticalMargin}>
        <Content
          title="Mix n' Match"
          description='Pick meals from different restaurants for 1 delivery'
          img='home/mix.png'
        />
        <Content
          title='Enjoy'
          description='Eat meals now or save for later'
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
          Weekly Plans
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
      <HowItWorks />
      <Plans />
      <Why />
      <Slider />
      <Testimonials />
      <Footer />
    </>
  )
}
/**
 * for all screens, welcome banner, needs to show title of how it works
 * 
 * make dots green,
 * make why orchid same height as how orchid
 * 
 * remove extra margins
 * 
 * 
 * for how and why, inrease space between button and title
 */
export default Index;

export const indexRoute = '/';