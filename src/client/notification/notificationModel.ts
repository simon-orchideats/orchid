// lowercase instead of capitalized so theme.ts can use these as fields in CommonColor.
// ex: theme.pallete.common.success vs theme.pallete.common.SUCCESS
export enum NotificationType {
  success = 'success',
  warning = 'warning',
  error = 'error',
}

export interface INotification {
  readonly message: string;
  readonly type: NotificationType;
  readonly doesAutoHide: boolean,
}

export class Notification implements INotification {
  readonly message: string;
  readonly type: NotificationType;
  readonly doesAutoHide: boolean;

  public constructor({
    message,
    type,
    doesAutoHide,
  }: INotification) {
    this.message = message;
    this.type = type;
    this.doesAutoHide = doesAutoHide;
  }
  
  public get Message() { return this.message }
  public get Type() { return this.type }
  public get DoesAutoHide() { return this.doesAutoHide }
};
