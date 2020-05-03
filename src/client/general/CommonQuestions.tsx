import { makeStyles, Container, Typography, Paper, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  title: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
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
          a="Orchid allows YOU to receive your favorite restaurant meals every week at one low cost. We're a weekly
          subscription meal service that delivers same-day-fresh cooked meals from your local restaurants. Because they're
          fully cooked, all you have to do is heat them up. We started Orchid to save you time, energy, and money."
        />
        <Expander
          q='What makes Orchid different from other delivery websites?'
          a="Orchid provides weekly meals from your favorite LOCAL restaurants in bulk. We combine bulk meals with
          personalized delivery times to save you time and money. Quality is our top priority, which is why we only
          partner with exclusive restaurants and offer a limited number of carefully designed meals per restaurant."
        />
        <Expander
          q='How many restaurants can I pick?'
          a="As many as you want!"
        />
        <Expander
          q="Do I need to pick meals every week?"
          a="Forgot to pick your meal? No worries. Our team will hand select your favorite meals based off your preferences. 
          Otherwise, we recommend coming back to orchideats.com to choose the meals you'd like to receive every week."
        />
        <Expander
          q='How do I update my subscription or delivery?'
          a={`You can perform permanent updates to your reoccuring subscription in the My Plan page. These changes will
          affect future deliveries, but the ones in your "Upcoming deliveries" remain unaffected. You can make
          1-time manual updates on a specific order from the Upcoming Deliveries if the upcoming deliveries require
          any adjustments`}
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
          a="Orchid is a subscription, not a contract and you can cancel your service at any time."
        />
        <Typography variant='body2' className={classes.mediumTopMargin}>
          *The cutoff for any changes is 12:00 am EST, 2 days before your next delivery
        </Typography>
      </Container>
    </Paper>
  )
}

export default Faq;
