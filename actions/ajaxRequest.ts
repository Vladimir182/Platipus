import 'isomorphic-fetch';
import {asyncFactory} from 'typescript-fsa-redux-thunk';
import actionCreatorFactory from 'typescript-fsa';
import State from 'app/interfaces/IState';
import ROLES from "app/const/roles";
import {ERRORS} from "app/const/errors";
import {message} from 'antd'
import {isLocalStorageNameSupported, isPageRoundDetails} from "app/utils";
import localization from "app/localization";

/** Parameters used for logging in */
interface requestParams {
  url: string,
  method: string,
  params: {
    login?: string;
    password?: string;
    sessionId?: string;
  }
}

/** The object that comes back from the server on successful login */
interface resultParams {
  sessionId: string;
}


interface IActionsType {
  normal: string;
  async: string;
}

const GLOBAL_ERROR = 'GLOBAL_ERROR';
const RESET_GLOBAL_ERROR = 'RESET_GLOBAL_ERROR';
export let globalError = actionCreatorFactory()<any>(GLOBAL_ERROR);
export let resetGlobalError = actionCreatorFactory()(RESET_GLOBAL_ERROR);

export const catchReqError = (err: any, dispatch: any, history: any, useErrorPage?: boolean): boolean => {
  dispatch(globalError(err));
  if (ERRORS.AUTH.NO_SUCH_LOGIN_SESSION.CODE === err.code
      || ERRORS.AUTH.PERMISSION_DENIED.CODE === err.code) {
    cleanSession();

    switchRoute(history);
  }
  if(useErrorPage) {
    switchRoute(history, err);
    return false;
  }
  message.error(err.message);
  console.log(err);
  return false;
}


export default async (actionsType: IActionsType, data: any, history: any, dispatch: any, useErrorPage?: boolean): Promise<boolean> => {
  try {
    await dispatch(reqActionFactory(actionsType).action(data));
    isPageRoundDetails() ? console.log('Round Details page') : dispatch(resetGlobalError());
    return true;
  } catch (err) {
    return catchReqError(err, dispatch, history, useErrorPage)
  }
};

export let login = async (actionsType: IActionsType, data: any, history: any, dispatch: any, getHashRequest?: boolean): Promise<boolean> => {
  try {
    let res = await dispatch(reqActionFactory(actionsType).action(data));
    localStorage.setItem('sessionId', res.sessionId);
    localStorage.setItem('roleId', res.role);
    localStorage.setItem('userId', res.userId);
    localStorage.setItem('login', res.login);

    if(!getHashRequest){
      switchRoute(history);
    }
    return true;
  } catch (err) {
    dispatch(globalError(err));
    cleanSession();
    if(!getHashRequest){
      switchRoute(history);
    }
    if (isLocalStorageNameSupported()) {
      message.error(err.message);
    } else {
      message.error(localization.LOCAL_STORAGE_ERROR);
    }
    console.log(err);
    return false;
  }
};

function cleanSession() {
  localStorage.setItem('sessionId', '');
  localStorage.setItem('roleId', '');
  localStorage.setItem('userId', '');
  localStorage.setItem('login', '');
}

export function reqActionFactory(actionsType: IActionsType) {
  return asyncFactory<State>(actionCreatorFactory(actionsType.normal) as any)<requestParams, resultParams>(
    actionsType.async,
    async (data: any, dispatch: any) => {
      let id = (localStorage.getItem('sessionId') as string);
      const options: RequestInit = {
        method: data.method,
        body: data.params ? JSON.stringify(data.params) : null,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-request-sign': id
        }
      };
      const res = await fetch(data.url, options);
      if (!res.ok) {
        throw await res.json();
      }
      return res.json();
    }
  );
}

export function switchRoute(browserHistory: any, err?:any) {
  if(err){
    let code = err.code || err.statusCode;
    let message;
    switch(code){
      case 412:
      case "412":
      case "5002":
      case 5002: {
        message = "Round doesn't exist!";
        break;
      }
      default: {
        message = err.message;
      }
    }
    browserHistory.push(`/error?code=${code}&message=${message}`);
    return;
  }
  switch (parseInt(localStorage.getItem('roleId') as any)) {
    case ROLES.CASHIER.id: {
      browserHistory.push(ROLES.CASHIER.route);
      break;
    }
    case ROLES.AGENT.id: {
      browserHistory.push(ROLES.AGENT.route);
      break;
    }
    case ROLES.ADMIN.id: {
      browserHistory.push(ROLES.ADMIN.route);
      break;
    }
    case ROLES.DISTRIBUTOR.id: {
      browserHistory.push(ROLES.DISTRIBUTOR.route);
      break;
    }
    default: {
      browserHistory.push(ROLES.UNAUTHORIZED.route);
      break;
    }
  }
}
