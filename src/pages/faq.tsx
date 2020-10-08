import { makeStyles, Container, Typography, Paper } from '@material-ui/core';
import Footer from '../client/general/Footer';

// todo pivot: still need to clean up styles
const useStyles = makeStyles(theme => ({
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
  },
  title: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  qa: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  link: {
    textDecoration: 'underline',
    cursor: 'pointer',
    color: theme.palette.common.link,
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  faq: {
    backgroundImage: 'url(/faqs/carrots.jpg)',
    backgroundAttachment: 'fixed',
    backgroundSize: 'cover',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    marginBottom: theme.spacing(4),
  },
}))

const Qa: React.FC<{
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
    <div className={classes.qa}>
      <Typography variant='subtitle1'>{q}</Typography>
      {
        a && 
        <Typography variant='body1'>
          {a}
        </Typography>
      }
      {n && n}
    </div>
  )
}

const faqs = () => {
  const classes = useStyles();
  return (
    <>
      <Paper elevation={0} className={classes.faq}>
        <Container maxWidth='lg' className={classes.container}>
          <Typography variant='h2' className={classes.header}>
            FAQ
          </Typography>
          <Typography variant='h6' className={classes.title}>
            SUBSCRIPTION
          </Typography>
          <Qa
            q='What is Table?'
            n={
              <Typography variant='body1'>
                We're Costco of online food ordering. The lowest prices with no markups or service fees. Get instant
                access to savings by simply joining an affordable monthly plan.
              </Typography>
            }
          />
          <Typography variant='h6' className={classes.title}>
            WEBSITE
          </Typography>
          <Qa
            q='How do I reset my password?'
            a="You can logout by clicking the top right corner of the website. Once logged out, you can click
            login to go to the login page. At the bottom of the login page, below entering your password, you can click
            Don't remember your password?"
          />
          <Qa
            q='How do I create an account?'
            a="You may click login at the top right corner of our home page and then click Sign Up under the Table logo
            to create an account. Alternatively you can proceed through the checkout process and sign up at checkout."
          />
        </Container>
      </Paper>
      <Footer />
    </>
  )
}

export default faqs;

export const faqsRoute = '/faq';