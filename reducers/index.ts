import {combineReducers} from 'redux';
import {RootState} from './state';
import {ajaxRequest} from './ajaxRequest';
import filter from './filter';
import table from './table';
import {routerReducer, RouterState} from 'react-router-redux';
import {isPageGameHistory} from "app/utils";

export {RootState, RouterState};

// NOTE: current type definition of Reducer in 'react-router-redux' and 'redux-actions' module
// doesn't go well with redux@4
const appReducer = combineReducers<any>({
  table: table as any,
  filter: filter as any,
  request: ajaxRequest as any,
  router: routerReducer as any
});
export const rootReducer = (state: any, action: any) => {
  if (!localStorage.getItem('sessionId') && !isPageGameHistory() && state) {
    const {router} = state;
    state = {router}
  }
  return appReducer(state, action)
};
