import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { getTheme } from '../client/global/styles/theme';
import Navbar from '../client/_app/Navbar';
import { isServer } from '../client/utils/isServer';
import LogRocket from 'logrocket';
import { activeConfig } from '../config';
import { analyticsService } from '../client/utils/analyticsService';
import { Router, withRouter } from 'next/router';

// from https://github.com/mui-org/material-ui/tree/master/examples/nextjs

class MyApp extends App {
  
  async componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) jssStyles.parentElement!.removeChild(jssStyles);
    if (!isServer()) {
      analyticsService.init();
      LogRocket.init(activeConfig.client.logRocket.key, {
        console: {
          shouldAggregateConsoleErrors: true,
        }
      });
      // depending on the the route being loaded, sometimes router doesn't see promo param
      // which is why we try again inside the routeChangeComplete
      // also important that we keep using the query.{value} instead of storing it in a variable, otherwise the logic
      // doesn't work
      let prevPromo: string | false = this.props.router.query.p as string;
      let prevAmountOff: string | false = this.props.router.query.a as string;
      Router.events.on('routeChangeComplete', url => {
        if (prevAmountOff === undefined) {
          prevAmountOff = this.props.router.query.a as string || false;
        }
        if (prevPromo === undefined) {
          prevPromo = this.props.router.query.p as string || false;
        }
        if (
          prevPromo
          && !this.props.router.query.p 
          && prevAmountOff 
          && !this.props.router.query.a
        ) {
          this.props.router.replace(`${url}?p=${prevPromo}&a=${prevAmountOff}`);
        };
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>Orchid</title>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        </Head>
        <ThemeProvider theme={getTheme()}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Navbar />
          <Component {...pageProps} />
        </ThemeProvider>
      </React.Fragment>
    );
  }
}

export default withRouter(MyApp);
