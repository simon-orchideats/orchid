export interface IRewards {
  readonly earned: number,
  readonly potential: number
}

export class Rewards implements IRewards {
  readonly earned: number
  readonly potential: number

  constructor (r: IRewards) {
    this.earned = r.earned;
    this.potential = r.potential;
  }

  public get Earned() { return this.earned }
  public get Potential() { return this.potential }

}