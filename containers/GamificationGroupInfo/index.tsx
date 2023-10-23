import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Form, Icon, Select} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import {FilterColumn} from "app/components/FilterColumn";
import localization from "app/localization";
import {message} from 'antd';

import './style.css';

// const FormItem = Form.Item;
const {Option} = Select;
import {
  concatParamsToURL, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,sortTableOrder, 

} from 'app/utils';
import {
  previousPage, selectGames,
  searchByRooms, searchWithGift, selectCurrency, selectCurrencyDate, selectDateRange, selectEndDate,
  selectOptionRange,
  selectRooms, selectStartDate,
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_HISTORY_DETAILS} from "app/components/HelpComponent/anchorId";
import {AddPanel} from "app/components/AddPanel";
import { bindActionCreators } from 'redux';
import { GamificationGroupModalComponent } from 'app/components/GamificationGroupModalComponent';
import { EditGamificationGroupModalComponent } from 'app/components/EditGamificationGroupModalComponent';

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

export namespace GamificationGroupInfo {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    getGamificationList: (that: any) => void;
    getPlatformList: (that: any) => void;
    getOfficeList: (that: any, platform?: number) => void;
    getRoomList: (that: any, office?: number) => void;
    changeReport: (that: any, obj: any) => void;
    addGroup: (that: any) => void;
    EditGroup: (that: any) => void;
    selectGames: (val: string[]) => string[];
    deleteGames: (that: any, id: number) => void;
    selectDateRange: (val: string[]) => void;
    selectedDateRange?: string[];
    // onTimeZoneChange?: (val: string) => void;
    timeZone?: string;
    dispatchRangePickerStartValue: (val: Date) => void;
    dispatchRangePickerEndValue: (val: Date) => void;
    selectedOptionRange: string;
    selectOptionRange: (val: string) => void;
    mapConfigToFormRow: (val: any) => void;
    mobileRangePicker?: {
      dispatchEndValue: (val: Date) => void;
      dispatchStartValue: (val: Date) => void;
      handleChangeRangeOptions: (value: string) => void;
      selectedOptionRange: string;
      selectOptionRange: (val: string) => void;
    };

    // getGamesList: any;
    gamesList: any[];

    sort: ISort;
    report: any;
    metadata: any;
    loadingReport: boolean;
    pagination: IPagination;
    path: string;
    newRecordId: number;

    appliedColumnFilter: any;
    gamificationsList: any;
    gamificationsPlatformList: any;
    gamificationsOfficeList: any;
    gamificationsRoomList: any;
    selectedGames: string[];
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
    gamificationsList: state.filter.gamificationsList,
    gamificationsPlatformList: state.filter.gamificationsPlatformList,
    gamificationsOfficeList: state.filter.gamificationsOfficeList,
    gamificationsRoomList: state.filter.gamificationsRoomList,
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    loadingReport: state.table.loadingReport,
    path: state.router.location.pathname,
    newRecordId: state.table.newRecordId,
    metadata: state.table.metadata,
    gamesList: state.filter.gamesList,
    selectedGames: state.filter.selectedGames,
    selectedOptionRange: state.filter.selectedOptionRange,
    selectedDateRange: state.filter.selectedDateRange,
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
      selectOptionRange,
      selectDateRange,
      selectGames,
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
        url: concatParamsToURL(api.GAMIFICATION_GROUP, params),
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
        url: concatParamsToURL(api.GAMIFICATION_GROUP, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    changeReport: (that: any, obj: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.GAMIFICATION_GROUP,
        method: ajaxRequestTypes.METHODS.PUT,
        params: obj
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.props.getReport(that, false);
        }
      });
    },
    addGroup: (that: any) => {  

      const result = that.state.groups.map((key: any) => {      
        return { 
          gamificationId: that.props.metadata.gamificationId,
          roomId: key.roomId
        }
      });

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT); 
      let params = {
        groups: result
      };
      let data = {
        url: api.GAMIFICATION_GROUP,
        method: ajaxRequestTypes.METHODS.POST,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({showModal: false});
          that.props.getReport(that, false);
        }
      });
    },
    EditGroup:(that: any) => {
      if(!that.state.putEditData.groups) {
        that.setState({
          showEditModal: false
        })        
      }
      const result = that.state.saveEditData.editGroups.map((key: any) => {    
        return { 
          id: key.id,
          gamificationId: key.gamificationId,
          roomId: key.roomId
        }
      });
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT); 
      let params: any;
        params = {
          groups: result,
        };
      let data = {
        url: api.GAMIFICATION_GROUP,
        method: ajaxRequestTypes.METHODS.PUT,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({showEditModal: false});
          that.props.getReport(that, false);
        }
      });
    },
    deleteGames: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.DELETE_REPORT);
      let params = {
        id: id
      };
      let data = {
        url: api.GAMIFICATION_GROUP,
        method: ajaxRequestTypes.METHODS.DELETE,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.DELETED[lang]);
          // that.setState({showModal: false});
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
    sortAndPaginate: (val: ITable) => {
      dispatch(tableAction(val));
    },
    getGamificationList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAMIFICATION_LIST);
      let data = {
        url: api.GET_GAMIFICATION_LIST,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getPlatformList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAMIFICATION_PLATFORM_LIST);
      let data = {
        url: api.GET_PLATFORM_V2,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getOfficeList: (that: any, platformId: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAMIFICATION_OFFICE_LIST);
      let data = {
        url: `${api.GET_OFFICE_V2}?platformId=${platformId}`,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getRoomList: (that: any, officeId: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAMIFICATION_ROOM_LIST);
      let data = {
        url: `${api.GET_ROOM_V2}?officeId=${officeId}`,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    // getGamesList: (that: any, platform?: string) => {
    //   let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAME_LIST);
    //   let params = {platform: platform};
    //   let data = {
    //     url: concatParamsToURL(api.GET_GAME_LIST, params),
    //     method: ajaxRequestTypes.METHODS.GET
    //   };
    //   req(types, data, that.props.history, dispatch);
    // },
    searchByRooms: (e: any) => {
      dispatch(searchByRooms(e.target.checked));
    },
    searchWithGift: (e: any) => {
      dispatch(searchWithGift(e.target.checked));
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
    }
  })
)

class GamificationGroupInfoVO extends React.Component<GamificationGroupInfo.Props, GamificationGroupInfo.State> {

  constructor(props: GamificationGroupInfo.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.addHandler = this.addHandler.bind(this)
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
      // this.props.getGamesList(this);
    
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

  addHandler = () => {
    this.props.getPlatformList(this);
    // this.props.getOfficeList(this);
    // this.props.getRoomList(this);
    this.setState({
      showModal: true,
      groups:[{
        platformId: null, 
        officeId: null, 
        roomId: null
      }]
    })
  };

  CancelAddGroup = () => {
    this.setState({
      showModal: false,
      groups:[],
    })
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
        title: localization.ID_COLUMN[lang],
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
        title: 'Name',
        dataIndex: 'gamificationName',
        key: 'gamificationName',
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: `${row.gamificationName}(#${row.gamificationId})`,
            props: {
              style: {
                fontWeight: '700'
              }
            }
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
        title: 'Platform',
        dataIndex: 'platformName',
        key: 'platformName',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: `${row.platformName}(#${row.platformId})`,
            props: {}
          }
        }
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
      {
        title: localization.OPERATION_COLUMN[lang],
        sorter: false,
        dataIndex: 'operation',
        key: 'operation',
        render: (text: any, record: any) => {
          return (
            <div>
                <span>
                  <a onClick={() => this.handlerShowEditModal(record)}>{localization.EDIT[lang]}</a>
                  <Popconfirm
                    icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                    okType={'danger'}
                    title={localization.SURE_TO_DELETE[lang]}
                    onConfirm={() => this.props.deleteGames(this, record.id)}
                    onCancel={() => {
                    }}
                  >
                    <a style={{marginLeft: '10px'}}>{localization.DELETE[lang]}</a>
                  </Popconfirm>
                </span>            
            </div>
          );
        }
      }];

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

  categoryIdOptions(arr:any[]){
    return arr.map((option: any) => {
      return (
        <Option
          key={option.id}
          value={option.id}>{option.name}</Option>
      )
    })
  }
  onChangeGroupState = (index: any, name: any, id: any) => {
    if(name === 'platformId'){
      this.setState(
        (state) => ({
          ...state,
          groups: [
            ...state.groups.slice(0, index),
            {
              ...state.groups[index],
              officeId: null,
              roomId: null
            },
            ...state.groups.slice(index + 1)
          ]
        })
      );
    } else if(name === 'officeId'){
        this.setState(
          (state) => ({
            ...state,
            groups: [
              ...state.groups.slice(0, index),
              {
                ...state.groups[index],
                roomId: null
              },
              ...state.groups.slice(index + 1)
            ]
          })
        );
      }
  }

  updateGroupState = (event: any, index: any) => {
    event.persist();
    if( event.target.name === 'platformId'){
      this.onChangeGroupState(index, event.target.name, event.target.value);
      this.props.getOfficeList(this, event.target.value);
    } else if(event.target.name === 'officeId'){
      this.onChangeGroupState(index, event.target.name, event.target.value);
      this.props.getRoomList(this, event.target.value);
    }
    this.setState(
      (state) => ({
        ...state,
        groups: [
          ...state.groups.slice(0, index),
          {
            ...state.groups[index],
            [event.target.name]: event.target.value
          },
          ...state.groups.slice(index + 1)
        ]
      })
    );
  }

  onChangeEditGroupState = (index: any, id: any) => {
   if(id === 'platformId') {
      this.setState(
        (state) => {
          return ({
            saveEditData: {
              ...state.saveEditData,
              editGroups: [
                ...state.saveEditData.editGroups.slice(0, index),
                {
                  ...state.saveEditData.editGroups[index],
                  officeId: null,
                  roomId: null
                },
                ...state.saveEditData.editGroups.slice(index + 1)
                ]
              },
            putEditData: {
              ...state.putEditData,
                groups: [
                  ...state.saveEditData.editGroups.slice(0, index),
                  {
                    ...state.saveEditData.editGroups[index],
                    officeId: null,
                    roomId: null
                  },
                  ...state.saveEditData.editGroups.slice(index + 1)
                ]
              }
          }) 
        } 
      )
    } else if( id === 'officeId'){
      this.setState(
        (state) => {
          return ({
            saveEditData: {
              ...state.saveEditData,
              editGroups: [
                ...state.saveEditData.editGroups.slice(0, index),
                {
                  ...state.saveEditData.editGroups[index],
                  roomId: null
                },
                ...state.saveEditData.editGroups.slice(index + 1)
                ]
              },
            putEditData: {
              ...state.putEditData,
                groups: [
                  ...state.saveEditData.editGroups.slice(0, index),
                  {
                    ...state.saveEditData.editGroups[index],
                    roomId: null
                  },
                  ...state.saveEditData.editGroups.slice(index + 1)
                ]
              }
          }) 
        } 
      )
    }
  }

  editUpdateChildrenState = (event: any, index: any) => {
    event.persist();
    if( event.target.name === 'platformId'){
      this.onChangeEditGroupState(index, event.target.name)
      this.props.getOfficeList(this, event.target.value)
    } else if(event.target.name === 'officeId'){
      this.onChangeEditGroupState(index, event.target.name)
      this.props.getRoomList(this, event.target.value)
    }
    this.setState(
      (state) => {
        return ({
          saveEditData: {
            ...state.saveEditData,
            editGroups: [
              ...state.saveEditData.editGroups.slice(0, index),
              {
                ...state.saveEditData.editGroups[index],
                [event.target.name]: event.target.value
              },
              ...state.saveEditData.editGroups.slice(index + 1)
              ]
            },
          putEditData: {
            ...state.putEditData,
              groups: [
                ...state.saveEditData.editGroups.slice(0, index),
                {
                  ...state.saveEditData.editGroups[index],
                  [event.target.name]: event.target.value
                },
                ...state.saveEditData.editGroups.slice(index + 1)
              ]
            }
        }) 
      } 
    );
  }

  removeGroupRow = (index: any) => {
    let formValues = this.state.groups;
    formValues.splice(index, 1);
    this.setState({ formValues });
  }

  addGroupInputRow = () => {
    const newRow = this.mapConfigToFormRow(this.getGamificationGroupConfig());
    this.setState((state) =>({
      ...state,
      groups: [...state.groups, newRow]
    }))
  };

  mapConfigToFormRow(configItems: any){
    return configItems.reduce((accumulator: any, configItem: any) => {
      accumulator[configItem.name] = null;
      return accumulator;
    }, {});
  }
  
  handlerShowEditModal = (record: any) => {
    this.props.getPlatformList(this)
    this.props.getOfficeList(this, record.platformId);
    this.props.getRoomList(this, record.officeId);
    this.setState({
      showEditModal: true,
      saveEditData: {
        ...this.state.saveEditData,
        ...record,
        editGroups: [...record],
        },
        putEditData: {
          id: record.id
        }
      })
  }

  CancelEditModal = () => {
    this.setState({
      showEditModal: false,
      saveEditData: {
        editGroups: [],
      }
    })
  }

  getGamificationGroupConfig = () => {

    let GamificationGroupConfig = [
    {
      width: 3,
      inputType: 'selectGroupPlatform',
      required: false,
      isNeedToRender: true,
      name: 'platformId',
      title: 'Select Platform',
      customOptions: this.categoryIdOptions,
      style: {width: '100%'},
      data: this.props.gamificationsPlatformList,
      currValue: this.state.groups.map(item => item.platformId),
      handlers: {
        // onChange: this.selectPrizeType,
        onChange: (index: any) => (e: any) => this.updateGroupState(e, index),
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    },
    {
      width: 3,
      inputType: 'selectGroupOffice',
      required: false,
      disabled: !this.props.gamificationsPlatformList,
      isNeedToRender: true,
      name: 'officeId',
      title: 'Select Office',
      customOptions: this.categoryIdOptions,
      style: {width: '100%'},
      data: this.props.gamificationsOfficeList,
      currValue: this.state.groups.map((item: any) => item.officeId),
      handlers: {
        // onChange: this.selectPrizeType,
        onChange: (index: any) => (e: any) => this.updateGroupState(e, index),
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    },
    {
      width: 3,
      inputType: 'selectGroupRoom',
      required: false,
      disabled: false,
      isNeedToRender: true,
      name: 'roomId',
      title: 'Select Room',
      customOptions: this.categoryIdOptions,
      style: {width: '100%'},
      data: this.props.gamificationsRoomList,
      currValue: this.state.groups.map((item: any) => item.roomId),
      handlers: {
        // onChange: this.selectPrizeType,
        onChange: (index: any) => (e: any) => this.updateGroupState(e, index),
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    }
  ]
  return GamificationGroupConfig;
};

  getEditGamificationGroupConfig = () => {
    let EditGamificationGroupConfig = [
    {
      width: 3,
      inputType: 'selectEditGroupPlatform',
      required: false,
      isNeedToRender: true,
      name: 'platformId',
      title: 'Select Platform',
      customOptions: this.categoryIdOptions,
      style: {width: '100%'},
      data: this.props.gamificationsPlatformList,
      currValue: this.state.saveEditData.editGroups.map((item: any) => item.platformId),
      handlers: {
        // onChange: this.selectPrizeType,
        onChange: (index: any) => (e: any) => this.editUpdateChildrenState(e, index),
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    },
    {
      width: 3,
      inputType: 'selectEditGroupOffice',
      required: false,
      isNeedToRender: true,
      name: 'officeId',
      title: 'Select Office',
      customOptions: this.categoryIdOptions,
      style: {width: '100%'},
      data: this.props.gamificationsOfficeList,
      currValue: this.state.saveEditData.editGroups.map((item: any) => item.officeId),
      handlers: {
        // onChange: this.selectPrizeType,
        onChange: (index: any) => (e: any) => this.editUpdateChildrenState(e, index),
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    },
    {
      width: 3,
      inputType: 'selectEditGroupRoom',
      required: false,
      isNeedToRender: true,
      name: 'roomId',
      title: 'Select Room',
      customOptions: this.categoryIdOptions,
      style: {width: '100%'},
      data: this.props.gamificationsRoomList,
      currValue:this.state.saveEditData.editGroups.map((item: any) => item.roomId),
      handlers: {
        // onChange: this.selectPrizeType,
        onChange: (index: any) => (e: any) => this.editUpdateChildrenState(e, index),
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    }
  ]
  return EditGamificationGroupConfig;
};

  render() {

    let buttons = [
      {
        onClick:this.pageToGoBack,
        icon: 'arrow-left',
        text: (localization.BACK_HISTORY as any)[lang],
        type: 'danger'
      },
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: 'Add Gamification group'
      }
    ];
    const editModalTitle = `Edit ${this.state.saveEditData['gamificationName']} (#${this.state.saveEditData['id']}) in ${this.props.metadata['gamificationName']} (#${this.props.metadata['gamificationId']})`

    return (
      <div className={'gutter-box-padding'}>
        <GamificationGroupModalComponent 
          elementsInRow={3}
          groups={this.state.groups}
          modalTitle={`Add Gamification group - ${this.props.metadata['gamificationName']
        } (#${this.props.metadata['gamificationId']})`}
          handleOk={() => this.props.addGroup(this)}
          handleCancel={() => this.CancelAddGroup()}
          addGroupRow={this.addGroupInputRow}
          filterInputsGroup={this.getGamificationGroupConfig()}
          removeGroupRow={(index: any) => this.removeGroupRow(index)}
          visible={this.state.showModal}
        />

        <EditGamificationGroupModalComponent
          elementsInRow={3}
          groups={this.state.saveEditData.editGroups}
          handleOk={() => this.props.EditGroup(this)}
          handleCancel={() => this.CancelEditModal() }
          filterInputsGroup={this.getEditGamificationGroupConfig()}
          modalTitle={editModalTitle}
          visible={this.state.showEditModal}/>
        <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            title={localization.GAME_SETTINGS[lang]}
            pageTitle={`Gamification: ${this.props.metadata['gamificationName']
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

export const GamificationGroupInfo = withRouter(GamificationGroupInfoVO);
