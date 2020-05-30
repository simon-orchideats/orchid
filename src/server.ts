import { universalAuthCB, popupSocialAuthCB } from './utils/auth';
import { init } from '@sentry/node';
import { CaptureConsole } from '@sentry/integrations';
import { initConsumerService } from './server/consumer/consumerService';
import { initGeoService } from './server/place/geoService';
import { getContext } from './utils/apolloUtils';
import { initOrderService } from './server/orders/orderService';
import express from 'express';
import next from 'next';
import { initElastic } from './server/elasticConnector';
import { initPlanService } from './server/plans/planService';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { activeConfig, isDev } from './config';
import { schema } from './schema';
import { initRestService } from './server/rests/restService';
import Stripe from 'stripe';
import cookieParser from "cookie-parser";
import { handleLoginRoute, handleAuthCallback, handlePopupSocialAuth } from './server/auth/authenticate';

/**
 * Next.js can automatically set up our web server. By default it serves html pages under /pages and sets up api
 * endpoints in /pages/api. For an apollo example of this, see
 * 
 * https://github.com/zeit/next.js/tree/canary/examples/api-routes-apollo-server-and-client
 * 
 * The default behavior gives us 2 main benefits
 * 
 * 1) It uses micro https://github.com/zeit/micro. This let's us take advantage of serverless arch.
 * 2) When an page is 100% static (specifically, doens't use getInitialProps) then Next.js will automatically create a
 * static html file and serve that instead of using SSR. https://nextjs.org/docs/advanced-features/automatic-static-optimization
 * 
 * However, we don't need 1), at least right now and we have very few purely static pages. So a custom server doesn't
 * hurt us very much and since we need to check for `req.header('x-forwarded-proto') !== 'https'` for heroku,
 * we decided to use our own custom server. This has the added benefit of reducing the server's dependency on Nextjs.
 */

// todo Warning: Cannot update a component from inside the function body of a different component. in menu after seting zip
// todo think about how we're going to "confirm" orders. and how when updating an order, we need to check if hte order
// is already confirmed. originally we were gonna listen for stripe payment event and then use that

/**
 * 
 * 
 * when logging in from homepage, we lose the query params which is a problem when we have promos
 * 
 * 
 * 
 * 1) discount the referrer for every week of the referral
 * 2) discount the referral $7.50 / $5 for a month --- DONE
 * 3) discount the referral +7.50 for skipping on weeks 3 and 4.
 * 
 * 
 * 
 * 
 * heres the final plan
 * 
 * when a user signs up with a referral code...
 * 
 * 1) apply coupon to the new user
 * 2) get referrer data from coupon
 * 3) create 1 weeklyDiscount with 4 discounts inside it.
 * 4) apply what you can to the upcoming orders, this should return you a weeklyDiscount wth the remaining discounts in weeklyDiscount.discounts
 *    - if the order already has discounts, just append to the array
 * 5) apply the rest of these into the consumer plan
 *    - consumer is to have a list of weeklyDiscounts where each weeklyDiscount represents a discount to be applied for 
 *    upcoming orders. so if there are 5 weekly discounts, then there will be 5 discounts on the next order
 * 6) when generating a new upcoming order, cehck the consumer.plan for weeklyDiscounts and apply the first weeklyDiscounts.discount
 * for all weeklyDiscounts.
 * 
 * 
 * if the friend cancels, we need to remove all the discounts with referredUserId === friend.id and then if no more weekly.discounts, then remove weeklyDiscounts
 * 
 * if a friend skips, then we need to set 1 week's weeklyDiscount.discount to 0 with description that friend skipped
 * 
 * 
 * 3---- if there is a coupon applied and the referral is at least 2 weeks in (do discount end - discount start) and
 * order is autopicked, then create and apply the invoice
 * 
 * 
 */


init({
  dsn: activeConfig.server.sentry.dsn,
  integrations: [
    new CaptureConsole({
      levels: ['error', 'warn']
    })
  ],
});

const start = async () => {
  const ssr = next({
    dev: isDev
  });

  const ssrHandler = ssr.getRequestHandler()
  await ssr.prepare();

  const app = express();
  app.use(cookieParser());

  //needed if since we run behind a heroku load balancer in prod
  if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect('https://' + req.header('host') + req.url);
      } else {
        next();
      }
    });
  }

  const elastic = initElastic();
  const stripe = new Stripe(activeConfig.server.stripe.key, {
    apiVersion: '2020-03-02',
  });

  const geoService = initGeoService();
  const planService = initPlanService(stripe);
  const consumerService = initConsumerService(elastic, stripe);
  const restService = initRestService(elastic);
  const orderService = initOrderService(elastic, stripe);

  restService.setGeoService(geoService);
  consumerService.setOrderService(orderService);
  consumerService.setPlanService(planService);
  consumerService.setGeoService(geoService);
  orderService.setConsumerService(consumerService);
  orderService.setGeoService(geoService);
  orderService.setPlanService(planService);
  orderService.setRestService(restService);

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => getContext(req, res)
  });

  apolloServer.applyMiddleware({
    app,
    path: '/api/graphql'
  })

  app.use('/login', handleLoginRoute);
  app.use(universalAuthCB, handleAuthCallback);
  app.use(popupSocialAuthCB, handlePopupSocialAuth);
  app.all('*', (req, res) => ssrHandler(req, res));

  const webServer = createServer(app);

  const port = activeConfig.server.app.port;
  webServer.listen(port, () => {
    console.log(`API Server is now running at ${activeConfig.server.app.url}:${port}${apolloServer.graphqlPath}`);
  });
};

start();