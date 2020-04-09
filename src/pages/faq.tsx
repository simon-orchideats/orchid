import { makeStyles, Container, Typography, Paper, Link } from '@material-ui/core';
import Footer from '../client/general/Footer';
import { plansRoute } from './plans';

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
            FAQs
          </Typography>
          <Typography variant='h6' className={classes.title}>
            SUBSCRIPTION
          </Typography>
          <Qa
            q='What is Orchid?'
            a="Orchid allows YOU to receive your favorite restaurant meals every week at one low cost. We're a weekly
            subscription meal service that delivers same-day-fresh cooked meals from your local restaurants. Because they're
            fully cooked, all you have to do is heat them up. We started Orchid to save you time, energy, and money."
          />
          <Qa
            q='What makes Orchid different from other delivery websites?'
            a="Orchid provides weekly meals from your favorite LOCAL restaurants in bulk. We combine bulk meals with
            personalized delivery times to save you time and money. Quality is our top priority, which is why we only
            partner with exclusive restaurants and offer a limited number of carefully designed meals per restaurant."
          />
          <Qa
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
                    <a href='https://example.com'>Facebook</a>
                  </Link>
                  &nbsp;or&nbsp;
                  <Link
                    component='button'
                    variant='body1'
                    className={classes.link}
                  >
                    <a href='https://example.com'>Instagram</a>
                  </Link>
                  &nbsp;to be the first to hear about updates and new features.
                </Typography>
              </>
            }
          />
          <Qa
            q="Do I need to pick meals every week?"
            a="Forgot to pick your meal? No worries. Our team will hand select your favorite meals based off your preferences. 
            Otherwise, we recommend coming back to orchideats.com to choose the meals you'd like to receive every week."
          />
          <Qa
            q='How do I update my subscription or delivery?'
            a="You can perform permanent updates to your reoccuring subscription in the My Plan page. These changes will
            automatically update your upcoming deliveries to reflect your newest preferences. You can also perform a 1-time
            update on a specific delivery from the Upcoming Deliveries page as long as it's 2 days before your delivery.
            If you upgrade or downgrade your plan for a single delivery, we'll charge or refund you the difference."
          />
          <Qa
            q="Do you offer any discounts?"
            a="We work closely with our restaurants to offer our customers the best deal and pricing as possible.
            Unfortunately at this time we do not offer any additional discounts. We are constantly working to provide the
            best deals."
          />
          <Qa
            q='Will I be locked into a contract?'
            a="Orchid is a subscription, not a contract and you can cancel your service at any time."
          />
          <Typography variant='h6' className={classes.title}>
            PAYMENTS & PRICING
          </Typography>
          <Qa
            q='Meal Plans & Pricing'
            n={
              <>
                <Typography variant='body1'>
                  To read more about meals and pricing, see our plan&nbsp;
                  <Link href={plansRoute}>
                    <Typography
                      variant='body1'
                      className={classes.link}
                      component='span'
                    >
                      page.
                    </Typography>
                  </Link>
                </Typography>
              </>
            }
          />
          <Qa
            q='Do I need to have a card on file?'
            a="Yes. Your card will be automatically processed through our payment system each week unless you cancel
            the subscription or skip the delievery within 2 days in advance."
          />
          <Qa
            q='How often am I charged?'
            a="Orchid will automatically process your credit card on file 2 days prior to your next delivery.
            However if you change your preferred delivery day we automatically update your billing due date on your account."
          />
          <Qa
            q='What forms of payment do you accept?'
            a="Visa, Mastercard, American Express, Discover and Diners Club"
          />
          <Typography variant='h6' className={classes.title}>
            MEALS
          </Typography>
          <Qa
            q='How do I reheat my food to keep restaurant quality?'
            a="Each restaurant cooks your meal fresh, the same day it's delivered. Since it's already cooked, just reheat
            as desired."
          />
          <Qa
            q='What are the portion sizes for your meals?'
            a="Each portion size is made for one meal per person."
          />
          <Qa
            q='Where can I find nutritional information about my meals?'
            a="At this time, we do not offer nutritional information."
          />
          <Qa
            q='How long will my meals last?'
            a="From the time of delivery, each meal will last for a week so long it is stored proprely."
          />
          <Typography variant='h6' className={classes.title}>
            DELIVERY
          </Typography>
          <Qa
            q='What days of the week do you deliver?'
            a="Every day."
          />
          <Qa
            q='Who delivers my meals?'
            a="Every subscription comes complimentary with your own personal delivery driver from Orchid. Just as a server
            provides personal and exceptional service at a sit-down restaurant, our delivery drivers serve and deliver to
            you during your entire subscription."
          />
          <Qa
            q='What time of day will meals be delivered?'
            a="You can choose from many of our delivery windows, ranging from 3 - 4pm up to 6 - 7pm."
          />
          <Qa
            q='How can I add delivery instructions?'
            a="You can add instructions at checkout."
          />
          <Qa
            q='Does someone have to be home to recieve my delivery?'
            a="No, but we'll text you before arriving. If you are unavailable, we'll leave the food at your doorstep."
          />
          <Qa
            q='Where do you deliver?'
            a="At the time we currently deliver in Jersey City and Hoboken. We are constnatly updating our locations and
            will announce when we offer additional delivery locations to you."
          />
          <Qa
            q='How much is shipping?'
            a="Free!"
          />
          <Qa
            q='Can I skip a week of delivery?'
            a="Sure! Just make sure you do it 2 days before your delivery."
          />
          <Qa
            q='What type of packaging will my meals be delivered?'
            a="Our packaging is designed to be leak proof while also being 100% compostable"
          />
          <Typography variant='h6' className={classes.title}>
            WEBSITE
          </Typography>
          <Qa
            q='How do I reset my password?'
            a="You can logout via by clicking the top right corner of the website. Once logged out, you can click
            login to go to login page. At the bottom of the login page, below entering your password, you can click
            Don't remember your password?"
          />
          <Qa
            q='How do I create an account?'
            a="You may click login at the top right corner of our home page and then click Sign Up under the Orchid logo
            to create an account. Alternatively you can proceed through the checkout process and sign up at checkout."
          />
          <Qa
            q='Is there an app available for download?'
            a="Unfortunately at this time no app is readily available. We are consistently making updates to our platform
            and will norify customers via email and our social channels of any future updates."
          />
          <Qa
            q='How do I unsubscribe from your emails?'
            a="You can unsubscribe to our emails by clicking unsubscribe at the bottom of any of our emails."
          />
          <Qa
            q='How can I subscribe to your promotional emails?'
            a="You can subscribe to our emails by creating an account or by entering your email on our home page."
          />
        </Container>
      </Paper>
      <Footer />
    </>
  )
}

export default faqs;

export const faqsRoute = '/faq';