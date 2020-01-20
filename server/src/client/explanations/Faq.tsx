import { makeStyles, Container, Typography, Paper, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mediumTopMargin: {
    marginTop: theme.spacing(2),
  },
  verticalPadding: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(4),
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
  )
}

export default Faq;
