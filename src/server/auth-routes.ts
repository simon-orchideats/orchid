import express from 'express';
import request from 'request';

const authRoutes = express.Router();

// authRoutes.get("/login", passport.authenticate("auth0", {
//   scope: "openid email profile"
// }), (_req, res) => res.redirect("/"));

authRoutes.get("/callback", (_req, _res, _next) => {
  let options;
  if(!_req.cookies['refresh_token']){
   options = {
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
   }
  } else {
    console.log("Refresh token found");
    options = {
      method: 'POST',
      url: 'https://foodflick.auth0.com/oauth/token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      form: {
        grant_type: 'refresh_token',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        refresh_token: _req.cookies['refresh_token'],
        
      }
    };
  }
  

  request(options, function (_error:any, _response:any, _body:string) {
    if (_error) 
    {
      console.log(_error);
    }
    
    let parsedBody = JSON.parse(_body);
    let accessToken, refreshToken;
    if(parsedBody['refresh_token']) {
    

      accessToken = JSON.parse(_body)['access_token'];
      refreshToken = JSON.parse(_body)['refresh_token'];
      // todo must delete header in order to refresh actual values, investigate behavior on why
      _res.setHeader('Set-Cookie',['access_token='+accessToken,'refresh_token='+refreshToken]);
      _res.setHeader('Authorization','Bearer '+accessToken);
    } else if(!parsedBody['refresh_token']) {
        accessToken = JSON.parse(_body)['access_token'];
        _res.setHeader('Set-Cookie',['access_token='+accessToken]);
    }
    
    _res.redirect('http://localhost:8443/account');
  
  });
  
});


authRoutes.get("/logout", (req, res) => {
  req.logout();

  const {AUTH0_DOMAIN, AUTH0_CLIENT_ID, BASE_URL} = process.env;
  res.redirect(`https://${AUTH0_DOMAIN}/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${BASE_URL}`);
});

export default authRoutes