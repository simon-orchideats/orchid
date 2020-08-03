// from https://github.com/mui-org/material-ui/tree/master/examples/nextjs
import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/core/styles';
import { getTheme } from '../client/global/styles/theme';
import { activeConfig } from '../config';
import { fbEvents } from "../client/utils/analyticsService";
const tracking = activeConfig.client.analytics.ga.trackingId;
const fbTracking = activeConfig.client.analytics.facebookPixel.pixelId;

export default class MyDocument extends Document {
  render() {
    return (
      <html lang="en">
        <script src="https://js.stripe.com/v3/"></script>
        <script src='https://secure.trust-provider.com/trustlogo/javascript/trustlogo.js' />
        <script src='https://cdnjs.cloudflare.com/ajax/libs/postscribe/2.0.6/postscribe.min.js' />
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${tracking}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${tracking}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
          {/*Facebook Pixel */}
          <script 
            dangerouslySetInnerHTML={{ 
              __html:`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('${fbEvents.INIT}', '${fbTracking}');
                fbq('${fbEvents.TRACK}', '${fbEvents.PAGE_VIEW}');
              ` 
            }}
          />
          <noscript 
            dangerouslySetInnerHTML={{ 
              __html:`
                <img
                  height="1"
                  width="1"
                  style="display:none"
                  src="https://www.facebook.com/tr?id=${fbTracking}&ev=PageView&noscript=1"
                />
              ` 
            }}
          />
        
          <meta property="og:image" content="/logo.png" />
          {/* PWA primary color */}
          <meta name="theme-color" content={getTheme().palette.primary.main} />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Raleway:300,400,500,700&display=swap"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

MyDocument.getInitialProps = async ctx => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
  };
};
