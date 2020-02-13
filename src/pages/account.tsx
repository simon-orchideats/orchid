import Link from 'next/link'
import { AuthProps, privateRoute } from "../client/components/privateRoute";

type Props = AuthProps;
function Account ({auth, refreshToken}:Props){
  console.log("2");
  console.log(auth);
  console.log(refreshToken)
  return(
  <div>
    This is a static page goto{' '}
    <Link href="/">
      <a>test</a>
    </Link>{' '}
    page.
  </div>);
}

Account.getInitialProps = async ({ auth }: AuthProps): Promise<Props> => {
  let refreshToken:string;
  refreshToken = 'test';
  return  {refreshToken,auth};
}

export default privateRoute(Account);
export const accountRoute = 'account';
