import Link from 'next/link'
import requireAuth from '../client/component/requireAuth';
  const Account = () => {
  return(
  <div>
    This is a static page goto{' '}
    <Link href="/">
      <a>test</a>
    </Link>{' '}
    page.
  </div>);
}
export default requireAuth(Account); 
export const accountRoute = 'account';
