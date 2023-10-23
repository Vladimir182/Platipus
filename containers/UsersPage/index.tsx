import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, TreeSelect, Icon, Popconfirm, Tag, Switch, message, Button, InputNumber} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {Filter} from "app/components/Filter";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import './flags.min.css';
import {
  addZoneOffsetToISOString,
  concatParamsToURL, convertSelectedTreeValuesToNumbers, formatNumberData, formatTableData, formatTreeData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,
  isoStringToUTCDate, reversedSortTableOrder,
  sortTableOrder,
  isTest
} from 'app/utils'
import {previousPage, selectRooms, switchRoomsToCurrency} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {IRoom} from "app/reducers/filter";
import {getRoleById, default as roles} from "app/const/roles";
import {FilterColumn} from "app/components/FilterColumn";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_ONLINE_USERS, LINK_ALL_USERS} from "app/components/HelpComponent/anchorId";
import {TabsComponent} from "app/components/Tabs";
import './style.css';

const SORT_ARR = ['id', 'login', 'balance', 'game'];
const SORT_DEFAULT = 'login';
let lang = localStorage.getItem('lang') || 'en';

export namespace BackOfficeUsers {
  export interface Props extends RouteComponentProps<void> {
    getUsers: (that: any, needResetPagination?: boolean, selectedPlatform?: string, resetRooms?: boolean) => void;
    tableChange: any;
    getChangedUsers: any;
    getRoomList: any;
    getPlatformList: (that: any) => Promise<boolean>;
    getRoomListOnSwitch: (that: any, val: boolean) => void;
    selectRooms: any;
    sortAndPaginateAndFilter: any;
    changeSortKey: any;
    resetTableData: any;
    savePrevPage: any;
    savePrevPageForHelp: any;
    switchRoomsToCurrency: (val: boolean) => any;

    initUrl: (that: any) => void;
    sort: ISort;
    users: any;
    loadingUsers: boolean;
    loadingRooms: boolean;
    roomsList: IRoom[];
    roomsId: boolean;
    selectedRooms: string[];
    pagination: IPagination;
    appliedColumnFilter: any;
    platformList: any[];
    path: string;
    timeZone: string;
    metadata: any;
    switchedRoomsToCurrency: boolean;
    report: any;
    disableUser: (that: any, id: number, status: number) => void;
    updateUserBalance: any;
  }

  export interface State {
    id: number;
    balance: number;
  }
}


enum UserRouteId {
  All = 1,
  Online = 2
}

@connect((state): any => ({
    sort: state.table.sort,
    pagination: state.table.pagination,
    appliedColumnFilter: state.table.filter,
    users: state.table.report,
    loadingUsers: state.table.loadingReport,
    loadingRooms: state.filter.loadingRooms,
    roomsList: state.filter.roomsList,
    platformList: state.filter.platformList,
    selectedRooms: state.filter.selectedRooms,
    path: state.router.location.pathname,
    timeZone: state.filter.timeZone,
    switchedRoomsToCurrency: state.filter.switchRoomsToCurrency,
    metadata: state.table.metadata,
    report: state.table.report
  }),
  (dispatch: any): any => ({
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
    getUsers: (that: any, needResetPagination?: boolean, selectedPlatform?: string, resetRooms?: boolean) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        sortKey: getCorrectSortKey(that.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
        roomsId: (resetRooms || that.props.selectedRooms.length === 0) ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        sortDirection: that.props.sort.sortDirection,
        searchKey: 'login',
        platform: selectedPlatform || (that.props.platformList[0] && that.props.platformList[0].id),
        searchValue: that.props.appliedColumnFilter.login && that.props.appliedColumnFilter.login[0] || '""',
        status: that.props.appliedColumnFilter.status && that.props.appliedColumnFilter.status.length > 0 ? that.props.appliedColumnFilter.status : [0, 1],
        role: that.props.appliedColumnFilter.role && that.props.appliedColumnFilter.role.length > 0 ? that.props.appliedColumnFilter.role : [0, 1, 3, 4, 6],
      };
      let data = {
        url: that.getRouteId() === UserRouteId.All && concatParamsToURL(api.GET_ALL_USERS, params) || that.getRouteId() === UserRouteId.Online && concatParamsToURL(api.GET_ONLINE_USERS, params) || '',
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedUsers: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let platform = getParameterByName('platform', that.props.location.search);
      let params = {
        sortKey: getCorrectSortKey(val.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        sortDirection: val.sort.sortDirection,
        searchKey: 'login',
        platform: platform,
        searchValue: val.filter.login && val.filter.login[0] || '""',
        status: val.filter.status !== null && val.filter.status.length > 0 ? val.filter.status : [0, 1],
        role: val.filter.role !== null && val.filter.role.length > 0 ? val.filter.role : [0, 1, 3, 4, 6],
      };



      let data = {
        url: that.getRouteId() === UserRouteId.All && concatParamsToURL(api.GET_ALL_USERS, params) || that.getRouteId() === UserRouteId.Online && concatParamsToURL(api.GET_ONLINE_USERS, params) || '',
        method: ajaxRequestTypes.METHODS.GET
      };




      req(types, data, that.props.history, dispatch);
    },
    tableChange: (val: ITable, that: any) => {
      if (val.sort.sortDirection !== that.props.sortDirection && val.sort.sortKey !== that.props.sortKey || val.pagination.current !== that.props.current) {
        that.props.sortAndPaginateAndFilter(val);
        that.props.getChangedUsers(that, val);
      }
    },
    sortAndPaginateAndFilter: (val: ITable) => {
      dispatch(tableAction(val));
    },
    getRoomList: (that: any, platform?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let params = {platform, category: that.props.switchedRoomsToCurrency ? "currency" : ""};
      let data = {
        url: concatParamsToURL(api.GET_ROOM_LIST, params),
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
    updateUserBalance: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        id: that.state.id,
        balance: that.state.balance
      };
      let data = {
        url: api.USER_BALANCE,
        method: ajaxRequestTypes.METHODS.PUT,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.resetState();
          that.props.getUsers(that, false);
        }
      });
    },
    selectRooms: (arr: string[]) => {
      dispatch(selectRooms(arr))
    },
    disableUser: (that: any, id: number, status: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let disabled = status === 0 ? true : false;
      let params = {
        disabled: disabled,
        id: id
      };
      let data = {
        url: api.USER_LOCKOUT,
        method: ajaxRequestTypes.METHODS.PUT,
        params
      };

      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(that.getStatusNameById(Math.abs(status-1)));
          that.props.getUsers(that, false, getParameterByName('platform', that.props.location.search));
        }
      });
    },
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPage(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'historyList'}))
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    switchRoomsToCurrency: (val: boolean) => {
      dispatch(switchRoomsToCurrency(val))
    }
  })
)



class BackOfficeUsersVO extends React.Component<BackOfficeUsers.Props, BackOfficeUsers.State> {

  constructor(props: BackOfficeUsers.Props, context?: any) {
    super(props, context);
    this.onShowUsersClick = this.onShowUsersClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.onRoomsFilterChangeHandler = this.onRoomsFilterChangeHandler.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.updateState = this.updateState.bind(this);

    this.state = {
      id: -1,
      balance:-1
    };
  }


  getPageTitle() {
    return this.getRouteId() === UserRouteId.All ? (localization.ALL_USERS as any)[lang] : this.getRouteId() === UserRouteId.Online ? (localization.USERS_ONLINE as any)[lang] : 'Unknown Page'
  }


  renderUsersInTotal() {
    return (
      (this.getRouteId() === UserRouteId.Online) ?
      <span><Icon type={"team"}/> {this.props.metadata.count} {localization.ONLINE[lang]} {localization.USERS[lang]} {localization.IN_TOTAL[lang]}</span>
      :
      (this.getRouteId() === UserRouteId.All) ?
      <span><Icon type={"team"}/> {this.props.metadata.count} {localization.USERS[lang]} {localization.IN_TOTAL[lang]}</span>
      : ''
    )
  }

  getCurrentUsersRoute = (routeType: UserRouteId) => {
    const roleId = localStorage.getItem('roleId');

    if(!roleId || roleId === 'undefined' || !getRoleById(parseInt(roleId))) return false;

    const role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    const routeTypeChild = routeType === UserRouteId.All ? 'USERS_BACKOFFICE' : routeType === UserRouteId.Online ? 'USERS_CASINO' : UserRouteId.All;
    return `${(roles as any)[role].route}${(roles as any)[role].children[routeTypeChild]}`
  };


  getRouteId() {
    const routeAll = this.getCurrentUsersRoute(UserRouteId.All);
    const routeOnline = this.getCurrentUsersRoute(UserRouteId.Online);

    if (!(routeOnline || routeAll)) return '';

    return (this.props.path.indexOf(routeOnline as string) > -1 && UserRouteId.Online)
      || (this.props.path.indexOf(routeAll as string) > -1 && UserRouteId.All)
      || '';
  }

  updateInitialData() {
    this.props.getPlatformList(this).then((flag: boolean) => {
      let roleId = parseInt(localStorage.getItem("roleId")as any);
      if (flag && this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
        let platform = getParameterByName('platform', this.props.location.search)
          || (this.props.platformList[0] && this.props.platformList[0].id);
        this.props.getRoomList(this, platform);
        this.props.getUsers(this, false, platform);
        insertParam([
          {
            key: 'platform',
            value: platform
          }
        ], this.props);
      }
    });
  }

  componentDidMount() {
    this.updateInitialData();
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
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
      default:
        return localization.ENABLED[lang];
    }
  }

  componentWillUnmount() {
    this.props.resetTableData();
  }

  switchRoomsToCurrency = (val: boolean) => {
    this.props.selectRooms([]);
    this.props.switchRoomsToCurrency(val);
    this.props.getRoomListOnSwitch(this, val);
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
    this.props.sortAndPaginateAndFilter(tableConfig);
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

  onShowUsersClick() {
    let platform = getParameterByName('platform', this.props.location.search)
      || (this.props.platformList[0] && this.props.platformList[0].id);
    this.props.getUsers(this, true, platform);
  }

  onTableChange(pagination: any, filter: any, sorter: any) {
    //sort
    let sort = {
      sortKey: getCorrectSortKey(sorter.columnKey || this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
      sortDirection: sortTableOrder(sorter.order) || "desc"
    };
    //pagination
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

  onRoomsFilterChangeHandler(val: string[]) {
    this.props.selectRooms(val);
  }

  onFilterColumn(selectedKeys: any, confirm: any) {
    confirm();
  }

  onResetFilterColumn(clearFilters: any) {
    clearFilters();
  }

  private openHistory(record: any): void {
    if (record.role === roles.PLAYER.id) {
      let platform = getParameterByName('platform', this.props.location.search);
      let size = getParameterByName('size', this.props.location.search) || 10;
      let roleId = localStorage.getItem('roleId') as string;
      let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
      this.props.savePrevPage(this.props.path + this.props.history.location.search);
      this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HISTORY_LIST}/${record.id}?page=1&size=${size}&platform=${platform}`)
    }
  }

  onRowClick = (record: any) => {
    return {
      onClick: () => {
        this.openHistory(record)
      },
    };
  };

  roleFilterColumn(): any[] {
    let roleId = parseInt(localStorage.getItem('roleId') as string);
    switch (roleId) {
      case roles.ADMIN.id: {
        return [
          {text: 'player', value: '0'},
          {text: 'cashier', value: '1'},
          {text: 'agent', value: '3'},
          {text: 'admin', value: '4'},
          {text: 'distributor', value: '6'}
        ]
      }
      case roles.DISTRIBUTOR.id: {
        return [
          {text: 'player', value: '0'},
          {text: 'cashier', value: '1'},
          {text: 'agent', value: '3'},
          {text: 'distributor', value: '6'}
        ]
      }
      case roles.AGENT.id: {
        return [
          {text: 'player', value: '0'},
          {text: 'cashier', value: '1'},
          {text: 'agent', value: '3'}
        ]
      }
      default: {
        return []
      }
    }
  }

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    console.log('this.getRouteId()', this.getRouteId())
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    if (this.getRouteId() === UserRouteId.All) {
      this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_ALL_USERS}`);
    } else if(this.getRouteId() === UserRouteId.Online) {
      this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_ONLINE_USERS}`);
    }
  };

  onChangeTab = (selectedPlatform: string) => {
    this.props.selectRooms([]);
    this.props.getRoomList(this, selectedPlatform);
    this.props.getUsers(this, true, selectedPlatform, true);
    insertParam([
      {
        key: 'platform',
        value: selectedPlatform
      }
    ], this.props);
  };

  updateState = (id: number, balance: number) => { this.setState({id, balance}); }

  resetState = () => { this.setState({id: -1, balance: -1}); }

  renderBalance = ({value, userId, balance}: any) => {
    const editableBalance = this.state.id !== -1 && this.state.id === userId ?
      <div>
        <span>
          <Button size="small" style={{ marginTop: 0 }} type="primary" onClick={() => {this.props.updateUserBalance(this)}}>
            Save
          </Button>
        </span>
        <span> </span>
        <span>
          <InputNumber
            size="small"
            defaultValue={balance}
            min={0} max={1000000000}
            style={{width: '120px'}}
            onChange={(bal: any)=>{this.updateState(userId, +bal)}}
          />
        </span>
      </div> :
      <div style={{cursor:'pointer'}} onClick={() => this.updateState(userId, balance)}>
        {value}{/* <a title={'Change Balance (test only)'}>{value}</a> */}
      </div>;

      return isTest() ? editableBalance : value;
  }

  renderTable() {
    let appliedColumnFilter = this.props.appliedColumnFilter || {};
    let roleFilter: any = this.roleFilterColumn();
    let tableHasPlayersOnly = () => this.props.users.filter((el:any) => el.role != 0).length == 0;
    const that: any = this;
    //table
    let columns = [
      {
        title: (localization.ID_COLUMN as any)[lang],
        dataIndex: 'id',
        key: 'id',
        sorter: true,
        sortOrder: this.props.sort.sortKey === 'id' && reversedSortTableOrder(this.props.sort.sortDirection),
        render: (text: any, record: any) => {
          let arr: any = this.props.users.filter((v: any) => (v.role === 0 && text === v.id));
          if (arr.length > 0) {
            return {
              children: <a title={(localization.OPEN_USERS_HISTORY as any)[lang]}
                           onClick={() => this.openHistory(record)}>{text}</a>,
              props: {
                style: {
                  fontWeight: '700',
                }
              }
            };
          } else {
            return {
              children: text,
              props: {
                style: {
                  fontWeight: '700',
                }
              }
            };
          }
        }
      },
      {
        title: 'Account',
        dataIndex: 'login',
        key: 'login',
        sortOrder: this.props.sort.sortKey === 'login' && reversedSortTableOrder(this.props.sort.sortDirection),
        sorter: true,
        render: (text: any, record: any) => {
          let arr: any = this.props.users.filter((v: any) => (v.role === 0 && text === v.login));
          if (arr.length > 0) {
            return {
              children: <a title={(localization.OPEN_USERS_HISTORY as any)[lang]}
                           onClick={() => this.openHistory(record)}>{text}</a>,
              props: {
                style: {
                  fontWeight: '700',
                }
              }
            };
          } else {
            return {
              children: text,
              props: {
                style: {
                  fontWeight: '700',
                }
              }
            };
          }
        },
        filteredValue: appliedColumnFilter.login || null,
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
        filterIcon: (filtered: any) => <Icon type="filter" style={{color: filtered ? '#108ee9' : '#aaa'}}/>,
      },
      {
        title: (localization.BALANCE_COLUMN as any)[lang],
        dataIndex: 'balance',
        key: 'balance',
        sortOrder: this.props.sort.sortKey === 'balance' && reversedSortTableOrder(this.props.sort.sortDirection),
        sorter: true,
        render(value: any, row: any, i: number) {
          const balance = +`${row.balance}`.split(' ').join('');
          // const currency = row.currency;
          const userId = +row.id;
          return {
            children: (that.getRouteId() === UserRouteId.All) && value || (that.getRouteId() === UserRouteId.Online) && that.renderBalance({balance, userId, value}) || '',
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.CURRENCY as any)[lang],
        dataIndex: 'currency',
        key: 'currency',
        sorter: false,
      },
      {
        title: (localization.OFFICE_ROOM_COLUMN as any)[lang],
        dataIndex: 'officeAndRoom',
        key: 'officeAndRoom',
        sorter: false,
      },
      {
        title: this.getRouteId() === UserRouteId.All && (localization.STATUS_COLUMN as any)[lang] || this.getRouteId() === UserRouteId.Online && localization.STATUS_COLUMN[lang] || '',
        dataIndex: 'status',
        key: 'status',
        sorter: false,
        editable: false,
        filteredValue: appliedColumnFilter.status || null,
        filters: [
          {text: 'disabled', value: "1"},
          {text: 'enabled', value: "0"},
        ],
        render: (value: any, row: any, i: number) => {
          return {
            children: (
              <div className={`status-data-cell ${(tableHasPlayersOnly()) && `status-data-cell__short` || '' } `}>
                <Tag color={row.status === 0 ? "green" : "red"}>{this.getStatusNameById(row.status)}</Tag>
                {
                  row.role != 0
                  &&
                  <Popconfirm
                      icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                      okType={'danger'}
                      title={row.status === 1?localization.SURE_TO_ENABLE[lang]:localization.SURE_TO_DISABLE[lang]}
                      onConfirm={() => this.props.disableUser(this, row.id, row.status)}
                      onCancel={() => {}}
                    >
                    {
                      <Switch
                        checked={row.status === 1}
                        checkedChildren={<Icon type="check"/>}
                        unCheckedChildren={<Icon type="close"/>}
                      />
                    }
                  </Popconfirm>
                }
              </div>
            ),
            props: {}
          };
        }
      },
      {
        title: (localization.ROLE_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'role',
        key: 'role',
        filteredValue: appliedColumnFilter.role || null,
        filters: roleFilter,
        render(value: any, row: any, i: number) {
          let id = getRoleById(parseInt(value));
          return {
            children: id
          };
        }
      },
      {
        title: (localization.GAME as any)[lang],
        dataIndex: 'game',
        key: 'game',
        sortOrder: this.props.sort.sortKey === 'game' && reversedSortTableOrder(this.props.sort.sortDirection),
        sorter: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: (localization.LAST_VISIT_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'lastVisit',
        key: 'lastVisit',
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
        title: (localization.LAST_IP_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'lastIp',
        key: 'lastIp',
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: (localization.FLAG_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'countryCode',
        key: 'countryCode',
        render(value: any, row: any, i: number) {
          return {
            children: <img className={"flag flag-" + value}/>
          };
        }
      },
      {
        title: (localization.COUNTRY_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'country',
        key: 'country',
      }];

    if(this.getRouteId() == UserRouteId.All){
      columns = columns.filter((el: any) => (el.dataIndex != 'game'));
    }

    let propertiesToConvert = ['balance'];

    let tableData = formatTableData(this.props.users.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
    tableData = tableData.map((val) => {
      return {...val, betCount: formatNumberData(val.betCount, true)}
    });
    tableData = tableData.map((v: any) => {
      let office = v.officeName ? v.officeName : '';
      let room = v.roomName ? " / " + v.roomName : '';
      return {
        ...v,
        officeAndRoom: office + room
      }
    });
    let loading = this.props.loadingRooms || this.props.loadingUsers;
    return (<DataTable
      columns={columns}
      onTableChange={this.onTableChange}
      loading={loading}
      pagination={this.props.pagination}
      data={tableData}/>)
  }

  renderFilter() {
    let fields: any = [];
    const tProps = [
      {
        name: {
          loading: this.props.loadingRooms,
          onChange: this.switchRoomsToCurrency,
          value: this.props.switchedRoomsToCurrency,
          options: [localization.SELECT[lang], localization.OFFICES_AND_ROOMS[lang], localization.CURRENCIES_AND_ROOMS[lang]]
        },
        props: {
          allowClear: true,
          value: this.props.selectedRooms,
          treeData: formatTreeData(this.props.roomsList, true),
          onChange: this.onRoomsFilterChangeHandler,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: (localization.PLEASE_SELECT as any)[lang]
        }
      }];
    let loading = this.props.loadingRooms || this.props.loadingUsers;
    let customTextShowDataButton = {
      icon: 'reload',
      text: (localization.REFRESH_HISTORY as any)[lang]
    };

    const infoPanelSubString =  `${(localization.USERS as any)[lang]} ${this.getRouteId() !== UserRouteId.All && (localization.ONLINE as any)[lang] || ''}`;

    let infoPanel = [{
      icon: 'team',
      text: `${!(Object.keys(this.props.metadata).length === 0 && this.props.metadata.constructor === Object) ? this.props.metadata.items : ''} ${infoPanelSubString}`
    }];
    return (<Filter
      goToDescriptionInHelp={this.goToDescriptionInHelp}
      infoPanel={infoPanel}
      customTextShowDataButton={customTextShowDataButton}
      pageTitle= {this.getPageTitle()}
      fields={fields}
      onShowReportClick={this.onShowUsersClick}
      loadingButton={loading}
      treeProps={tProps}/>)
  }
  render() {
    let platform = getParameterByName('platform', this.props.location.search)
      || (this.props.platformList[0] && this.props.platformList[0].id);
    return (
      <div className={'gutter-box-padding'}>
        <Row type="flex" justify="space-around" align="middle">
          <TabsComponent
            withBudge={true}
            title={localization.SELECT_PLATFORM[lang]}
            selectedTab={platform}
            tabsArr={this.props.metadata.counts || []}
            onChange={this.onChangeTab}/>
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.renderUsersInTotal()}
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.renderFilter()}
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.props.users ? this.renderTable() : <SpinComponent/>}
        </Row>
      </div>);
  }
}

export const BackOfficeUsers = withRouter(BackOfficeUsersVO);
