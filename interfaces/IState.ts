import {IAppError} from "app/const/errors";

export interface ICurrList {
  updates: any[],
  rates: any[]
}

export default interface State {
  roleId?: string;
  sessionId?: string;
  loggingIn?: boolean;
  error?: IAppError;

}
