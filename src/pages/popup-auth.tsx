import auth0 from 'auth0-js';
import { activeConfig } from '../config';
import { isServer } from '../client/utils/isServer';

const CheckoutSocialAuth = () => {
  if (isServer()) return null;
  const webAuth = new auth0.WebAuth({
    domain: activeConfig.client.auth.domain,
    clientID: activeConfig.client.auth.clientId
  });
  webAuth.popup.callback({
    // the default value of when left undefined, but typescript complains so we explictly specify
    hash: window.location.hash
  });
  return <div>Logging in</div>;
}

export default CheckoutSocialAuth;
