import { makeStyles, Typography, Button, Paper, Grid, Container, Hidden } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { plansRoute } from './plans';
import { menuRoute } from './menu';
import RestIcon from '@material-ui/icons/RestaurantMenu';
import TodayIcon from '@material-ui/icons/Today';
import Router from 'next/router';
import { howItWorksRoute } from './how-it-works';
import withClientApollo from '../client/utils/withClientApollo';
import { Plan } from "../plan/planModel";
import { useUpdateCartPlanId } from '../client/global/state/cartState';
import Footer from '../client/general/Footer';
import { useRef, createRef, useState } from 'react';
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
  verticalCenter: {
    display: 'flex',
    flexDirection: 'column',
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
    height: 500,
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  welcomeTitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.175rem'
    },
  },
  welcomeText: {
    maxWidth: 600 // chosen by inspection
  },
  explanationImg: {
    height: 200
  },
  plansDescription: {
    maxWidth: 400 // chosen by inspection
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
  largeVerticalPadding: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
  plans: {
    backgroundImage: `url(/cuttingBoard.jpeg)`,
    backgroundPosition: '70% 30%',
    backgroundSize: 'cover',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 400,
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
    maxWidth: 500,
  },
  paper: {
    opacity: 0.9,
    padding: theme.spacing(3),
    width: '100%',
    backgroundColor: theme.palette.secondary.main
  },
  lowWidth: {
    maxWidth: 150,
  },
  microwave: {
    maxWidth: 135,
    height: 85,
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
}));

const Welcome = withClientApollo(() => {
  const classes = useStyles();
  const onClick = () => {
    Router.push(menuRoute);
  }
  return (
    <div className={`${classes.welcome} ${classes.centered}`}>
      <div className={classes.welcomeText}>
        <Typography variant='h3' className={classes.welcomeTitle}>
          Chef-cooked meals delivered weekly from local restaurants
        </Typography>
        <Typography variant='subtitle1' className={classes.mediumVerticalMargin}>
          Eat from your favorite restaurants and save.
          <br />
          Weekly meals starting at $9.99
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
    description: string,
    img?: string,
    icon?: JSX.Element,
  }> = ({
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
        <Content description='Select Your Favorite Restaurant & Meals' icon={<RestIcon className={classes.howIcon} />} />
        <Content description='Tell Us When to Deliver' icon={<TodayIcon className={classes.howIcon} />} />
        <Content description='Eat Now or Save for Later' img='home/microwave.png' />
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
    <div className={`${classes.largeVerticalPadding} ${classes.mediumVerticalMargin} ${classes.centered} ${classes.donate}`}>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        Let's help our heroic healthcare workers fight COVID-19.
      </Typography>
      <Typography variant='subtitle1'>
        Orchid will match all meal donations, now optional in your plan, and deliver to local NYC hospitals.
        Please join us in doing our part to help on the front lines of this crisis.
      </Typography>
    </div>
  );
};

const Plans = withClientApollo(() => {
  const setCartStripePlanId = useUpdateCartPlanId();
  const [addMarketingEmail] = useAddMarketingEmail();
  const [isSubbed, setIsSubbed] = useState(false);
  const onClick = (plan: Plan) => {
    Router.push(menuRoute);
    setCartStripePlanId(plan.stripeId);
  };
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
    <div className={classes.plans}>
      <Paper className={`${classes.paper} ${classes.centered}`} elevation={0}>
        <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
          Choose a Plan that Works for You
        </Typography>
        <Typography variant='subtitle1' className={`${classes.verticalMargin} ${classes.plansDescription}`}>
          Choose from 4, 8 or 12 meals per week
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
            Stay updated with Orchid's newsletter
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
                  variant='outlined'
                  color='primary'
                  onClick={onSubscribe}
                >
                  Subscribe
                </Button>
              </div>
          }
        </Paper>
      </Paper>
    </div>
  )
})

const Benefits = () => {
  const classes = useStyles();
  const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <>
      <Typography
        variant='h4'
        color='primary'
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
        <Grid item xs={5} className={classes.verticalCenter}>
          <img src={img} alt='logo' className={classes.explanationImg} />
        </Grid>
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
        <Grid item xs={5} className={classes.verticalCenter}>
          <img src={img} alt='logo' className={classes.explanationImg} />
        </Grid>
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
  const sustainableDescription = `No cross-country shipments. No ice packs. No warehouses. Food is delievered fresh from down
                                  the street in eco-friendly, compostable containers.`
  const sameDayDescription = 'Every meal is same-day fresh. Enjoy your meal as the chef intended.';
  const faveRestsDescription = 'Support your local favorites. Change places and flavors every week for infinite variety.'
  const afordableDescription = `Restaurant quality, without restaurant prices. Restaurants save when you buy ahead in bulk
                                and we pass those savings to you.`;
  return (
    <>
      <Hidden xsDown implementation='js'>
        <Container maxWidth='lg' className={`${classes.largeVerticalMargin} ${classes.reasons} ${classes.centered}`}>
          <Grid container>
            <Explanation 
              title='Sustainable'
              description={sustainableDescription}
              img='/home/deliverySample.jpeg'
              imgLeft={true}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Same day cooking'
              description={sameDayDescription}
              img='home/fresh.jpeg'
              imgLeft={false}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Favorite restaurants'
              description={faveRestsDescription}
              img='home/rest.jpeg'
              imgLeft={true}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Affordable'
              description={afordableDescription}
              img='home/chicken.jpeg'
              imgLeft={false}
            />
          </Grid>
          <Link href={plansRoute}>
            <Button
              variant='outlined'
              color='primary'
              className={classes.largeVerticalMargin}
            >
              SEE PLANS
            </Button>
          </Link>
        </Container>
      </Hidden>
      <Hidden smUp implementation='js'>
        <Container maxWidth='xs' className={`${classes.centered} ${classes.reasons} ${classes.largeVerticalMargin}`}>
          <MobileBlock
            title='Sustainable'
            description={sustainableDescription}
          />
          <MobileBlock
            title='Same day cooking'
            description={sameDayDescription}
          />
          <MobileBlock
            title='Favorite restaurants'
            description={faveRestsDescription}
          />
          <MobileBlock
            title='Affordable'
            description={afordableDescription}
          />
          <Link href={plansRoute}>
            <Button
              variant='outlined'
              color='primary'
              className={classes.largeBottomMargin}
            >
              SEE PLANS
            </Button>
          </Link>
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
      <HowItWorks />
      <Plans />
      <Benefits />
      <Footer />
    </>
  )
}

export default Index;

export const indexRoute = '/';