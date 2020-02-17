import React, {useEffect} from "react";
import { randomString, sha256, bufferToBase64UrlEncoded } from '../utils/tokenGenerate'
import { activeConfig } from '../../config';
import { getCurrentURL } from '../utils/getCurrentURL';

const Redirect = () => {
  useEffect(() => {
    const authRedirect = async () => {
      let codeVerifier= randomString(32);
      const authorizationEndpointUrl = new URL(`${activeConfig.authorization.domain}/authorize`);
      sessionStorage.setItem('codeVerifier', codeVerifier);
      const res = await sha256(codeVerifier);
      const codeChallenge= bufferToBase64UrlEncoded(res);
      authorizationEndpointUrl.search = new URLSearchParams({
        response_type: 'code',
        redirect_uri: getCurrentURL(),
        client_id: activeConfig.authorization.clientId,
        scope: activeConfig.authorization.scope,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: randomString(32)
      }).toString();
      window.location.assign(authorizationEndpointUrl.toString());
    }
    authRedirect();  
  },[])
  return <h1>redirect</h1>
}

export default Redirect