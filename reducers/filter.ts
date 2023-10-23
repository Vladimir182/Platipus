import { reducerWithInitialState } from 'typescript-fsa-reducers';
import {
  previousPage,
  searchByRooms,
  searchId,
  searchLogin,
  searchWithFun,
  searchWithGift,
  searchWithBuy,
  selectCurrency,
  selectCurrencyArray,
  selectCurrencyDate,
  selectDateAndTimePicker,
  selectDateRange,
  selectEndDate,
  selectGames,
  selectCountrys,
  selectGroups,
  selectGroup,
  selectOfficesByPlatform,
  resetOfficesByPlatform,
  selectOptionRange,
  selectPlatform,
  selectRooms,
  selectRoomsByOffice,
  selectStartDate,
  selectTimeZone,
  selectWithoutKeysRooms,
  switchRoomsToCurrency,
  selectPlayers
} from 'app/actions/filter';
import { getAsyncAction } from 'app/reducers/ajaxRequest';
import { ajaxRequestTypes } from 'app/actionTypes';
import { ICurrList } from 'app/interfaces/IState';
import { getParameterByName, getTodayRange, getTodayRangeWithoutSecond } from 'app/utils';

/** An initial value for the application state */
export interface IRoom {
  id: number;
  name: string;
  categoryName: string;
  categoryId: number;
  continentId: number;
  categoryPlatformId: number;
  platform: string;
}

interface IGameTypeItem {
  id: number;
  name: string;
  subTypeId: number;
  typeId: number;
  actionTypeId: number;
}
interface IGameSubTypeItem {
  id: number;
  name: string;
}
export interface IGameTypes {
  gameTypes: IGameTypeItem[];
  gameSubtypes: IGameSubTypeItem[];
}

interface State {
  selectedCurrency?: number;
  selectedCurrencyDate?: number;
  selectedGames?: string[];
  selectedCountrys?: string[];
  selectedGroups?: number[];
  selectedGroup?: number;
  selectedDateRange?: string[];
  selectedRooms?: string[];
  selectedWithoutKeysRooms?: string[];
  selectedPlatform?: string;
  selectedPlayers?: any[];
  currencyList?: ICurrList;
  currencySettingsList?: any[];
  currencyFilterList?: any[];
  roomsList?: IRoom[];
  gameOptionOfficeList?: any;
  gameTypesList?: IGameTypes;
  withoutKeysRoomsList?: IRoom[];
  checkedRooms: boolean;
  previousPage?: any;
  searchIdValue?: any;
  searchLoginValue?: any;
  selectedDateAndTime?: string[];
  activityDates?: string[];
  timeZone?: string;
  switchRoomsToCurrency?: boolean;
  platformList?: any[];
  selectedCurrencyArray?: any[];
  gamificationsOfficeList: Map<number, { id: number; name: string; platformId: number }>;
  gamificationsRoomList: Map<number, { id: number; name: string; officeId: number }>;
}

const initial = <State>{
  selectedCurrency: undefined,
  selectedCurrencyDate: undefined,
  selectedDateRange: getTodayRange(),
  currencySettingsList: [],
  currencyFilterList: [],
  currencyList: {
    updates: [],
    rates: []
  },
  roomsList: [],
  gameOptionRoomList: [],
  gameOptionOfficeList: [],
  withoutKeysRoomsList: [],
  selectedRooms: [],
  selectedRoomsByOffice: [],
  selectedOfficesByPlatform: [],
  selectedWithoutKeysRooms: [],
  selectedPlatform: undefined,
  selectedPlayers: [],
  gamificationsResourceList: [],
  checkedRooms: false,
  checkedFun: false,
  checkedGift: false,
  checkedBuy: false,
  gamificationsList: [],
  gamificationsPlatformList: [],
  gamificationsOfficeList: new Map(),
  gamificationsRoomList: new Map(),
  gamesList: [],
  countrysList: [],
  groupList: [],
  walletList: [],
  gameTypesList: {
    gameTypes: [],
    gameSubtypes: []
  },
  missedVersionList: [],
  selectedGames: [],
  selectedCountrys: [],
  selectedGroups: [],
  selectedGroup: 1,
  searchIdValue: '',
  searchLoginValue: '',
  timeZone: '+00:00',
  switchRoomsToCurrency: false,
  selectedDateAndTime: getTodayRangeWithoutSecond(),
  activityDates: [
    /*
      '2021-08-12',
      '2021-08-08',
      '2021-08-09',
      '2021-07-09',
      '2021-11-30'
    */
  ],
  platformList: [],
  selectedCurrencyArray: []
};
/** Reducer, handling updates to indicate logging-in status/error */
export default reducerWithInitialState(initial)
  .case(selectCurrency, (state, selectedCurrency) => ({
    ...state,
    selectedCurrency: selectedCurrency
  }))
  .case(selectCurrencyDate, (state, selectedCurrencyDate) => ({
    ...state,
    selectedCurrencyDate: selectedCurrencyDate
  }))
  .case(selectDateRange, (state, selectedDateRange) => ({
    ...state,
    selectedDateRange: selectedDateRange
  }))
  .case(selectStartDate, (state: any, start: any) => ({
    ...state,
    selectedDateRange: [start, state.selectedDateRange[1]]
  }))
  .case(selectEndDate, (state: any, end: any) => ({
    ...state,
    selectedDateRange: [state.selectedDateRange[0], end]
  }))
  .case(selectDateAndTimePicker, (state: any, selectedDateAndTime) => ({
    ...state,
    selectedDateAndTime
  }))
  .case(selectOptionRange, (state: any, selectedOptionRange: string) => ({
    ...state,
    selectedOptionRange
  }))
  .case(selectRooms, (state, selectedRooms) => ({
    ...state,
    selectedRooms: selectedRooms
  }))
  .case(selectOfficesByPlatform, (state, selectedOfficesByPlatform) => ({
    ...state,
    selectedOfficesByPlatform
  }))
  .case(resetOfficesByPlatform, (state, selectedOfficesByPlatform) => ({
    ...state,
    selectedOfficesByPlatform: []
  }))
  .case(selectRoomsByOffice, (state, selectedRoomsByOffice) => ({
    ...state,
    selectedRoomsByOffice
  }))
  .case(selectWithoutKeysRooms, (state, selectedWithoutKeysRooms) => ({
    ...state,
    selectedWithoutKeysRooms: selectedWithoutKeysRooms
  }))
  .case(selectGames, (state, selectedGames) => ({
    ...state,
    selectedGames: selectedGames
  }))
  .case(selectPlayers, (state, selectedPlayers) => ({
    ...state,
    selectedPlayers
  }))
  .case(selectCountrys, (state, selectedCountrys) => ({
    ...state,
    selectedCountrys: selectedCountrys
  }))
  .case(selectGroups, (state, selectedGroups) => ({
    ...state,
    selectedGroups: selectedGroups
  }))
  .case(selectGroup, (state, selectedGroup) => ({
    ...state,
    selectedGroup: selectedGroup
  }))
  .case(searchByRooms, (state, checked) => ({
    ...state,
    checkedRooms: checked
  }))
  .case(searchWithFun, (state, checked) => ({
    ...state,
    checkedFun: checked
  }))
  .case(switchRoomsToCurrency, (state, checked) => ({
    ...state,
    switchRoomsToCurrency: checked
  }))
  .case(searchWithGift, (state, checked) => ({
    ...state,
    checkedGift: checked
  }))
  .case(searchWithBuy, (state, checked) => ({
    ...state,
    checkedBuy: checked
  }))
  .case(searchId, (state, searchText) => ({
    ...state,
    searchIdValue: searchText
  }))
  .case(searchLogin, (state, searchText) => ({
    ...state,
    searchLoginValue: searchText
  }))
  .case(selectTimeZone, (state, timeZone) => ({
    ...state,
    timeZone: timeZone
  }))
  .case(previousPage, (state, obj) => {
    let {pageType, pageValue} = obj;
    return (
      {
        ...state,
        previousPage: {
          ...state.previousPage,
          [pageType]: pageValue
        }
      })
  })
  .case(selectPlatform, (state, selectedPlatform) => ({
    ...state,
    selectedPlatform: selectedPlatform
  }))
  .case(selectCurrencyArray, (state, selectedCurrencyArray) => ({
    ...state,
    selectedCurrencyArray: selectedCurrencyArray
  }))
  //async
  .case(getAsyncAction(ajaxRequestTypes.CURRENCY_LIST).async.started, state => ({
    ...state,
    loadingCurrency: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.CURRENCY_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingCurrency: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.CURRENCY_LIST).async.done, (state, result: any) => {
    let eu = result.result.data.rates.filter((obj: any) => obj.id == 2)[0].id;
    return ({
      ...state,
      currencyList: result.result.data,
      selectedCurrency: getParameterByName('updateId', result.params.url) == -1 && !state.selectedCurrency ? eu : state.selectedCurrency,
      selectedCurrencyDate: getParameterByName('updateId', result.params.url) == -1 && !state.selectedCurrencyDate ? result.result.data.rates[0].updateId : state.selectedCurrencyDate,
      loadingCurrency: false,
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.CURRENCY_SETTINGS_LIST).async.started, state => ({
    ...state,
    loadingCurrencySettings: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.CURRENCY_SETTINGS_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingCurrencySettings: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.CURRENCY_SETTINGS_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      currencySettingsList: result.result.data.rates,
      loadingCurrencySettings: false,
      currencyFilterList:result.result.metadata.currencies,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GAMIFICATION_RESOURCE_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      gamificationsResourceList: result.result.data,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GAMIFICATION_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      gamificationsList: result.result.data,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GAMIFICATION_PLATFORM_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      gamificationsPlatformList: result.result.data,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.OFFICES_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      gameOptionOfficeList: result.result.data,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GAMIFICATION_OFFICE_LIST).async.done, (state, result: any) => {

    const platformId = +result.result.metadata['platformId'];
    const copiedList = new Map([...state.gamificationsOfficeList])
    copiedList.set(platformId, result.result.data);

    return ({
      ...state,
      gamificationsOfficeList: copiedList
      // loadingGames: false,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GAMIFICATION_ROOM_LIST).async.done, (state, result: any) => {

    const officeId = +result.result.metadata['officeId'];
    const copiedList = new Map([...state.gamificationsRoomList])
    copiedList.set(officeId, result.result.data);

    return ({
      ...state,
      gamificationsRoomList: copiedList
      // loadingGames: false,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.ROOM_LIST).async.started, state => ({
    ...state,
    loadingRooms: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.ROOM_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingRooms: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.ROOM_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      roomsList: result.result.data,
      loadingRooms: false,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.ROOM_LIST_V2).async.done, (state, result: any) => {
    return ({
      ...state,
      gameOptionRoomList: result.result.data,
      loadingRooms: false,
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.WITHOUT_KEY_ROOM_LIST).async.started, state => ({
    ...state,
    loadingWithoutKeysRooms: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.WITHOUT_KEY_ROOM_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingWithoutKeysRooms: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.WITHOUT_KEY_ROOM_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      withoutKeysRoomsList: result.result.data,
      loadingWithoutKeysRooms: false,
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.GAME_LIST).async.started, state => ({
    ...state,
    loadingGames: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.GAME_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingGames: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GAME_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      gamesList: result.result.data,
      loadingGames: false,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.COUNTRY_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      countrysList: result.result.data,
      loadingGames: false,
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.MISSED_VERSION_LIST).async.started, state => ({
    ...state,
    loadingMissedVersion: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.MISSED_VERSION_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingMissedVersion: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.MISSED_VERSION_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      missedVersionList: result.result.data,
      loadingMissedVersion: false,
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.GROUP_LIST).async.started, state => ({
    ...state,
    loadingGroups: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.GROUP_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingGroups: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GROUP_LIST).async.done, (state, result: any) => {
    let selectedGroup = result.result.data.length > 0 ? result.result.data[0].id : undefined;
    return ({
      ...state,
      groupList: result.result.data,
      selectedGroup,
      loadingGroups: false,
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.WALLET_LIST).async.started, state => ({
    ...state,
    loadingWallets: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.WALLET_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingWallets: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.WALLET_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      walletList: result.result.data,
      loadingWallets: false,
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.GAME_TYPES_LIST).async.started, state => ({
    ...state,
    loadingGameTypesList: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.GAME_TYPES_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingGameTypesList: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.GAME_TYPES_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      gameTypesList: result.result.metadata,
      loadingGameTypesList: false,
    })
  })

  .case(getAsyncAction(ajaxRequestTypes.PLATFORM_LIST).async.started, state => ({
    ...state,
    loadingPlatform: true,
  }))
  .case(getAsyncAction(ajaxRequestTypes.PLATFORM_LIST).async.failed, (state) => {
    return ({
      ...state,
      loadingPlatform: false
    })
  })
  .case(getAsyncAction(ajaxRequestTypes.PLATFORM_LIST).async.done, (state, result: any) => {
    return ({
      ...state,
      platformList: result.result.data,
      loadingPlatform: false,
    })
  })
;
