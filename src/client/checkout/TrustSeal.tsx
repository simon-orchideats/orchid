import { useEffect } from "react"
import { activeConfig } from "../../config";

const TrustSeal = () => {
  useEffect(() => {
    //@ts-ignore
    postscribe('#trustSeal', `
      <script>
        TrustLogo('${activeConfig.client.app.url}/checkout/trustSealSmall.png', 'CL1', 'none');
      </script>
    `);
  }, []);
  return <div id='trustSeal' />
}

export default TrustSeal;