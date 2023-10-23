import actionCreatorFactory from 'typescript-fsa';
import { filter } from 'app/actionTypes';

const actionCreator = actionCreatorFactory();

export const selectDateRange = actionCreator<string[]>(filter.SELECT_DATE_RANGE);
export const selectStartDate = actionCreator<string>(filter.SELECT_START_DATE);
export const selectEndDate = actionCreator<string>(filter.SELECT_END_DATE);
export const selectDateAndTimePicker = actionCreator<string[]>(filter.SELECT_DATE_AND_TIME_RANGE);
export const selectOptionRange = actionCreator<string>(filter.SELECT_OPTION_RANGE);
export const selectGames = actionCreator<string[]>(filter.SELECT_GAME);
export const selectPlayers = actionCreator<any[]>(filter.SELECT_PLAYERS);
export const selectCountrys = actionCreator<string[]>(filter.SELECT_COUNTRY);
export const selectGroups = actionCreator<number[]>(filter.SELECT_GROUPS);
export const selectGroup = actionCreator<number>(filter.SELECT_GROUP);
export const selectCurrencyDate = actionCreator<number>(filter.SELECT_CURRENCY_DATE);
export const selectCurrency = actionCreator<number>(filter.SELECT_CURRENCY);
export const selectCurrencyArray = actionCreator<number[]>(filter.SELECT_CURRENCY_ARRAY);
export const selectRooms = actionCreator<string[]>(filter.SELECT_ROOMS);
export const selectRoomsByOffice = actionCreator<string[]>(filter.SELECT_ROOMS_BY_OFFICES);
export const selectOfficesByPlatform = actionCreator<string[]>(filter.SELECT_OFFICES_BY_PLATFORM);
export const resetOfficesByPlatform = actionCreator<string[]>(filter.RESET_OFFICES_BY_PLATFORM);
export const selectPlatform = actionCreator<string>(filter.SELECT_PLATFORM);
export const selectWithoutKeysRooms = actionCreator<string[]>(filter.SELECT_WITHOUT_KEYS_ROOMS);
export const selectTimeZone = actionCreator<string>(filter.SELECT_TIMEZONE);
export const searchByRooms = actionCreator<boolean>(filter.SEARCH_BY_ROOMS);
export const searchWithFun = actionCreator<boolean>(filter.SEARCH_WITH_FUN);
export const searchWithGift = actionCreator<boolean>(filter.SEARCH_WITH_GIFT);
export const searchWithBuy = actionCreator<boolean>(filter.SEARCH_WITH_BUY);
export const previousPage = actionCreator<{ pageType: string; pageValue: string }>(
  filter.PREVIOUS_PAGE
);
export const searchId = actionCreator<string>(filter.SEARCH_ID);
export const searchLogin = actionCreator<string>(filter.SEARCH_LOGIN);
export const switchRoomsToCurrency = actionCreator<boolean>(filter.SWITCH_ROOMS_TO_CURRENCY);
