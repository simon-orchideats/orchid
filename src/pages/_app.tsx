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
import { Router } from 'next/router';

// from https://github.com/mui-org/material-ui/tree/master/examples/nextjs

export default class MyApp extends App {
  
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
      Router.events.on('routeChangeComplete', () => {
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
