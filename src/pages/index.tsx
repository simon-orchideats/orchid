import { makeStyles, Typography, Button, Paper, Grid, Container, Hidden } from '@material-ui/core';
import PlanCards from '../client/plan/PlanCards';
import Link from 'next/link';
import { plansRoute } from './plans';
import { menuRoute } from './menu';
import RestIcon from '@material-ui/icons/RestaurantMenu';
import TodayIcon from '@material-ui/icons/Today';
import StoreIcon from '@material-ui/icons/Storefront';

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
}));

const Welcome = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.welcome} ${classes.centered}`}>
      <div className={classes.welcomeText}>
        <Typography variant='h2' className={classes.welcomeTitle}>
          Chef-cooked healthy meals delivered from local restaurants to you
        </Typography>
        <Typography variant='subtitle1' className={classes.mediumVerticalMargin}>
          Offering meals starting at $9.99
        </Typography>
        <Link href={plansRoute}>
          <Button variant='contained' color='primary'>
            SEE PLANS
          </Button>
        </Link>
      </div>
    </div>
  );
};

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
    <Grid item xs={12} sm={6} md={3}>
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
        How it works
      </Typography>
      <Grid container className={classes.verticalMargin}>
        <Content description='Choose your plan of prepared meals' icon={<RestIcon className={classes.howIcon} />} />
        <Content description='Choose when you want them' icon={<TodayIcon className={classes.howIcon} />} />
        <Content description='Local restaurants cook, we deliver' icon={<StoreIcon className={classes.howIcon} />} />
        <Content description='Enjoy immediately' img='home/microwave.png'/>
      </Grid>
      <Link href={menuRoute}>
        <Button variant='outlined' color='primary'>GET STARTED</Button>
      </Link>
    </div>
  );
};

const Plans = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.plans}`}>
      <Paper className={`${classes.paper} ${classes.centered}`} elevation={0}>
        <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
          Flexible plans
        </Typography>
        <Typography variant='subtitle1' className={`${classes.verticalMargin} ${classes.plansDescription}`}>
          Each Sauté delicious meal is fully prepared by restaurants near you. Fresh. Local. Always.
        </Typography>
        <PlanCards isSelectable={false}/>
        <Link href={menuRoute}>
          <Button
            variant='contained'
            color='primary'
            className={classes.largeVerticalMargin}
          >
            SEE MENU
          </Button>
        </Link>
      </Paper>
    </div>
  )
}

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
      <Typography variant='h6' color='textSecondary'>
        {description}
      </Typography>
    </>
  );
  const MobileBlock: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <div className={`${classes.centered} ${classes.largeBottomMargin}`}>
      <img src='/placeholder.jpg' alt='logo' />
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
  return (
    <>
      <Hidden xsDown implementation='js'>
        <Container maxWidth='lg' className={`${classes.largeVerticalMargin} ${classes.reasons} ${classes.centered}`}>
          <Grid container>
            <Explanation 
              title='Sustainable'
              description='No cross-country shipments. No ice packs. No warehouses. Food is delievered fresh from down
              the street in eco-friendly, compostable containers.'
              img='home/sustainable.jpeg'
              imgLeft={true}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Same day cooking'
              description='Every meal is same-day fresh. Enjoy your meal as the chef intended.'
              img='home/fresh.jpeg'
              imgLeft={false}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Favorite restaurants'
              description='Support your local favorites. Change places and flavors every week for infinite variety.'
              img='home/rest.jpeg'
              imgLeft={true}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Affordable'
              description='Restaurant quality, without restaurant prices. Restaurants save when you buy ahead in bulk
              and we pass those savings to you.'
              img='home/chicken.jpeg'
              imgLeft={false}
            />
          </Grid>
          <Link href={menuRoute}>
            <Button
              variant='outlined'
              color='primary'
              className={classes.largeVerticalMargin}
            >
              SEE MENU
            </Button>
          </Link>
        </Container>
      </Hidden>
      <Hidden smUp implementation='js'>
        <Container maxWidth='xs' className={`${classes.centered} ${classes.reasons} ${classes.largeVerticalMargin}`}>
          <MobileBlock
            title='Sustainable'
            description='yada yada, local. never frozen. not some warehouse accross the country. no more icepacks'
          />
          <MobileBlock
            title='Same day cooking'
            description='freshest. yada yada YADA yda yda yda yda yada YADA yda yda yda yda yada YADA yda yda yda'
          />
          <MobileBlock
            title='Favorite restaurants'
            description='Support your local favorites. Change places and flavors every week for infinite variety.'
          />
          <MobileBlock
            title='Affordable'
            description='Cancel anytime. Restaurant quality, without restaurant costs. cuz fixed plans. yada yda yda'
          />
          <Link href={menuRoute}>
            <Button
              variant='outlined'
              color='primary'
              className={classes.largeBottomMargin}
            >
              SEE MENU
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
      <HowItWorks />
      <Plans />
      <Benefits />
    </>
  )
}

export default Index;

export const indexRoute = '/';