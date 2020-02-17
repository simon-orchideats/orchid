import React, { useEffect } from "react";
import { authRedirect, needsRedirect } from './auth'
import { isServer } from '../isServer';
import { Typography } from "@material-ui/core";

const Redirect = () => {
  useEffect(() => {
    authRedirect();  
  }, [])
  return <Typography variant='body1'>Logging you in...</Typography>
}

const requireAuth = (WrappedComponent: React.ComponentType) => () => {
  if (isServer()) return <WrappedComponent/>
  return needsRedirect() ? <Redirect/> : <WrappedComponent/>
}

export default requireAuth;