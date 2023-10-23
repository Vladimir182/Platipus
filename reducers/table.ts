import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {changeSortKey, IPagination, ISort, resetTableData, tableAction} from "app/actions/table";
import {getAsyncAction} from "app/reducers/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";

/** An initial value for the application state */
interface State {
  sort: ISort
  pagination: IPagination
  includeRooms: boolean
  filter?: any,
  metadata?: any,
  newRecordId?: number | undefined
}

const initial = <State>{
  sort: {
    sortKey: '',
    sortDirection: 'asc'
  },
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  filter: {role:["0"]},
  report: null,
  reportTotal: {},
  includeRooms: false,
  metadata: {},
  newRecordId: undefined
};

/** Reducer, handling updates to indicate logging-in status/error */
export default reducerWithInitialState(initial)
  .case(tableAction, (state, obj) => ({
    ...state,
    sort: obj.sort,
    pagination: obj.pagination,
    filter: obj.filter ? { ...state.filter, ...obj.filter } : {},
  }))
  .case(changeSortKey, (state, sortArr: string[]) => ({
    ...state,
    sort: {
      sortKey: sortArr[0],
      sortDirection: sortArr[1]
    },
  }))
  .case(resetTableData, (state) => ({
    ...state,
    report: null,
    metadata: {}
  }))
  //async
  .case(getAsyncAction(ajaxRequestTypes.REPORT).async.started, state => ({
    ...state,
    loadingReport: true,
    // error: undefined
  }))
  .case(getAsyncAction(ajaxRequestTypes.REPORT).async.failed, (state) => {
    return ({
      ...state,
      // error: error as any,
      loadingReport: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.REPORT).async.done, (state, result: any) => {
    let pagination = result.result.metadata.searchPage ?
      {
        ...state.pagination,
        total: parseInt(result.result.metadata.items),
        current: parseInt(result.result.metadata.searchPage)
      }
      :
      {...state.pagination, total: parseInt(result.result.metadata.items)};
    return ({
      ...state,
      report: result.result.data,
      reportTotal: result.result.totalData,
      loadingReport: false,
      pagination,
      includeRooms: result.result.metadata.includeRooms === "1",
      metadata: result.result.metadata,
      // error: undefined
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.CHANGE_REPORT).async.started, state => ({
    ...state,
    newRecordId: undefined
  }))
  .case(getAsyncAction(ajaxRequestTypes.CHANGE_REPORT).async.done, (state, result: any)  => ({
    ...state,
    newRecordId: result.result.metadata.gameId || result.result.metadata.id
  }))

  .case(getAsyncAction(ajaxRequestTypes.ADD_REPORT).async.started, state => ({
    ...state,
    newRecordId: undefined
  }))
  .case(getAsyncAction(ajaxRequestTypes.ADD_REPORT).async.done, (state, result: any)  => ({
    ...state,
    newRecordId: result.result.metadata.gameId
  }));
