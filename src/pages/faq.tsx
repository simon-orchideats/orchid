import { makeStyles, Container, Typography, Paper, Link } from '@material-ui/core';
import Footer from '../client/general/Footer';
import { deliveryFee } from '../order/costModel';
import { referralFriendAmount, welcomePromoAmount, referralSelfAmount } from '../order/promoModel';

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
            n={
              <>
                <Typography variant='body1'>
                  A weekly-delivered meal plan subscription fulfilled by local restaurants. Each week, you can either
                  build your meal plan by picking meals from as many different restaurants as you want or allow Orchid to
                  choose, based on your pre-filled plan preferences.
                </Typography>
                <p />
                <Typography variant='body1'>
                  Orchid then does the rest by placing all the different
                  orders, picking up from all the different restaurants, and then delivering them in one simple batch to
                  you. Weekly deliveries are based on each your preferred schedule and are confirmed in advance with
                  exact ETA’s.
                </Typography>
              </>
            }
          />
          <Qa
            q='How is Orchid different from other delivery websites?'
            n={
              <>
                <Typography variant='body1'>
                  We offer weekly-delivered meal plans that offer unrivaled variety with the ability to mix and match
                  different restaurants. Other services offer single-limited restaurant orders and charge higher fees with
                  unreliable and unpredictable deliveries. Imagine subscribing to Netflix vs buying a movie on Amazon.
                </Typography>
                <p />
                <Typography variant='body1'>
                  With Orchid you pay a weekly subscription to combine meals from different restaurants all at one flat rate.
                  Our focus is on meal plans, not single meals. All restaurants on our menu listings are carefully picked to 
                  provide the best quality, variety, and value for you.
                </Typography>
              </>
            }
          />
          <Qa
            q='How fresh is the food?'
            n={
              <>
                <Typography variant='body1'>
                  Orchid meals are cooked the same day and our meal plans are designed to be eaten over the week. While we
                  understand that freshness is a concern when when saving food, you gain all the perks of meal prepping for
                  the week without the work - instant meals and bulk savings.
                </Typography>
                <p />
                <Typography variant='body1'>
                  If freshness is the #1 priority then nothing beats dining-in or on-demand delivery. But if you appreciate
                  the comfort of always having cooked meals at home or the flexibility of eating whenever and however you
                  want, then Orchid is the perfect fit.
                </Typography>
              </>
            }
          />
          <Qa
            q='How many restaurants can I pick?'
            a="As many as you want! Go wild."
          />
          <Qa
            q="Do I need to pick meals every week?"
            a="Nope, it’s up to you! You can choose to either pick your meals every week or allow Orchid to do it fo
            you. Our team will hand select your meals based on your favorite foods."
          />
          <Qa
            q='How do I update my subscription or delivery?'
            a='You can permanently update your recurring subscription in the My Plan page. These changes will
            affect future deliveries, but the ones in your "Upcoming deliveries" remain unaffected. You can also make
            1-time manual updates on a specific order from the Upcoming Deliveries.'
          />
          <Qa
            q="Do you offer any discounts?"
            n={
              <>
                <Typography variant='body1'>
                  We have two special promotions.
                </Typography>
                <div className={classes.qa}>
                  <Typography variant='body1'>
                    First time customers get ${(welcomePromoAmount * 4 / 100).toFixed(0)} off their first month
                    (${(welcomePromoAmount / 100).toFixed(2)} off for 4 weeks).
                  </Typography>
                  <Typography variant='body1'>
                    Existing customers can refer a friend to get ${(referralSelfAmount * 4 / 100).toFixed(0)} off
                    (${(referralSelfAmount / 100).toFixed(0)} off for 4 weeks) and give their friend
                    ${(referralFriendAmount * 4 / 100).toFixed(0)} off (${(referralFriendAmount / 100).toFixed(2)} off
                    for 4 weeks).
                  </Typography>
                </div>
              </>
            }
          />
          <Qa
            q='Will I be locked into a contract?'
            a="Orchid is a subscription, not a contract. You can cancel your service with ease at any time."
          />
          <Typography variant='h6' className={classes.title}>
            PAYMENTS & PRICING
          </Typography>
          <Qa
            q='How much does it cost?'
            n={
              <>
                <Typography variant='body1'>
                  We have 3 pricing tiers.
                </Typography>
                <div className={classes.qa}>
                  <Typography variant='body1'>
                    4 - 7 meals for $11.89
                  </Typography>
                  <Typography variant='body1'>
                    8 - 11 meals for $10.49
                  </Typography>
                  <Typography variant='body1'>
                    12+ for $9.99
                  </Typography>
                </div>
                <Typography variant='body1'>
                  We include a free delivery each week, but you can add more for an additional $3.50. A delivery must have at least
                  4 meals. We only charge based on the number of meals confirmed per week, not based on your plan. So
                  if you decide to add or remove meals for a given week, you'll be charged fairly.
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
            a="While every meal is cooked the same day as it's delivered, it's probably not a good idea to eat sushi 7
            days after you order it. That's why we recommend picking a balance, some meals for now and some for later, 
            just as you would when meal prepping."
          />
          <Typography variant='h6' className={classes.title}>
            DELIVERY
          </Typography>
          <Qa
            q='What days of the week do you deliver?'
            a="Every day. If your restaurant is closed on a specific day, we'll deliver your entire order the next day."
          />
          <Qa
            q='Who delivers my meals?'
            a="Every subscription comes complimentary with your own personal delivery driver from Orchid. Just as a server
            provides personal and exceptional service at a sit-down restaurant, our delivery drivers serve and deliver to
            you during your entire subscription. They are your direct contact for everything."
          />
          <Qa
            q='What time of day will meals be delivered?'
            n={
              <>
                <Typography variant='body1'>
                  You can choose from our 3 delivery windows. We'll let you know the precise ETA the day before.
                </Typography>
                <div className={classes.qa}>
                  <Typography variant='body1'>
                    5pm - 7pm
                  </Typography>
                  <Typography variant='body1'>
                    6pm - 8pm
                  </Typography>
                  <Typography variant='body1'>
                    7pm - 9pm
                  </Typography>
                </div>
              </>
            }
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
            n={
              <>
                <Typography variant='body1'>
                  At this time we currently deliver in Jersey City and Hoboken with NYC soon to follow. We constantly
                  work to expand our locations. Follow us on&nbsp;
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
                  &nbsp;to be the first to hear about new locations and updates.
                </Typography>
              </>
            }
          />
          <Qa
            q='How much is delivery?'
            a={`You get a free delivery each week! Additional deliveries are $${(deliveryFee / 100).toFixed(2)}`}
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
            and will notify customers via our social channels of any future updates."
          />
        </Container>
      </Paper>
      <Footer />
    </>
  )
}

export default faqs;

export const faqsRoute = '/faq';