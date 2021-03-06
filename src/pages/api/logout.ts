import { NextApiRequest, NextApiResponse } from 'next';
import { accessTokenCookie, refreshTokenCookie } from '../../utils/auth';
import { activeConfig } from '../../config';

export default (_req: NextApiRequest, res: NextApiResponse ) => {
  res.writeHead( 302,{
    'Set-Cookie': [
      `${accessTokenCookie}=''; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; path=/`,
      `${refreshTokenCookie}=''; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; path=/`],
    'Location': `https://${activeConfig.client.auth.domain}/v2/logout?returnTo=${activeConfig.client.app.url}&client_id=${activeConfig.client.auth.clientId}`, 
  })
  res.end();
}