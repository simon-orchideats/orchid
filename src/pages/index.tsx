import { makeStyles, Typography, Button, Grid, useMediaQuery, Theme, useTheme, Avatar, Container } from '@material-ui/core';
import Link from 'next/link';
import { menuRoute } from './menu';
import Router from 'next/router';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import React from 'react';
import SearchAreaInput from '../client/general/inputs/SearchAreaInput';
import { plansRoute } from './plans';
import { useSetSearchArea } from '../client/global/state/cartState';

const deskBody1FontSize = '1.5rem';
const deskBody2FontSize = '1.2rem';

const useStyles = makeStyles(theme => ({
  body1: {
    [theme.breakpoints.down('sm')]: {
      fontSize: deskBody2FontSize
    },
    fontSize: deskBody1FontSize
  },
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
    [theme.breakpoints.down('sm')]: {
      width: deskBody2FontSize
    },
    width: deskBody1FontSize
  },
  red: {
    color: theme.palette.common.red,
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
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logos: {
    width: '30%'
  },
  welcome: {
    [theme.breakpoints.down('xs')]: {
      backgroundPosition: '0%',
      backgroundImage: `url(/home/home-m-sm.jpg)`,
    },
    backgroundImage: `url(/home/home-banner2.jpg)`,
    backgroundPosition: '100%',
    backgroundSize: 'cover',
    marginTop: -theme.mixins.navbar.marginBottom,
    minHeight: 475,
    height: 700,
    // - the promo banner then the top margin of how-it-works
    maxHeight: `calc(100vh - ${theme.mixins.customToolbar.height}px - 50px)`,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      maxHeight: `calc(100vh - ${theme.mixins.customToolbar.landscapeHeight}px - 115.5px - 150px)`,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      maxHeight: `calc(100vh - ${theme.mixins.customToolbar.smallHeight}px - 115.5px - 150px)`,
    },
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  welcomeSearch: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  welcomeTitle: {
    fontSize: '4rem',
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: '3.5rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.3rem',
    },
    [theme.breakpoints.down(380)]: {
      fontSize: '2rem',
    },
  },
  membersSave: {
    fontSize: '2.75rem',
    fontWeight: 500,
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.5rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2rem',
    },
    [theme.breakpoints.down(380)]: {
      fontSize: '1.8rem',
    },
  },
  welcomeText: {
    minWidth: 320,
    marginTop: theme.spacing(4),
  },
  verticalMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  mediumVerticalMargin: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  bottomMargin: {
    marginBottom: theme.spacing(3),
  },
  sushiContainer: {
    padding: theme.spacing(4),
    backgroundColor: theme.palette.common.white,
  },
  sushi: {
    width: '100%',
    maxWidth: 500,
    marginLeft: theme.spacing(2),
  },
  underline: {
    textDecoration: 'underline'
  },
  plans: {
    backgroundImage: `url(/home/try.jpg)`,
    backgroundPosition: '50% 90%',
    backgroundSize: 'cover',
    height: 475,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: theme.spacing(4),
    textAlign: 'center',
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
      paddingRight: theme.spacing(4),
    },
    backgroundColor: '#fffef1',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: 600,
    padding: theme.spacing(4),
  },
  tableFood: {
    width: '100%',
  },
  subtitle: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
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
  shrinker: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.75rem',
    },
    [theme.breakpoints.down('xs')]: {
    fontSize: '2.15rem',
    },
  },
  ripOff: {
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
  comparisonTextContainer: {
    paddingTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
}));

const Welcome = withClientApollo(() => {
  const classes = useStyles();
  const setSearchArea = useSetSearchArea();
  const onSelectLocation = (area: string) => {
    setSearchArea(area)
    Router.push(menuRoute);
  }
  return (
    <div className={classes.welcome}>
      <div className={classes.welcomeText}>
        <Typography variant='h3' className={classes.welcomeTitle}>
          <b>Restaurant delivery,</b>
        </Typography>
        <Typography
          variant='h3'
          className={`${classes.welcomeTitle} ${classes.red}`}
        >
          <b>without the ripoffs</b>
        </Typography>
        <div className={classes.welcomeSearch}>
          <SearchAreaInput onSelect={area => onSelectLocation(area)} />
        </div>
        <Typography variant='h3' className={classes.membersSave}>
          <b>Members save 30% vs</b>
        </Typography>
        <img src='/home/logos.png' className={classes.logos}/>
      </div>
    </div>
  );
});

const Plans = withClientApollo(() => {
  const classes = useStyles();
  return (
    <div className={classes.plans}>
      <Typography variant='h3'>
        Try Table <b>FREE</b> for 30 days
      </Typography>
      <Link href={menuRoute}>
        <Button
          className={classes.mediumVerticalMargin}
          variant='contained'
          color='primary'
          size='large'
        >
          Get Started
        </Button>
      </Link>
      <Typography variant='body2'>
        Then pay as low as $1.49/month. Cancel anytime. 100% satisfaction or money back guaranteed
      </Typography>
      <Link href={plansRoute}>
        <Button
          className={classes.underline}
          color='inherit'
          variant='text'
        >
          Explore memberships
        </Button>
      </Link>
    </div>
  );
});

const RipOff = () => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <div className={`${classes.centered} ${classes.ripOff}`}>
      <Typography variant={isSmAndDown ? 'h3' : 'h2'} className={classes.red}>
        <b>LOWEST PRICE GUARANTEED</b>
      </Typography>
    </div>
  );
};

const Comparison = () => {
  const classes = useStyles();
  return (
    <div className={classes.sample}>
      <Container maxWidth='xl'>
        <Grid container justifyContent='center'>
          <Grid
            item
            xs={12}
            md={6}
            className={classes.centered}
          >
            <img src='/home/chart.png' className={classes.sampleImg} />
          </Grid>
          <Grid
            item
            container
            className={classes.comparisonTextContainer}
            xs={12}
            md={6}
          >
            {/* <Grid item xs={6}>
              <Typography
                variant='h5'
                align='center'
                className={`
                  ${classes.subtitle}
                  ${classes.sampleTitle}
                  ${classes.verticalMargin}
                `}
              >
                <b>Other apps</b>
              </Typography>
              <Typography variant='body1' className={classes.body1}>
                ❌&nbsp;Price markups
              </Typography>
              <Typography variant='body1' className={classes.body1}>
                ❌&nbsp;Service fees
              </Typography>
              <Typography variant='body1' className={classes.body1}>
                ❌&nbsp;30% commission from restaurants
              </Typography>
            </Grid> */}
            <Grid item xs={12}>
              <Typography variant='h5' align='center'>
                <img
                  src='/home/check.png'
                  alt='check'
                  className={classes.check}
                />
                &nbsp;
                No markups
              </Typography>
              <p />
              <Typography variant='h5' align='center'>
                <img
                  src='/home/check.png'
                  alt='check'
                  className={classes.check}
                />
                &nbsp;
                No Service fees
              </Typography>
              <p />
              <Typography variant='h5' align='center'>
                <img
                  src='/home/check.png'
                  alt='check'
                  className={classes.check}
                />
                &nbsp;
                No commissions
              </Typography>
              <p />
              <Typography variant='h5' align='center'>
                <img
                  src='/home/check.png'
                  alt='check'
                  className={classes.check}
                />
                &nbsp;
                Extra discounts
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

const Sushi = () => {
  const classes = useStyles();
  return (
    <Grid container className={classes.sushiContainer}>
      <Grid
        item
        xs={5}
        className={classes.centered}
      >
        <Typography
          variant='body1'
          color='secondary'
          className={`${classes.body1} ${classes.red}`}
        >
          <del>
            <b>$24.11</b>
          </del>
        </Typography>
        <Typography variant='body1' className={classes.body1}>
          <b>$16.84</b>
        </Typography>
        <Typography variant='body1' className={classes.body1}>
          Okinawa Sushi Grill
        </Typography>
        <Typography variant='body1' className={classes.body1}>
          Hoboken, NJ
        </Typography>
      </Grid>
      <Grid item xs={7} className={classes.centered}>
        <img src='/home/sushi.jpg' className={classes.sushi} />
      </Grid>
    </Grid>
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
                My boyfriend and I can order guilt-free
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
                "It's so cheap"
              </Typography>
              <Typography variant='body1'>
                I don't have to compare prices anymore
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
      <Welcome />
      <RipOff />
      <Comparison />
      <Plans />
      <Sushi />
      <Testimonials />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';