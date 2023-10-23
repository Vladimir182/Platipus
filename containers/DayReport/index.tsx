import * as React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, TreeSelect, Col, Tooltip} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {Filter, IField} from "app/components/Filter";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import {
  addZoneOffsetToISOStringForRequest,
  concatParamsToURL, convertSelectedTreeValuesToNumbers, formatNumberData, formatTableData, formatTreeData,
  getCorrectSortKey, getOneDayRangeByDate, getParameterByName, insertParam,
  isDeviceMobileAndTablet,
  removeParams, reversedSortTableOrder, /*shortFormatNumber,*/
  sortTableOrder,
  generateValueWithCurrency, generateValueWithoutCurrency, generateValueWithPercent
} from 'app/utils'
import {
  previousPage, searchWithFun, searchWithGift, searchWithBuy, selectCurrency, selectCurrencyDate, selectDateRange, selectEndDate,
  selectGames,
  selectOptionRange, selectPlatform,
  selectRooms, selectStartDate, switchRoomsToCurrency
} from "app/actions/filter";
import {changeSortKey, IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {IRoom} from "app/reducers/filter";
import {default as roles, getRoleById} from "app/const/roles";
import shortcuts from "app/const/shortcuts";
import {SpinComponent} from "app/components/SpinComponent";
import {DownloadButton} from "app/components/DownloadButton";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
import {FORMATS} from "app/const/moneyFormatter";
import {IChart, IOption, LineChartComponent} from "app/components/LineChartComponent";
import './style.css';

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'name';
let lang = localStorage.getItem('lang') || 'en';
const MAX_SIZE = 100000000;
interface ICurrList {
  updates: any[],
  rates: any[]
}

export namespace DayReport {
  export interface Props extends RouteComponentProps<void> {
    getCurrencyList: (that: any, updateId: number) => Promise<boolean>;
    selectCurrencyDate: (val: number) => void;
    selectCurrency: (val: number) => void;
    selectDateRange: (val: string[]) => void;
    getReport: (that: any, needResetPagination?: boolean, isAllRecords?: boolean, sortObj?: string[]) => void;
    tableChange: (val: ITable, that: any) => void;
    getChangedReport: (that: any, val: ITable) => void;
    getRoomList: (that: any, platform?: string) => void;
    getRoomListOnSwitch: (that: any, val: boolean) => void;
    searchWithFun: (e: boolean) => void;
    searchWithGift: (e: any) => void;
    searchWithBuy: (e: any) => void;
    selectRooms: (arr: string[]) => void;
    getGamesList: (that: any) => void;
    selectGames: (val: string[]) => void;
    tableAction: (val: ITable) => void;
    dispatchRangePickerStartValue: (val: Date) => void;
    dispatchRangePickerEndValue: (val: Date) => void;
    resetTableData: () => void;
    selectOptionRange: (val: string) => void;
    savePrevPageForHelp: (page: string) => void;
    getPlatformList: (that: any) => Promise<boolean>;
    selectPlatform: (val: string) => void;
    switchRoomsToCurrency: (val: boolean) => any;
    changeSortKey: (val: string[]) => any;

    currencyList: ICurrList;
    platformList: any[];
    selectedCurrency: number;
    selectedCurrencyDate: number;
    selectedDateRange: string[];
    sort: ISort;
    report: any;
    selectedPlatform: any;
    reportTotal: any;
    loadingReport: boolean;
    loadingRooms: boolean;
    loadingCurrency: boolean;
    loadingGames: boolean;
    roomsList: IRoom[];
    checkedFun: boolean;
    checkedGift: boolean;
    checkedBuy: boolean;
    roomsId: boolean;
    selectedRooms: string[];
    pagination: IPagination;
    error: any;
    gamesList: any[];
    selectedGames: string[];
    path: string;
    selectedOptionRange: string;
    timeZone: string;
    metadata: any;
    switchedRoomsToCurrency: boolean;
  }

  export interface State {
    isChart: boolean;
    selectedDataKeys: string[];
    chartsData: IChart[];
  }
}

@connect((state): any => ({
    currencyList: state.filter.currencyList,
    selectedCurrency: state.filter.selectedCurrency,
    selectedCurrencyDate: state.filter.selectedCurrencyDate,
    selectedDateRange: state.filter.selectedDateRange,
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    reportTotal: state.table.reportTotal,
    loadingReport: state.table.loadingReport,
    loadingRooms: state.filter.loadingRooms,
    loadingCurrency: state.filter.loadingCurrency,
    loadingGames: state.filter.loadingGames,
    platformList: state.filter.platformList,
    roomsList: state.filter.roomsList,
    selectedPlatform: state.filter.selectedPlatform,
    switchedRoomsToCurrency: state.filter.switchRoomsToCurrency,
    checkedFun: state.filter.checkedFun,
    checkedGift: state.filter.checkedGift,
    checkedBuy: state.filter.checkedBuy,
    selectedRooms: state.filter.selectedRooms,
    error: state.request.error,
    gamesList: state.filter.gamesList,
    selectedGames: state.filter.selectedGames,
    path: state.router.location.pathname,
    selectedOptionRange: state.filter.selectedOptionRange,
    timeZone: state.filter.timeZone,
    metadata: state.table.metadata
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
      selectGames,
      tableAction,
      searchWithFun,
      selectRooms,
      selectOptionRange,
      resetTableData
    }, dispatch),
    getReport: (that: any, needResetPagination?: boolean, isAllRecords?: boolean, sortObj?: string[]) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        sortKey: sortObj?sortObj[0]:getCorrectSortKey(that.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        currencyId: that.props.selectedCurrency,
        page: needResetPagination ? 1 : (page ? page : 1),
        platform: that.props.selectedPlatform || "all",
        limit: (!isAllRecords)?(size && !isNaN(size) ? size : that.props.pagination.pageSize):MAX_SIZE,
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        gamesId: that.props.selectedGames.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, that.props.gamesList),
        sortDirection: sortObj?sortObj[1]:that.props.sort.sortDirection,
        fun: that.props.checkedFun ? 1 : 0
      };
      let data = {
        url: concatParamsToURL(api.GET_DAYS_REPORT, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        sortKey: getCorrectSortKey(val.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        currencyId: that.props.selectedCurrency,
        gamesId: that.props.selectedGames.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, that.props.gamesList),
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        platform: that.props.selectedPlatform || "all",
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        sortDirection: val.sort.sortDirection,
        fun: that.props.checkedFun ? 1 : 0
      };
      let data = {
        url: concatParamsToURL(api.GET_DAYS_REPORT, params),
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
    searchWithGift: (e: any) => {
      dispatch(searchWithGift(e.target.checked));
    },
    searchWithBuy: (e: any) => {
      dispatch(searchWithBuy(e.target.checked));
    },
    getGamesList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAME_LIST);
      let data = {
        url: concatParamsToURL(api.GET_GAME_LIST, {}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
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
    selectPlatform: (val: string) => {
      dispatch(selectPlatform(val))
    },
    switchRoomsToCurrency: (val: boolean) => {
      dispatch(switchRoomsToCurrency(val))
    },
    changeSortKey: (val: string[]) => {
      dispatch(changeSortKey(val))
    }
  })
)

class DayReportVO extends React.Component<DayReport.Props, DayReport.State> {

  constructor(props: DayReport.Props, context?: any) {
    super(props, context);

    this.state = {
      isChart: false,
      selectedDataKeys: ["profit"],
      chartsData:[
        {
          id: "default-chart",
          chartOptions: [
            {
              dataKey: "bet",
              name: "Bet",
              color: "black",
              className: "checkbox-type-1",
              checked: false
            },
            {
              dataKey: "win",
              name: "Win",
              color: "red",
              className: "checkbox-type-2",
              checked: false
            },
            {
              dataKey: "betCount",
              name: "Bet Count",
              color: "green",
              className: "checkbox-type-3",
              checked: false
            },
            {
              dataKey: "avgBet",
              name: "Avg Bet",
              color: "blue",
              className: "checkbox-type-4",
              checked: false
            },
            {
              dataKey: "profit",
              name: "Profit",
              color: "orange",
              className: "checkbox-type-5",
              checked: true
            },
            {
              dataKey: "payout",
              name: "Payout",
              color: "purple",
              className: "checkbox-type-6",
              checked: false
            },
            {
              dataKey: "giftCount",
              name: "Gift Count",
              color: "#ff009e",
              className: "checkbox-type-7",
              checked: false
            },
            {
              dataKey: "giftSpins",
              name: "Gift Spins",
              color: "#007f90",
              className: "checkbox-type-8",
              checked: false
            },
            {
              dataKey: "giftWin",
              name: "Gift Win",
              color: "#08e63d",
              className: "checkbox-type-9",
              checked: false
            }
          ]
        }
      ]
    }
  }

  defaultPageSettings = () => {
    this.handleChangeRangeOptions("thismonth");
    this.props.changeSortKey(["name", "desc"]);
  };

  componentDidMount() {
    this.defaultPageSettings();
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
          this.props.getGamesList(this);
          this.props.getReport(this);
        });
      }
    });
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    this.props.resetTableData();
    this.resetPagination(true);
  }

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
      page: 1,
      platform: this.props.selectedPlatform || "all",
      gifts: + this.props.checkedGift,
      limit: this.props.pagination.pageSize,
      roomsId: this.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(this.props.selectedRooms, this.props.roomsList),
      gamesId: this.props.selectedGames.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(this.props.selectedGames, this.props.gamesList),
      sortDirection: this.props.sort.sortDirection,
      fun: this.props.checkedFun ? 1 : 0
    };
    const request = {
      method: ajaxRequestTypes.METHODS.GET,
      headers: new Headers({
        'x-request-sign': token
      })
    };
    let filename: string;
    fetch(concatParamsToURL(api.GET_DAYS_REPORT_FILE, params), request)
      .then((response: any) => {
        filename = response.headers.get('Content-disposition').split(';')[1].split('=')[1].trim();
        return response.blob()
      })
      .then((blob: any) => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        console.log(filename);
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
      }
    };
    this.props.tableAction(tableConfig);
    this.props.history.push({
      search: `?page=${needResetPagination ? 1 : page ? page : 1}&size=${size && !isNaN(size) ? size : this.props.pagination.pageSize}`
    });
  };

  onChangeRangePickerHandler = (dates: Date[] | any[]) => {
    this.props.selectDateRange([dates[0].toISOString(), dates[1].toISOString()]);
  };

  onShowReportClick = () => {
    if(this.state.isChart){
      this.props.getReport(this, true, true, ["name", "asc"]);
    }else{
      this.props.getReport(this, true, false);
    }
  };

  onPlatformChangeHandler = (val: string) => {
    this.props.selectRooms([]);
    this.props.getRoomList(this, val);
    this.selectPlatform(val);
  };

  switchRoomsToCurrency = (val: boolean) => {
    this.props.selectRooms([]);
    this.props.switchRoomsToCurrency(val);
    this.props.getRoomListOnSwitch(this, val);
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

  onTableChange = (pagination: any, filter: any, sorter: any) => {
    let sort = {
      sortKey: getCorrectSortKey(sorter.columnKey || this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
      sortDirection: sortTableOrder(sorter.order) || "desc"
    };
    let current: number = (pagination.current == this.props.pagination.current
      || pagination.pageSize != this.props.pagination.pageSize) ? 1 : pagination.current;
    let params = {
      sort,
      pagination: {...pagination, current}
    };
    this.props.history.push({
      search: `?page=${current}&size=${pagination.pageSize}`
    });
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

  onRoomsFilterChangeHandler = (val: string[]) => {
    this.props.selectRooms(val);
  };

  onChartChange = () => {
    if(!this.state.isChart){
      this.props.getReport(this, true, true, ["name", "asc"]);
    }else{
      this.props.getReport(this);
    }
    this.setState({isChart:!this.state.isChart})
  };

  renderTable() {
    const that = this;
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
          return {
            children: this.renderNameCell(value),
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
      return {...val, betCount: formatNumberData(val.betCount, true)}
    });
    let loading = this.props.loadingRooms || this.props.loadingReport || this.props.loadingGames;
    return (<DataTable
      columns={columns}
      onTableChange={this.onTableChange}
      totalData={this.props.reportTotal}
      loading={loading}
      checkedBuy={this.props.checkedBuy}
      pagination={this.props.pagination}
      metadata={this.props.metadata}
      data={tableData}/>)
  }

  renderNameCell = (value: string) => {
    let title = (
    <div>
      <span className={"tooltip-link-to-report"} onClick={()=>{this.openReport("platform", value)}}>Platform</span>
      <br/>
      <span className={"tooltip-link-to-report"} onClick={()=>{this.openReport("currency", value)}}>Currency</span>
      <br/>
      <span className={"tooltip-link-to-report"} onClick={()=>{this.openReport("game", value)}}>Game</span>
    </div>);
    return (
      <Tooltip trigger={"click"} title={title}>
        <a>{value}</a>
      </Tooltip>
    )
  };

  openReport = (type: string, value: string) => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();

    this.props.selectDateRange(getOneDayRangeByDate(value));

    switch(type){
      case "platform": {
        this.props.history.push(`${roles[role].route}${roles[role].children.OFFICE_REPORT_V3}`);
        break;
      }
      case "currency": {
        this.props.history.push(`${roles[role].route}${roles[role].children.CURRENCIES_REPORT_V3}`);
        break;
      }
      case "game": {
        this.props.history.push(`${roles[role].route}${roles[role].children.GAMES_REPORT_V3}`);
        break;
      }
    }
  };

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
    //rooms field
    const tProps = [
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
      },
      {
        name: (localization.PICK_GAME as any)[lang],
        props: {
          allowClear: true,
          value: this.props.selectedGames,
          treeData: formatTreeData(this.props.gamesList),
          onChange: this.props.selectGames,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: (localization.PLEASE_SELECT as any)[lang]
        }
      }];
    //checkbox
    let checkbox = [
      {
        inputType: 'checkbox',
        isNeedToRender: typeof this.props.checkedFun !== 'undefined',
        children: [
          {
            isNeedToRenderChild: typeof this.props.checkedFun !== 'undefined',
            required: false,
            childType: 'switch',
            label: "Switch to Chart",
            checked: this.state.isChart,
            onChange: this.onChartChange
          }
        ]
      }
    ];
    let mobileRangePickerHandlers = {
      dispatchStartValue: this.props.dispatchRangePickerStartValue,
      dispatchEndValue: this.props.dispatchRangePickerEndValue,
      handleChangeRangeOptions: this.handleChangeRangeOptions,
      selectedOptionRange: this.props.selectedOptionRange,
      selectOptionRange: this.props.selectOptionRange
    };
    let loading = this.props.loadingRooms || this.props.loadingReport || this.props.loadingGames;
    return (<Filter
      goToDescriptionInHelp={this.goToDescriptionInHelp}
      fields={fields}
      pageTitle={localization.DAY_REPORT[lang]}
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
      additionalFields={checkbox}
      mobileRangePicker={mobileRangePickerHandlers}
      // goBack={()=>{}}
      onChangeRangePickerHandler={this.onChangeRangePickerHandler}/>)
  }

  onChangeChart = (chartKey: string, dataKey: string, checked: boolean) => {
    let selectedDataKeys = [...this.state.selectedDataKeys];
    checked?selectedDataKeys.push(dataKey):selectedDataKeys = selectedDataKeys.filter(val => val !== dataKey);
    let chartsData = this.state.chartsData.map((el1) => {
      return (el1.id === chartKey ? {id: chartKey, chartOptions: el1.chartOptions.map((el2)=> {return (
        el2.dataKey === dataKey ? {...el2, checked} : el2
      )})} : el1);
    });
    //delete unchecked chart
    for(let i = 0; i < chartsData.length; i++){
      let chart = chartsData[i];
      if(chart.id == chartKey && chart.id !==  "default-chart"){
        if(chart.chartOptions.filter((val) => val.checked).length === 0){
          chartsData.splice(i, 1);
        }
        break;
      }
    }
    this.setState({chartsData, selectedDataKeys});
  };

  onCreateChart = (chartKey: string, dataKey: string) => {
    let chartCopy: IChart;
    let chartsData =  JSON.parse(JSON.stringify(this.state.chartsData));
    for(let i = 0; i < this.state.chartsData.length; i++){
      let c = this.state.chartsData[i];
      if(c.id === chartKey){
        chartCopy = JSON.parse(JSON.stringify(c));
        chartCopy.id = `chart-${dataKey}-${new Date()}`;
        chartCopy.chartOptions = chartCopy.chartOptions.map((val: IOption)=>{
          return (val.dataKey === dataKey)?{...val, checked: true}:{...val, checked: false};
        });
        chartsData.splice(i + 1, 0, chartCopy);
        break;
      }
    }

    let selectedDataKeys = [...this.state.selectedDataKeys];
    selectedDataKeys.push(dataKey);

    this.setState({chartsData, selectedDataKeys});
  };

  onCloseChart = (chartKey: string) => {
    let chartsData =  JSON.parse(JSON.stringify(this.state.chartsData));
    let selectedDataKeys = [...this.state.selectedDataKeys];
    let delEl;
    for (let i = 0; i < chartsData.length; i++){
      if(chartKey == chartsData[i].id){
        delEl = chartsData.splice(i, 1)[0];
        break;
      }
    }
    if(delEl){
      for(let i = 0; i < delEl.chartOptions.length; i++ ){
        let option: IOption = delEl.chartOptions[i];
        if(option.checked){
          selectedDataKeys.splice(selectedDataKeys.indexOf(option.dataKey), 1)
        }
      }
    }
    this.setState({chartsData, selectedDataKeys});
  };

  renderChart() {
    let data = this.props.report;
    let currency: string = (this.props.metadata && this.props.metadata.currencyReport && this.props.metadata.currencyReport.name) || "";
    return (
      <LineChartComponent
        currency={currency}
        data={data}
        chartsData={this.state.chartsData}
        selectedDataKeys={this.state.selectedDataKeys}
        closeChart={this.onCloseChart}
        onChangeCheckbox={this.onChangeChart}
        onCreateNewChart={this.onCreateChart}
      />);
  }

  renderNoData() {
    return (<h1>No data</h1>)
  }

  render() {
    return (<div>
      <Row type="flex" justify="space-around" align="middle">
        {this.renderFilter()}
      </Row>
      <Row type="flex" justify="space-around" align="middle">
        {this.props.report ? (this.state.isChart?(this.props.report.length !== 0?this.renderChart(): this.renderNoData()):this.renderTable()) : <SpinComponent/>}
      </Row>
      {
        this.props.report && <Row type="flex" justify="space-around" align="middle">
          <Col span={24} style={{textAlign: 'right'}}>
            <DownloadButton
              onSaveExcelButton={this.onSaveExcelButton}
              loading={this.props.loadingRooms || this.props.loadingReport}/>
          </Col>
        </Row>
      }
    </div>);
  }
}

export const DayReport = withRouter(DayReportVO);
