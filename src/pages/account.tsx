import Link from 'next/link'
import { AuthProps, privateRoute } from "../client/components/privateRoute";

type Props = AuthProps;
function Account ({auth}:Props){
  console.log({auth});
  return(
  <div>
    This is a static page goto{' '}
    <Link href="/">
      <a>test</a>
    </Link>{' '}
    page.
  </div>
  )
}

export default privateRoute(Account);
export const accountRoute = 'account';
