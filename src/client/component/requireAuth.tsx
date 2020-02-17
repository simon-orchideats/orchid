import React from "react";
import { isServer } from '../utils/isServer';
import Redirect from './AuthRedirect';

const requireAuth = (WrappedComponent: React.ComponentType) => {
  
  const requireAuth = () => {
    if (!isServer()) { 
      const hasSignedInUser = window.localStorage.REFRESH_TOKEN;
      if (hasSignedInUser) {
        return <WrappedComponent/>;
      } else if(!sessionStorage.getItem('codeVerifier')){
        return  <Redirect/>
      } else{
        return <WrappedComponent/>;
      }
    }
    return <WrappedComponent/>;
  }
  return requireAuth;
}

export default requireAuth;