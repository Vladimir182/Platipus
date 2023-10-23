import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row} from 'antd';
import req, {switchRoute} from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {Filter} from "app/components/Filter";
import {DataTable} from "app/components/Table";
import localization from "app/localization";

import {
  addZoneOffsetToISOString, addZoneOffsetToISOStringForRequest,
  concatParamsToURL, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet, isoStringToUTCDate,
  reversedSortTableOrder,
  sortTableOrder
} from 'app/utils'
import {
  previousPage, selectCurrencyArray, selectDateRange, selectEndDate, selectOptionRange, selectPlatform,
  selectStartDate
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_SETTINGS_CURRENCY} from "app/components/HelpComponent/anchorId";
import shortcuts from "app/const/shortcuts";

const SORT_ARR = ['value', 'exchange', 'date'];
const SORT_DEFAULT = 'date';
let lang = localStorage.getItem('lang') || 'en';

export namespace CurrencySettings {
  export interface Props extends RouteComponentProps<void> {
    selectCurrencyDate: any;
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    selectDateRange: any;
    dispatchRangePickerStartValue: any;
    dispatchRangePickerEndValue: any;
    dispatchRangePickerOptionChangeOnMobile: any;
    selectPlatform: (val: string) => void;
    getPlatformList: (that: any) => Promise<boolean>;
    selectCurrencyArray: (val: number[]) => void;

    currencySettingsList: any;
    currencyFilterList: any;
    newRecordId: number;
    selectedDateRange: string[];
    sort: ISort;
    loadingCurrencySettings: boolean;
    pagination: IPagination;
    selectedOptionRange: string;
    path: string;
    timeZone: string;
    selectedPlatform: any;
    selectedCurrencyArray: number[];
    platformList: any[];
    metadata: any;
  }
}

@connect((state): any => ({
    currencySettingsList: state.filter.currencySettingsList,
    currencyFilterList: state.filter.currencyFilterList,
    selectedCurrencyDate: state.filter.selectedCurrencyDate,
    sort: state.table.sort,
    pagination: state.table.pagination,
    loadingCurrency: state.filter.loadingCurrency,
    path: state.router.location.pathname,
    timeZone: state.filter.timeZone,
    newRecordId: state.table.newRecordId,
    selectedDateRange: state.filter.selectedDateRange,
    selectedOptionRange: state.filter.selectedOptionRange,
    selectedPlatform: state.filter.selectedPlatform,
    selectedCurrencyArray: state.filter.selectedCurrencyArray,
    loadingCurrencySettings: state.filter.loadingCurrencySettings,
    platformList: state.filter.platformList,
    metadata: state.table.metadata
  }),
  (dispatch: any): any => ({
    selectCurrencyArray: (val: number[]) => {
      dispatch(selectCurrencyArray(val))
    },
    selectDateRange: (val: string[]) => {
      dispatch(selectDateRange(val))
    },
    getReport: (that: any, needResetPagination?: boolean) => {
      that.resetPagination(needResetPagination);
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CURRENCY_SETTINGS_LIST);
      let params: any = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        platform: that.props.selectedPlatform || "all",
        type:"json",
        sortKey: getCorrectSortKey(that.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        sortDirection: that.props.sort.sortDirection,
        currenciesId: that.props.selectedCurrencyArray.length !== 0? that.props.selectedCurrencyArray: [-1]
      };
      let data = {
        url: concatParamsToURL(api.GET_CURRENCY_SETTING, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CURRENCY_SETTINGS_LIST);
      let params = {
        startDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endDate: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        platform: that.props.selectedPlatform || "all",
        type:"json",
        sortKey: getCorrectSortKey(val.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        sortDirection: val.sort.sortDirection,
        currenciesId: that.props.selectedCurrencyArray.length !== 0? that.props.selectedCurrencyArray: [-1]
      };
      let data = {
        url: concatParamsToURL(api.GET_CURRENCY_SETTING, params),
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
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    dispatchRangePickerStartValue: (val: any) => {
      dispatch(selectCurrencyArray([]));
      dispatch(selectStartDate(val.toISOString()))
    },
    dispatchRangePickerEndValue: (val: any) => {
      dispatch(selectCurrencyArray([]));
      dispatch(selectEndDate(val.toISOString()))
    },
    dispatchRangePickerOptionChangeOnMobile: (val: string) => {
      dispatch(selectCurrencyArray([]));
      dispatch(selectOptionRange(val))
    },
    selectPlatform: (val: string) => {
      dispatch(selectPlatform(val))
    },
    getPlatformList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.PLATFORM_LIST);
      let data = {
        url: api.GET_PLATFORM_LIST,
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    }
  })
)

class CurrencySettingsVO extends React.Component<CurrencySettings.Props, any> {

  constructor(props: CurrencySettings.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.onChangeRangePickerHandler = this.onChangeRangePickerHandler.bind(this);
  }

  componentDidMount() {
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
      this.props.getPlatformList(this).then(()=>{
        let platform = getParameterByName('platform', this.props.location.search)
          || (this.props.platformList[0] && this.props.platformList[0].id);
        if(platform && platform != this.props.selectedPlatform){
          this.props.selectPlatform(platform);
          insertParam([
            {
              key: 'platform',
              value: platform
            }
          ], this.props);
        }
        this.props.getReport(this);
      });
    }
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    this.props.resetTableData();
  }

  onFocusHandler() {
    console.log('focus');
  }

  onBlurHandler() {
    console.log('blur');
  }

  onSaveExcelButton = ()=> {
    let token = (localStorage.getItem('sessionId') as string);
    let params: any = {
      startDate: addZoneOffsetToISOStringForRequest(this.props.selectedDateRange[0], this.props.timeZone),
      endDate: addZoneOffsetToISOStringForRequest(this.props.selectedDateRange[1], this.props.timeZone),
      platform: this.props.selectedPlatform || "all",
      type:"excel",
      sortKey: getCorrectSortKey(this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
      sortDirection: this.props.sort.sortDirection,
      currenciesId: this.props.selectedCurrencyArray.length !== 0? this.props.selectedCurrencyArray: [-1]
    };
    const request = {
      method: ajaxRequestTypes.METHODS.GET,
      headers: new Headers({
        'x-request-sign': token
      })
    };
    let filename: string;
    fetch(concatParamsToURL(api.GET_CURRENCY_SETTING, params), request)
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
      }
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

  onShowReportClick() {
    this.props.getReport(this);
  }

  onTableChange(pagination: any, filter: any, sorter: any) {
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
    this.props.tableChange(params, this);
  }

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_SETTINGS_CURRENCY}`);
  };

  onPlatformChangeHandler = (val: string) => {
    this.selectPlatform(val);
  };

  selectPlatform(val: string){
    insertParam([
      {
        key: 'platform',
        value: val
      }
    ], this.props);
    this.props.selectCurrencyArray([]);
    this.props.selectPlatform(val);
    setTimeout(()=>{
      this.props.getReport(this);
    }, 10);
  }

  onChangeRangePickerHandler(dates: any) {
    console.log('onChangeRangePickerHandler: ', dates);
    this.props.selectCurrencyArray([]);
    this.props.selectDateRange([dates[0].toISOString(), dates[1].toISOString()]);
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

  renderTable() {
    //table
    let columns: any = [
      {
        title: (localization.ID_COLUMN as any)[lang],
        dataIndex: 'id',
        key: 'id',
        sorter: false,
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: (localization.NAME_COLUMN as any)[lang],
        dataIndex: 'value',
        key: 'value',
        sorter: true,
        editable: false,
        sortOrder: this.props.sort.sortKey === 'value' && reversedSortTableOrder(this.props.sort.sortDirection),
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: (localization.TIME_COLUMN as any)[lang],
        dataIndex: 'date',
        sorter: true,
        sortOrder: this.props.sort.sortKey === 'date' && reversedSortTableOrder(this.props.sort.sortDirection),
        render: (value: any, row: any, i: number) => {
          return {
            children: value ? isoStringToUTCDate(addZoneOffsetToISOString(value, this.props.timeZone)) : '',
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: (localization.EXCHANGE_COLUMN as any)[lang],
        dataIndex: 'exchange',
        key: 'exchange',
        sorter: true,
        sortOrder: this.props.sort.sortKey === 'exchange' && reversedSortTableOrder(this.props.sort.sortDirection),
        editable: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      }];

    let roleId = parseInt(localStorage.getItem('roleId') as string);
    if(roleId){
      let role: string = (getRoleById(roleId) as string).toUpperCase();
      if((roles as any)[role].name != roles.ADMIN.name){
        // columns.pop();
      }
    }

    let propertiesToConvert = ['avgBet', 'bet', 'payout', 'profit', 'win', 'giftWin'];
    let tableData = formatTableData(this.props.currencySettingsList.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
    tableData = tableData.map((val) => {
      return {...val, betCount: formatNumberData(val.betCount, true)}
    });

    let loading = this.props.loadingCurrencySettings;
    return (<DataTable
      columns={columns}
      onTableChange={this.onTableChange}
      loading={loading}
      data={tableData}/>)
  }

  renderFilter() {
    let multiSelect = {
      positionId: 1,
      inputType: 'multiSelect',
      required: false,
      isNeedToRender: true,
      name: localization.PLEASE_SELECT[lang],
      title: localization.PICK_CURRENCY[lang],
      data: this.props.currencyFilterList,
      currValue: this.props.selectedCurrencyArray,
      handlers: {
        onChange: this.props.selectCurrencyArray,
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    };

    let fields = [
      {
        name: localization.PLATFORM[lang],
        title: localization.SELECT_PLATFORM[lang],
        required: false,
        allowClear: false,
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
    let mobileRangePickerHandlers = {
      dispatchStartValue: this.props.dispatchRangePickerStartValue,
      dispatchEndValue: this.props.dispatchRangePickerEndValue,
      handleChangeRangeOptions: this.handleChangeRangeOptions,
      selectedOptionRange: this.props.selectedOptionRange,
      selectOptionRange: this.props.dispatchRangePickerOptionChangeOnMobile
    };
    let loading = this.props.loadingCurrencySettings;
    return (<Filter
      goToDescriptionInHelp={this.goToDescriptionInHelp}
      pageTitle={localization.CURRENCY_SETTINGS[lang]}
      fields={fields}
      selectedDateRange={this.props.selectedDateRange}
      onSaveExcelButton = {this.onSaveExcelButton}
      onShowReportClick={this.onShowReportClick}
      loadingButton={loading}
      treeProps={[] as any}
      additionalFields={[multiSelect]}
      timeZone={this.props.timeZone}
      mobileRangePicker={mobileRangePickerHandlers}
      onChangeRangePickerHandler={this.onChangeRangePickerHandler}/>)
  }

  render() {
    return (
      <div className={'gutter-box-padding'}>
        <Row type="flex" justify="space-around" align="middle">
          {this.props.currencySettingsList && this.renderFilter()}
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.props.currencySettingsList ? this.renderTable() : <SpinComponent/>}
        </Row>
      </div>);
  }
}

export const CurrencySettings = withRouter(CurrencySettingsVO);
