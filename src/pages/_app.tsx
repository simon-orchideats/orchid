import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { getTheme } from '../client/global/styles/theme';
import Navbar from '../client/_app/Navbar';
import fetch from 'isomorphic-unfetch';
 import {urlParams} from '../client/utils/tokenGenerate';
import {redirectURL} from '../client/utils/redirectURL';
import {activeConfig} from '../config'
// from https://github.com/mui-org/material-ui/tree/master/examples/nextjs

export default class MyApp extends App {
  
  async componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }

    if(urlParams().get('code')) {
      const getTokens = async () => { 
        try {
          return await fetch('https://foodflick.auth0.com/oauth/token', {
            method: 'POST',
            mode:'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                audience: activeConfig.authorization.audience,
                client_id: activeConfig.authorization.client_id,
                code_verifier: sessionStorage.getItem('codeVerifier'),
                code: urlParams().get('code'),
                redirect_uri: redirectURL()
              }),
            })
        } catch(err) {return err}
      };

      let data = await getTokens();
      data = await data.json();
      if(data['refresh_token']){
        window.localStorage.setItem('REFRESH_TOKEN',data['refresh_token']);
        window.sessionStorage.removeItem('codeVerifier');
      }
      console.log(data);
    } else if(window.localStorage.getItem('REFRESH_TOKEN')) {

       const getRefreshToken = async () => {
       try { 
          return await fetch('https://foodflick.auth0.com/oauth/token', {
            method: 'POST',
            mode:'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              grant_type: 'refresh_token',
              client_id: activeConfig.authorization.client_id,
              refresh_token: window.localStorage.getItem('REFRESH_TOKEN')
            }),
          })
        } catch (err) {return err}
      };

      let data = await getRefreshToken();
      data = await data.json();
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
