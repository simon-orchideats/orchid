import { initOrderService } from './server/orders/orderService';
import express from 'express';
import next from 'next';
import { initElastic } from './server/elasticConnector';
import { initPlanService } from './server/plans/planService';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { activeConfig, isProd } from './config';
import { schema } from './schema';
import { initRestService } from './server/rests/restService';
import Stripe from 'stripe';

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

const start = async () => {
  const ssr = next({
    dev: !isProd
  })

  const ssrHandler = ssr.getRequestHandler()
  await ssr.prepare();

  const app = express();
  
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
    apiVersion: '2019-12-03',
  });
  initPlanService(stripe);
  initRestService(elastic);
  initOrderService(elastic, stripe);

  const apolloServer = new ApolloServer({
    schema,
    context: () => ({
      signedInUser: 'testUser'
    }),
  });

  apolloServer.applyMiddleware({
    app,
    path: '/api/graphql'
  })

  app.all('*', (req, res) => ssrHandler(req, res));

  const webServer = createServer(app);

  const port = activeConfig.server.app.port;
  webServer.listen(port, () => {
    console.log(`API Server is now running at https://localhost:${port}${apolloServer.graphqlPath}`);
  });
};

start();