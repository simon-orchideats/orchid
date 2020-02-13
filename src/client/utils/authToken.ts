
export class AuthToken {
  readonly decodedToken:string;

  constructor(readonly token?: string) {
    // we are going to default to an expired decodedToken
    this.decodedToken = "";

    // then try and decode the jwt using jwt-decode
    try {
      if (token) this.decodedToken = token;
    } catch (e) {
    }
  }

  get authorizationString() {
    return `Bearer ${this.token}`;
  }

}