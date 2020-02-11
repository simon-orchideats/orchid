import express from 'express';
import request from 'request';

const authRoutes = express.Router();

// authRoutes.get("/login", passport.authenticate("auth0", {
//   scope: "openid email profile"
// }), (_req, res) => res.redirect("/"));

authRoutes.get("/callback", (_req, _res, _next) => {
  let options = {
    method: 'POST',
    url: 'https://foodflick.auth0.com/oauth/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form: {
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code: _res.req?.query.code,
      redirect_uri: 'http://localhost:8443/callback'
    }
  };
  request(options, function (_error:any, _response:any, _body:string) {
    if (_error) throw new Error(_error);
  
    _res.setHeader('Set-Cookie',['access_token='+_body]);
    _res.redirect('/'+_res.req?.query.state);
  
  });
  
});

authRoutes.get("/logout", (req, res) => {
  req.logout();

  const {AUTH0_DOMAIN, AUTH0_CLIENT_ID, BASE_URL} = process.env;
  res.redirect(`https://${AUTH0_DOMAIN}/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${BASE_URL}`);
});

export default authRoutes