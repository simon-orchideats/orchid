import request from 'request';

export default (_req:any , _res:any) => {

  let refreshToken= _req.query.token;
  let options = {
    method: 'POST',
    url: 'https://foodflick.auth0.com/oauth/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form: {
      grant_type: 'refresh_token',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      refresh_token: refreshToken
      
    }
  };
  request(options, function (_error:any, _response:any, _body:string) {
    if (_error) 
    {
      console.log(_error);
    }
    console.log(_req)
    let parsedBody = JSON.parse(_body);
    let accessToken;
    if(parsedBody['refresh_token']) {
      accessToken = JSON.parse(_body)['access_token'];
      refreshToken = JSON.parse(_body)['refresh_token'];
      // todo must delete header in order to refresh actual values, investigate behavior on why
      _res.setHeader('Set-Cookie',['access_token='+accessToken]);
      _res.setHeader('Authorization','Bearer '+accessToken);
    } 
    _res.redirect(`http://localhost:8443/account`);
  
  });
  //let options = {audience:'urn:https://saute.com'}; 
  
  // _res.status(200).json({
  //   quote: 'Write tests, not too many, mostly integration',
  //   author: 'Guillermo Rauch'
  // })
}