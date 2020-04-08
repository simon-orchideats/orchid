import { NextApiRequest, NextApiResponse } from 'next';
import { accessTokenCookie, refreshTokenCookie } from '../../utils/auth';
import { activeConfig } from '../../config';

export default (_req: NextApiRequest, res: NextApiResponse ) => {
  res.writeHead( 301,{
    'Location': `${activeConfig.client.auth.logOut}`, 
    'Set-Cookie': [
      `${accessTokenCookie}=''; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; path=/`,
      `${refreshTokenCookie}=''; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; path=/`],
  })
  res.end();
}