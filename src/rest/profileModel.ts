export interface IProfile {
  readonly name: string;
  readonly phone: string;
}

export class Profile implements IProfile {
  readonly name: string;
  readonly phone: string;

  constructor(profile: IProfile) {
    this.name = profile.name
    this.phone = profile.phone
  }

  public get Name() { return  this.name }
  public get Phone() { return this.phone }
}