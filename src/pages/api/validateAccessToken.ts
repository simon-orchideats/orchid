// import jwt from 'express-jwt';
// import jwksRsa from 'jwks-rsa';
// import express from 'express';
// const authRoutes = express.Router();
import jwt from 'jsonwebtoken';
// Verify using getKey callback
// Example uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
var jwksClient = require('jwks-rsa');
var client = jwksClient({
  jwksUri: 'https://foodflick.auth0.com/.well-known/jwks.json'
});
function getKey(header:any, callback:any){
  client.getSigningKey(header.kid, function(_err:any, key:any) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
export default (_req:any , _res:any) => {
  let accessToken= _req.query.token;
  //let options = {audience:'urn:https://saute.com'}; 
  jwt.verify(accessToken, getKey, function(_err, decoded) {
    console.log(_err);
    if(decoded) {
      _res.status(200).json({passed:'good'});

    } else {
      _res.status(400).json( {bad:'bad'});
    } // bar
  });
  // _res.status(200).json({
  //   quote: 'Write tests, not too many, mostly integration',
  //   author: 'Guillermo Rauch'
  // })
}