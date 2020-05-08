import { makeStyles, Typography, Button, Paper, Grid, Container, Hidden } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { menuRoute } from './menu';
import RestIcon from '@material-ui/icons/RestaurantMenu';
import TodayIcon from '@material-ui/icons/Today';
import Router from 'next/router';
import { howItWorksRoute } from './how-it-works';
import withClientApollo from '../client/utils/withClientApollo';
import Footer from '../client/general/Footer';
import { useRef, createRef, useState, Fragment } from 'react';
import EmailInput from '../client/general/inputs/EmailInput';
import { useAddMarketingEmail } from '../consumer/consumerService';

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
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  welcomeTitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.175rem'
    },
    fontWeight: 500,
  },
  welcomeText: {
    maxWidth: 600 // chosen by inspection
  },
  verticalMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
    height: 75,
    marginBottom: theme.spacing(1),
  },
  shrinker: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.25rem',
    },
  },
  howIcon: {
    fontSize: 90,
  },
  title: {
    paddingBottom: theme.spacing(2)
  },
  donate: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  newsLetterInput: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    width: '100%',
    maxWidth: 500,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    },
  },
  newsletterPaper: {
    backgroundColor: theme.palette.common.white,
    width: '60%',
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emailInput: {
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      marginBottom: theme.spacing(2),
    },
  },
  who: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
    backgroundColor: theme.palette.common.white,    
  },
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
          Weekly meal subscriptions starting at $9.99
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
    <Grid item xs={12} sm={4} md={4}>
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
        <Typography variant='h5'>
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
          title='Options'
          description='Select Your Favorite Restaurant & Meals'
          icon={<RestIcon className={classes.howIcon} />}
        />
        <Content
          title='Save time'
          description='Tell Us When to Deliver'
          icon={<TodayIcon className={classes.howIcon}/>}
        />
        <Content
          title='Flexible'
          description='Eat Now or Save for Later'
          img='home/microwave.png'
        />
      </Grid>
      <Typography variant='subtitle1' className={classes.title}>
        Questions or Comments? Email us at emily@orchideats.com to learn more.
      </Typography>
      <Link href={howItWorksRoute}>
        <Button variant='outlined' color='primary'>Learn More</Button>
      </Link>
    </div>
  );
};

const Donate = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.mediumVerticalMargin} ${classes.centered} ${classes.donate}`}>
      <Typography variant='h6' className={classes.shrinker}>
        Help our heroic healthcare workers fight COVID-19
      </Typography>
      <Typography variant='body1'>
        Orchid will match all meal donations, now optional in your plan, and deliver to local NYC hospitals
      </Typography>
    </div>
  );
};

const Plans = withClientApollo(() => {
  const [addMarketingEmail] = useAddMarketingEmail();
  const [isSubbed, setIsSubbed] = useState(false);
  const validateEmailRef = useRef<() => boolean>();
  const emailInputRef = createRef<HTMLInputElement>();
  const onSubscribe = () => {
    if (!validateEmailRef.current!()) return;
    const email = emailInputRef.current!.value;
    addMarketingEmail(email);
    setIsSubbed(true);
  }
  const classes = useStyles();
  return (
    <div className={`${classes.plans} ${classes.centered}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        Choose a Plan that Works for You
      </Typography>
      <Typography variant='h4' className={`${classes.largeBottomMargin} ${classes.centered}`}>
        A plan made to fit your lifestyle. Starting at $9.99 per meal
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
      <Paper className={classes.newsletterPaper}>
        <Typography variant='h6'>
          Schedule Your Meals
        </Typography>
        <Typography variant='h6'>
          sign up for offers, new restaurants and more
        </Typography>
        {
          isSubbed ?
            <Typography variant='subtitle1'>
              Thank you!
            </Typography>
          :
            <div className={classes.newsLetterInput}>
              <EmailInput
                variant='outlined'
                className={classes.emailInput}
                inputRef={emailInputRef}
                setValidator={(validator: () => boolean) => {
                  validateEmailRef.current = validator;
                }}
              />
              <Button
                variant='contained'
                color='primary'
                onClick={onSubscribe}
              >
                Subscribe
              </Button>
            </div>
        }
      </Paper>
    </div>
  )
});

const Benefits = () => {
  const classes = useStyles();
  const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <>
      <Typography
        variant='h4'
        className={`${classes.verticalMargin} ${classes.shrinker}`}
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
      title: 'Come home to a warm meal',
      description: `
        Few things express love like coming home after a long day to a warm meal cooked just for you. Our meals
        are cooked with care by a local restaurant chef, not in some warehouse across the country. No more tiresome cooking
        and cleaning or even waiting for delivery. No more thinking about food because we've got you covered. Sit back and
        enjoy a meal in 3 minutes.
      `,
      img: '/home/sharing.jpeg',
      imgLeft: true
    },
    {
      title: 'No service charge',
      description: `
        Neighbors don't nickle and dime each other. There's no service charge when buying in-store, so why should
        buying online be any different? Why do you have to pay, to pay? It's time we redefine online food ordering.
        This means we will never charge mysterious service fees. No hidden fees, ever.
      `,
      img: 'home/trade.jpg',
      imgLeft: false
    },
    {
      title: 'Save up to 38%',
      description: `
        Cooking for friends and family is always better than cooking for just one. This is why we offer meal plans
        instead of just individual meals. Bulk means savings, and we pass those savings to you. It also means we can give
        one free delivery every week. You save up to 38% per meal when you order on Orchid. Save with us at an honest
        $9.99 per meal vs $16.00 per meal after fees when compared to ordering with other food apps.
      `,
      img: 'home/bulk.jpg',
      imgLeft: true
    },
    {
      title: 'Connect the community',
      description: `
        Food always tastes better when it comes from someone you know. Ditch cross-country shipments, the ice packs,
        and the anonymous cooks. Orchid delivers food same-day fresh from down the street so you can enjoy the meal as your
        local neighbor intended.
      `,
      img: 'home/rest.jpeg',
      imgLeft: false,
    },
  ]
  
  const title = (
    <>
      <Typography
        variant='h2'
        className={`${classes.largeBottomMargin} ${classes.centered}`}
      >
        Who we are
      </Typography>
      <Typography variant='h4' className={`${classes.largeBottomMargin} ${classes.centered}`}>
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

const Index = () => {
  return (
    <>
      <Welcome />
      <Donate />
      <Benefits />
      <Plans />
      <HowItWorks />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';