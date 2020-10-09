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
      backgroundImg: 'url(/home/burg-fries.png)',
      backgroundPosition: '100% 60%',
      backgroundSize: 'cover',
    },
    paddingTop: theme.spacing(5),
    backgroundImage: `url(/home/burg-fries.png)`,
    backgroundPosition: '0% 60%',
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
  why: {
    minHeight: 400,
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
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
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
          The cheapest
        </Typography>
        <Typography variant='h3' className={`${classes.welcomeTitle}`}>
          way to order food
        </Typography>
        <Typography variant='h3' className={`${classes.welcomeTitle} ${classes.bottomMargin}`}>
          frequently
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

// const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => {
//   const classes = useStyles();
//   return (
//     <>
//       <Typography variant='h4' className={`${classes.mediumBottomMargin} ${classes.subtitleShrinker}`}>
//         {title}
//       </Typography>
//       <Typography variant='h6' color='textSecondary'>
//         {description}
//       </Typography>
//     </>
//   )
// };

// const Explanation: React.FC<{
//   title: string,
//   description: string,
//   imgBackground?: React.ReactNode
// }> = ({
//   title,
//   description,
//   imgBackground,
// }) => {
//   const classes = useStyles();
//   const textBlock = (
//     <TextBlock
//       title={title}
//       description={description}
//     />
//   )
//   return (
//     <Grid item xs={12}className={classes.centered}>
//       {textBlock}
//       {imgBackground}
//     </Grid>
//   )
// }

// const Why = () => {
//   const classes = useStyles();
//   return (
//     <Container maxWidth='lg' className={classes.explainations}>
//       {/* <Typography variant='h2' className={`${classes.largeBottomMargin} ${classes.centered} ${classes.shrinker}`}>
//         Why Table?
//       </Typography> */}
//       <Grid container>
//         <Explanation
//           title="Avoid markups"
//           description={`Other apps markup orders by an average of ${AVERAGE_MARKUP_PERCENTAGE}%`}
//           // imgBackground={<img src='how-it-works/sandwich.png' className={classes.sandwich} alt='sandwich' />}
//         />
//         <Grid item xs={12} className={classes.largeVerticalMargin} />
//         <Explanation
//           title='Subscribe'
//           description="Bulk monthly ordering deserves bulk savings"
//         />
//         <Grid item xs={12} className={classes.largeVerticalMargin} />
//         <Explanation
//           title='Save'
//           description="Our members save an average of $8 per order!"
//         />
//         <Grid item xs={12} className={classes.largeVerticalMargin} />
//         <Explanation
//           title='Enjoy guilt free'
//           description='We take no commissions so we can happily pass savings to you'
//           // imgBackground={<img src='how-it-works/rice.png' className={classes.rice} alt='rice' />}
//         />
//         <Grid item xs={12} className={classes.largeVerticalMargin} />
//       </Grid>
//     </Container>
//   )
// };

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
      <Link href={menuRoute}>
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

const Index = () => {
  return (
    <>
      <Welcome />
      {/* <Why /> */}
      <HowItWorks />
      <Plans />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';