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
      auth: new AuthToken(this.props.token)
    };

    static async getInitialProps(_ctx: NextPageContext) {
      
      const cookies = 'test';
      const auth = new AuthToken(cookies);
      const initialProps = { auth };
      if (WrappedComponent.getInitialProps) {
        const wrappedProps = await WrappedComponent.getInitialProps(initialProps);
        // make sure our `auth: AuthToken` is always returned
        return { ...wrappedProps, auth };
      }
      return initialProps;
    }
    componentDidMount() {
      this.setState({ auth: new AuthToken(this.props.token) })
    }
    render() {
      // we want to hydrate the WrappedComponent with a full instance method of
      // AuthToken, the existing props.auth is a flattened auth, we want to use
      // the state instance of auth that has been rehydrated in browser after mount
      
      const { auth, ...propsWithoutAuth } = this.props;
      return <WrappedComponent auth={this.state.auth} {...propsWithoutAuth} />;
    }
  };
}