import React from "react";
import { isServer } from '../utils/isServer';
import Redirect from './AuthRedirect';

const requireAuth = (WrappedComponent: React.ComponentType) => {
  
  return () => {
    if (isServer()) return <WrappedComponent/>
    const hasSignedInUser = window.localStorage.REFRESH_TOKEN;
    return !hasSignedInUser && !sessionStorage.getItem('codeVerifier') ? <Redirect/> : <WrappedComponent/>
  }
}

export default requireAuth;