import { universalAuthCB, popupSocialAuthCB } from './utils/auth';
import { init } from '@sentry/node';
import { CaptureConsole } from '@sentry/integrations';
import { initConsumerService } from './server/consumer/consumerService';
import { initGeoService } from './server/place/geoService';
import { getContext } from './utils/apolloUtils';
import { initOrderService } from './server/orders/orderService';
import express from 'express';
import path from 'path';
import next from 'next';
import { initElastic } from './server/elasticConnector';
import { initPlanService } from './server/plans/planService';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { activeConfig, isProd } from './config';
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

// todo: listen for stripe event of payment and then create the next order
// todo: use refresh token...
// todo logout
// todo Warning: Cannot update a component from inside the function body of a different component. in menu after seting zip
// todo use getAdjustmentDesc
// todo test for consumerServiceTest
// todo think about how we're going to "confirm" orders. and how when updating an order, we need to check if hte order
// is already confirmed. originally we were gonna listen for stripe payment event and then use that
// to mark corresponding orders as confirmed, but can't do that since we delivery date might be more than 2 days past 
// payment day if the consumer updated the delivery date. for now we'll just do it each day
// at 12am.
// write up experiences for dave.
// todo everything in config needs to be prod. for stripe, use the foodflick one. update elastic dbs.
// add metrics
// have counter in banner. have btton that takes you to dontaors with count. do dave's screenshot thing. Healthcare

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
    dev: !isProd
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
  app.use('/privacy', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public/html', 'privacy.html'));
  })
  app.all('*', (req, res) => ssrHandler(req, res));

  const webServer = createServer(app);

  const port = activeConfig.server.app.port;
  webServer.listen(port, () => {
    console.log(`API Server is now running at https://localhost:${port}${apolloServer.graphqlPath}`);
  });
};

start();