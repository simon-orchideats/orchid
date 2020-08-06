import { makeStyles, Container, Grid, Typography, Avatar, Hidden, Button, Paper } from '@material-ui/core';
import Faq from '../client/general/CommonQuestions';
import Link from 'next/link';
import { menuRoute } from './menu';
import Footer from '../client/general/Footer';

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
  check: {
    width: 32,
    [theme.breakpoints.down('sm')]: {
      width: 28
    },
    [theme.breakpoints.down('xs')]: {
      width: 22
    },
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
  icon: {
    maxWidth: 85,
    height: 85,
    marginBottom: theme.spacing(1),
  },
}))

const BenefitTextBox: React.FC<{
  title: string,
  description: string,
  img: string
}> = ({
  title,
  description,
  img,
}) => {
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
          <img
            src={img}
            alt='logo'
            className={classes.icon}
          />
          <Typography
            variant='h6'
            className={classes.smallBottomMargin}
            align='center'
          >
            <img
              src='/home/check.png'
              alt='check'
              className={classes.check}
            />
            &nbsp;
            {title}
          </Typography>
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
            description='Pick meals from different restaurants to build your 1st order'
            dividerTitle='Step'
            dividerSubtitle='1'
            img='how-it-works/mix.jpg'
            imgLeft={true}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Set delivery'
            description="Tell us your delivery schedule and we'll deliver at that time each week"
            dividerTitle='Step'
            dividerSubtitle='2'
            img='how-it-works/schedule.jpg'
            imgLeft={false}
            imgBackground={<img src='how-it-works/fruits.png' className={classes.fruits} alt='fruits' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Receive 1 weekly delivery'
            description="The same driver delivers to you each week. They text you an ETA the morning of your delivery"
            dividerTitle='Step'
            dividerSubtitle='3'
            img='how-it-works/deliver.jpg'
            imgLeft={true}
            imgBackground={<img src='how-it-works/sandwich.png' className={classes.sandwich} alt='sandwich' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Enjoy'
            description='Enjoy your fresh cooked meals when delivered or throughout the week'
            dividerTitle='Step'
            dividerSubtitle='4'
            img='how-it-works/eating.jpg'
            imgLeft={false}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Subscribe & repeat'
            description="Get a new delivery with new food each week"
            dividerTitle='Step'
            dividerSubtitle='5'
            img='how-it-works/sub.jpeg'
            imgLeft={true}
            imgBackground={<img src='how-it-works/potatoes.png' className={classes.potatoes} alt='potatoes' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Plan ahead or sit back'
            description="Orders and deliveries are easy to change, skip, and cancel"
            dividerTitle='Step'
            dividerSubtitle='6'
            img='how-it-works/sample.png'
            imgLeft={false}
            imgBackground={<img src='how-it-works/rice.png' className={classes.rice} alt='rice' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title="We'll pick meals if you forget"
            description="If you forget to customize your week's meals, we'll pick for you"
            dividerTitle='Step'
            dividerSubtitle='7'
            img='how-it-works/pick.jpeg'
            imgLeft={true}
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
            img='home/eat.svg'
            description="Pick meals for your order from as many different restaurants and cuisines as you want.
            Don't limit yourself ever again."
          />
          <BenefitTextBox
            title='Reliable, Exact Delivery'
            img='how-it-works/delivery-man.png'
            description="Know exactly when you get your food and who delivers it. Your personal weekly server confirms exact
            ETA's for all your deliveries in advance."
          />
          <BenefitTextBox
            title='Convenient'
            img='home/piggy-bank.svg'
            description='Get the convenience of subscription by getting weekly delicious meals while enjoying free
            delivery and no hidden service fees.'
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