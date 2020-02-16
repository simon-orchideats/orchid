import React, {useEffect} from "react";
import {randomString, sha256, bufferToBase64UrlEncoded} from '../utils/tokenGenerate'
import {activeConfig} from '../../config';
import {redirectURL} from '../utils/redirectURL';

function Redirect () {

    useEffect(() => {
           let codeVerifier= randomString(32);
           const authorizationEndpointUrl = new URL(activeConfig.authorization.endpoint);
          sessionStorage.setItem('codeVerifier', codeVerifier);
          sha256(codeVerifier).then(bufferToBase64UrlEncoded).then(res => {
            authorizationEndpointUrl.search = String(new URLSearchParams({
              response_type: 'code',
              redirect_uri: redirectURL(),
              client_id: activeConfig.authorization.client_id,
              scope: activeConfig.authorization.scope,
              code_challenge: res,
              code_challenge_method: 'S256',
              state: randomString(32)
            }));
            window.location.assign(String(authorizationEndpointUrl));
          });    
    },[])
    return <h1>redirect</h1>
}

export default Redirect