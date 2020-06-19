export interface IRestProfile {
  readonly name: string;
  readonly phone: string;
  readonly story?: string;
  readonly actor?: string;
  readonly actorImg?: string;
}

export class RestProfile implements IRestProfile {
  readonly name: string;
  readonly phone: string;
  readonly story?: string;
  readonly actor?: string;
  readonly actorImg?: string;

  constructor(profile: IRestProfile) {
    this.name = profile.name
    this.phone = profile.phone
    this.story = profile.story;
    this.actor = profile.actor;
    this.actorImg = profile.actorImg;
  }

  public get Name() { return  this.name }
  public get Phone() { return this.phone }
  public get Story() { return this.story }
  public get Actor() { return this.actor }
  public get ActorImg() { return this.actorImg }

  static getICopy(profile: IRestProfile): IRestProfile {
    return {
      ...profile
    }
  }
}