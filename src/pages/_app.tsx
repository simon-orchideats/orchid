import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { getTheme } from '../client/global/styles/theme';
import Navbar from '../client/_app/Navbar';
import { getTokens, getAccessToken, needsLogin, canLogin } from '../client/utils/tokenGenerate';
// from https://github.com/mui-org/material-ui/tree/master/examples/nextjs

export default class MyApp extends App {
  
  async componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }
    if (needsLogin()) {
      let data = await getTokens();
      if (data.refresh_token){
        window.localStorage.setItem('REFRESH_TOKEN',data.refresh_token);
        window.sessionStorage.removeItem('codeVerifier');
      }
      console.log(data);
    } else if (canLogin()) {
        let data = await getAccessToken();
        console.log(data);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>My page</title>
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
