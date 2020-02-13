import { NextPageContext } from "next";
import React, { Component } from "react";
import { AuthToken } from "../utils/authToken";
import fetch from 'isomorphic-unfetch';

export type AuthProps = {
  refreshToken: string,
  auth: AuthToken
}


export function privateRoute(WrappedComponent: any) {
  return class extends Component<AuthProps> {

    state = {
      auth: new AuthToken(this.props.auth.token)
    };

    static async getInitialProps(_ctx: NextPageContext) {
      let cookie, accessToken;
      console.log('getInitialProps');
      console.log(_ctx);
      console.log(_ctx.req?.headers.cookie);
      if(_ctx.req?.headers.cookie) {
        cookie = Object.fromEntries(_ctx.req?.headers.cookie.split(/; */).map(c => {
          const [ key, ...v ] = c.split('=');
          return [ key, decodeURIComponent(v.join('=')) ];
      }));
      accessToken = cookie['access_token'];
      // if access token exists check validity
       if(accessToken) {
        const res = await fetch(`http://localhost:8443/api/validateAccessToken?token=${accessToken}`);
        const data = await res.json();
        console.log(data);
        //if not valid
        if(data['bad'] && _ctx.res) {
          //will have to pass refresh token to get new access Tokenf
          _ctx.res.writeHead(301, {
            Location: `https://foodflick.auth0.com/authorize?response_type=code&client_id=yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg&redirect_uri=http://localhost:8443/callback&scope=offline_access&audience=https://saute.com&state=${_ctx.pathname}`
          });
          _ctx.res.end();
        }
        accessToken = cookie['access_token']
         //validate
        
       } else if(cookie['refresh_token']) {
        const res = await fetch(`http://localhost:8443/api/validateAccessToken?token=${accessToken}`);
        const data = await res.json();
        console.log(data);
         
        //grab access token
       } else {
         //do call out to retrieve new set
       }
      // cookie='';
      }
     
      //console.log(cookie);
    //   let cookie= _ctx.req?.headers.cookie;
    //   if(String(cookie).length==0)
    //   { cookie = JSON.parse(String(_ctx.req?.headers.cookie?.split(';')[0]));
    // }
     // _ctx.req?.headers.cookie
      //const cookies = document.cookie;
      const auth = new AuthToken(accessToken);
  
      const initialProps = { auth };
     
      if (WrappedComponent.getInitialProps) {
      
        const wrappedProps = await WrappedComponent.getInitialProps(initialProps);
        // make sure our `auth: AuthToken` is always returned
        return { ...wrappedProps, auth };
      }
      //console.log(initialProps)
      return initialProps;
    }
    componentDidMount() {
      console.log("1");
      console.log(this.props);
      window.localStorage.setItem('REFRESH_TOKEN','test');
      //will have to check localStorage here since it is only avaialble on client


      //this.setState({ auth: new AuthToken(this.props.refreshToken) })
    }
    render() {
      
      // we want to hydrate the WrappedComponent with a full instance method of
      // AuthToken, the existing props.auth is a flattened auth, we want to use
      // the state instance of auth that has been rehydrated in browser after mount
     // console.log(this.props);
      const { auth, ...propsWithoutAuth } = this.props;
      return <WrappedComponent auth={this.state.auth} {...propsWithoutAuth} />;
    }
  };
}