import React, { Component } from "react";
import { isServer } from '../utils/isServer';
import Redirect from './redirect';

export function requireAuth(WrappedComponent: React.ComponentType, route:string) {
  return class extends Component {
    render() {
      const {...propsWithoutAuth } = this.props;
      if(!isServer()) { 
        const hasSignedInUser = window.localStorage.REFRESH_TOKEN;
        if(hasSignedInUser) {
          return <WrappedComponent  {...propsWithoutAuth} />;
        } else if(sessionStorage.getItem('codeVerifier')){
          
        }else {
          return  <Redirect route={route}/>
        }
      }
      return <WrappedComponent  {...propsWithoutAuth} />;
    }
  };
}