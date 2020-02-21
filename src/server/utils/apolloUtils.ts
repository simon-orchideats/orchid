import { IncomingMessage } from "http"
import { getSignedInUser } from "../auth/authenticate"

export const getContext = (req?: IncomingMessage) => ({
  signedInUser: getSignedInUser(req),
})
