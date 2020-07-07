import { makeStyles, Container, Grid, Typography, Avatar, Hidden, Button, Paper } from '@material-ui/core';
import Faq from '../client/general/CommonQuestions';
import Link from 'next/link';
import { menuRoute } from './menu';
import Footer from '../client/general/Footer';
import CheckIcon from '@material-ui/icons/Check';

const useStyles = makeStyles(theme => ({
  img: {
    zIndex: 1,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  explainations: {
    backgroundColor: theme.palette.background.default,
  },
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
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
  largeVerticalMargin: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
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
  shrinker: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.75rem',
    },
  },
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
    maxWidth: 300
  },
  check: {
    paddingRight: theme.spacing(1),
    color: 'green',
  },
  row: {
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
    },
    display: 'flex',
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
}))

const BenefitTextBox: React.FC<{title: string, description: string}> = ({ title, description }) => {
  const classes = useStyles();
  return (
    <>
      <Grid
        item
        xs={12}
        sm={6}
        md={4}
        className={classes.gridBox}
      >
        <div className={classes.benefitBox}>
          <div className={classes.row}>
            <CheckIcon fontSize='large' className={classes.check} />
            <Typography variant='h6' className={classes.smallBottomMargin}>
              {title}
            </Typography>
          </div>
          <Typography variant='body1'>
            {description}
          </Typography>
        </div>
      </Grid>
    </>
  )
};

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

const HowItWorks = () => {
  const classes = useStyles();
  return (
    <>
      <Container maxWidth='lg' className={classes.explainations}>
        <Typography variant='h2' className={`${classes.largeBottomMargin} ${classes.centered} ${classes.shrinker}`}>
          How it Works
        </Typography>
        <Grid container>
          <Explanation
            title="Mix n' Match"
            description='Pick meals from different restaurants to build your weekly delivery. Add more meals to get
            more deliveries.'
            dividerTitle='Step'
            dividerSubtitle='1'
            img='how-it-works/burgers.jpg'
            imgLeft={true}
            imgBackground={<img src='how-it-works/sandwich.png' className={classes.sandwich} alt='sandwich' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Set Delivery'
            description="Tell us what day and time you want your meals. We'll follow this schedule each week."
            dividerTitle='Step'
            dividerSubtitle='2'
            img='how-it-works/chef.jpg'
            imgLeft={false}
            imgBackground={<img src='how-it-works/fruits.png' className={classes.fruits} alt='fruits' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Enjoy'
            description='Eat at your own pace. Sushi on your Tuesday delivery,
            chicken on workout Wednesday, a light lunch on Friday, and a treat-yourself dinner on Sunday.'
            dividerTitle='Step'
            dividerSubtitle='3'
            img='how-it-works/deliver.jpg'
            imgLeft={true}
            imgBackground={<img src='how-it-works/potatoes.png' className={classes.potatoes} alt='potatoes' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Subscribe'
            description='Pick meals each week in advance or sit back and let us pick from your favorites. Skip a
            week or cancel anytime.'
            dividerTitle='Step'
            dividerSubtitle='4'
            img='how-it-works/eating.jpg'
            imgLeft={false}
            imgBackground={<img src='how-it-works/rice.png' className={classes.rice} alt='rice' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
        </Grid>
      </Container>
      <div className={classes.benefits}>
        <Typography variant='h2' className={`${classes.benefitsTitle} ${classes.centered} ${classes.shrinker}`}>
          Benefits
        </Typography>
        <Grid
          container
          className={classes.padding}
        >
          <BenefitTextBox
            title='Unrivaled Variety'
            description='Pick meals for your order from as many different restaurants and cuisines as you want.'
          />
          <BenefitTextBox
            title='Reliable, Exact Delivery'
            description='Know exactly when you get to eat. We confirm exact ETA’s for all your deliveries in advance.'
          />
          <BenefitTextBox
            title='Convenient'
            description='Get your food, ready to eat, all at once. No waiting for delivery. Just eat.'
          />
        </Grid>
      </div>
      <Faq />
      <Paper elevation={0} className={`${classes.largeBottomPadding} ${classes.centered} ${classes.footer}`}>
        <Link href={menuRoute}>
          <Button variant='contained' color='primary'>GET STARTED</Button>
        </Link>
      </Paper>
      <Footer />
    </>
  )
}

export default HowItWorks;

export const howItWorksRoute = '/how-it-works';