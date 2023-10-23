import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api, {isPanelAggregate} from 'app/const/api';
import {Row, Col, Breadcrumb} from 'antd';
import req, {switchRoute} from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {Filter} from "app/components/Filter";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import {
  addZoneOffsetToISOStringForRequest,
  concatParamsToURL, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet, reversedSortTableOrder,
  sortTableOrder, uniqueObjectsArrayByProperty,
  generateValueWithCurrency, generateValueWithoutCurrency, generateValueWithPercent
} from 'app/utils'
import {
  searchLogin,
  previousPage,
  searchByRooms, searchWithFun, searchWithGift, searchWithBuy, selectCurrency, selectCurrencyDate, selectDateRange, selectEndDate,
  selectOfficesByPlatform,
  selectOptionRange,
  selectRooms, selectRoomsByOffice, selectStartDate,
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import shortcuts from "app/const/shortcuts";
import {SpinComponent} from "app/components/SpinComponent";
import {DownloadButton} from "app/components/DownloadButton";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
import {FORMATS} from "app/const/moneyFormatter";
import {IRoom} from "app/reducers/filter";

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

interface ICurrList {
  updates: any[],
  rates: any[]
}

export namespace OfficeReport {
  export interface Props extends RouteComponentProps<void> {
    requestOffices: any;
    getCurrencyList: any;
    getDateForCurrencyList: any;
    selectCurrencyDate: any;
    selectCurrency: any;
    selectDateRange: any;
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    searchWithFun: any;
    searchWithGift: any;
    searchWithBuy: any;
    sortAndPaginate: any;
    dispatchRangePickerStartValue: any;
    dispatchRangePickerEndValue: any;
    resetTableData: any;
    dispatchRangePickerOptionChangeOnMobile: any;
    savePrevPageForHelp: any;
    searchLogin: any;
    savePrevPage: (page: string) => void;
    getRoomList: (that: any, platform?: string) => Promise<boolean>;
    selectOfficesByPlatform: (val: string[]) => void;
    selectRoomsByOffice: (val: string[]) => void;

    currencyList: ICurrList;
    roomsList: IRoom[];
    selectedCurrency: number;
    selectedCurrencyDate: number;
    selectedDateRange: string[];
    selectedRoomsByOffice: string[];
    selectedOfficesByPlatform: string[];
    sort: ISort;
    report: any;
    reportTotal: any;
    loadingReport: boolean;
    loadingCurrency: boolean;
    loadingGames: boolean;
    checkedFun: boolean;
    checkedGift: any;
    checkedBuy: any;
    pagination: IPagination;
    path: string;
    selectedOptionRange: string;
    appliedColumnFilter: any;
    timeZone: string;
    match: any;
    metadata: any;
    searchLoginValue: string;
  }

  export interface State {
  }
}

@connect((state): any => ({
    currencyList: state.filter.currencyList,
    selectedCurrency: state.filter.selectedCurrency,
    selectedCurrencyDate: state.filter.selectedCurrencyDate,
    selectedDateRange: state.filter.selectedDateRange,
    selectedOptionRange: state.filter.selectedOptionRange,
    selectedRoomsByOffice: state.filter.selectedRoomsByOffice,
    selectedOfficesByPlatform: state.filter.selectedOfficesByPlatform,
    sort: state.table.sort,
    pagination: state.table.pagination,
    appliedColumnFilter: state.table.filter,
    report: state.table.report,
    reportTotal: state.table.reportTotal,
    loadingReport: state.table.loadingReport,
    loadingRooms: state.filter.loadingRooms,
    loadingCurrency: state.filter.loadingCurrency,
    loadingGames: state.filter.loadingGames,
    roomsList: state.filter.roomsList,
    checkedRooms: state.filter.checkedRooms,
    checkedFun: state.filter.checkedFun,
    checkedGift: state.filter.checkedGift,
    checkedBuy: state.filter.checkedBuy,
    selectedRooms: state.filter.selectedRooms,
    error: state.request.error,
    path: state.router.location.pathname,
    metadata: state.table.metadata,
    timeZone: state.filter.timeZone,
    searchLoginValue: state.filter.searchLoginValue
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
    getRoomList: (that: any, platform?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: concatParamsToURL(api.GET_ROOM_LIST, {platform: platform || (that.props.selectedPlatform || "all")}),
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    },
    selectOfficesByPlatform: (val: string[]) => {
      dispatch(selectOfficesByPlatform(val))
    },
    selectRoomsByOffice: (val: string[]) => {
      dispatch(selectRoomsByOffice(val))
    },
    selectCurrency: (val: number) => {
      dispatch(selectCurrency(val))
    },
    selectCurrencyDate: (val: number) => {
      dispatch(selectCurrencyDate(val))
    },
    selectDateRange: (val: string[]) => {
      dispatch(selectDateRange(val))
    },
    getReport: (that: any, needResetPagination?: boolean, levelObj?: any) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let lvlKey = levelObj ? levelObj.levelKey : that.getLevelKey();
      let sortArr = lvlKey === 4?SORT_ARR.slice(1):SORT_ARR;
      let params: any = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        sortKey: getCorrectSortKey(that.props.sort.sortKey, sortArr, SORT_DEFAULT),
        currencyId: that.props.selectedCurrency,
        officesId: (lvlKey == 2 && (that.props.selectedOfficesByPlatform.length > 0) && that.props.selectedOfficesByPlatform) || [-1],
        roomsId: (lvlKey == 3 && (that.props.selectedRoomsByOffice.length > 0) && that.props.selectedRoomsByOffice) || [-1],
        platform: (levelObj && levelObj.levelKey === 2)?levelObj.levelValue:that.props.match.params.platform || "all",
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
        sortDirection: that.props.sort.sortDirection,
        levelKey: levelObj ? levelObj.levelKey : that.getLevelKey(),
        levelValue: levelObj ? levelObj.levelValue : that.getLevelValue(),
        fun: that.props.checkedFun ? 1 : 0,
        searchValue: that.props.searchLoginValue || '""'
      };
      let data = {
        url: concatParamsToURL(api.GET_OFFICE_REPORT_V3, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        sortKey: getCorrectSortKey(val.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        currencyId: that.props.selectedCurrency,
        officesId: (that.getLevelKey() == 2 && (that.props.selectedOfficesByPlatform.length > 0) && that.props.selectedOfficesByPlatform) || [-1],
        roomsId: (that.getLevelKey() == 3 && (that.props.selectedRoomsByOffice.length > 0) && that.props.selectedRoomsByOffice) || [-1],
        platform: that.props.match.params.platform || "all",
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        sortDirection: val.sort.sortDirection,
        levelKey: that.getLevelKey(),
        levelValue: that.getLevelValue(),
        fun: that.props.checkedFun ? 1 : 0,
        searchValue: that.props.searchLoginValue || '""'
      };
      let data = {
        url: concatParamsToURL(api.GET_OFFICE_REPORT_V3, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    tableChange: (val: ITable, that: any) => {
      if (val.sort.sortDirection !== that.props.sortDirection && val.sort.sortKey !== that.props.sortKey || val.pagination.current !== that.props.current) {
        that.props.sortAndPaginate(val);
        that.props.getChangedReport(that, val);
      }
    },
    sortAndPaginate: (val: ITable) => {
      dispatch(tableAction(val));
    },
    searchByRooms: (e: any) => {
      dispatch(searchByRooms(e.target.checked));
    },
    searchWithFun: (e: any) => {
      dispatch(searchWithFun(e));
    },
    searchWithGift: (e: any) => {
      dispatch(searchWithGift(e.target.checked));
    },
    searchWithBuy: (e: any) => {
      dispatch(searchWithBuy(e.target.checked));
    },
    selectRooms: (arr: string[]) => {
      dispatch(selectRooms(arr))
    },
    dispatchRangePickerStartValue: (val: any) => {
      dispatch(selectStartDate(val.toISOString()))
    },
    dispatchRangePickerEndValue: (val: any) => {
      dispatch(selectEndDate(val.toISOString()))
    },
    dispatchRangePickerOptionChangeOnMobile: (val: string) => {
      dispatch(selectOptionRange(val))
    },
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    savePrevPage(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'historyList'}))
    },
    searchLogin: (val: any) => {
      let value = val.target ? val.target.value.trim() : val;
      const MAX_ID_LENGTH = 50;
      if (value.length > MAX_ID_LENGTH) { return; }
      dispatch(searchLogin(value))
    }
  })
)

class OfficeReportVO extends React.Component<OfficeReport.Props, OfficeReport.State> {

  constructor(props: OfficeReport.Props, context?: any) {
    super(props, context);
    this.onDateChangeHandler = this.onDateChangeHandler.bind(this);
    this.onCurrencyChangeHandler = this.onCurrencyChangeHandler.bind(this);
    this.onChangeRangePickerHandler = this.onChangeRangePickerHandler.bind(this);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.onSaveExcelButton = this.onSaveExcelButton.bind(this);
  }

  componentDidMount() {
    this.props.getCurrencyList(this, -1).then((flag: any) => {
      let roleId = parseInt(localStorage.getItem("roleId")as any);
      if (flag && this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
        this.props.getRoomList(this, this.props.match.params.platform);
        this.props.getReport(this).then((flag: any)=>{
          if(flag && this.getLevelKey() === 1 && !isPanelAggregate()){
            this.goToLevel(2, this.props.report[0].id, 0, 0)
          }
        });
      }
    });
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
    this.props.searchLogin("");
  }

  componentDidUpdate(prevProps:any, prevState:any, snapshot:any) {
    /*MAY BE BROKEN*/
    if(prevProps.path !== this.props.path && this.getLevelKey() === 1 && !this.props.loadingReport){
      this.props.getReport(this).then((flag: any)=>{
        if(flag && this.getLevelKey() === 1 && !isPanelAggregate()){
          this.goToLevel(2, this.props.report[0].id, 0, 0)
        }
      });
    }
  }

  goToLevel(level: number, value: any, officeId: number, roomId: number) {
    if(this.props.selectedOfficesByPlatform.length > 0){
      this.props.selectOfficesByPlatform([]);
    }
    if(this.props.selectedRoomsByOffice.length > 0){
      this.props.selectRoomsByOffice([]);
    }
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let r = roles[role];
    if (level === 1) {
      this.props.history.push(`${r.route}${r.children.OFFICE_REPORT_V3}`);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: 'Platform',
      });
    }
    if (level === 2) {
      this.props.history.push(`${r.route}${r.children.OFFICE_REPORT_V3}/${value}`);
      this.props.getRoomList(this, value);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: value,
      });
    }
    if (level === 3) {
      this.props.history.push(`${r.route}${r.children.OFFICE_REPORT_V3}/${this.props.match.params.platform}/${officeId}`);
      this.props.getRoomList(this, this.props.match.params.platform);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: officeId,
      });
    }
    if (level === 4) {
      this.props.history.push(`${r.route}${r.children.OFFICE_REPORT_V3}/${this.props.match.params.platform}/${this.props.match.params.officeId}/${roomId}`);
      this.props.getReport(this, true, {
        levelKey: level,
        levelValue: roomId,
      });
    }
  }

  getLevelKey(): number {
    let params = this.props.match.params;
    let platform = params.platform;
    let officeId = params.officeId;
    let roomId = params.roomId;
    let levelKey = 0;
    if (!platform && !officeId && !roomId) {
      levelKey = 1;
    } else if (platform && !officeId && !roomId) {
      levelKey = 2;
    } else if (platform && officeId && !roomId) {
      levelKey = 3;
    } else if (platform && officeId && roomId) {
      levelKey = 4;
    }
    return levelKey;
  }

  getLevelValue(): string {
    let params = this.props.match.params;
    let platform = params.platform;
    let officeId = params.officeId;
    let roomId = params.roomId;
    let levelValue = '';
    if (!platform && !officeId && !roomId) {
      levelValue = 'Platform';
    } else if (platform && !officeId && !roomId) {
      levelValue = platform;
    } else if (platform && officeId && !roomId) {
      levelValue = officeId;
    } else if (platform && officeId && roomId) {
      levelValue = roomId;
    }
    return levelValue;
  }

  componentWillUnmount() {
    this.props.resetTableData();
  }

  onDateChangeHandler(val: number) {
    console.log('onDateChangeHandler: ', val);
    this.props.getCurrencyList(this, val);
    this.props.selectCurrencyDate(val);
  }

  onCurrencyChangeHandler(val: number) {
    console.log('onCurrencyChangeHandler: ', val);
    this.props.selectCurrency(val);
  }

  onFocusHandler() {
    console.log('focus');
  }

  onBlurHandler() {
    console.log('blur');
  }

  openHistory(record: any): void {
    let roleId = localStorage.getItem('roleId') as string;
    let platform = this.props.match.params.platform;
    let size = getParameterByName('size', this.props.location.search) || 10;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPage(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HISTORY_LIST}/${record.userId}?page=1&size=${size}&platform=${platform}`)
  }

  onSaveExcelButton() {
    let token = (localStorage.getItem('sessionId') as string);
    let params: any = {
      startDate: addZoneOffsetToISOStringForRequest(this.props.selectedDateRange[0], this.props.timeZone),
      endDate: addZoneOffsetToISOStringForRequest(this.props.selectedDateRange[1], this.props.timeZone),
      sortKey: getCorrectSortKey(this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
      currencyId: this.props.selectedCurrency,
      officesId: (this.getLevelKey() == 2 && (this.props.selectedOfficesByPlatform.length > 0) && this.props.selectedOfficesByPlatform) || [-1],
      roomsId: (this.getLevelKey() == 3 && (this.props.selectedRoomsByOffice.length > 0) && this.props.selectedRoomsByOffice) || [-1],
      platform: this.props.match.params.platform || "all",
      page: 1,
      gifts: + this.props.checkedGift,
      limit: this.props.pagination.pageSize,
      sortDirection: this.props.sort.sortDirection,
      levelKey: this.getLevelKey(),
      levelValue: this.getLevelValue(),
      fun: this.props.checkedFun ? 1 : 0,
      searchValue: this.props.searchLoginValue || '""'
    };
    const request = {
      method: ajaxRequestTypes.METHODS.GET,
      headers: new Headers({
        'x-request-sign': token
      })
    };
    let filename: string;
    fetch(concatParamsToURL(api.GET_OFFICE_REPORT_FILE_V3, params), request)
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
  }

  resetPagination(needResetPagination?: boolean) {
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

  onChangeRangePickerHandler(dates: any) {
    console.log('onChangeRangePickerHandler: ', dates);
    this.props.selectDateRange([dates[0].toISOString(), dates[1].toISOString()]);
  }

  onShowReportClick() {
    this.props.getReport(this, true);
  }

  onTableChange(pagination: any, filter: any, sorter: any) {
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
  }

  handleChangeRangeOptions = (value: string) => {
    this.props.dispatchRangePickerOptionChangeOnMobile(value);
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
        title = localization.PLATFORMS_HEADER[lang];
        break;
      }
      case 2:{
        title = localization.OFFICES_HEADER[lang];
        break;
      }
      case 3:{
        title = localization.ROOMS_HEADER[lang];
        break;
      }
      case 4:{
        title = localization.USERS_HEADER[lang];
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
        sorter: this.getLevelKey() !==4,
        sortOrder: this.props.sort.sortKey === 'name' && reversedSortTableOrder(this.props.sort.sortDirection),
        render: (value: any, row: any, i: number) => {
          let level = this.getLevelKey() + 1;
          return {
            children: this.getLevelKey() != 4 ?
              <a onClick={() => this.goToLevel(level, value, row.id, row.id)}>{value}</a>
              : <a title={(localization.OPEN_USERS_HISTORY as any)[lang]} onClick={() => this.openHistory(row)}>{value}</a>,
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
        currencySymbol:true,
        key: 'win',
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
        key: 'betCount',
        sortOrder: this.props.sort.sortKey === 'betCount' && reversedSortTableOrder(this.props.sort.sortDirection),
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
        dataIndex: 'profit',
        key: 'profit',
        currencySymbol:true,
        sortOrder: this.props.sort.sortKey === 'profit' && reversedSortTableOrder(this.props.sort.sortDirection),
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
        key: 'payout',
        dataIndex: 'payout',
        sortOrder: this.props.sort.sortKey === 'payout' && reversedSortTableOrder(this.props.sort.sortDirection),
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
      return {...val, betCount: formatNumberData(val.betCount, true)}
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

  renderFilter(): any {
    let fields = [
      {
        positionId: 2,
        name: (localization.CURRENCY as any)[lang],
        title: (localization.PICK_CURRENCY as any)[lang],
        data: this.props.currencyList.rates,
        currValue: this.props.selectedCurrency,
        handlers: {
          onChange: this.onCurrencyChangeHandler,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      }
    ];
    
    //search fields
    let idSearchField = {
      positionId: 5,
      inputType: 'search',
      required: false,
      isNeedToRender: true,
      label: localization.SEARCH_BY_LOGIN[lang],
      placeholder: localization.SEARCH_COLUMN_FILTER[lang],
      onChange: this.props.searchLogin,
      onSearch: () => {
        this.props.getReport(this, true)
      },
      value: this.props.searchLoginValue,
      tooltipMsg: localization.NO_SUCH_ID_FOUND[lang]
    };

    let multiSelect: any[];
    let multiSelectOffices: any[] = [
      {
        positionId: 3,
        inputType: 'multiSelect',
        required: false,
        isNeedToRender: true,
        name: localization.PLEASE_SELECT[lang],
        title: localization.SELECT_OFFICES[lang],
        data: uniqueObjectsArrayByProperty(this.props.roomsList, "categoryId").map((val:any)=> {
          return {...val, id:val.categoryPlatformId, name: val.categoryName}
          }
        ),
        currValue: this.props.selectedOfficesByPlatform,
        handlers: {
          onChange: this.props.selectOfficesByPlatform,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      }
    ];
    let multiSelectRooms: any[] = [
      {
        positionId: 3,
        inputType: 'multiSelect',
        required: false,
        isNeedToRender: true,
        name: localization.PLEASE_SELECT[lang],
        title: localization.SELECT_ROOMS[lang],
        data: this.props.roomsList.filter((val:IRoom) => val.categoryPlatformId == this.props.match.params.officeId),
        currValue: this.props.selectedRoomsByOffice,
        handlers: {
          onChange: this.props.selectRoomsByOffice,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      }
    ];
    if(this.getLevelKey() == 2){
      multiSelect = multiSelectOffices
    } else if(this.getLevelKey() == 3) {
      multiSelect = multiSelectRooms
    } else if (this.getLevelKey() == 4) {
      multiSelect = [idSearchField]
    } else{
      multiSelect = [];
    }
    let mobileRangePickerHandlers = {
      dispatchStartValue: this.props.dispatchRangePickerStartValue,
      dispatchEndValue: this.props.dispatchRangePickerEndValue,
      handleChangeRangeOptions: this.handleChangeRangeOptions,
      selectedOptionRange: this.props.selectedOptionRange,
      selectOptionRange: this.props.dispatchRangePickerOptionChangeOnMobile
    };
    let loading = this.props.loadingReport;
    return (<Filter
      goToDescriptionInHelp={this.goToDescriptionInHelp}
      pageTitle={(localization.OFFICE_REPORT as any)[lang]}
      fields={fields}
      selectedDateRange={this.props.selectedDateRange}
      onShowReportClick={this.onShowReportClick}
      loadingButton={loading}
      treeProps={[]}
      onChangeCheckboxFun={this.props.searchWithFun}
      checkedFun={this.props.checkedFun}
      onChangeCheckboxGift={this.props.searchWithGift}
      checkedGift={this.props.checkedGift}
      onChangeCheckboxBuy={this.props.searchWithBuy}
      checkedBuy={this.props.checkedBuy}
      additionalFields={multiSelect}
      mobileRangePicker={mobileRangePickerHandlers}
      onChangeRangePickerHandler={this.onChangeRangePickerHandler}/>)
  }

  renderBreadCrumb = () => {
    let platform = this.props.match.params.platform;
    let officeId = this.props.match.params.officeId;
    let roomId = this.props.match.params.roomId;
    let breadcrumb = [{
      levelKey: 1,
      levelValue: 'Platform',
      title: localization.REPORT_TITLE[lang],
      isLink: this.getLevelKey() !== 1
    }];
    if (this.getLevelKey() >= 2) {
      breadcrumb.push({
        levelKey: 2,
        isLink: this.getLevelKey() !== 2,
        title: localization.PLATFORM_TITLE[lang],
        levelValue: platform,
      })
    }
    if (this.getLevelKey() >= 3) {
      breadcrumb.push({
        levelKey: 3,
        levelValue: this.props.metadata.officeName,
        title: localization.OFFICE_TITLE[lang],
        isLink: this.getLevelKey() !== 3,
      })
    }
    if (this.getLevelKey() === 4) {
      breadcrumb.push({
        levelKey: 4,
        levelValue: this.props.metadata.roomName,
        title: localization.ROOM_TITLE[lang],
        isLink: false,
      })
    }

    let helperFunc = (val: any)=>{
      // if(this.props.history.location.search.indexOf("platform") != -1){
      //   removeParams(["platform"], this.props);
      // }
      this.goToLevel(val.levelKey, val.levelValue, officeId, roomId)
    };

    return (
      <Breadcrumb>
        {
          breadcrumb.map((val: any) => {
            return (
              <Breadcrumb.Item key={val.levelKey}>
                {val.isLink ?
                  <a title={val.title}
                     onClick={()=>{helperFunc(val)}}>
                    {val.levelValue}
                  </a> : <span title={val.title}>{val.levelValue}</span>}
              </Breadcrumb.Item>)
          })
        }
      </Breadcrumb>)
  };

  render() {
    return (
      <div className={'gutter-box-padding'}>
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

export const OfficeReport = withRouter(OfficeReportVO);
