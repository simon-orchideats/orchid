import { makeStyles, Typography, Button, Paper, Grid, Container, Hidden } from '@material-ui/core';
import PlanChooser from '../client/plans/PlanChooser';

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
    [theme.breakpoints.down('sm')]: {
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
  welcomeText: {
    maxWidth: 600 // chosen by inspection
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
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  lowWidth: {
    maxWidth: 150,  
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
        <Typography variant='h2'>
          Chef-cooked healthy meals delivered from local restaurants to you
        </Typography>
        <Typography variant='subtitle1' className={classes.mediumVerticalMargin}>
          Offering meals starting at $8.99
        </Typography>
        <Button variant='contained' color='primary'>
          SEE PLANS
        </Button>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const classes = useStyles();
  const Content: React.FC<{ description: string }> = ({ description }) => (
    <Grid item xs={12} sm={6} md={3}>
      <div className={classes.centered}>
        <img
          src='/placeholder.jpg'
          alt='logo'
          className={classes.lowWidth}
        />
        <Typography variant='subtitle1' className={`${classes.lowWidth} ${classes.verticalMargin}`}>
          {description}
        </Typography>
      </div>
    </Grid>
  )
  return (
    <div className={`${classes.largeVerticalMargin} ${classes.centered}`}>
      <Typography variant='h3' className={classes.title}>
        How it works
      </Typography>
      <Grid container className={classes.verticalMargin}>
        <Content description='Choose your plan of prepared meals' />
        <Content description='Choose when you want for them' />
        <Content description='Local restaurants cook, we deliver' />
        <Content description='Enjoy immediately' />
      </Grid>
      <Button variant='outlined' color='primary'>GET STARTED</Button>
    </div>
  );
};

const Plans = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.plans}`}>
      <Paper className={`${classes.paper} ${classes.centered}`} elevation={0}>
        <Typography variant='h3' className={classes.title}>
          Flexible plans
        </Typography>
        <Typography variant='subtitle1' className={`${classes.verticalMargin} ${classes.plansDescription}`}>
          Each Sauté delicious meal is fully prepared by restaurants near you. Fresh. Local. Always.
        </Typography>
        <PlanChooser />
      </Paper>
    </div>
  )
}

const Benefits = () => {
  const classes = useStyles();
  const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => (
    <>
      <Typography
        variant='h3'
        color='primary'
        className={classes.verticalMargin}
      >
        {title}
      </Typography>
      <Typography variant='h4' color='textSecondary'>
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
          <img src={img} alt='logo' />
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
          <img src={img} alt='logo' />
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
              description='yada yada, local. never frozen. not some warehouse accross the country. no more icepacks'
              img='/placeholder.jpg'
              imgLeft={true}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Same day cooking'
              description='freshest. yada yada YADA yda yda yda yda yada YADA yda yda yda yda yada YADA yda yda yda'
              img='/placeholder.jpg'
              imgLeft={false}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Favorite restaurants'
              description='Support your local favorites. Change places and flavors every week for infinite variety.'
              img='/placeholder.jpg'
              imgLeft={true}
            />
            <Grid item xs={12} className={classes.largeVerticalMargin} />
            <Explanation 
              title='Affordable'
              description='Cancel anytime. Restaurant quality, without restaurant costs. cuz fixed plans. yada yda yda'
              img='/placeholder.jpg'
              imgLeft={false}
            />
          </Grid>
          <Button
            variant='outlined'
            color='primary'
            className={classes.largeVerticalMargin}
          >
            SEE MENU
          </Button>
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
          <Button variant='outlined' color='primary' className={classes.largeBottomMargin}>
            SEE MENU
          </Button>
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