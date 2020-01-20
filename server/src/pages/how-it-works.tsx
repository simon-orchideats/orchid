import { makeStyles, Container, Grid, Typography, Avatar, Hidden, Button, Paper, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  img: {
    zIndex: 1,
    width: 400,
    position: 'relative',
  },
  explainations: {
    backgroundColor: theme.palette.background.default,
  },
  getStarted: {
    background: theme.palette.common.tan,
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
  mediumBottomMargin: {
    marginBottom: theme.spacing(2),
  },
  smallBottomMargin: {
    marginBottom: theme.spacing(1),
  },
  mediumTopMargin: {
    marginTop: theme.spacing(2),
  },
  largeVerticalMargin: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
  verticalPadding: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(4),
  },
  benefits: {
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
    },
  },
  potatoes: {
    [theme.breakpoints.down('lg')]: {
      width: 525,
    },
    [theme.breakpoints.down('md')]: {
      width: 420,
    },
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
  sandwich: {
    [theme.breakpoints.down('lg')]: {
      width: 375,
    },
    [theme.breakpoints.down('md')]: {
      width: 300,
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
      <Grid item xs={12} sm={3} className={classes.mediumBottomMargin}>
        <Typography variant='h6' className={classes.smallBottomMargin}>
          {title}
        </Typography>
        <Typography variant='body1'>
          {description}
        </Typography>
      </Grid>
    </>
  )
};

const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant='h4' className={classes.mediumBottomMargin}>
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

const Expander: React.FC<{
  q: string,
  a: string
}> = ({
  q,
  a
}) => {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='subtitle1'>{q}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Typography variant='body1'>
          {a}
        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

const HowItWorks = () => {
  const classes = useStyles();
  return (
    <>
      <Container maxWidth='lg' className={classes.explainations}>
        <Typography variant='h2' className={`${classes.largeBottomMargin} ${classes.centered}`}>
          How it works
        </Typography>
        <Grid container>
          <Explanation
            title='Pick the meal plan'
            description='Subscribe and save! Choose 4, 8, or 12 meals per week to fit your lifestyle. Need to cancel, 
            change menus, or skip a week? Not a problem.'
            dividerTitle='Step'
            dividerSubtitle='1'
            img='how-it-works/burgers.jpg'
            imgLeft={true}
            imgBackground={<img src='how-it-works/sandwich.png' className={classes.sandwich} alt='sandwich' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Pick the menu'
            description="Like variety? Pick a set of customized meals from a variety of your favorite local restaurants.
            Forget to choose next weeks menu? No worries. We'll renew your previous selection."
            dividerTitle='Step'
            dividerSubtitle='2'
            img='how-it-works/chef.jpg'
            imgLeft={false}
            imgBackground={<img src='how-it-works/fruits.png' className={classes.fruits} alt='fruits' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Set deliviery time'
            description='Know exactly when your food arrives, no more unpredictable delivery times. Every meal is cooked
            the same day and delivered exactly when you want it.'
            dividerTitle='Step'
            dividerSubtitle='3'
            img='how-it-works/deliver.jpg'
            imgLeft={true}
            imgBackground={<img src='how-it-works/potatoes.png' className={classes.potatoes} alt='potatoes' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Pick the meal plan'
            description='Enjoy the meal as intended, fresh from the kitchen. No reheating. No wasteful packaging. Just
            food. Just eat.'
            dividerTitle='Step'
            dividerSubtitle='4'
            img='how-it-works/eating.jpg'
            imgLeft={false}
            imgBackground={<img src='how-it-works/rice.png' className={classes.rice} alt='rice' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
        </Grid>
        <Grid container className={`${classes.largeBottomMargin} ${classes.benefits}`}>
          <Grid item xs={12}>
            <Typography variant='h2' className={`${classes.largeBottomMargin} ${classes.centered}`}>
              Benefits
            </Typography>
          </Grid>
          <Grid item xs={2} />
          <BenefitTextBox
            title='Sustainable'
            description='yadayda. support local business. locally sourced food. take it a step further and combine your delivery times.'
          />
          <Grid item xs={2} />
          <BenefitTextBox
            title='Affordable'
            description='Bulk and save. cheaper than eating out all the time.'
          />
          <Grid item xs={2} />
          <Grid item xs={2} />
          <BenefitTextBox
            title='Convenient'
            description='No microwave. No oven. Just eat. Send meals to your office, home or both. Customize your delivery schedule to suit you.'
          />
          <Grid item xs={2} />
          <BenefitTextBox
            title='Variety'
            description='Ultimate variety from a endless array of restaurants.'
          />
          <Grid item xs={2} />
        </Grid>
      </Container>
      <Paper elevation={0} className={`${classes.verticalPadding}`}>
        <Container maxWidth='lg'>
          <Typography variant='h2' className={`${classes.largeBottomMargin} ${classes.centered}`}>
            FAQ
          </Typography>
          <Expander
            q='Will I be locked into a contract?'
            a='No, you can cancel your plan at any time. Any remaining meals this week will be delivered.'
          />
          <Expander
            q='Can I skip a week of delivery?'
            a='Yes. Just make sure you do it before the plan cutoff time to stop your next order.'
          />
          <Expander
            q="What if I forget to choose next week's menu?"
            a="No worries. We'll just repeat your previous restaurant menu"
          />
          <Expander
            q='Can update my schedule?'
            a='Yes. You can always update future weeks. You schedule your deliveries up to 6 weeks ahead of time.'
          />
          <Typography variant='body2' className={classes.mediumTopMargin}>
            *The cutoff for any changes is 11:59 pm EST, 2 days before the start of your next week.
          </Typography>
        </Container>
      </Paper>
      <Paper elevation={0} className={`${classes.verticalPadding} ${classes.centered} ${classes.getStarted}`}>
        <Button variant='contained' color='primary'>GET STARTED</Button>
      </Paper>
    </>
  )
}

export default HowItWorks;

export const howItWorksRoute = 'how-it-works';