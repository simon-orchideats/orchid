import { makeStyles, Typography, Button, Grid, useMediaQuery, Theme, useTheme, Avatar, Hidden, ImageList, ImageListItem, ImageListItemBar, Container, TextField } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { menuRoute } from './menu';
import Router from 'next/router';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import { useSetSearchArea, useSetPlan } from '../client/global/state/cartState';
import { IPlan } from '../plan/planModel';
import SearchAreaInput from '../client/general/inputs/SearchAreaInput';
import { AVERAGE_MARKUP_PERCENTAGE } from '../order/cartModel';


// todo pivot: still need to clean up styles
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
      maxHeight: `calc(100vh - ${theme.mixins.customToolbar.landscapeHeight}px - 115.5px - 150px)`,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      maxHeight: `calc(100vh - ${theme.mixins.customToolbar.smallHeight}px - 115.5px - 150px)`,
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
  welcomeSearch: {
    backgroundColor: theme.palette.common.white
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



  
  img: {
    zIndex: 1,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  explainations: {
    backgroundColor: theme.palette.background.default,
  },
  // check: {
  //   width: 32,
  //   [theme.breakpoints.down('sm')]: {
  //     width: 28
  //   },
  //   [theme.breakpoints.down('xs')]: {
  //     width: 22
  //   },
  // },
  // centered: {
  //   textAlign: 'center',
  //   display: 'flex',
  //   flexDirection: 'column',
  //   alignItems: 'center',
  //   justifyContent: 'center'
  // },
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  gridBox: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2)
    },
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  mediumBottomMargin: {
    marginBottom: theme.spacing(2),
  },
  smallBottomMargin: {
    marginBottom: theme.spacing(1),
  },
  // largeVerticalMargin: {
  //   marginTop: theme.spacing(8),
  //   marginBottom: theme.spacing(8),
  // },
  largeBottomPadding: {
    paddingBottom: theme.spacing(8),
  },
  benefitsTitle: {
    paddingTop: theme.spacing(4),
  },
  padding: {
    padding: theme.spacing(4),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(4),
  },
  footer: {
    marginBottom: theme.spacing(8),
  },
  benefits: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
    backgroundColor: theme.palette.primary.light,    
  },
  // shrinker: {
  //   [theme.breakpoints.down('xs')]: {
  //     fontSize: '2.75rem',
  //   },
  // },
  subtitleShrinker: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.85rem',
    },
  },
  potatoes: {
    [theme.breakpoints.down('lg')]: {
      width: 525,
    },
    [theme.breakpoints.down('md')]: {
      width: 400,
      paddingBottom: 150,
    },
    [theme.breakpoints.down('sm')]: {
      width: 300,
    },
    paddingBottom: 75,
    width: 700,
    left: -20,
    position: 'absolute',
  },
  fruits: {
    [theme.breakpoints.down('lg')]: {
      width: 375,
    },
    [theme.breakpoints.down('md')]: {
      width: 300,
    },
    paddingBottom: 50,
    width: 500,
    right: 50,
    position: 'absolute',
  },
  rice: {
    [theme.breakpoints.down('lg')]: {
      width: 225,
    },
    [theme.breakpoints.down('md')]: {
      width: 180,
    },
    width: 300,
    right: 0,
    position: 'absolute',
  },
  benefitBox: {
    maxWidth: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sandwich: {
    [theme.breakpoints.down('lg')]: {
      width: 375,
    },
    [theme.breakpoints.down('md')]: {
      width: 300,
    },
    [theme.breakpoints.down('sm')]: {
      width: 280,
    },
    width: 500,
    left: 0,
    position: 'absolute',
  },
}));

const Welcome = withClientApollo(() => {
  const classes = useStyles();
  const onSelectLocation = () => {
    Router.push(menuRoute);
  }
  return (
    <div className={classes.welcome}>
      <div className={classes.welcomeText}>
        <Typography variant='h3' className={classes.welcomeTitle}>
          The cheapest way
        </Typography>
        <Typography variant='h3' className={`${classes.welcomeTitle} ${classes.bottomMargin}`}>
          to order food
        </Typography>
        <Grid container>
          <Grid item xs={6}>
            <div className={classes.centered}>
              <Typography variant='h4' className={`${classes.welcomeSub}`}>
                😍 No markups
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
        <div className={classes.welcomeSearch}>
          <SearchAreaInput onSelect={onSelectLocation} />
        </div>
      </div>
    </div>
  );
});

const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant='h4' className={`${classes.mediumBottomMargin} ${classes.subtitleShrinker}`}>
        {title}
      </Typography>
      <Typography variant='h6' color='textSecondary'>
        {description}
      </Typography>
    </>
  )
};

const Explanation: React.FC<{
  title: string,
  description: string,
  dividerTitle: string,
  dividerSubtitle: string,
  img: string,
  imgLeft: boolean
  imgBackground?: React.ReactNode
}> = ({
  title,
  description,
  dividerTitle,
  dividerSubtitle,
  img,
  imgLeft,
  imgBackground,
}) => {
  const classes = useStyles();
  let left;
  let right;
  const imgBlock = (
    <>
      <img src={img} className={classes.img} alt={img} />
      {imgBackground}
    </>
  )
  const textBlock = (
    <TextBlock
      title={title}
      description={description}
    />
  )
  if (imgLeft) {
    left = imgBlock;
    right = textBlock;
  } else {
    left = textBlock;
    right = imgBlock;
  }
  return (
    <>
      <Hidden smDown>
        <Grid item sm={5} className={classes.centered}>
          {left}
        </Grid>
        <Grid item sm={2} className={`${classes.centered} ${classes.divider}`}>
          <Typography variant='h6'>{dividerTitle}</Typography>
          <Avatar>{dividerSubtitle}</Avatar>
        </Grid>
        <Grid item sm={5} className={classes.centered}>
          {right}
        </Grid>
      </Hidden>
      <Hidden mdUp>
        <Grid item xs={12} className={classes.centered}>
          {imgBlock}
        </Grid>
        <Grid item xs={12} className={`${classes.centered} ${classes.divider}`}>
          <Typography variant='h6'>{dividerTitle}</Typography>
          <Avatar>{dividerSubtitle}</Avatar>
        </Grid>
        <Grid item xs={12}className={classes.centered}>
          {textBlock}
        </Grid>
      </Hidden>
    </>
  )
}

const Why = () => {
  const classes = useStyles();
  return (
    <>
      <Container maxWidth='lg' className={classes.explainations}>
        <Typography variant='h2' className={`${classes.largeBottomMargin} ${classes.centered} ${classes.shrinker}`}>
          Why Table?
        </Typography>
        <Grid container>
          <Explanation
            title="Avoid markups"
            description={`Other apps markup orders by an average of ${AVERAGE_MARKUP_PERCENTAGE}%`}
            dividerTitle='Step'
            dividerSubtitle='1'
            img='how-it-works/mix.jpg'
            imgLeft={true}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Subscribe'
            description="Bulk monthly ordering deserves bulk savings"
            dividerTitle='Step'
            dividerSubtitle='2'
            img='how-it-works/schedule.jpg'
            imgLeft={false}
            imgBackground={<img src='how-it-works/fruits.png' className={classes.fruits} alt='fruits' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Save'
            description="Our members save an average of $8 per order!"
            dividerTitle='Step'
            dividerSubtitle='3'
            img='how-it-works/deliver.jpg'
            imgLeft={true}
            imgBackground={<img src='how-it-works/sandwich.png' className={classes.sandwich} alt='sandwich' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Enjoy guilt free'
            description='We take no commissions so we can happily pass savings to you'
            dividerTitle='Step'
            dividerSubtitle='4'
            img='how-it-works/eating.jpg'
            imgLeft={false}
            imgBackground={<img src='how-it-works/rice.png' className={classes.rice} alt='rice' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
        </Grid>
      </Container>
    </>
  )
};

const Plans = withClientApollo(() => {
  const classes = useStyles();
  const setStripeProductPriceId = useSetPlan();
  const onClickButton = (plan: IPlan) => {
    setStripeProductPriceId(plan);
    Router.push(menuRoute);
  }
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
      <PlanCards 
        renderButton={p => 
          <Button
            // className={classes.marginTop}
            onClick={() => onClickButton(p)}
            variant='contained'
            color='primary'
            size='large'
            fullWidth
          >
            GET STARTED
          </Button>
        }
      />
    </div>
  )
});

const Index = () => {
  return (
    <>
      <Welcome />
      <Why />
      <Plans />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';