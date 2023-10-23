import actionCreatorFactory from 'typescript-fsa';
import {table} from 'app/actionTypes';

const actionCreator = actionCreatorFactory();

export interface ISort {
  sortKey: string;
  sortDirection: string;
}

export interface IPagination {
  current: number,
  pageSize: number,
  total?: number
}

export interface ITable {
  sort: ISort;
  pagination: IPagination;
  filter?: any
}

export const tableAction = actionCreator<ITable>(table.TABLE_ACTION);
export const changeSortKey = actionCreator<string[]>(table.CHANGE_SORT_KEY);
export const resetTableData = actionCreator(table.RESET_TABLE_DATA);
