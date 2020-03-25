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
          q='Will I be locked into a contract?'
          a='No, you can cancel your plan at any time. Any confirmed meals this week will be delivered.'
        />
        <Expander
          q='Can I skip a week of delivery?'
          a='Yes. Just make sure you do it before the plan cutoff time to stop your next order.'
        />
        <Expander
          q="What if I forget to choose next week's menu?"
          a="No worries. We'll hand pick new meals for you."
        />
        <Expander
          q='Can update my schedule?'
          a='Yes. You can always update future weeks.'
        />
        <Typography variant='body2' className={classes.mediumTopMargin}>
          *The cutoff for any changes is 12:00 am EST, 2 days before the start of your next week.
        </Typography>
      </Container>
    </Paper>
  )
}

export default Faq;
