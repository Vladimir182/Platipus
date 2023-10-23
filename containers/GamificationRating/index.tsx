import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Form, Icon} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import {FilterColumn} from "app/components/FilterColumn";
import localization from "app/localization";

// import './style.css';

import {
  concatParamsToURL, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,sortTableOrder, 

} from 'app/utils';
import {
  previousPage,
  searchByRooms, searchWithGift, selectCurrency, selectCurrencyDate,
  selectRooms,
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_HISTORY_DETAILS} from "app/components/HelpComponent/anchorId";
import { bindActionCreators } from 'redux';
import { AddPanel } from 'app/components/AddPanel';

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

export namespace GamificationRating {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    timeZone?: string;
    savePrevPage: any;

    sort: ISort;
    report: any;
    metadata: any;
    loadingReport: boolean;
    pagination: IPagination;
    path: string;
    newRecordId: number;

    appliedColumnFilter: any;
    prevPage: any;
  }

  export interface State {
    showModal: boolean;
    groups: any[];

    [key: string]: any;
  }
}

const EditableContext = React.createContext([]);

const EditableRow = (obj: any) => {
  let {form, index, ...props} = obj;
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  )
};

const EditableFormRow = Form.create()(EditableRow);

@connect((state): any => ({
    appliedColumnFilter: state.table.filter,
    currencyList: state.filter.currencyList,
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    loadingReport: state.table.loadingReport,
    path: state.router.location.pathname,
    newRecordId: state.table.newRecordId,
    metadata: state.table.metadata,
    timeZone: state.filter.timeZone,
    prevPage: state.filter.previousPage,
  }),
  (dispatch: any): any => ({
    selectCurrency: (val: number) => {
      dispatch(selectCurrency(val))
    },
    selectCurrencyDate: (val: number) => {
      dispatch(selectCurrencyDate(val))
    },
    ...bindActionCreators({
    }, dispatch),
    getReport: (that: any, needResetPagination?: boolean) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let matchParams = that.props.match.params;
      let gamificationId = matchParams.gamificationId;
      let params: any = {
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
        gamificationId
      };
      let data = {
        url: concatParamsToURL(api.GAMIFICATION_RATING, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let matchParams = that.props.match.params;
      let gamificationId = matchParams.gamificationId;
      let params = {
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        gamificationId
      };
      let data = {
        url: concatParamsToURL(api.GAMIFICATION_RATING, params),
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
    searchWithGift: (e: any) => {
      dispatch(searchWithGift(e.target.checked));
    },
    savePrevPage(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'historyList'}))
    },
    selectRooms: (arr: string[]) => {
      dispatch(selectRooms(arr))
    },
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    }
  })
)

class GamificationRatingV0 extends React.Component<GamificationRating.Props, GamificationRating.State> {

  constructor(props: GamificationRating.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.state = {
      showModal: false,
      showEditModal: false,
      platformId: null,
      groups: [],
      saveEditData: {
        editGroups: [],    
      },
      putEditData: {},
    };

  }
  componentDidMount() {
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
      this.props.getReport(this);
    
    }
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  }
  

  getIsDisabledByGameId(id: number) {
    for (let i = 0; i < this.props.report.length; i++) {
      let item = this.props.report[i];
      if (item.id === id) {
        return item.disabled;
      }
    }
  }

  getStatusNameById(disabled: number): string {
    switch (disabled) {
      case 0: {
        return localization.ENABLED[lang];
      }
      case 1: {
        return localization.DISABLED[lang];
      }
    }
    return '';
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

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_HISTORY_DETAILS}`);
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
    this.props.tableChange(params, this);
  }

  onFilterColumn(selectedKeys: any, confirm: any) {
    confirm();
  }

  onResetFilterColumn(clearFilters: any) {
    clearFilters();
  }

  openHistory(record: any): void{
      let platform = getParameterByName('platform', this.props.location.search);
      let size = getParameterByName('size', this.props.location.search) || 10;
      let roleId = localStorage.getItem('roleId') as string;
      let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
      this.props.savePrevPage(this.props.path + this.props.history.location.search);
      this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HISTORY_LIST}/${record.userId}?page=1&size=${size}&platform=${platform}`)
    }

  pageToGoBack = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let page = this.props.prevPage && this.props.prevPage.help && this.props.prevPage.help.length ?
      this.props.prevPage.help : `${(roles as any)[role].route}${(roles as any)[role].children.GAMIFICATION}`;
    this.props.history.push(page)
  };

  renderTable() {

    let appliedColumnFilter = this.props.appliedColumnFilter || {};

    //table
    let columns: any = [
      {
        title: 'Position',
        dataIndex: 'Position',
        key: 'Position',
        sorter: false,
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: row.position,
            props: {
              style: {
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'Player',
        dataIndex: 'Player',
        key: 'Player',
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: <a title={(localization.OPEN_USERS_HISTORY as any)[lang]}
                        onClick={() => this.openHistory(row)}>
                        {`${row.userName}(#${row.userId})`}
                      </a>,
            props: {
              style: {
                fontWeight: '700'
              }
            }
          };
        },
      },
      {
        title: 'Score',
        dataIndex: 'Score',
        key: 'Score',
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: row.score,
            props: {
              style: {}
            }
          };
        },
      },
      {
        title: 'Time Stamp',
        dataIndex: 'Time Stamp',
        key: 'Time Stamp',
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: row.lastBetTime,
            props: {
              style: {}
            }
          };
        },
      },
      {
        title: 'Platform',
        dataIndex: 'Platform',
        key: 'Platform',
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: `${row.platformName}(#${row.platformId})`,
          };
        },
        filteredValue: appliedColumnFilter.nameGame || null,
        filterDropdown: (obj: any) => {
          let {setSelectedKeys, selectedKeys, confirm, clearFilters} = obj;
          return (
            <FilterColumn
              searchPlaceholder={localization.SEARCH_NAME[lang]}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              confirm={confirm}
              clearFilters={clearFilters}
              handleSearch={this.onFilterColumn}
              handleReset={this.onResetFilterColumn}
            />);
        },
        filterIcon: (filtered: any) => <Icon type="filter" style={{color: filtered ? '#108ee9' : '#aaa'}}/>
      },
      {
        title: 'Office',
        dataIndex: 'officeName',
        key: 'officeName',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: `${row.officeName}(#${row.officeId})`,
            props: {}
          };
        }
      },
      {
        title: 'Room',
        dataIndex: 'roomName',
        key: 'roomName',
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: `${row.roomName}(#${row.roomId})`,
            props: {
              style: {}
            }
          };
        },
      }, 
    ];

    columns = columns.map((col: any) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any) => {
          return({
          record,
          inputType: col.inputType,
          dataIndex: col.dataIndex,
          title: col.title
        })
      }
      };
    });

    const components = {
      row: EditableFormRow,
    };


    let propertiesToConvert = ['avgBet', 'payout', 'profit', 'win', 'giftWin'];
    let tableData = formatTableData(this.props.report.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
    tableData = tableData.map((val) => {
      return {...val, betCount: formatNumberData(val.betCount, true)}
    });
    //rooms field
    let loading = this.props.loadingReport;
    return (<DataTable
      additionalComponents={components}
      columns={columns}
      onTableChange={this.onTableChange}
      loading={loading}
      pagination={this.props.pagination}
      data={tableData}/>)
  }

  render() {

    let buttons = [
      {
        onClick:this.pageToGoBack,
        icon: 'arrow-left',
        text: (localization.BACK_HISTORY as any)[lang],
        type: 'danger'
      }
    ];

    return (
      <div className={'gutter-box-padding'}>
         <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            title={localization.GAME_SETTINGS[lang]}
            pageTitle={`Rating: ${this.props.metadata['gamificationName']
          } (#${this.props.metadata['gamificationId']})`}
            goToDescriptionInHelp={this.goToDescriptionInHelp}
            buttons={buttons}
          />
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.props.report ? this.renderTable() : <SpinComponent/>}
        </Row>
      </div>);
  }
}

export const GamificationRating = withRouter(GamificationRatingV0);
