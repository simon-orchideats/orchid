export interface IRestProfile {
  readonly name: string;
  readonly phone: string;
}

export class RestProfile implements IRestProfile {
  readonly name: string;
  readonly phone: string;

  constructor(profile: IRestProfile) {
    this.name = profile.name
    this.phone = profile.phone
  }

  public get Name() { return  this.name }
  public get Phone() { return this.phone }
}