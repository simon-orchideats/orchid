import { makeStyles, Container, Typography, Paper, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Link } from '@material-ui/core';
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
  link: {
    color: theme.palette.common.link
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
          n={
            <>
              <Typography variant='body1'>
                Currently we only offer 1 restaurant per week, but we understand that variety is important! We're
                quickly adding the option to pick additional restaurants for every 4 meals in your plan. Stay subscribed
                to our emails or follow us on&nbsp;
                <Link
                  component='button'
                  variant='body1'
                  className={classes.link}
                >
                  <a href='https://www.facebook.com/orchidFB'>Facebook</a>
                </Link>
                &nbsp;or&nbsp;
                <Link
                  component='button'
                  variant='body1'
                  className={classes.link}
                >
                  <a href='https://www.instagram.com/orchidIG'>Instagram</a>
                </Link>
                &nbsp;to be the first to hear about updates and new features.
              </Typography>
            </>
          }
        />
        <Expander
          q="Do I need to pick meals every week?"
          a="Forgot to pick your meal? No worries. Our team will hand select your favorite meals based off your preferences. 
          Otherwise, we recommend coming back to orchideats.com to choose the meals you'd like to receive every week."
        />
        <Expander
          q='How do I update my subscription or delivery?'
          a="You can perform permanent updates to your reoccuring subscription in the My Plan page. These changes will
          automatically update your upcoming deliveries to reflect your newest preferences. You can also perform a 1-time
          update on a specific delivery from the Upcoming Deliveries page as long as it's 2 days before your delivery.
          If you upgrade or downgrade your plan for a single delivery, we'll charge or refund you the difference."
        />
        <Expander
          q='Can I skip a week of delivery?'
          a="Sure! Just make sure you do it 2 days before your delivery."
        />
        <Expander
          q='How often am I charged?'
          a="Orchid will automatically process your credit card on file 2 days prior to your next delivery.
          However if you change your preferred delivery day we automatically update your billing due date on your account."
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
