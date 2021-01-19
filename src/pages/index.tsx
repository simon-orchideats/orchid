import { makeStyles, Typography, Button, Grid, Avatar, Container, Card, CardContent, CardMedia, Hidden } from '@material-ui/core';
import Link from 'next/link';
import { menuRoute } from './menu';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import React from 'react';

const deskBody1FontSize = '1.5rem';
const deskBody2FontSize = '1.2rem';

const useStyles = makeStyles(theme => ({
  body1: {
    [theme.breakpoints.down('sm')]: {
      fontSize: deskBody2FontSize
    },
    fontSize: deskBody1FontSize
  },
  welcomeContainer: {
    background: 'none',
    position: 'relative',
    height: '100%'
  },
  indexContainer: {
    background: theme.palette.background.paper
  },
  howContainer: {
    background: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  plansContainer: {
    background: 'none',
  },
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: 2,
    marginRight: 2,
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  cardTitle: {
    lineHeight: 1.5,
    fontWeight: 500,
  },
  cardContent: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingBottom: `${theme.spacing(1)} !important`,
    paddingTop: 4,
    [theme.breakpoints.up('md')]: {
      paddingTop: undefined,
    },
  },
  cardPrice: {
    lineHeight: 1.5,
    fontWeight: 500,
    color: theme.palette.text.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNewPrice: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.palette.common.green,
  },
  cardScaler: {
    width: '100%',
    paddingBottom: '100%',
    paddingTop: undefined,
    position: 'relative',
    cursor: 'pointer',
  },
  cardImg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
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
  howText: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
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
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logos: {
    width: '30%',
    marginLeft: theme.spacing(3),
  },
  welcome: {
    [theme.breakpoints.down('xs')]: {
      backgroundPosition: '0%',
      backgroundImage: `url(/home/home-m-sm2.jpg)`,
    },
    backgroundImage: `url(/home/home-banner4.jpg)`,
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  welcomeSearch: {
    // marginTop: theme.spacing(3),
    // marginBottom: theme.spacing(3),
  },
  welcomeTitle: {
    fontSize: '4rem',
    fontWeight: 500,
    paddingBottom: theme.spacing(1),
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
  content: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingBottom: `${theme.spacing(1)} !important`,
    paddingTop: 4,
    [theme.breakpoints.up('md')]: {
      paddingTop: undefined,
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
  plansImg: {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(2),
    },
  },
  green: {
    color: theme.palette.common.green
  },
  welcomeText: {
    // minWidth: 320,
    marginTop: theme.spacing(10),
  },
  verticalMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  browse: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderColor: theme.palette.common.black,
    color: theme.palette.text.primary,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  white: {
    backgroundColor: theme.palette.common.white,
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
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.secondary.main,
    // height: 475,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  welcomeSave: {
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    bottom: theme.spacing(4),
  },
  // testimonialsTitle: {
  //   [theme.breakpoints.down(1250)]: {
  //     paddingLeft: '0px !important',
  //   },
  //   [theme.breakpoints.down(1600)]: {
  //     paddingLeft: 400,
  //   },
  //   paddingLeft: 100,
  // },
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
    // backgroundColor: '#fffef1',
    backgroundColor: theme.palette.secondary.main,
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
  howImg: {
    width: '90%'
  },
  spacer: {
    marginTop: theme.spacing(5),
  },
  centerRow: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonTextContainer: {
    paddingTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
}));

const Welcome = withClientApollo(() => {
  const classes = useStyles();
  return (
      <div className={classes.welcome}>
        <Container maxWidth='lg' className={classes.welcomeContainer}>
          <div className={classes.welcomeText}>
            <Typography variant='h3' className={classes.welcomeTitle}>
              <b>Always the best deal in town</b>
            </Typography>
            <Typography
              variant='body1'
              className={classes.body1}
            >
              <b>The best price guaranteed for your favorite eats, delivered</b>
            </Typography>
            <div className={classes.welcomeSearch}>
              <Link href={menuRoute}>
                <Button
                  variant='contained'
                  className={`${classes.browse} ${classes.white}`}
                  color='primary'
                  size='large'
                >
                  Browse restaurant offers
                </Button>
              </Link>
            </div>
          </div>
          <div className={classes.welcomeSave}>
            <Typography variant='h3' className={classes.membersSave}>
              <b>Save 30% vs</b>
            </Typography>
            <img src='/home/ofd.jpg' className={classes.logos}/>
          </div>
        </Container>
      </div>
  );
});

// const Plans = withClientApollo(() => {
//   const classes = useStyles();
//   return (
//     <div className={classes.plans}>
//       <Container maxWidth='xl' className={classes.plansContainer}>
//         <Grid container>
//           <Grid
//             item
//             md={6}
//             sm={12}
//             className={classes.centerRow}
//           >
//             <Typography variant='h3' className={classes.title}>
//               Get even more for less with Table+
//             </Typography>
//             <Typography variant='body1' className={classes.body1}>
//               Get an additional 10% off, expedited orders, and exclusive weekly deals. Pay as low as $1.49/month, cancel anytime.
//             </Typography>
//             <Link href={menuRoute}>
//               <Button
//                 className={`${classes.browse} ${classes.white}`}
//                 variant='contained'
//                 size='large'
//               >
//                 Try Table+ free for 30 days
//               </Button>
//             </Link>
//           </Grid>
//           <Grid
//             item
//             md={6}
//             sm={12}
//             className={classes.centerRow}
//           >
//             <img src='/home/c2.jpg' className={classes.plansImg} />
//           </Grid>
//         </Grid>
//       </Container>
//     </div>
//   );
// });

// const RipOff = () => {
//   const classes = useStyles();
//   const theme = useTheme<Theme>();
//   const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));
//   return (
//     <div className={`${classes.centered} ${classes.ripOff}`}>
//       <Typography variant={isSmAndDown ? 'h3' : 'h2'} className={classes.red}>
//         <b>LOWEST PRICE GUARANTEED</b>
//       </Typography>
//     </div>
//   );
// };

const FoodCard: React.FC<{
  img: string,
  title: string,
  badPrice: number
  goodPrice: number,
}> = ({
  img,
  title,
  badPrice,
  goodPrice
}) => {
  const classes = useStyles();
  return (
    <Card elevation={0} className={classes.card}>
      <div className={classes.cardScaler}>
        <CardMedia
          className={classes.cardImg}
          image={img}
          title={img}
        />
      </div>
      <CardContent className={classes.cardContent}>
        <Typography
          variant='body1'
          className={classes.cardTitle}
        >
          {title}
        </Typography>
        <Typography
          component='span'
          gutterBottom
          variant='body2'
          className={classes.cardPrice}
        >
          <s>${badPrice.toFixed(2)}</s>&nbsp;
          <div className={classes.cardNewPrice}>
            ${goodPrice.toFixed(2)}
          </div>
        </Typography>
      </CardContent>
    </Card>
  )
}

const Comparison = () => {
  const classes = useStyles();
  return (
    <div className={classes.sample}>
      <Container maxWidth='xl'>
        <Grid container justifyContent='center'>
          <Grid
            item
            xs={4}
            md={3}
          >
            <FoodCard
              img='/menu/little-market/buffalo-blue-burger.jpg'
              title='Buffalo Blue Burger'
              badPrice={8.43}
              goodPrice={6.49}
            />
          </Grid>
          <Grid
            item
            xs={4}
            md={3}
          >
            <FoodCard
              img='/menu/tony-boloneys/winger.jpg'
              title='Winger Slice'
              badPrice={5.74}
              goodPrice={4.22}
            />
          </Grid>
          <Grid
            item
            xs={4}
            md={3}
          >
            <FoodCard
              img='https://s3.amazonaws.com/betterboh/u/img/prod/61/1553706119_ea3e27d8a2ad035195f5.jpg'
              title='Herb Marinated Steak'
              badPrice={19.33}
              goodPrice={13.95}
            />
          </Grid>
          <Hidden smDown>
            <Grid
              item
              xs={4}
              md={3}
            >
              <FoodCard
                img='/menu/tacos-victoria/burrito.jpg'
                title='Victoria Burrito'
                badPrice={11.8}
                goodPrice={10}
              />
            </Grid>
          </Hidden>
        </Grid>
      </Container>
    </div>
  )
}

const How = () => {
  const classes = useStyles();
  return (
    <Container maxWidth='xl' className={classes.howContainer}>
      <Grid container>
        <Hidden mdUp>
          <Grid
            item
            md={6}
            className={classes.centered}
          >
            <img src='/home/c3.jpg' className={classes.howImg} />
          </Grid>
        </Hidden>
        <Grid
          item
          md={6}
          className={`${classes.howText} ${classes.centerRow}`}
        >
          <Typography variant='h3' className={classes.title}>
            How can Table offer the best price?
          </Typography>
          <Typography variant='body1' className={classes.body1}>
            Orders are filled, sold, and delivered directly by restaurants. Other apps are the expensive "middle men".&nbsp;
            <Link href={menuRoute}>
              Learn More
            </Link>
          </Typography>
        </Grid>
        <Hidden smDown>
          <Grid
            item
            md={6}
            className={classes.centered}
          >
            <img src='/home/c3.jpg' className={classes.howImg} />
          </Grid>
        </Hidden>
        <Grid
          item
          xs={12}
          className={classes.spacer}
        />
        <Grid
          item
          md={6}
          className={classes.centered}
        >
          <img src='/home/c1.jpg' className={classes.howImg} />
        </Grid>
        <Grid
          item
          md={6}
          className={`${classes.howText} ${classes.centerRow}`}
        >
          <Typography variant='h3' className={classes.title}>
            How can restaurants offer better discounts?
          </Typography>
          <Typography variant='body1' className={classes.body1}>
            Table takes zero commission from restaurants, allowing them to offer discounted
            prices compared to other apps that take 24-30% commission from restaurants.&nbsp;
            <Link href={menuRoute}>
              Learn More
            </Link>
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          className={classes.spacer}
        />
      </Grid>
      <Typography variant='h5' align='center'>
        Support restaurants directly and get the best deals
      </Typography>
      <Link href={menuRoute}>
        <Button
          variant='contained'
          className={classes.browse}
          color='secondary'
          size='large'
        >
          Browse restaurant offers
        </Button>
      </Link>
    </Container>
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
  const classes = useStyles();
  return (
    <div className={classes.indexContainer}>
      <Welcome />
      <Comparison />
      <How />
      {/* <Plans /> */}
      <Testimonials />
      <Footer />
    </div>
  )
}

export default Index;

export const indexRoute = '/';