import * as React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {RouteComponentProps, withRouter} from 'react-router';
import api, {isPanelAggregate} from 'app/const/api';
import {Row, Col, Breadcrumb, TreeSelect} from 'antd';
import req, {switchRoute} from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {Filter, IField} from "app/components/Filter";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import {
  addZoneOffsetToISOStringForRequest,
  concatParamsToURL, convertSelectedTreeValuesToNumbers, formatNumberData, formatTableData, formatTreeData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet, removeParams, reversedSortTableOrder,
  sortTableOrder, 
  generateValueWithCurrency, generateValueWithoutCurrency, generateValueWithPercent
} from 'app/utils'
import {
  previousPage, searchWithFun, searchWithGift, searchWithBuy, selectCurrency, selectCurrencyDate, selectDateRange, selectEndDate,
  selectOptionRange, selectPlatform, selectRooms, selectStartDate, switchRoomsToCurrency
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import shortcuts from "app/const/shortcuts";
import {SpinComponent} from "app/components/SpinComponent";
import {DownloadButton} from "app/components/DownloadButton";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
import {IRoom} from "app/reducers/filter";
import {FORMATS} from "app/const/moneyFormatter";

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

interface ICurrList {
  updates: any[],
  rates: any[]
}

export namespace GamesReport {
  export interface Props extends RouteComponentProps<void> {
    getCurrencyList: (that: any, updateId: number) => Promise<boolean>;
    selectCurrencyDate: (val: number) => void;
    selectCurrency: (val: number) => void;
    selectDateRange: (val: string[]) => void;
    getRoomList: (that: any, platform?: string) => void;
    getRoomListOnSwitch: (that: any, val: boolean) => void;
    getReport: (that: any, needResetPagination?: boolean, levelObj?: any) => Promise<boolean>;
    tableChange: (val: ITable, that: any) => void;
    getChangedReport: (that: any, val: ITable) => void;
    searchWithFun: (e: boolean) => void;
    searchWithGift: (e: any) => void;
    searchWithBuy: (e: any) => void;
    tableAction: (val: ITable) => void;
    dispatchRangePickerStartValue: (val: Date) => void;
    dispatchRangePickerEndValue: (val: Date) => void;
    resetTableData: () => void;
    selectOptionRange: (val: string) => void;
    savePrevPageForHelp: (page: string) => void;
    getPlatformList: (that: any) => Promise<boolean>;
    switchRoomsToCurrency: (val: boolean) => any;
    selectPlatform: (val: string) => void;

    currencyList: ICurrList;
    selectedCurrency: number;
    selectedCurrencyDate: number;
    selectedDateRange: string[];
    sort: ISort;
    report: any;
    reportTotal: any;
    selectRooms: (arr: string[]) => void;
    selectedPlatform: any;
    loadingReport: boolean;
    loadingCurrency: boolean;
    loadingRooms: boolean;
    roomsList: IRoom[];
    platformList: any[];
    selectedRooms: string[];
    checkedFun: boolean;
    checkedGift: boolean;
    checkedBuy: boolean;
    pagination: IPagination;
    error: any;
    path: string;
    selectedOptionRange: string;
    appliedColumnFilter: any;
    timeZone: string;
    match: any;
    metadata: any;
    switchedRoomsToCurrency: boolean;
  }

  export interface State {
  }
}

@connect((state): any => ({
    currencyList: state.filter.currencyList,
    selectedCurrency: state.filter.selectedCurrency,
    selectedCurrencyDate: state.filter.selectedCurrencyDate,
    selectedDateRange: state.filter.selectedDateRange,
    sort: state.table.sort,
    pagination: state.table.pagination,
    loadingRooms: state.filter.loadingRooms,
    roomsList: state.filter.roomsList,
    selectedRooms: state.filter.selectedRooms,
    selectedPlatform: state.filter.selectedPlatform,
    platformList: state.filter.platformList,
    appliedColumnFilter: state.table.filter,
    report: state.table.report,
    metadata: state.table.metadata,
    reportTotal: state.table.reportTotal,
    loadingReport: state.table.loadingReport,
    loadingCurrency: state.filter.loadingCurrency,
    checkedFun: state.filter.checkedFun,
    checkedGift: state.filter.checkedGift,
    checkedBuy: state.filter.checkedBuy,
    error: state.request.error,
    path: state.router.location.pathname,
    selectedOptionRange: state.filter.selectedOptionRange,
    timeZone: state.filter.timeZone,
    switchedRoomsToCurrency: state.filter.switchRoomsToCurrency,
  }),
  (dispatch: any): any => ({
    getCurrencyList: (that: any, updateId: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CURRENCY_LIST);
      let data = {
        url: concatParamsToURL(api.GET_CURRENCY_LIST, {updateId: updateId}),
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    },
    getRoomListOnSwitch: (that: any, switchedRoomsToCurrency: boolean) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let platform = getParameterByName('platform', that.props.location.search)
        || (that.props.platformList[0] && that.props.platformList[0].id);
      let data = {
        url: concatParamsToURL(api.GET_ROOM_LIST, {category: switchedRoomsToCurrency ? "currency" : "", platform: platform || (that.props.selectedPlatform || "all")}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getRoomList: (that: any, platform?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: concatParamsToURL(api.GET_ROOM_LIST, {category: that.props.switchedRoomsToCurrency ? "currency" : "", platform: platform || (that.props.selectedPlatform || "all")}),
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
    ...bindActionCreators({
      selectCurrency,
      selectCurrencyDate,
      selectDateRange,
      tableAction,
      searchWithFun,
      selectOptionRange,
      resetTableData
    }, dispatch),
    getReport: (that: any, needResetPagination?: boolean, levelObj?: any) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        sortKey: getCorrectSortKey(that.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        currencyId: that.props.selectedCurrency,
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        platform: that.props.selectedPlatform || "all",
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
        sortDirection: that.props.sort.sortDirection,
        levelKey: levelObj ? levelObj.levelKey : that.getLevelKey(),
        levelValue: levelObj ? levelObj.levelValue : that.getLevelValue(),
        fun: that.props.checkedFun ? 1 : 0
      };
      let data = {
        url: concatParamsToURL(api.GET_GAMES_REPORT_V3, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        sortKey: getCorrectSortKey(val.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        currencyId: that.props.selectedCurrency,
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        platform: that.props.selectedPlatform || "all",
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        sortDirection: val.sort.sortDirection,
        levelKey: that.getLevelKey(),
        levelValue: that.getLevelValue(),
        fun: that.props.checkedFun ? 1 : 0
      };
      let data = {
        url: concatParamsToURL(api.GET_GAMES_REPORT_V3, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    tableChange: (val: ITable, that: any) => {
      if (val.sort.sortDirection !== that.props.sortDirection && val.sort.sortKey !== that.props.sortKey || val.pagination.current !== that.props.current) {
        that.props.tableAction(val);
        that.props.getChangedReport(that, val);
      }
    },
    searchWithGift: (e: any) => {
      dispatch(searchWithGift(e.target.checked));
    },
    searchWithBuy: (e: any) => {
      dispatch(searchWithBuy(e.target.checked));
    },
    dispatchRangePickerStartValue: (val: Date) => {
      dispatch(selectStartDate(val.toISOString()))
    },
    dispatchRangePickerEndValue: (val: Date) => {
      dispatch(selectEndDate(val.toISOString()))
    },
    savePrevPageForHelp: (page: string) => {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    onRoomsFilterChangeHandler(val: string[]) {
      this.props.selectRooms(val);
    },
    selectRooms: (arr: string[]) => {
      dispatch(selectRooms(arr))
    },
    selectPlatform: (val: string) => {
      dispatch(selectPlatform(val))
    },
    switchRoomsToCurrency: (val: boolean) => {
      dispatch(switchRoomsToCurrency(val))
    }
  })
)

class GamesReportVO extends React.Component<GamesReport.Props, GamesReport.State> {

  constructor(props: GamesReport.Props, context?: any) {
    super(props, context);
  }

  componentDidMount() {
    this.props.getCurrencyList(this, -1).then((flag: any) => {
      let roleId = parseInt(localStorage.getItem("roleId")as any);
      if (flag && this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
        this.props.getPlatformList(this).then((flag: any) => {
          let platform = getParameterByName('platform', this.props.location.search);
          if(platform && platform != this.props.selectedPlatform){
            this.props.selectPlatform(platform);
            insertParam([
              {
                key: 'platform',
                value: platform
              }
            ], this.props);
          }
          this.props.getRoomList(this);
          this.props.getReport(this).then((flag: any)=>{
            if(flag && this.getLevelKey() === 2 && !isPanelAggregate()){
              this.goToLevel(3, 0, 0, this.props.report[0].id, 0)
            }
          });
        });
      }
    });
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  }

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
    /*MAY BE BROKEN*/
    if(prevProps.path !== this.props.path && this.getLevelKey() === 1 && !this.props.loadingReport){
      this.props.getReport(this);
    }
  }

  onRoomsFilterChangeHandler = (val: string[]) => {
    this.props.selectRooms(val);
  };

  onPlatformChangeHandler = (val: string) => {
    this.props.selectRooms([]);
    this.props.getRoomList(this, val);
    this.selectPlatform(val);
  };

  selectPlatform(val: string){
    if(val){
      insertParam([
        {
          key: 'platform',
          value: val
        }
      ], this.props);
    }else{
      removeParams(['platform'],this.props)
    }
    this.props.selectPlatform(val);
  }

  goToLevel(level: number, value: any, gameId: number, platformGameId: number, officeId: number, notOmitPlatform?: boolean) {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let r = roles[role];
    if (level === 1) {
      this.props.history.push(`${r.route}${r.children.GAMES_REPORT_V3}`);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: localization.GAMES_HEADER[lang],
      });
    }
    if (level === 2) {
      this.props.history.push(`${r.route}${r.children.GAMES_REPORT_V3}/${gameId}`);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: gameId,
      }).then((flag: any)=>{
        if(flag && this.getLevelKey() === 2 && (!isPanelAggregate() || this.props.selectedPlatform) && !notOmitPlatform){
          this.goToLevel(3, 0, 0, this.props.report[0].id, 0)
        }
      });
    }
    if (level === 3) {
      this.props.history.push(`${r.route}${r.children.GAMES_REPORT_V3}/${this.props.match.params.gameId}/${platformGameId}`);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: platformGameId,
      });
    }
    if (level === 4) {
      this.props.history.push(`${r.route}${r.children.GAMES_REPORT_V3}/${this.props.match.params.gameId}/${this.props.match.params.platform}/${officeId}`);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: officeId,
      });
    }
  }

  getLevelKey(): number {
    let params = this.props.match.params;
    let gameId = params.gameId;
    let platform = params.platform;
    let officeId = params.officeId;
    let levelKey = 0;
    if (!gameId && !platform && !officeId) {
      levelKey = 1;
    } else if (gameId && !platform && !officeId) {
      levelKey = 2;
    } else if (gameId && platform && !officeId) {
      levelKey = 3;
    } else if (gameId && platform && officeId) {
      levelKey = 4;
    }
    return levelKey;
  }

  getLevelValue(): string {
    let params = this.props.match.params;
    let gameId = params.gameId;
    let platform = params.platform;
    let officeId = params.officeId;
    let levelValue = '';
    if (!gameId && !platform && !officeId) {
      levelValue = localization.GAMES_HEADER[lang];
    } else if (gameId && !platform && !officeId) {
      levelValue = gameId;
    } else if (gameId && platform && !officeId) {
      levelValue = platform;
    } else if (gameId && platform && officeId) {
      levelValue = officeId;
    }
    return levelValue;
  }

  componentWillUnmount() {
    this.props.resetTableData();
  }

  switchRoomsToCurrency = (val: boolean) => {
    this.props.selectRooms([]);
    this.props.switchRoomsToCurrency(val);
    this.props.getRoomListOnSwitch(this, val);
  };

  onDateChangeHandler = (val: number) => {
    this.props.getCurrencyList(this, val);
    this.props.selectCurrencyDate(val);
  };

  onFocusHandler() {
    console.log('focus');
  }

  onBlurHandler() {
    console.log('blur');
  }

  onSaveExcelButton = () => {
    let token = (localStorage.getItem('sessionId') as string);
    let params: any = {
      startDate: addZoneOffsetToISOStringForRequest(this.props.selectedDateRange[0], this.props.timeZone),
      endDate: addZoneOffsetToISOStringForRequest(this.props.selectedDateRange[1], this.props.timeZone),
      sortKey: getCorrectSortKey(this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
      currencyId: this.props.selectedCurrency,
      roomsId: this.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(this.props.selectedRooms, this.props.roomsList),
      platform: this.props.selectedPlatform || "all",
      page: 1,
      gifts: + this.props.checkedGift,
      limit: this.props.pagination.pageSize,
      sortDirection: this.props.sort.sortDirection,
      levelKey: this.getLevelKey(),
      levelValue: this.getLevelValue(),
      fun: this.props.checkedFun ? 1 : 0
    };
    const request = {
      method: ajaxRequestTypes.METHODS.GET,
      headers: new Headers({
        'x-request-sign': token
      })
    };
    let filename: string;
    fetch(concatParamsToURL(api.GET_GAMES_REPORT_FILE_V3, params), request)
      .then((response: any) => {
        try {
          filename = response.headers.get('Content-disposition').split(';')[1].split('=')[1].trim();
        }catch (err){
          switchRoute(this.props.history);
          return null;
        }
        return response.blob()
      })
      .then((blob: any) => {
        if(!blob){
          return;
        }
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
      });
  };

  resetPagination = (needResetPagination?: boolean) => {
    let page = parseInt(getParameterByName('page', this.props.location.search));
    let size = parseInt(getParameterByName('size', this.props.location.search));
    let tableConfig = {
      pagination: {
        current: needResetPagination ? 1 : page ? page : 1,
        pageSize: size && !isNaN(size) ? size : this.props.pagination.pageSize,
        total: this.props.pagination.total
      },
      sort: {
        sortKey: getCorrectSortKey(this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        sortDirection: this.props.sort.sortDirection
      },
      filter: this.props.appliedColumnFilter
    };
    this.props.tableAction(tableConfig);
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
  };

  onChangeRangePickerHandler = (dates: Date[]) => {
    this.props.selectDateRange([dates[0].toISOString(), dates[1].toISOString()]);
  };

  onShowReportClick = () => {
    this.props.getReport(this, true);
  };

  onTableChange = (pagination: any, filter: any, sorter: any) => {
    let sort = {
      sortKey: getCorrectSortKey(sorter.columnKey || this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
      sortDirection: sortTableOrder(sorter.order) || "desc"
    };
    let current: number = (pagination.current == this.props.pagination.current
      || pagination.pageSize != this.props.pagination.pageSize) ? 1 : pagination.current;
    let params = {
      filter: this.props.appliedColumnFilter,
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
    this.props.tableChange(params, this);
  };

  handleChangeRangeOptions = (value: string) => {
    this.props.selectOptionRange(value);
    for (let i = 0; i < shortcuts.length; i++) {
      let item = shortcuts[i];
      if (value === item.type) {
        this.props.dispatchRangePickerStartValue(item.start);
        this.props.dispatchRangePickerEndValue(item.end);
        break;
      }
    }
  };


  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_GAME_DATA_REPORT}`);
  };

  getLevelTitle = () => {
    let title = '';
    switch(this.getLevelKey()){
      case 1:{
        title = localization.GAMES_HEADER[lang];
        break;
      }
      case 2:{
        title = localization.PLATFORMS_HEADER[lang];
        break;
      }
      case 3:{
        title = localization.OFFICES_HEADER[lang];
        break;
      }
      case 4:{
        title = localization.ROOMS_HEADER[lang];
        break;
      }
    }
    return title;
  };

  renderTitle = () => {
    return (<div>
      <Row type="flex" justify="space-around" align="middle">
        <h2>{this.getLevelTitle()}</h2>
      </Row>
      {this.renderBreadCrumb()}
    </div>);
  };

  renderTable() {
    const that: any = this;
    //table
    let currency: string = (this.props.metadata && this.props.metadata.currencyReport && this.props.metadata.currencyReport.name) || "";
    const columns: any = [
      {
        title: (localization.ID_COLUMN as any)[lang],
        dataIndex: 'id',
        key: 'id',
        sorter: false,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                fontWeight: '700',
              }
            }
          };
        }
      },
      {
        title: (localization.NAME_COLUMN as any)[lang],
        dataIndex: 'name',
        key: 'name',
        sorter: true,
        sortOrder: this.props.sort.sortKey === 'name' && reversedSortTableOrder(this.props.sort.sortDirection),
        render: (value: any, row: any, i: number) => {
          let level = this.getLevelKey() + 1;
          return {
            children: this.getLevelKey() < 4 ?
              <a onClick={() => this.goToLevel(level, value, row.id, row.id, row.id)}>{value}</a> : value,
            props: {
              style: {
                fontWeight: '700',
              }
            }
          };
        }
      },
      {
        title: (localization.BET_COLUMN as any)[lang],
        dataIndex: 'bet',
        key: 'bet',
        sorter: true,
        currencySymbol:true,
        sortOrder: this.props.sort.sortKey === 'bet' && reversedSortTableOrder(this.props.sort.sortDirection),
        render(value: any, row: any, i: number) {
          return {
            children: generateValueWithCurrency(value, row, currency, 'buyBet', !that.props.checkedBuy),
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.WIN_COLUMN as any)[lang],
        sorter: true,
        sortOrder: this.props.sort.sortKey === 'win' && reversedSortTableOrder(this.props.sort.sortDirection),
        dataIndex: 'win',
        key: 'win',
        currencySymbol:true,
        render(value: any, row: any, i: number) {

          return {
            children: generateValueWithCurrency(value, row, currency, 'buyWin', !that.props.checkedBuy), 
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.BET_COUNT_COLUMN as any)[lang],
        sorter: true,
        dataIndex: 'betCount',
        sortOrder: this.props.sort.sortKey === 'betCount' && reversedSortTableOrder(this.props.sort.sortDirection),
        key: 'betCount',
        render(value: any, row: any, i: number) {
          return {
            children: generateValueWithoutCurrency(value, row, 'buyCount', !that.props.checkedBuy),
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.AVG_BET_COLUMN as any)[lang],
        sorter: true,
        dataIndex: 'avgBet',
        key: 'avgBet',
        currencySymbol:true,
        sortOrder: this.props.sort.sortKey === 'avgBet' && reversedSortTableOrder(this.props.sort.sortDirection),
        render(value: any, row: any, i: number) {
          return {
            children: generateValueWithCurrency(value, row, currency, 'buyAvgBet', !that.props.checkedBuy),
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.PROFIT_COLUMN as any)[lang],
        sorter: true,
        sortOrder: this.props.sort.sortKey === 'profit' && reversedSortTableOrder(this.props.sort.sortDirection),
        dataIndex: 'profit',
        key: 'profit',
        currencySymbol:true,
        render(value: any, row: any, i: number) {
          let obj = {
            children: generateValueWithCurrency(value, row, currency, 'buyProfit', !that.props.checkedBuy),
            props: {
              style: {}
            }
          };
          if (value) {
            let num = parseFloat(value.replace(/\s/g, ''));
            if (num >= 0) {
              obj.props.style = {background: '#90ee90', fontStyle: 'italic', fontWeight: '700'};
            } else {
              obj.props.style = {background: '#FFCCCB', fontStyle: 'italic', fontWeight: '700'};
            }
          }
          return obj;
        }
      },
      {
        title: (localization.PAYOUT_COLUMN as any)[lang],
        sorter: true,
        dataIndex: 'payout',
        sortOrder: this.props.sort.sortKey === 'payout' && reversedSortTableOrder(this.props.sort.sortDirection),
        key: 'payout',
        render(value: any, row: any, i: number) {
          let obj = {
            children: generateValueWithPercent(value, row, 'buyPayout', !that.props.checkedBuy),
            props: {
              style: {}
            }
          };
          if (value) {
            let num = parseFloat(value.replace(/\s/g, ''));
            if (num <= 100) {
              obj.props.style = {background: '#90ee90', fontStyle: 'italic', fontWeight: '700'};
            } else {
              obj.props.style = {background: '#FFCCCB', fontStyle: 'italic', fontWeight: '700'};
            }
          }
          return obj;
        }
      }];
    if (this.props.checkedGift) {
      let giftCountColumn = {
        title: (localization.GIFT_COUNT_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'giftSpins',
        key: 'giftSpins',
        render: (value: any, row: any, i: number) => {
          return (`${row.giftCount} (${row.giftSpins})`)
        }
      };
      columns.splice(-2, 0, giftCountColumn);

      let giftWinColumn = {
        title: (localization.GIFT_WIN_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'giftWin',
        key: 'giftWin',
        currencySymbol:true,
        render(value: any, row: any, i: number) {
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${value}` : `${value} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      };
      columns.splice(-2, 0, giftWinColumn);
    }
    let propertiesToConvert = ['avgBet', 'bet', 'payout', 'profit', 'win', 'giftWin', 'buyBet', 'buyWin', 'buyAvgBet', 'buyProfit', 'buyPayout'];
    let tableData = formatTableData(this.props.report.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
    tableData = tableData.map((val) => {
      return {...val, betCount: formatNumberData(val.betCount, true), buyCount: formatNumberData(val.buyCount, true)}
    });
    let loading = this.props.loadingReport;
    return (<DataTable
      title={this.renderTitle}
      columns={columns}
      onTableChange={this.onTableChange}
      totalData={this.props.reportTotal}
      loading={loading}
      checkedBuy={this.props.checkedBuy}
      pagination={this.props.pagination}
      metadata={this.props.metadata}
      data={tableData}/>)
  }

  renderFilter() {
    let fields: IField[] = [
      {
        name: (localization.CURRENCY as any)[lang],
        title: (localization.PICK_CURRENCY as any)[lang],
        data: this.props.currencyList.rates,
        currValue: this.props.selectedCurrency,
        handlers: {
          onChange: this.props.selectCurrency,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        name: localization.PLATFORM[lang],
        title: localization.SELECT_PLATFORM[lang],
        required: false,
        allowClear: true,
        data: this.props.platformList.map((val: any) => {
          return {...val, value: val.name}
        }),
        currValue: this.props.selectedPlatform,
        handlers: {
          onChange: this.onPlatformChangeHandler,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      }
    ];
    let tProps: any = [
      {
        positionId: 4,
        name: {
          disabled: !this.props.selectedPlatform,
          loading: this.props.loadingRooms,
          onChange: this.switchRoomsToCurrency,
          value: this.props.switchedRoomsToCurrency,
          options: [localization.SELECT[lang], localization.OFFICES_AND_ROOMS[lang], localization.CURRENCIES_AND_ROOMS[lang]]
        },
        props: {
          disabled: !this.props.selectedPlatform,
          allowClear: true,
          value: this.props.selectedRooms,
          treeData: formatTreeData(this.props.roomsList, true),
          onChange: this.onRoomsFilterChangeHandler,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: (localization.PLEASE_SELECT as any)[lang]
        }
      }
    ];
    if(this.getLevelKey() > 2){
      tProps = [];
      fields.pop();
    }
    let mobileRangePickerHandlers = {
      dispatchStartValue: this.props.dispatchRangePickerStartValue,
      dispatchEndValue: this.props.dispatchRangePickerEndValue,
      handleChangeRangeOptions: this.handleChangeRangeOptions,
      selectedOptionRange: this.props.selectedOptionRange,
      selectOptionRange: this.props.selectOptionRange
    };
    let loading = this.props.loadingReport || this.props.loadingRooms;
    return (<Filter
      goToDescriptionInHelp={this.goToDescriptionInHelp}
      fields={fields}
      pageTitle={(localization.GAME_REPORT as any)[lang]}
      selectedDateRange={this.props.selectedDateRange}
      onShowReportClick={this.onShowReportClick}
      loadingButton={loading}
      treeProps={tProps}
      onChangeCheckboxFun={this.props.searchWithFun}
      checkedFun={this.props.checkedFun}
      onChangeCheckboxGift={this.props.searchWithGift}
      checkedGift={this.props.checkedGift}
      onChangeCheckboxBuy={this.props.searchWithBuy}
      checkedBuy={this.props.checkedBuy}
      mobileRangePicker={mobileRangePickerHandlers}
      onChangeRangePickerHandler={this.onChangeRangePickerHandler}/>)
  }

  renderBreadCrumb = () => {
    let gameId = this.props.match.params.gameId;
    let platform = this.props.match.params.platform;
    let officeId = this.props.match.params.officeId;
    let breadcrumb = [{
      levelKey: 1,
      levelValue: localization.GAMES_HEADER[lang],
      title: localization.REPORT_TITLE[lang],
      isLink: this.getLevelKey() !== 1
    }];
    if (this.getLevelKey() >= 2) {
      breadcrumb.push({
        levelKey: 2,
        isLink: this.getLevelKey() !== 2,
        title: localization.GAME_TITLE[lang],
        levelValue: this.props.metadata.gameName,
      })
    }
    if (this.getLevelKey() >= 3) {
      breadcrumb.push({
        levelKey: 3,
        levelValue: this.props.metadata.platformName,
        title: localization.PLATFORM_TITLE[lang],
        isLink: this.getLevelKey() !== 3
      })
    }
    if (this.getLevelKey() === 4) {
      breadcrumb.push({
        levelKey: 4,
        levelValue: this.props.metadata.officeName,
        title: localization.OFFICE_TITLE[lang],
        isLink: false
      })
    }
    return (
      <Breadcrumb>
        {
          breadcrumb.map((val: any) => {
            return (
              <Breadcrumb.Item key={val.levelKey}>
                {val.isLink ?
                  <a title={val.title}
                     onClick={() => this.goToLevel(val.levelKey, val.levelValue, gameId, platform, officeId, true)}>{val.levelValue}</a>
                  : <span title={val.title}>{val.levelValue}</span>}
              </Breadcrumb.Item>)
          })
        }
      </Breadcrumb>)
  };

  render() {
    return (<div>
      <Row type="flex" justify="space-around" align="middle">
        {this.renderFilter()}
      </Row>
      <Row type="flex" justify="space-around" align="middle">
        {this.props.report ? this.renderTable() : <SpinComponent/>}
      </Row>
      {
        this.props.report && <Row type="flex" justify="space-around" align="middle">
          <Col span={24} style={{textAlign: 'right'}}>
            <DownloadButton
              onSaveExcelButton={this.onSaveExcelButton}
              loading={this.props.loadingReport}/>
          </Col>
        </Row>
      }
    </div>);
  }
}

export const GamesReport = withRouter(GamesReportVO);
