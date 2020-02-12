import { NextPageContext } from "next";
import React, { Component } from "react";
import { AuthToken } from "../utils/authToken";


export type AuthProps = {
  token: string,
  auth: AuthToken
}
export function privateRoute(WrappedComponent: any) {
  return class extends Component<AuthProps> {

    state = {
      auth: new AuthToken(this.props.auth.token)
    };

    static async getInitialProps(_ctx: NextPageContext) {
      console.log("2");
      let cookie;
    //   let cookie= _ctx.req?.headers.cookie;
    //   if(String(cookie).length==0)
    //   { cookie = JSON.parse(String(_ctx.req?.headers.cookie?.split(';')[0]));
    // }
     // _ctx.req?.headers.cookie
      //const cookies = document.cookie;
      const auth = new AuthToken(cookie);
  
      const initialProps = { auth };
     
      if (WrappedComponent.getInitialProps) {
      
        const wrappedProps = await WrappedComponent.getInitialProps(initialProps);
        // make sure our `auth: AuthToken` is always returned
        return { ...wrappedProps, auth };
      }
      //console.log(initialProps)
      return initialProps;
    }
    // componentDidMount() {
    //   console.log("1");
    //   this.setState({ auth: new AuthToken(this.props.token) })
    // }
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