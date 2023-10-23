import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import api, { isPanelAggregate } from 'app/const/api';
import { Row, TreeSelect, Icon, Button } from 'antd';
import req from 'app/actions/ajaxRequest';
import { ajaxRequestTypes } from 'app/actionTypes';
import { DataTable } from 'app/components/Table';
import localization from 'app/localization';
import './style.css';
import {
  addZoneOffsetToISOString,
  concatParamsToURL,
  convertSelectedTreeValuesToNumbers,
  formatNumberData,
  formatTableData,
  formatTreeData,
  getMoment,
  getParameterByName,
  insertParam,
  isDeviceMobileAndTablet,
  isoStringToUTCDate,
  sortTableOrder,
  isVideoPoker,
  debounce,
  DebouncedFunctionWithMethods,
  removeLoginSuffix,
} from 'app/utils';
import { IPagination, ISort, ITable, resetTableData, tableAction } from 'app/actions/table';
import { FORMATS } from 'app/const/moneyFormatter';
import historyListTypes from 'app/const/historyListTypes';
import { SpinComponent } from 'app/components/SpinComponent';
import ROLES, { default as roles, getRoleById } from 'app/const/roles';
import {
  previousPage,
  searchId,
  selectDateAndTimePicker,
  selectGames, selectPlayers,
  selectRooms,
  switchRoomsToCurrency
} from 'app/actions/filter';
import { LINK_BET_BOOK } from 'app/components/HelpComponent/anchorId';
import { Filter } from 'app/components/Filter';
import { IRoom } from 'app/reducers/filter';
import ALL_GAMES from 'app/const/allGames';
import { TabsComponent } from 'app/components/Tabs';
import { message } from 'antd';
import { normalizeSelectedPlayers, onSearchPlayers } from "app/utils/playersSelect";

let lang = localStorage.getItem('lang') || 'en';
export namespace BetsHistoryList {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    getRoomList: (that: any, platform?: string) => void;
    getRoomListOnSwitch: (that: any, val: boolean) => void;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPage: any;
    savePrevPageForHelp: any;
    selectDateRange: any;
    selectGames: any;
    selectRooms: (arr: string[]) => void;
    selectPlayers: (val: any[]) => void;
    getGamesList: any;
    dispatchRangePickerOptionChangeOnMobile: any;
    dispatchRangePickerEndValue: any;
    dispatchRangePickerStartValue: any;
    searchId: any;
    searchLogin: (val: any) => void;
    selectDateAndTimePickerValue: (val: any) => any;
    switchRoomsToCurrency: (val: boolean) => any;
    getPlatformList: (that: any) => Promise<boolean>;
    finishPlayerBonus: (that: any, obj: any) => () => void;
    onSearchPlayers: (that: any, shouldRemoveLoginSuffix?: boolean) => (val: string) => void;

    sort: ISort;
    report: any;
    metadata: any;
    reportTotal: any;
    loadingReport: boolean;
    loadingRooms: boolean;
    loadingGames: boolean;
    pagination: IPagination;
    path: string;
    userId: string;
    appliedColumnFilter: any;
    prevPage: any;
    selectedDateAndTime: string[];
    activityDates: string[];
    gamesList: any[];
    roomsList: IRoom[];
    selectedRooms: string[];
    selectedGames: string[];
    searchIdValue: string;
    selectedPlayers: any[];
    timeZone: string;
    platformList: any[];
    switchedRoomsToCurrency: boolean;
  }

  export interface State {
    loadingAutocompleteButton: { [key: string]: boolean };
    searchPlayersValue: string;
    playersSelectOptions: any[];
  }
}

@connect(
  (state): any => ({
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    reportTotal: state.table.reportTotal,
    metadata: state.table.metadata,
    loadingReport: state.table.loadingReport,
    path: state.router.location.pathname,
    prevPage: state.filter.previousPage,
    appliedColumnFilter: state.table.filter,
    searchIdValue: state.filter.searchIdValue,
    loadingRooms: state.filter.loadingRooms,
    loadingGames: state.filter.loadingGames,

    selectedDateAndTime: state.filter.selectedDateAndTime,
    activityDates: state.filter.activityDates,
    gamesList: state.filter.gamesList,
    roomsList: state.filter.roomsList,
    platformList: state.filter.platformList,
    selectedGames: state.filter.selectedGames,
    selectedRooms: state.filter.selectedRooms,
    selectedCurrency: state.filter.selectedCurrency,
    selectedPlayers: state.filter.selectedPlayers,
    timeZone: state.filter.timeZone,
    switchedRoomsToCurrency: state.filter.switchRoomsToCurrency
  }),
  (dispatch: any, ownProps: any): any => ({
    getRoomList: (that: any, platform?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: concatParamsToURL(api.GET_ROOM_LIST, {category: that.props.switchedRoomsToCurrency ? "currency" : "", platform}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getRoomListOnSwitch: (that: any, switchedRoomsToCurrency: boolean) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let platform = getParameterByName('platform', that.props.location.search)
        || (that.props.platformList[0] && that.props.platformList[0].id);
      let data = {
        url: concatParamsToURL(api.GET_ROOM_LIST, {category: switchedRoomsToCurrency ? "currency" : "", platform}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getReport: (
      that: any,
      needResetPagination?: boolean,
      selectedPlatform?: string,
      resetRooms?: boolean
    ) => {
      // console.log('METHOD: getReport');
      if (that.props.searchIdValue) needResetPagination = false;

      let page = parseInt(getParameterByName('page', that.props.location.search));
      page = that.props.metadata.searchPage ? that.props.metadata.searchPage : page;
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        startDate: that.props.selectedDateAndTime[0],
        endDate: that.props.selectedDateAndTime[1],
        roomsId:
          that.props.selectedRooms.length === 0
            ? [-1]
            : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        gamesId:
          that.props.selectedGames.length === 0
            ? [-1]
            : convertSelectedTreeValuesToNumbers(that.props.selectedGames, that.props.gamesList),
        searchKey: 'id',
        searchValue: that.props.searchIdValue || '""',
        users: that.isValidUserId()
          ? that.getUserId()
          : (that.props.selectedPlayers && that.props.selectedPlayers.map((item: any) => item.id).join(','))
              || (that.props.appliedColumnFilter.login && that.props.appliedColumnFilter.login[0])
              || '""',
        platform: selectedPlatform || (that.props.platformList[0] && that.props.platformList[0].id),
        page: needResetPagination ? 1 : page ? page : 1,
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
        state:
          that.props.appliedColumnFilter.state && that.props.appliedColumnFilter.state.length > 0
            ? that.props.appliedColumnFilter.state
            : [-1],
        transactionType: that.props.appliedColumnFilter.actionTypeId && that.props.appliedColumnFilter.actionTypeId.length > 0 ? that.props.appliedColumnFilter.actionTypeId.join(',') : ''
      };
      let data = {
        url: concatParamsToURL(api.GET_HISTORY_BETS, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch).then(() => {
        that.resetPagination(needResetPagination);
        let searchEl = document.querySelector('#search-value');
        if (searchEl) {
          searchEl.scrollIntoView({ block: 'center' });
        }
      });
    },
    getChangedReport: (that: any, val: ITable) => {
      // console.log('METHOD: getChangedReport', val);
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let platform = getParameterByName('platform', that.props.location.search);

      let params = {
        startDate: that.props.selectedDateAndTime[0],
        endDate: that.props.selectedDateAndTime[1],
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        gamesId: that.props.selectedGames.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, that.props.gamesList),
        searchKey: 'id',
        searchValue: '""',
        platform: platform,
        users: that.isValidUserId()
        ?  that.getUserId()
        : (that.props.selectedPlayers && that.props.selectedPlayers.map((item: any) => item.id).join(','))
        || (val.filter.login && val.filter.login[0])
        || '""',
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        state: val.filter.state !== null && val.filter.state > 0 ? val.filter.state : [-1],
        transactionType: val.filter.actionTypeId !== null && val.filter.actionTypeId.length > 0 ? val.filter.actionTypeId.join(',') : ''
      };
      let data = {
        url: concatParamsToURL(api.GET_HISTORY_BETS, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    finishPlayerBonus: (that: any, obj: any) => () => {

      const startState = {...that.state.loadingAutocompleteButton};
      startState[`${obj.rowId}`] = true;
      that.setState({ loadingAutocompleteButton: startState});

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.HISTORY_PLAYER_BONUS,
        method: ajaxRequestTypes.METHODS.PUT,
        params: obj
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          setTimeout(() => {
            message.success('Bonus has been completed successfully');
            const endState = {...that.state.loadingAutocompleteButton};
            endState[`${obj.rowId}`] = false;
            that.setState({ loadingAutocompleteButton: endState });
            that.props.getReport(that, false);
          }, 3000);
        } else {
          message.error('Bonus has not been completed');
          const endState = {...that.state.loadingAutocompleteButton};
          endState[`${obj.rowId}`] = false;
          that.setState({ loadingAutocompleteButton: endState });
          that.props.getReport(that, false);
        }
      });
    },
    tableChange: (val: ITable, that: any) => {
      if (val.sort.sortDirection !== that.props.sortDirection && val.sort.sortKey !== that.props.sortKey || val.pagination.current !== that.props.current) {
        that.props.sortAndPaginate(val);
        that.props.getChangedReport(that, val);
      }
    },
    getGamesList: (that: any, platform?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAME_LIST);
      let params = {platform: platform};
      let data = {
        url: concatParamsToURL(api.GET_GAME_LIST, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getPlatformList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.PLATFORM_LIST);
      let data = {
        url: api.GET_PLATFORM_LIST,
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    },
    sortAndPaginate: (val: ITable) => {
      dispatch(tableAction(val));
    },
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPage(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'historyDetails'}))
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    selectDateAndTimePickerValue: (val: string[]) => {
      dispatch(selectDateAndTimePicker(val))
    },
    selectGames: (val: string[]) => {
      dispatch(selectGames(val))
    },
    selectRooms: (arr: string[]) => {
      dispatch(selectRooms(arr))
    },
    selectPlayers: (val: any[]) => {
      dispatch(selectPlayers(val))
    },
    searchId: (val: any) => {
      let reg = /^\d+$/;
      let value = val.target ? val.target.value.trim() : val;
      const MAX_ID_LENGTH = 20;
      if (value !== "" && !reg.test(value) || value.length > MAX_ID_LENGTH) {
        return
      }
      dispatch(searchId(value))
    },
    switchRoomsToCurrency: (val: boolean) => {
      dispatch(switchRoomsToCurrency(val))
    },
    onSearchPlayers: (that: any, isAdmin: boolean) => onSearchPlayers(dispatch, that, isAdmin)
  })
)
class BetsHistoryListVO extends React.Component<BetsHistoryList.Props, BetsHistoryList.State> {
  private debouncedSearchPlayer: DebouncedFunctionWithMethods<(val: string) => void>;

  constructor(props: BetsHistoryList.Props, context?: any) {
    super(props, context);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.onGamesFilterChangeHandler = this.onGamesFilterChangeHandler.bind(this);
    this.onRoomsFilterChangeHandler = this.onRoomsFilterChangeHandler.bind(this);
    this.onShowReportClick = this.onShowReportClick.bind(this);

    this.state = {
      loadingAutocompleteButton: {
        '0': false
      },
      searchPlayersValue: '',
      playersSelectOptions: this.props.selectedPlayers
        ? normalizeSelectedPlayers(this.props.selectedPlayers)
        : [],
    };

    this.debouncedSearchPlayer = debounce(this.props.onSearchPlayers(this), 1000);
  }

  componentDidMount() {
    let roleId = parseInt(localStorage.getItem('roleId') as any);
    this.props.getPlatformList(this).then((flag: boolean) => {
      if (flag && this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
        let platform = getParameterByName('platform', this.props.location.search)
          || (this.props.platformList[0] && this.props.platformList[0].id);
        this.props.getReport(this, false, platform);
        this.props.getRoomList(this, platform);
        this.props.getGamesList(this, platform);

        insertParam([
          {
            key: 'platform',
            value: platform
          }
        ], this.props);
      }
    });
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    this.props.resetTableData();

    let roleId = localStorage.getItem('roleId');

    if (roleId && roleId !== "undefined") {
      let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
      let r = roles[role];
      if (this.props.history.action === "PUSH" && this.props.history.location.pathname.indexOf(r.children.HISTORY_DETAILS) !== -1 && this.props.searchIdValue) {
        return;
      }
    }

    this.props.searchId("");
    this.resetPagination(true);

    this.debouncedSearchPlayer.clear();
  }

  getUserId = (): number => +(this.props.match.params as any).id

  isValidUserId = (): boolean => this.getUserId() > 0

  resetPagination(needResetPagination?: boolean) {
    let page = parseInt(getParameterByName('page', this.props.location.search));
    page = this.props.metadata.searchPage ? this.props.metadata.searchPage : page;
    if (this.props.metadata.searchPage)
      needResetPagination = false;
    let size = parseInt(getParameterByName('size', this.props.location.search));
    let tableConfig = {
      pagination: {
        current: needResetPagination ? 1 : page ? page : 1,
        pageSize: size && !isNaN(size) ? size : this.props.pagination.pageSize,
        total: this.props.pagination.total
      },
      sort: {
        sortKey: this.props.sort.sortKey,
        sortDirection: this.props.sort.sortDirection
      },
      filter: this.props.appliedColumnFilter
    };
    this.props.sortAndPaginate(tableConfig);
    insertParam([
      {
        key: 'page',
        value: needResetPagination ? 1 : page ? page : 1
      },
      {
        key: 'size',
        value: size && !isNaN(size) ? size : this.props.pagination.pageSize
      }
    ], this.props);
  }

  openDetails(record: any): void {
    let platform = getParameterByName('platform', this.props.location.search);
    let size = getParameterByName('size', this.props.location.search) || 10;
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let detailsId;
    if (isVideoPoker(+record['gameId'])) {
      detailsId = record['bonusSpin'] === 0 ? record.id : record.bonusSpin;
    } else {
      detailsId = record.id;
    }
    this.props.savePrevPage(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HISTORY_LIST}/${record.userId}/details/${detailsId}?page=1&size=${size}&platform=${platform}`)
  }

  onTableChange(pagination: any, filter: any, sorter: any) {
    let sort = {
      sortKey: null,
      sortDirection: sortTableOrder(sorter.order) || this.props.sort.sortDirection
    };
    let current: number = (pagination.current == this.props.pagination.current
      || pagination.pageSize != this.props.pagination.pageSize) ? 1 : pagination.current;
    let params = {
      filter,
      sort,
      pagination: {...pagination, current}
    };
    insertParam([
      {
        key: 'page',
        value: current
      },
      {
        key: 'size',
        value: pagination.pageSize
      }
    ], this.props);
    this.props.searchId("");
    this.props.tableChange(params, this);
  }

  hasRecordHistoryDetails(id: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === id) {
        return true;
      }
    }
    return false;
  }

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_BET_BOOK}`);
  };

  onShowReportClick() {
    let platform =
      getParameterByName('platform', this.props.location.search) ||
      (this.props.platformList[0] && this.props.platformList[0].id);
    this.props.getReport(this, true, platform);
  }

  onGamesFilterChangeHandler(val: string[]) {
    this.props.selectGames(val);
  }

  onRoomsFilterChangeHandler(val: string[]) {
    this.props.selectRooms(val);
  }

  onFocusHandler() {
    console.log('focus');
  }

  onBlurHandler() {
    console.log('blur');
  }

  onResetFilterColumn(clearFilters: any) {
    clearFilters();
  }

  onFilterColumn(selectedKeys: any, confirm: any) {
    confirm();
  }

  selectDate = (val: any) => {
    let start = getMoment(this.props.selectedDateAndTime[0]);
    let end = getMoment(this.props.selectedDateAndTime[1]);
    let y = val.year();
    let m = val.month();
    let d = val.date();
    start.year(y);
    start.month(m);
    start.date(d);
    end.year(y);
    end.month(m);
    end.date(d);
    let range = [start.toISOString(), end.toISOString()];
    this.props.selectDateAndTimePickerValue(range);
  };

  selectStartTime = (val: any) => {
    console.log('selectStartTime', val);
    let start = getMoment(this.props.selectedDateAndTime[0]);
    let h = val.hour();
    let m = val.minute();
    let s = val.second();
    start.hour(h);
    start.minute(m);
    start.second(s);
    let range = [start.toISOString(), this.props.selectedDateAndTime[1]];
    this.props.selectDateAndTimePickerValue(range);
  };

  selectEndTime = (val: any) => {
    console.log('selectEndTime', val);
    let end = getMoment(this.props.selectedDateAndTime[1]);
    let h = val.hour();
    let m = val.minute();
    let s = val.second();
    end.hour(h);
    end.minute(m);
    end.second(s);
    let range = [this.props.selectedDateAndTime[0], end.toISOString()];
    this.props.selectDateAndTimePickerValue(range);
  };

  switchRoomsToCurrency = (val: boolean) => {
    this.props.selectRooms([]);
    this.props.switchRoomsToCurrency(val);
    this.props.getRoomListOnSwitch(this, val);
  };

  onChangeTab = (selectedPlatform: string) => {
    this.props.selectRooms([]);
    this.props.getRoomList(this, selectedPlatform);
    this.props.getReport(this, true, selectedPlatform, true);
    insertParam([
      {
        key: 'platform',
        value: selectedPlatform
      }
    ], this.props);
  };

  getGameServerNameById(id: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === id) {
        return item.serverName;
      }
    }
  }

  onChangeSelectPlayers = (val: any, options: any) => this.props.selectPlayers(
      options.map((option: any) => ({ id: option.props.value, login: option.props.children }))
  );

  onBlurSelectPlayers = () =>
      this.setState({ playersSelectOptions: normalizeSelectedPlayers(this.props.selectedPlayers) });

  renderTable() {
    //table
    let appliedColumnFilter = this.props.appliedColumnFilter || {};
    let userId = this.getUserId();

    let roleId = localStorage.getItem('roleId') as string;
    const isAdmin = roleId && (ROLES.ADMIN.id === +roleId);

    const columns: any = [
      {
        title: (localization.BET_ID_COLUMN as any)[lang],
        dataIndex: 'id',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let searchText = this.props.metadata.searchValue;
          let text = (searchText||searchText==='') && value ?
            <span>
            {value == searchText ?
              <span id={"search-value"} key={i}
                    style={{backgroundColor: '#fff20c'}}>{`${value} (${row.tid})`}</span> : `${value} (${row.tid})`
            }
          </span>
            : value;

          return {
            children: this.hasRecordHistoryDetails(row.gameId) ?
              <a title={(localization.OPEN_ACTION_DETAILS as any)[lang]}
                 onClick={() => this.openDetails(row)}>{text}</a> : text,
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: (localization.TIME_COLUMN as any)[lang],
        dataIndex: 'changeTime',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value ? isoStringToUTCDate(addZoneOffsetToISOString(value, this.props.timeZone)) : '',
            props: {
              style: {}
            }
          };
        }
      },
      this.isValidUserId()
        ? {
            title: (localization.LOGIN as any)[lang],
            dataIndex: 'login',
            sorter: false,
            render(value: any, row: any, i: number) {
              return {
                children: `${value}(#${userId})`,
                props: {
                  style: {}
                }
              };
            }
          }
        : {
            title: 'Account (#ID)',
            dataIndex: 'login',
            render(value: any, row: any, i: number) {
              return {
                children: `${isAdmin ? value : removeLoginSuffix(value)} (#${row.userId})`,
                props: {
                  style: {}
                }
              };
            }
          },
      {
        title: (localization.OFFICE_ROOM_COLUMN as any)[lang],
        dataIndex: 'office',
        render(value: any, row: any, i: number) {
          return {
            children: `${value} / ${row.room}`,
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: (localization.TYPE_COLUMN as any)[lang],
        dataIndex: 'actionTypeId',
        sorter: false,
        filteredValue: appliedColumnFilter.actionTypeId || null,
        filters: [
          {text: localization.BET_TYPE[lang], value: 3},
          {text: localization.BONUS_BET_TYPE[lang], value: 4},
          {text: localization.GIFT_TYPE[lang], value: 5},
        ],
        render: (value: any, row: any, i: number) => {
          let spanStyle: any = {
            padding: '5px',
            borderRadius: '5px',
            display: 'block',
            textAlign: 'center',
            margin: '0 auto',
          };
          let name: string = '';
          if (value) {
            switch (value) {
              case historyListTypes.BET_TYPE.id: {
                spanStyle = {...spanStyle, background: '#80d5ee'};
                name = historyListTypes.BET_TYPE.name;
                break;
              }
              case historyListTypes.BONUS_BET_TYPE.id: {
                spanStyle = {...spanStyle, background: '#eee635'};
                name = historyListTypes.BONUS_BET_TYPE.name;
                break;
              }
              case historyListTypes.DEPOSIT_TYPE.id: {
                spanStyle = {...spanStyle, background: '#55eead'};
                name = historyListTypes.DEPOSIT_TYPE.name;
                break;
              }
              case historyListTypes.WITHDRAW_TYPE.id: {
                spanStyle = {...spanStyle, background: '#ee9f9e'};
                name = historyListTypes.WITHDRAW_TYPE.name;
                break;
              }
              case historyListTypes.GIFT_TYPE.id: {
                spanStyle = {...spanStyle, background: '#bd9cee'};
                name = historyListTypes.GIFT_TYPE.name;
                break;
              }
            }
          }

          let res = row.giftCount && row.giftCount > 0 ?
            <span className={'gift-count-badge'}>{row.giftCount}</span> : null;
          return {
            children: this.hasRecordHistoryDetails(row.gameId) ?
              <span style={{cursor: 'pointer', ...spanStyle}} title={(localization.OPEN_ACTION_DETAILS as any)[lang]}
                    onClick={() => this.openDetails(row)}>{name} {res}</span>
              :
              <span style={spanStyle}>{name} {res}</span>
          };
        }
      },
      {
        title: localization.BET_STATE[lang],
        sorter: false,
        dataIndex: 'state',
        filteredValue: appliedColumnFilter.state || null,
        filters: [
          {text: localization.COMPLETE[lang], value: 1},
          {text: localization.IN_PROGRESS[lang], value: 2},
        ],
        render: (value: any, row: any, i: number) => {
          const rowId = row['id'];
          const bonusCompletionActive = row && row.bonusCompletionActive
          const bonus = row && row['jsonResult'] && row['jsonResult']['bonus'] && row['jsonResult']['bonus']['bonus'] || null;
          return {
            children: this.getBetStateIcon(
              value,
              bonusCompletionActive,
              rowId,
              bonus
              ),
            props: {
              style: {
                textAlign: 'center',
                fontSize: '20px'
              }
            }
          };
        }
      },
      /* {
        title: (localization.ACTION_COUNT_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'count',
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {}
            }
          };
        }
      }, */
      {
        title: (localization.BET_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'bet',
        render(value: any, row: any, i: number) {
          return {
            children: FORMATS[row.currency] ? `${FORMATS[row.currency]['symbol']} ${value}` : `${value} ${row.currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.PLAYERS_PROFIT_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'profit',
        render(value: any, row: any, i: number) {
          let obj = {
            children: FORMATS[row.currency] ? `${FORMATS[row.currency]['symbol']} ${value}` : `${value} ${row.currency}`,
            props: {
              style: {}
            }
          };
          if (value) {
            let num = parseFloat(value.replace(/\s/g, ''));
            switch (row.typeId) {
              case historyListTypes.DEPOSIT_TYPE.id: {
                obj.props.style = {background: '#90ee90', fontStyle: 'italic', fontWeight: '700'};
                break;
              }
              case historyListTypes.WITHDRAW_TYPE.id: {
                obj.props.style = {background: '#FFCCCB', fontStyle: 'italic', fontWeight: '700'};
                break;
              }
              default: {
                if (num <= 0) {
                  obj.props.style = {background: '#90ee90', fontStyle: 'italic', fontWeight: '700'};
                } else {
                  obj.props.style = {background: '#FFCCCB', fontStyle: 'italic', fontWeight: '700'};
                }
              }
            }
          }
          return obj;
        }
      },
      {
        title: (localization.BALANCE_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'balance',
        render(value: any, row: any, i: number) {
          return {
            children: FORMATS[row.currency] ? `${FORMATS[row.currency]['symbol']} ${value}` : `${value} ${row.currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.NAME_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'name',
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {}
            }
          };
        }
      }];
    let propertiesToConvert = ['bet', 'profit', 'balance'];
    let tableData = formatTableData(this.props.report.map((val: any, i: number) => Object.assign({}, val, {key: `${val.rowNumber}-${val.id}`})), propertiesToConvert);
    tableData = tableData.map((val) => {
      return {...val, count: formatNumberData(val.count, true), actionTypeId: val.typeId}
    });
    return (<DataTable
      columns={columns}
      onTableChange={this.onTableChange}
      totalData={this.props.reportTotal}
      loading={this.props.loadingReport}
      pagination={this.props.pagination}
      data={tableData}/>)
  }

  getBetStateIcon(id: number, bonusCompletionActive: boolean, rowId: string, bonus: string): any {
    switch (id) {
      case 1:
      case 3:
      case 4: {
        return (
          <Icon
            title={localization.COMPLETE[lang]}
            theme="twoTone"
            twoToneColor="#52c41a"
            type={'check-circle'}
          />)
      }
      case 2: {
        if (!isPanelAggregate() && bonusCompletionActive) {
          return (
            <Button
              type="danger"
              size="small"
              loading={this.state.loadingAutocompleteButton[rowId]}
              onClick={this.props.finishPlayerBonus(this, { rowId, bonus })}>
              {this.state.loadingAutocompleteButton[rowId] ? 'Processing' : 'Complete'}
            </Button>)
        }
        return (
          <Icon
            title={localization.IN_PROGRESS[lang]}
            type={'loading'}
          />)
      }
    }
    return
  }

  pageToGoBack = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let platform = getParameterByName('platform', this.props.location.search);
    let size = getParameterByName('size', this.props.location.search) || 10;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let page = this.props.prevPage && this.props.prevPage.historyList ?
      this.props.prevPage.historyList : `${(roles as any)[role].route}${(roles as any)[role].children.USERS_BACKOFFICE}?page=1&size=${size}&platform=${platform}`;
    this.props.history.push(page)
  };

  renderFilter() {
    const validUserId = this.isValidUserId();

    //rooms field
    const tProps = [
      {
        positionId: 3,
        name: {
          loading: this.props.loadingRooms,
          onChange: this.switchRoomsToCurrency,
          value: this.props.switchedRoomsToCurrency,
          options: [localization.SELECT[lang], localization.OFFICES_AND_ROOMS[lang], localization.CURRENCIES_AND_ROOMS[lang]]
        },
        props: {
          allowClear: true,
          value: this.props.selectedRooms,
          treeData: formatTreeData(this.props.roomsList,true),
          onChange: this.onRoomsFilterChangeHandler,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: (localization.PLEASE_SELECT as any)[lang]
        }
      },
      {
        positionId: 4,
        name: (localization.PICK_GAME as any)[lang],
        props: {
          allowClear: true,
          value: this.props.selectedGames,
          treeData: formatTreeData(this.props.gamesList),
          onChange: this.onGamesFilterChangeHandler,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: (localization.PLEASE_SELECT as any)[lang]
        }
      }
    ];

    if (validUserId) tProps.shift();

    //search fields
    let idSearchField = {
      positionId: 5,
      inputType: 'search',
      required: false,
      isNeedToRender: true,
      label: localization.SEARCH_BY_ID[lang],
      placeholder: localization.SEARCH_COLUMN_FILTER[lang],
      onChange: this.props.searchId,
      onSearch: () => {
        let platform = getParameterByName('platform', this.props.location.search)
          || (this.props.platformList[0] && this.props.platformList[0].id);
        this.props.getReport(this, true, platform)
      },
      value: this.props.searchIdValue,
      tooltipMsg: localization.NO_SUCH_ID_FOUND[lang],
      visibleTooltip: !!(this.props.metadata.searchValue && this.props.metadata.searchValue !== '""' && this.props.report && this.props.report.length === 0)
    };
    //date and time range picker
    /* [
      '2021-08-12',
      '2021-08-08',
      '2021-08-09',
      '2021-07-09',
      '2021-11-30'
    ] */
    let timePicker = {
      positionId: 1,
      inputType: 'dateAndRangeTime',
      required: true,
      isNeedToRender: true,
      label: localization.SELECT_TIME_RANGE[lang],
      selectDate: this.selectDate,
      selectStartTime: this.selectStartTime,
      selectEndTime: this.selectEndTime,
      value: this.props.selectedDateAndTime,
      activityDates: this.props.metadata.activityDates ? this.props.metadata.activityDates : []
    };
    let loading = this.props.loadingRooms || this.props.loadingReport || this.props.loadingGames;

    let infoText = [
      {
        icon: 'idcard',
        text: `${(localization.LOGIN as any)[lang]}: ${typeof this.props.metadata.login !== 'undefined' ? `${this.props.metadata.login}(#${this.props.metadata.userId})` : ''}`
      },
      {
        icon: 'home',
        text: `${(localization.ROOM_COLUMN as any)[lang]}: ${typeof this.props.metadata.roomName !== 'undefined' ? `${this.props.metadata.roomName}(#${this.props.metadata.roomId})` : ''}`
      },
      {
        icon: 'wallet',
        text: `${(localization.CURRENCY as any)[lang]}: ${typeof this.props.metadata.currency !== 'undefined' ? this.props.metadata.currency : ''}`
      }];

    const additionalFields = [idSearchField, timePicker]

    if (!validUserId) {
      const playersSelect = {
        positionId: 5,
        required: false,
        inputType: 'multiSelect',
        isNeedToRender: true,
        currValue: this.props.selectedPlayers.map(({ id }) => id),
        name: 'Name',
        title: 'Select Account',
        data: this.state.playersSelectOptions,
        autoClearSearchValue: false,
        handlers: {
          onChange: this.onChangeSelectPlayers,
          onSearch: this.debouncedSearchPlayer.debounced,
          onBlur: this.onBlurSelectPlayers,
        }
      };

      // @ts-ignore
      additionalFields.push(playersSelect)
    }

    return (
      <Filter
        additionalFields={additionalFields}
        goToDescriptionInHelp={this.goToDescriptionInHelp}
        fields={[]}
        pageTitle={
          validUserId
            ? (localization.PLAYER_HISTORY as any)[lang]
            : (localization.USERS_BET_BOOK as any)[lang]
        }
        infoText={validUserId ? infoText : null}
        goBackPlayer={validUserId ? this.pageToGoBack : null}
        onShowReportClick={this.onShowReportClick}
        loadingButton={loading}
        treeProps={tProps}
      />
    );
  }

  render() {
    // console.log('LOCATION USER ID: ', (this.props.match.params as any).id);
    // console.log('LOCATION PATHNAME: ', this.props.history.location.pathname); // /admin/history/3021935

    let platform =
      getParameterByName('platform', this.props.location.search) ||
      (this.props.platformList[0] && this.props.platformList[0].id);
    return (
      <div className={'gutter-box-padding'}>
        {this.isValidUserId() ? null : (
          <Row type="flex" justify="space-around" align="middle">
            <TabsComponent
              withBudge={false}
              title={localization.SELECT_PLATFORM[lang]}
              selectedTab={platform}
              tabsArr={this.props.platformList}
              onChange={this.onChangeTab}
            />
          </Row>
        )}
        <Row type="flex" justify="space-around" align="middle">
          {this.renderFilter()}
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.props.report ? this.renderTable() : <SpinComponent />}
        </Row>
      </div>
    );
  }
}

export const BetsHistoryList = withRouter(BetsHistoryListVO);
