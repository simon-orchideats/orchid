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

const Faq = () => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.verticalPadding}>
      <Container maxWidth='lg'>
        <Typography variant='h2' className={classes.title}>
          FAQ
        </Typography>
        <Expander
          q='How many restaurants can I pick?'
          a='Currently we only offer 1 restaurant per week, but we are quickly adding the option for up to 2 restaurants per week.
          Stay tuned!'
        />
        <Expander
          q="Do I need to pick meals every week?"
          a="No worries. We'll hand pick new meals for you based on your preferences."
        />
        <Expander
          q='Can I update my schedule?'
          a='Yes. You can always update future weeks.'
        />
        <Expander
          q='Can I change my meals?'
          a="Yes. You can change your meals any time as long as it's 2 days before your delivery. If you perform a 1-time
          plan upgrade or downgrade for a single week, then we'll charge or refund you the difference on your weekly
          bill."
        />
        <Expander
          q='Can I skip a week of delivery?'
          a="Yes. If you skip a week then we'll adjust your week's bill accordingly. Just make sure you do it before the
          plan cutoff time to stop your next order."
        />
        <Expander
          q='How often am I charged?'
          a='Orchid charges you once per week, 2 days before your delivery. If you change your preferred delivery day
          we also update your billing date.'
        />
        <Expander
          q='Will I be locked into a contract?'
          a='No, you can cancel your plan at any time. Any confirmed meals this week will be delivered.'
        />
        <Typography variant='body2' className={classes.mediumTopMargin}>
          *The cutoff for any changes is 12:00 am EST, 2 days before the start of your next week.
        </Typography>
      </Container>
    </Paper>
  )
}

export default Faq;
