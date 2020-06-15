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
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='subtitle1'>{q}</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
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
          q='What is Orchid?'
          a="A weekly-delivered meal plan subscription fulfilled by local restaurants. Each week, you can either
          build their meal plan by picking meals from as many different restaurants as they want or allow Orchid to
          choose, based on their pre-filled plan preferences. Orchid then does the rest by placing all the different
          orders, picking up from all the different restaurants, and then delivering them in one simple batch to
          you. Weekly deliveries are based on each your preferred schedule and are confirmed in advance with
          exact ETA’s."
        />
        <Expander
          q='How is Orchid different from other delivery websites?'
          a="We offer weekly-delivered meal plans that offer unrivaled variety with the ability to mix and match
          different restaurants. Other services offer single-limited restaurant orders and charge higher fees with
          unreliable and unpredictable deliveries. Imagine subscribing to Netflix vs buying a movie on Amazon. With
          Orchid you pay a weekly subscription to combine meals from different restaurants all at one flat rate. Our
          focus is on meal plans, not single meals. All restaurants on our menu listings are carefully picked to 
          provide the best quality, variety, and value for you."
        />
        <Expander
          q='How many restaurants can I pick?'
          a="As many as you want! Go wild."
        />
        <Expander
          q="Do I need to pick meals every week?"
          a="Nope, it’s up to you! You can choose to either pick your meals every week or allow Orchid to do it fo
          you. Our team will hand select your meals based on your favorite foods."
        />
        <Expander
          q='How do I update my subscription or delivery?'
          a='You can permanently update your recurring subscription in the My Plan page. These changes will
          affect future deliveries, but the ones in your "Upcoming deliveries" remain unaffected. You can also make
          1-time manual updates on a specific order from the Upcoming Deliveries.'
        />
        <Expander
          q='Can I skip a week of delivery?'
          a="Sure! Just make sure you do it 2 days before your delivery."
        />
        <Expander
          q='How often am I charged?'
          a="Orchid will automatically process your credit card on file at the end of each weekly cycle based
          on the number of meals confirmed for that week. A weekly cycle begins the day you subscribe."
        />
        <Expander
          q='Will I be locked into a contract?'
          a="Orchid is a subscription, not a contract. You can cancel your service with ease at any time."
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
