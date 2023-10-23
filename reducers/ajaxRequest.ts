import {reducerWithInitialState} from 'typescript-fsa-reducers';
import State from 'app/interfaces/IState';
import {ajaxRequestTypes} from "app/actionTypes";
import {globalError, reqActionFactory, resetGlobalError} from "app/actions/ajaxRequest";
import {IAppError} from "app/const/errors";

/** An initial value for the application state */
const initial = <State>{
  roleId: "",
  sessionId: "",
  currencyList: {
    updates: [],
    rates: []
  }
};

export interface IAsyncAction {
  type: string,
  action: any
}

export let asyncActions: IAsyncAction[] = [];
/*Init async reducers*/
(() => {
  for (let key in ajaxRequestTypes) {
    if (ajaxRequestTypes.hasOwnProperty(key) && typeof (ajaxRequestTypes as any)[key] === 'string') {
      let type = (ajaxRequestTypes as any)[key];
      asyncActions.push({
        type: type,
        action: reqActionFactory(ajaxRequestTypes.standartAsyncTypes(type))
      });
    }
  }
})();

export function getAsyncAction(type: string): any {
  for (let i = 0; i < asyncActions.length; i++) {
    if (asyncActions[i].type === type) {
      return asyncActions[i].action;
    }
  }
}

/** Reducer, handling updates to indicate logging-in status/error */
export const ajaxRequest = reducerWithInitialState(initial)
  .case(getAsyncAction(ajaxRequestTypes.LOGIN).async.started, state => ({
    ...state,
    loggingIn: true,
    // error: undefined
  }))
  .case(getAsyncAction(ajaxRequestTypes.LOGIN).async.failed, (state, {error}: { params: {}, error: IAppError }) => {
    return ({
      ...state,
      // error: error as any,
      loggingIn: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.LOGIN).async.done, ((state, result: any) => {
      return ({
        ...state,
        result,
        loggingIn: false,
        sessionId: result.result.sessionId
        // error: undefined
      })
    }
  ))

  //error actions
  .case(globalError, (state, error) => ({
    ...state,
    error
  }))
  .case(resetGlobalError, (state) => ({
    ...state,
    error: undefined
  }));
