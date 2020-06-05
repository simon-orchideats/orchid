import { makeStyles, Container, Typography, Paper, Link } from '@material-ui/core';
import Footer from '../client/general/Footer';
import { plansRoute } from './plans';
import { deliveryFee } from '../order/costModel';

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
            q='What is Orchid?'
            a="Orchid lets you mix-and-match meals from different restaurants every week. You just pick the meals and the
            delivery time. We'll pick up the meals for you and deliver to your doorstep at your scheduled time. Skip
            any week or let us pick meals for you. With Orchid you don't have to think about food anymore."
          />
          <Qa
            q='What makes Orchid different from other delivery websites?'
            a="Orchid provides weekly mix-and-match meals from your favorite local restaurants in bulk. We combine bulk
            meals with personalized delivery times to save you time and money. Quality is our top priority, which is why
            we only partner with exclusive restaurants and offer a limited number of carefully designed meals per restaurant."
          />
          <Qa
            q='How many restaurants can I pick?'
            a="As many as you want!"
          />
          <Qa
            q="Do I need to pick meals every week?"
            a="Forgot to pick your meal? No worries. Our team will hand select your favorite meals based on your preferences. 
            Otherwise, we recommend coming back to orchideats.com to choose the meals you'd like to receive every week."
          />
          <Qa
            q='How do I update my subscription or delivery?'
            a={`You can perform permanent updates to your recurring subscription in the My Plan page. These changes will
            affect future deliveries, but the ones in your "Upcoming deliveries" remain unaffected. You can make
            1-time manual updates on a specific order from the Upcoming Deliveries if the upcoming deliveries require
            any adjustments`}
          />
          <Qa
            q="Do you offer any discounts?"
            n={
              <>
                <Typography variant='body1'>
                  We work closely with our restaurants to offer our customers the best deal and pricing as possible.
                  Unfortunately at this time we do not offer any additional discounts. We are constantly working to provide the
                  best deals. Stay subscribed to our emails or follow us on&nbsp;
                  <Link
                    component='button'
                    variant='body1'
                    className={classes.link}
                  > 
                    <div onClick={() => window.open('https://www.facebook.com/orchidFB')}>Facebook</div>
                  </Link>
                  &nbsp;or&nbsp;
                  <Link
                    component='button'
                    variant='body1'
                    className={classes.link}
                  >
                    <div onClick={() => window.open('https://www.instagram.com/orchidIG')}>Instagram</div>
                  </Link>
                  &nbsp;to be the first to hear about updates and new features.
                </Typography>
              </>
            }
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
            the subscription or skip all deliveries for the week."
          />
          <Qa
            q='How often am I charged?'
            a="Orchid will automatically process your credit card on file at the end of each weekly cycle based
            on the number of meals confirmed for that week. A weekly cycle begins the day you subscribe."
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
            a="From the time of delivery, each meal will last for a week so long it is stored properly."
          />
          <Typography variant='h6' className={classes.title}>
            DELIVERY
          </Typography>
          <Qa
            q='What days of the week do you deliver?'
            a="Every day. If your restaurant is closed on a specific day, we'll deliver it the next day."
          />
          <Qa
            q='Who delivers my meals?'
            a="Every subscription comes complimentary with your own personal delivery driver from Orchid. Just as a server
            provides personal and exceptional service at a sit-down restaurant, our delivery drivers serve and deliver to
            you during your entire subscription."
          />
          <Qa
            q='What time of day will meals be delivered?'
            a="You can choose from our 2 delivery windows, 4pm - 6pm and 6pm - 8pm. We'll let you know the precise ETA the
            day before."
          />
          <Qa
            q='How can I add delivery instructions?'
            a="You can add instructions at checkout."
          />
          <Qa
            q='Does someone have to be home to receive my delivery?'
            a="No, but we'll call/text you before arriving. We'll text you our precise ETA the day before so you can
            plan ahead. If you're unavailable when we arrive for delivery, we'll leave the food at your doorstep."
          />
          <Qa
            q='Where do you deliver?'
            a="At the time we currently deliver in Jersey City and Hoboken. We are constantly updating our locations and
            will announce when we offer additional delivery locations to you."
          />
          <Qa
            q='How much is delivery?'
            a={`First delivery is free each week! Additional deliveries are $${(deliveryFee / 100).toFixed(2)}`}
          />
          <Qa
            q='Can I skip a week of delivery?'
            a="Sure! Just make sure you do it 2 days before your delivery."
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
            a="You may click login at the top right corner of our home page and then click Sign Up under the Orchid logo
            to create an account. Alternatively you can proceed through the checkout process and sign up at checkout."
          />
          <Qa
            q='Is there an app available for download?'
            a="Unfortunately at this time no app is readily available. We are consistently making updates to our platform
            and will notify customers via email and our social channels of any future updates."
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