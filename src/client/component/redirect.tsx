import React, {useEffect} from "react";
import {randomString, sha256, bufferToBase64UrlEncoded} from '../utils/tokenGenerate'

type redirectProps = {
  route:string
}

function Redirect (props:redirectProps) {
    useEffect(() => {
           let codeVerifier= randomString(32);
           sessionStorage.setItem('codeVerifier', codeVerifier);
          sha256(codeVerifier).then(bufferToBase64UrlEncoded).then(res => {
            
            let authorizeLink = `https://foodflick.auth0.com/authorize?response_type=code&code_challenge=${res}&code_challenge_method=S256&client_id=yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg&redirect_uri=http://localhost:8443/${props.route}&scope=offline_access&audience=https://saute.com&state=${randomString(32)}`;
            window.location.href = authorizeLink
          });    
    },[])
    return <h1>redirect</h1>
}

export default Redirect