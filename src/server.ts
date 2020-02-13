import express from 'express';
import next from 'next';
import { initElastic } from './server/elasticConnector';
import { initPlanService } from './server/plans/planService';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { activeConfig, isProd } from './config';
import { schema } from './server/schema/schema';
import { initRestService } from './server/rests/restService';
import cookieParser from 'cookie-parser'; 
import authRoutes from './server/auth-routes';
import jwt from 'express-jwt';
import jwksRsa from 'jwks-rsa';

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

// Create middleware for checking the JWT
const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://foodflick.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'https://saute.com',
  issuer: `https://foodflick.auth0.com/`,
  algorithms: ['RS256']
});

const start = async () => {
  const ssr = next({
    dev: !isProd
  })



  const ssrHandler = ssr.getRequestHandler()
  await ssr.prepare();

  const app = express();
  app.use(cookieParser());

  //needed if since we run behind a heroku load balancer in prod
  if (process.env.NODE_ENV === 'production') {
    //if your application is behind a proxy (like on Heroku)
    // or if you're encountering the error message:
    // "Unable to verify authorization request state"
    app.set('trust proxy', 1);
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect('https://' + req.header('host') + req.url);
      } else {
        next();
      }
    });
  }

  app.use(authRoutes);

   // you are restricting access to some routes
   
const restrictAccess = (_val:string) => {
  return (_req:any, res:any, _next:any) => {
      console.log("Test")
      console.log(_req.cookies['access_token'])
    if(_req.cookies['access_token']){
      console.log("boom")
      app.use(_val,checkJwt);
    } else{
      res.redirect(`https://foodflick.auth0.com/authorize?response_type=code&client_id=yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg&redirect_uri=http://localhost:8443/callback&scope=SCOPE&audience=https://saute.com&state=${_val}`);
    }
    console.log("yeee")
    _next();
    };
  
}

  // handles requests to /account and calls middleware
  app.use("/account", restrictAccess('/account'));
  const elastic = initElastic();
  initPlanService(elastic);
  initRestService(elastic);

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