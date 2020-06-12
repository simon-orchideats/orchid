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
          a="Orchid lets you mix-and-match from different restaurants to create weekly meal plans. We'll deliver all
          your meals together at once based on your preferred time slot (extra deliveries are +$3.50). With Orchid you
          don't have to think about food anymore because we'll automatically renew your subscription each and and pick
          new meals for you. But if you like more control, you can always edit the meals or even skip a week."
        />
        <Expander
          q='How is Orchid different from other delivery websites?'
          a="We offer a weekly meal-plan from a variety of restaurants whereas other websites offer single restaurant
          orders. Imagine subscribing to Netflix vs buying a movie on Amazon. With Orchid you pay a weekly subscription
          to combine meals from any restaurant vs paying for an on-demand order from 1 restaurant. Our focus is on
          meal-plans, not single meals."
        />
        <Expander
          q='How many restaurants can I pick?'
          a="As many as you want!"
        />
        <Expander
          q="Do I need to pick meals every week?"
          a="Forgot to pick your meal? No worries. Our team will hand select your favorite meals based on your preferences. 
          Otherwise, we recommend coming back to orchideats.com to choose the meals you'd like to receive every week."
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
          a="Orchid is a subscription, not a contract. You can cancel your service at any time."
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
