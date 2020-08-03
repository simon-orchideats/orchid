import { makeStyles, Container, Typography, Paper, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { faqsRoute } from '../../pages/faq';
import Link from 'next/link';

const useStyles = makeStyles(theme => ({
  title: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.75rem'
    },
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: theme.palette.common.link,
  },
  mediumTopMargin: {
    marginTop: theme.spacing(2),
  },
  verticalPadding: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  details: {
    flexDirection: 'column'
  },
}))

const Expander: React.FC<{
  q: string,
  a?: string,
  n?: JSX.Element,
}> = ({
  q,
  a,
  n,
}) => {
  const classes = useStyles();
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='subtitle1'>{q}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details}>
      {
        a && 
        <Typography variant='body1'>
          {a}
        </Typography>
      }
      {n && n}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

const Faq = () => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.verticalPadding}>
      <Container maxWidth='lg'>
        <Typography variant='h2' className={classes.title}>
          Common Questions
        </Typography>
        <Expander
          q='What is Table?'
          n={
            <>
              <Typography variant='body1'>
                A subscription of weekly meal plans delivered from local restaurants. Each week, customers can either
                build their meal plan by picking meals from all different restaurants or allow Table to choose, based
                on their plan preferences.
              </Typography>
              <p />
              <Typography variant='body1'>
                Each customer is then assigned a personal weekly server who will place and
                schedule all the different orders, pick up from all the different restaurants, and then deliver all the
                meals in one simple batch to the customer. Weekly deliveries are based on each customer's preferred
                schedule and confirmed in advance with exact ETA's.
              </Typography>
            </>
          }
        />
        <Expander
          q='How is Table different from other delivery websites?'
          n={
            <>
              <Typography variant='body1'>
              Table is a weekly subscription that delivers restaurant meals all at one low, flat rate with no extra
                fees. Our service offers unrivaled variety with the ability to mix and match different restaurants in
                each delivery. Imagine subscribing to Netflix vs buying 1 movie on Amazon.
              </Typography>
              <p />
              <Typography variant='body1'>
                All restaurants on our listings are carefully picked and vetted to provide you the best food for your
                weekly meal plan. Furthermore, you are personally assigned a server that will deliver all your meals
                each week and text you far in advance of each delivery's ETA. No more trying to communicate and teach
                directions to a new stranger every time you get your food delivered. No more waiting around wondering
                when or if your food will arrive.
              </Typography>
            </>
          }
        />
        <Expander
          q='How long will my meals last?'
          a="Every meal is cooked the same day as it's delivered but should be stored in the fridge for however many days
          you feel comfortable. We recommend picking a balance. When delivered, eat certain meals now and save
          some for later, just as you would with meal prepping."
        />
        <Expander
          q="Do I need to pick meals every week?"
          a="Nope, it’s up to you! You can choose to either pick your meals every week or allow Table to do it for you.
          Our team will hand select your meals based on your favorite foods and preferences."
        />
        <Expander
          q='Can I skip a week of delivery?'
          a="Sure! Just make sure you do it 2 days before your delivery."
        />
        <Expander
          q='How often am I charged?'
          a="Table will automatically process your credit card on file at the end of each weekly cycle based
          on the number of meals confirmed for that week. A weekly cycle begins the day you subscribe."
        />
        <Expander
          q='Will I be locked into a contract?'
          a="Table is a subscription, not a contract. You can cancel your service with ease any time in the My Plan page."
        />
        <Typography variant='body2' className={classes.mediumTopMargin}>
          See more answers on our&nbsp;
          <Link href={faqsRoute}>
            <Typography
              variant='body2'
              className={classes.link}
              component='span'
            >
              FAQ
            </Typography>
          </Link>
        </Typography>
      </Container>
    </Paper>
  )
}

export default Faq;
