import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Form, Input, Icon, Select} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import {message} from 'antd';
import './style.css'
 
const FormItem = Form.Item;
import {
  concatParamsToURL, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,
  sortTableOrder,
  uniqueObjectsArrayByProperty
} from 'app/utils'
import {
  previousPage,
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
// import {FilterColumn} from "app/components/FilterColumn";
import {AddPanel} from "app/components/AddPanel";
import {ModalComponent} from "app/components/ModalComponent";
 
const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';
 
const {Option} = Select;
 
interface dataToSaveItemI {
  id: number;
  value: string;
}
 
interface dataToSaveI {
  names: dataToSaveItemI[];
  values: dataToSaveItemI[];
}
 
export namespace GameOptionsSettings {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    addGameOption: (that: any) => void;
    editGameOption: (that: any) => void;
    deleteOption: (that: any, id: number) => void;
    changeReport: (that: any, obj: any) => void;
    getRoomList: (that: any, platform?: string) => Promise<boolean>;
 
    sort: ISort;
    report: any;
    reportTotal: any;
    loadingReport: boolean;
    pagination: IPagination;
    path: string;
    appliedColumnFilter: any;
    newRecordId: number;
    roomsList: any;
  }
 
  export interface State {
    data: any;
    editingKey: any;
    id: number | undefined;
    showModal: boolean;
    showEditModal: boolean;
    selectedOfficeId: any;
    autospinCount: string | number;
    autospinLimitLost: string | number;
    autospinLimitWin: string | number;
    limitTime: string | number;
    autoPlayCheckBox: boolean | null,
    buyFeatureCheckBox: boolean | null,
    realityCheck: number | null,
    realityCheckManualLimits: number | null,
    historyUrl: string | null,
    realityCheckLostCheckBox: boolean,
    historyUrlIFrameCheckBox: boolean,
    elapsedTimeCheckBox: boolean,
    netWinCheckBox: boolean,
    turboSpinCheckBox: boolean,
    slamStopCheckBox: boolean,
    dataToSave: dataToSaveI;
    saveEditData: any;
    putEditData: any;
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
 
class EditableCell extends React.Component {
  getInput = (onChangeInput: any, record: any, dataIndex: any) => {
    return <Input onChange={(e: any) => {
      onChangeInput(e, record, dataIndex)
    }} size={'small'}/>;
  };
 
  render() {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
      index,
      onChangeInput,
      ...restProps
    } = this.props as any;
    return (
      <EditableContext.Consumer>
        {(form: any) => {
          const {getFieldDecorator} = form;
          return (
            <td {...restProps}>
              {editing ? (
                <FormItem style={{margin: 0}}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: true,
                      message: `${localization.PLEASE_INPUT[lang]} ${title}!`,
                    }],
                    initialValue: record[dataIndex],
                  })(this.getInput(onChangeInput, record, dataIndex))}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}
 
@connect((state): any => ({
    roomsList: state.filter.roomsList,
    appliedColumnFilter: state.table.filter,
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    loadingReport: state.table.loadingReport,
    path: state.router.location.pathname,
    newRecordId: state.table.newRecordId
  }),
  (dispatch: any): any => ({
    getReport: (that: any, needResetPagination?: boolean) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.SETTINGS_GAME_OPTIONS, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params = {
        page: val.pagination.current,
        limit: val.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.SETTINGS_GAME_OPTIONS, params),
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
    getRoomList: (that: any, platform?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: concatParamsToURL(api.GET_ROOM_LIST, {platform: platform || (that.props.selectedPlatform || "all")}),
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    },
    addGameOption: (that: any) => {
      const {
        selectedOfficeId,
        autospinCount,
        autospinLimitLost,
        autospinLimitWin,
        limitTime,
        autoPlayCheckBox,
        buyFeatureCheckBox,
        realityCheck,
        realityCheckManualLimits,
        historyUrl,
        realityCheckLostCheckBox,
        historyUrlIFrameCheckBox,
        elapsedTimeCheckBox,
        netWinCheckBox,
        turboSpinCheckBox,
        slamStopCheckBox
      } = that.state;

      if(!autospinCount){
        message.warn('Autospin Count is required')
        return
      } else if(!autospinLimitLost) {
        message.warn('Autospin Limit Lost is required')
        return
      } else if(!autospinLimitWin){
        message.warn('Autospin Limit Win is required')
        return
      } else if(!limitTime){
        message.warn('Limit Time is required')
        return
      } else if(!selectedOfficeId) {
        message.warn(' Office Name is required')
        return
      } else if(realityCheck < 0 || realityCheck !== 0 && realityCheck < 60){
        message.warn('Reality Check must be 0 or 60 or more seconds')
        return
      } else if (historyUrl !== null && !(historyUrl.startsWith('http://') || historyUrl.startsWith('https://'))){
        message.warn('Missing http:// or https:// for the field History URL')
        return
      }
      
      function realityCheckManualLimitsResult(value: any) {
        if(value !==''){
          return value && Array.from(value.split(','), Number)
        } else {
          return null
        }
      }

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        officeId: Number(selectedOfficeId),
        autospin_count: Array.from(autospinCount.split(','), Number),
        autospin_limit_lost: Array.from(autospinLimitLost.split(','), Number),
        autospin_limit_win: Array.from(autospinLimitWin.split(','), Number),
        limit_time: Array.from(limitTime.split(','), Number),
        autoPlay: autoPlayCheckBox,
        buyFeature: buyFeatureCheckBox,
        realityCheck: realityCheck ? realityCheck : 0,
        realityCheckLost: realityCheckLostCheckBox,
        realityCheckManualLimits: realityCheckManualLimitsResult(realityCheckManualLimits),
        elapsedTime: elapsedTimeCheckBox,
        netWin: netWinCheckBox,
        historyUrlIFrame: historyUrlIFrameCheckBox,
        historyUrl: historyUrl !== '' ? historyUrl : null,
        turboSpin: turboSpinCheckBox,
        slamStop: slamStopCheckBox
      };
 
      let data = {
        url: api.SETTINGS_GAME_OPTIONS,
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
    editGameOption:(that: any) => {
      const {
        autospin_count,
        autospin_limit_lost,
        autospin_limit_win,
        limit_time,
        autoPlay,
        buyFeature,
        realityCheck,
        realityCheckLost,
        realityCheckManualLimits,
        elapsedTime,
        netWin,
        historyUrlIFrame,
        historyUrl,
        turboSpin,
        slamStop,
        // realityCheckManualLimits
      } = that.state.saveEditData;

      if(!autospin_count){
        message.warn('Autospin Count is required')
        return
      } else if(!autospin_limit_lost) {
        message.warn('Autospin Limit Lost is required')
        return
      } else if(!autospin_limit_win){
        message.warn('Autospin Limit Win is required')
        return
      } else if(!limit_time){
        message.warn('Limit Time is required')
        return
      } else if(realityCheck < 0 || realityCheck !== 0 && realityCheck < 60){
        message.warn('Reality Check must be 0 or 60 or more seconds')
        return
      } else if (historyUrl !== null && !(historyUrl.startsWith('http://') || historyUrl.startsWith('https://'))){
        message.warn('Missing http:// or https:// for the field History URL')
        return
      }

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        ...that.state.putEditData,
        autospin_count,
        autospin_limit_lost,
        autospin_limit_win,
        limit_time,
        autoPlay,
        buyFeature,
        realityCheck: realityCheck ? realityCheck : 0,
        realityCheckLost,
        realityCheckManualLimits: realityCheckManualLimits !== '' ? realityCheckManualLimits && Array.from(realityCheckManualLimits.split(','), Number) : null,
        elapsedTime,
        netWin,
        historyUrlIFrame,
        historyUrl: historyUrl !== '' ? historyUrl : null,
        turboSpin,
        slamStop,
      };
      let data = {
        url: api.SETTINGS_GAME_OPTIONS,
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
    deleteOption: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.DELETE_REPORT);
      let params = {
        id: id
      };
      let data = {
        url: api.SETTINGS_GAME_OPTIONS,
        method: ajaxRequestTypes.METHODS.DELETE,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.DELETED[lang]);
          that.props.getReport(that, false);
        }
      });
    },
    changeReport: (that: any, obj: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.GET_WALLET_OPTIONS,
        method: ajaxRequestTypes.METHODS.PUT,
        params: obj
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({
            editingKey: '',
            dataToSave: {
              names: [],
              values: []
            }
          });
          that.props.getReport(that, false);
        }
      });
    },
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    }
  })
)
 
class GameOptionsSettingsVO extends React.Component<GameOptionsSettings.Props, GameOptionsSettings.State> {
 
  constructor(props: GameOptionsSettings.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
 
    this.state = {
      data: [],
      editingKey: '',
      id: undefined,
      showModal: false,
      showEditModal: false,
      selectedOfficeId: undefined,
      autospinCount: '',
      autospinLimitLost: '',
      autospinLimitWin: '',
      limitTime: '',
      autoPlayCheckBox: null,
      buyFeatureCheckBox: null,
      realityCheck: 0,
      realityCheckManualLimits: null,
      historyUrl: null,
      realityCheckLostCheckBox: false,
      historyUrlIFrameCheckBox: false,
      elapsedTimeCheckBox: false,
      netWinCheckBox: false,
      turboSpinCheckBox: true,
      slamStopCheckBox: true,
      dataToSave: {
        names: [],
        values: []
      },
      saveEditData: {},
      putEditData: {}
    };
  }
 
  componentDidMount() {
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
      this.props.getReport(this);
      this.props.getRoomList(this)
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
 
  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_GAME_DATA_REPORT}`);
  };
 
  isEditing = (record: any) => {
    return record.key === this.state.editingKey;
  };
 
  deleteWalletOptions = (id: number) => {
    console.log('delete');
  };
 
  onFilterColumn(selectedKeys: any, confirm: any) {
    confirm();
  }
 
  onResetFilterColumn(clearFilters: any) {
    clearFilters();
  }
 
 
 
  onChangeInput = (e: any, row: any, dataIndex: any) => {
    if (dataIndex === 'name') {
      let names: dataToSaveItemI[] = [...this.state.dataToSave.names];
      let filteredValue = names.filter((val: any) => {
        return val.id === row.id
      })[0];
 
      if (filteredValue) {
        for (let i = 0; i < this.state.dataToSave.names.length; i++) {
          let ver = this.state.dataToSave.names[i];
          if (ver.id === row.id) {
            names[i].value = e.target.value;
          }
        }
      } else {
        names.push({
          id: row.id,
          value: e.target.value
        });
      }
 
      this.setState({
        dataToSave: {
          names: names,
          values: [...this.state.dataToSave.values]
        }
      });
    } else {
      let values: dataToSaveItemI[] = [...this.state.dataToSave.values];
      let filteredValue = values.filter((val: any) => {
        return val.id === row.id
      })[0];
 
      if (filteredValue) {
        for (let i = 0; i < this.state.dataToSave.values.length; i++) {
          let ver = this.state.dataToSave.values[i];
          if (ver.id === row.id) {
            values[i].value = e.target.value;
          }
        }
      } else {
        values.push({
          id: row.id,
          value: e.target.value
        });
      }
 
      this.setState({
        dataToSave: {
          names: [...this.state.dataToSave.names],
          values: values
        }
      });
    }
  };
 
  renderTable() {
    
   let getTableIcon = (result: any) => {
     return result ? 
        (<Icon
        title={'Enabled'}
        theme="twoTone"
        twoToneColor="#52c41a"
        type={'check-circle'}/>)
      : 
        (<Icon
        title={'Disabled'}
        theme="twoTone"
        twoToneColor="#ff0002"
        type={'close-circle'}
        />)
    }

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
                textAlign: 'center',
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'Platform',
        dataIndex: 'plfatformName',
        key: 'platformId',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: `${row.platformName}(#${row.platformId})`,
            props: {
              style: {
                textAlign: 'center',
                fontWeight: '700'
              }
            }
          };
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
            props: {
              style: {
                textAlign: 'center',
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'AutoPlay',
        dataIndex: 'autoPlay',
        key: 'autoPlay',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: getTableIcon(row.autoPlay),
            props: {
              style: {
                fontSize: '20px',
                textAlign: 'center',
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'Buy Feature',
        dataIndex: 'buyFeature',
        key: 'buyFeature',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: getTableIcon(row.buyFeature),
            props: {
              style: {
                fontSize: '20px',
                textAlign: 'center',
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'Reality Check',
        dataIndex: 'realityCheck',
        key: 'realityCheck',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: row.realityCheck ? row.realityCheck : 0,
            props: {
              style: {
                textAlign: 'center',
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'Reality Check Lost',
        dataIndex: 'realityCheckLost',
        key: 'realityCheckLost',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: getTableIcon(row.realityCheckLost),
            props: {
              style: {
                fontSize: '20px',
                textAlign: 'center',
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: localization.OPERATION_COLUMN[lang],
        sorter: false,
        dataIndex: 'operation',
        key: 'operation',
        render: (text: any, record: any) => {
          return (
            <div style={{textAlign: 'center'}}>
               <span>
                  <a onClick={() => this.editChangeGameOption(record)}>{localization.EDIT[lang]}</a>
                  <Popconfirm
                    icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                    okType={'danger'}
                    title={localization.SURE_TO_DELETE[lang]}
                    onConfirm={() => this.props.deleteOption(this, record.id)}
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
        onCell: (record: any) => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
          onChangeInput: this.onChangeInput
        }),
      };
    });
 
    const components = {
      row: EditableFormRow,
      cell: EditableCell,
    };
 
    let propertiesToConvert = ['avgBet', 'payout', 'profit', 'win', 'giftWin'];
    let tableData = formatTableData(this.props.report.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
    tableData = tableData.map((val) => {
      return {...val, betCount: formatNumberData(val.betCount, true)}
    });

    // let loading = false;
    return (<DataTable
      additionalComponents={components}
      columns={columns}
      onTableChange={this.onTableChange}
      loading={this.props.loadingReport}
      pagination={this.props.pagination}
      data={tableData}/>)
  }
 
  addHandler = () => {
    this.setState({
      showModal: true,
      id: undefined,
      selectedOfficeId: undefined,
      autospinCount: '0,25,50,75,100',
      autospinLimitLost: '0.5,0.6,0.7,0.8,0.9,1',
      autospinLimitWin: '25,50,75,100',
      limitTime: '5,10,20,30,40,50,60,1440',
      autoPlayCheckBox: true,
      buyFeatureCheckBox: true,
      realityCheck: 0,
      realityCheckManualLimits: null,
      historyUrl: null,
      realityCheckLostCheckBox: false,
      historyUrlIFrameCheckBox: false,
      elapsedTimeCheckBox: false,
      netWinCheckBox: false,
      turboSpinCheckBox: true,
      slamStopCheckBox: true
    })
  };
  
  categoryIdOptions(arr:any[]){
    return arr.map((option: any) => {
      return (
        <Option
          key={option.id}
          value={option.id}>{option.name}</Option>
      )
    })
  };

  handlerInputDefault = (value: any | boolean | any, key: string) => {
    const regex = /^[0-9,]*$/;
    if (regex.test(value)) {
      this.setState((state) =>({ 
        ...state,
        [key]: value
      }));
    }
  };
  handlerInputLimitLost = (value: any | boolean | any, key: string) => {
    const regex = /^[0-9,.]*$/;
    if (regex.test(value)) {
      this.setState((state) =>({ 
        ...state,
        [key]: value
      }));
    }
  };
  handlerInputHistory = (value: any, key: string) => {
    this.setState((state) =>({ 
      ...state,
      [key]: value !== '' ? value : null
    }));
  };

  handlerEditInputDefault = (value: string | number | boolean | any, key: string) => {
      const regex = /^[0-9,]*$/;
      if (regex.test(value)) {
      this.setState((state) =>({
        saveEditData: {
          ...state.saveEditData,
          [key]: value
        },
        putEditData: {
          ...state.putEditData,
          [key]: Array.from(value.split(','), Number)
        }
      }))
    }
  };
  handlerEditAutospinLimitLost = (value: string | number | boolean | any, key: string) => {
      const regex = /^[0-9,.]*$/;
      if (regex.test(value)) {
      this.setState((state) =>({
        saveEditData: {
          ...state.saveEditData,
          [key]: value
        },
        putEditData: {
          ...state.putEditData,
          [key]: Array.from(value.split(','), Number)
        }
      }))
    }
  };

  handlerEditHistoryURL = (value: string | number | boolean | any, key: string) => {
    this.setState((state) =>({
      saveEditData: {
        ...state.saveEditData,
        [key]: value ? value : null
      },
      putEditData: {
        ...state.putEditData,
        [key]: value ? value : null
      }
    }))
  }

  handlerDefaultCheckbox = (value: boolean, key: string) => {
    this.setState((state) =>({ 
      ...state,
      [key]: value
    }));
  };

  handlerEditDefaultCheckbox = (value: boolean, key: string) => {
    this.setState((state) => ({
      saveEditData: {
        ...state.saveEditData,
        [key]: value
      },
      putEditData: {
        ...state.putEditData,
        [key]: value
      }
    }))
  };

  handlerInputRealityValue = (value: any, key: string) => {
    if( key === 'realityCheckManualLimits'){
      const regex = /^[0-9,]*$/;
      if (regex.test(value)) {
        this.setState((state) =>({ 
          ...state,
          [key]: value
        }));
      }
    } else {
      this.setState((state) =>({ 
        ...state,
        [key]: value
      }));
    }
  };

  handlerEditInputRealityCheckValue = (value: number, key: string) => {
    this.setState((state) =>({ 
      saveEditData: {
        ...state.saveEditData,
        [key]: value
      },
      putEditData: {
        ...state.putEditData,
        [key]: value
      }
    }))    
  };

  handlerEditInputRealityValue = (value: any, key: string) => {
    const regex = /^[0-9,]*$/;
      if (regex.test(value)) {
      this.setState((state) =>({ 
        saveEditData: {
          ...state.saveEditData,
          [key]: value ? value : null
        },
        putEditData: {
          ...state.putEditData,
          [key]: value ? value : null
        }
      }))
    }
  };

  onChangeSelectOffice = (val: string[]) => {
    this.setState((state) =>({
      ...state,
      selectedOfficeId: val
    }))  
  };

  onChangeEditSelectOffice = (val: any) => {
    this.setState((state) =>({ 
      saveEditData: {
        ...state.saveEditData,
        officeId: val
      },
      putEditData: {
      ...state.putEditData,
      officeId: val
      }
    }))  
  };

  cancelGameOptionModal = () => {
    this.setState({
      showModal: false,
    })
  };

  cancelEditGameOptionModal = () => {
    this.setState({
      showEditModal: false,
      id: undefined,
      selectedOfficeId: undefined,
      autospinCount: '0, 25, 50, 75, 100',
      autospinLimitLost: '0.5, 0.6, 0.7, 0.8, 0.9, 1',
      autospinLimitWin: '25, 50, 75, 100',
      limitTime: '5, 10, 20, 30, 40, 50, 60, 1440',
      autoPlayCheckBox: true,
      buyFeatureCheckBox: true,
      realityCheck: 0,
      realityCheckManualLimits: null,
      historyUrl: null,
      realityCheckLostCheckBox: false,
      historyUrlIFrameCheckBox: false,
      elapsedTimeCheckBox: false,
      netWinCheckBox: false,
      turboSpinCheckBox: true,
      slamStopCheckBox: true
    })
  };

  editChangeGameOption(record: any) {
    this.setState({
      showEditModal: true,
      saveEditData: {
        ...this.state.saveEditData,
        ...record,
        autospin_count: record.autospin_count ? record.autospin_count : [0, 25, 50, 75, 100],
        autospin_limit_lost: record.autospin_limit_lost ? record.autospin_limit_lost : [0.5, 0.6, 0.7, 0.8, 0.9, 1],
        autospin_limit_win: record.autospin_limit_win ? record.autospin_limit_win : [25, 50, 75, 100],
        limit_time: record.limit_time ? record.limit_time : [5, 10, 20, 30, 40, 50, 60, 1440],
        autoPlay: record.autoPlay !== undefined ? record.autoPlay : true,
        buyFeature: record.buyFeature !== undefined ? record.buyFeature : true,
        realityCheck: record.realityCheck ? record.realityCheck : 0,
        realityCheckManualLimits: record.realityCheckManualLimits ? record.realityCheckManualLimits.join() : null,
        historyUrl: record.historyUrl ? record.historyUrl : null,
        realityCheckLost: record.realityCheckLost ? record.realityCheckLost : false,
        historyUrlIFrame: record.historyUrlIFrame ? record.historyUrlIFrame : false,
        elapsedTime: record.elapsedTime ? record.elapsedTime : false,
        netWin: record.netWin ? record.netWin : false,
        turboSpin: record.turboSpin !== undefined ? record.turboSpin : true,
        slamStop: record.slamStop !== undefined ? record.slamStop : true,
      },
      putEditData: {
        id: record.id
      }
    })
  };


  getGameOptionsConfig() {
    let select = [
      {
        positionId: 1,
        width: 1,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.selectedOfficeId,
        name: 'Name',
        title: 'Office',
        customOptions: this.categoryIdOptions,
        // data: this.props.OfficeList,
        data: uniqueObjectsArrayByProperty(this.props.roomsList, "categoryId").map((val:any)=> {
          return {...val, id:val.categoryPlatformId, name: val.categoryName}
          }
        ),
        handlers: {
          onChange: this.onChangeSelectOffice,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 2,
        inputType: 'textInput',
        width: 2,
        required: true,
        isNeedToRender: true,
        value: this.state.autospinCount,
        style: {width: '100%'},
        placeholder: 'Autospin Count',
        label: 'Autospin Count:',
        onChange: (e: any) => this.handlerInputDefault(e.target.value, 'autospinCount')
        // onChange: this.handlerAutospinCount
      },
      {
        positionId: 3,
        width: 2,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.autospinLimitLost,
        placeholder: 'Autospin Limit Lost' ,
        label: 'Autospin Limit Lost:',
        onChange: (e: any) => this.handlerInputLimitLost(e.target.value, 'autospinLimitLost')
        // onChange: this.handlerAutospinLimitLost
      },
      {
        positionId: 3,
        width: 2,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.autospinLimitWin,
        placeholder: 'Autospin Limit Win' ,
        label: 'Autospin Limit Win:',
        onChange: (e: any) => this.handlerInputDefault(e.target.value, 'autospinLimitWin')
        // onChange: this.handlerAutospinLimitWin
      },
      {
        positionId: 4,
        width: 2,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.limitTime,
        placeholder: 'Limit Time',
        label: 'Limit Time:',
        onChange: (e: any) => this.handlerInputDefault(e.target.value, 'limitTime')
        // onChange: this.handlerLimitTime
      },
      {
        positionId: 5,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Autoplay',
            checked: this.state.autoPlayCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'autoPlayCheckBox')
          }
        ]
      },
      {
        positionId: 6,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Buy Feature',
            checked: this.state.buyFeatureCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'buyFeatureCheckBox')
          }
        ]
      },
      {
        positionId: 7,
        inputType: 'numberValue',
        width: 2,
        required: false,
        isNeedToRender: true,
        value: this.state.realityCheck,
        style: {width: '100%'},
        placeholder: 'Reality Check (sec)',
        label: 'Reality Check:',
        onChange: (e: any) => this.handlerInputRealityValue(e , 'realityCheck')
      },
      {
        positionId: 8,
        inputType: 'textInput',
        width: 2,
        required: false,
        isNeedToRender: true,
        value: this.state.realityCheckManualLimits,
        placeholder: 'Reality Check Manual Limits',
        label: 'Reality Check Manual Limits:',
        onChange: (e: any) => this.handlerInputRealityValue(e.target.value , 'realityCheckManualLimits')
      },
      {
        positionId: 9,
        width: 1,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.historyUrl,
        placeholder: 'URL' ,
        label: 'History URL:',
        onChange: (e: any) => this.handlerInputHistory(e.target.value, 'historyUrl')
      },
      {
        positionId: 10,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Reality Check Lost',
            checked: this.state.realityCheckLostCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'realityCheckLostCheckBox')
          }
        ]
      },
      {
        positionId: 11,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'History URL IFrame',
            checked: this.state.historyUrlIFrameCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'historyUrlIFrameCheckBox')
          }
        ]
      },
      {
        positionId: 12,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Elapsed Time',
            checked: this.state.elapsedTimeCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'elapsedTimeCheckBox')
          }
        ]
      },
      {
        positionId: 13,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Net Win',
            checked: this.state.netWinCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'netWinCheckBox')
          }
        ]
      },
      {
        positionId: 14,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Turbo Spin',
            checked: this.state.turboSpinCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'turboSpinCheckBox')
          }
        ]
      },
      {
        positionId: 15,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Slam Stop',
            checked: this.state.slamStopCheckBox,
            onChange: (e: any) => this.handlerDefaultCheckbox(e.target.checked, 'slamStopCheckBox')
          }
        ]
      },
    ];
    return select;
  }

  getEditGameOptionsConfig() {

    let select = [
      {
        positionId: 1,
        width: 1,
        inputType: 'select',
        disabled: true,
        required: true,
        isNeedToRender: true,
        currValue: String(this.state.saveEditData.officeId),
        name: 'Office',
        title: 'Office',
        customOptions: this.categoryIdOptions,
        // data: this.props.OfficeList,
        data: uniqueObjectsArrayByProperty(this.props.roomsList, "categoryId").map((val:any)=> {
          return {...val, id:val.categoryPlatformId, name: val.categoryName}
          }
        ),
        handlers: {
          onChange: this.onChangeEditSelectOffice,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 2,
        inputType: 'textInput',
        width: 2,
        required: true,
        isNeedToRender: true,
        value: this.state.saveEditData && this.state.saveEditData.autospin_count,
        style: {width: '100%'},
        placeholder: 'Autospin Count',
        label: 'Autospin Count:',
        onChange: (e: any) => this.handlerEditInputDefault(e.target.value, 'autospin_count')
        // onChange: this.handlerAutospinCount
      },
      {
        positionId: 3,
        width: 2,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.saveEditData && this.state.saveEditData.autospin_limit_lost,
        placeholder: 'Autospin Limit Lost' ,
        label: 'Autospin Limit Lost:',
        onChange: (e: any) => this.handlerEditAutospinLimitLost(e.target.value, 'autospin_limit_lost')
        // onChange: this.handlerAutospinLimitLost
      },
      {
        positionId: 3,
        width: 2,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.saveEditData && this.state.saveEditData.autospin_limit_win,
        placeholder: 'Autospin Limit Win' ,
        label: 'Autospin Limit Win:',
        onChange: (e: any) => this.handlerEditInputDefault(e.target.value, 'autospin_limit_win')
        // onChange: this.handlerAutospinLimitWin
      },
      {
        positionId: 4,
        width: 2,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.saveEditData && this.state.saveEditData.limit_time,
        placeholder: 'Limit Time',
        label: 'Limit Time:',
        onChange: (e: any) => this.handlerEditInputDefault(e.target.value, 'limit_time')
        // onChange: this.handlerLimitTime
      },
      {
        positionId: 5,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Autoplay',
            checked: this.state.saveEditData && this.state.saveEditData.autoPlay,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'autoPlay')
          }
        ]
      },
      {
        positionId: 6,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Buy Feature',
            checked: this.state.saveEditData && this.state.saveEditData.buyFeature,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'buyFeature')
          }
        ]
      },
      {
        positionId: 7,
        inputType: 'numberValue',
        width: 2,
        required: true,
        isNeedToRender: true,
        value: this.state.saveEditData && this.state.saveEditData.realityCheck,
        style: {width: '100%'},
        placeholder: 'Reality Check (sec)',
        label: 'Reality Check:',
        onChange: (e: any) => this.handlerEditInputRealityCheckValue(e , 'realityCheck')
      },
      {
        positionId: 8,
        inputType: 'textInput',
        width: 2,
        required: true,
        isNeedToRender: true,
        value: this.state.saveEditData && this.state.saveEditData.realityCheckManualLimits,
        style: {width: '100%'},
        placeholder: 'Reality Check Manual Limits',
        label: 'Reality Check Manual Limits:',
        onChange: (e: any) => this.handlerEditInputRealityValue(e.target.value , 'realityCheckManualLimits')
      },
      {
        positionId: 9,
        width: 1,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.saveEditData && this.state.saveEditData.historyUrl,
        placeholder: 'URL' ,
        label: 'History URL:',
        onChange: (e: any) => this.handlerEditHistoryURL(e.target.value, 'historyUrl')
      },
      {
        positionId: 10,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Reality Check Lost',
            checked: this.state.saveEditData && this.state.saveEditData.realityCheckLost,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'realityCheckLost')
          }
        ]
      },
      {
        positionId: 11,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'History URL IFrame',
            checked: this.state.saveEditData && this.state.saveEditData.historyUrlIFrame,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'historyUrlIFrame')
          }
        ]
      },
      {
        positionId: 12,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Elapsed Time',
            checked: this.state.saveEditData && this.state.saveEditData.elapsedTime,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'elapsedTime')
          }
        ]
      },
      {
        positionId: 13,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Net Win',
            checked: this.state.saveEditData && this.state.saveEditData.netWin,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'netWin')
          }
        ]
      },
      {
        positionId: 14,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Turbo Spin',
            checked: this.state.saveEditData && this.state.saveEditData.turboSpin,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'turboSpin')
          }
        ]
      },
      {
        positionId: 15,
        width: 2,
        inputType: 'checkbox',
        isNeedToRender: true,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            label: 'Slam Stop',
            checked: this.state.saveEditData && this.state.saveEditData.slamStop,
            onChange: (e: any) => this.handlerEditDefaultCheckbox(e.target.checked, 'slamStop')
          }
        ]
      },
    ];
    return select;
  }

  buttons = [
    {
      onClick: this.addHandler,
      icon: 'plus-circle',
      text: 'Add Game Options'
    },
    {
      onClick: this.onShowReportClick,
      icon: 'reload',
      text: localization.SHOW_DATE_BY_FILTER[lang],
      loading:this.props.loadingReport
    }
  ];

  render() {
    let buttons = [
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: 'Add Game Options'
      },
      {
        onClick: () => this.props.getReport(this, true),
        icon: 'reload',
        text: localization.SHOW_DATE_BY_FILTER[lang],
        loading:this.props.loadingReport
      }
    ];

    return (
      <div className={'gutter-box-padding'}>
        { this.state.showModal ?
          <ModalComponent
            handleOk={() => {
              this.props.addGameOption(this)
            }}
            handleCancel={this.cancelGameOptionModal}
            modalTitle={'Add Game Option'}
            filterInputs={this.getGameOptionsConfig()}
            visible={this.state.showModal}/>
            :
          <ModalComponent
            handleOk={() => {
              this.props.editGameOption(this)
            }}
            handleCancel={this.cancelEditGameOptionModal}
            modalTitle={`Edit Game Option (#${this.state.saveEditData.id})`}
            filterInputs={this.getEditGameOptionsConfig()}
            visible={this.state.showEditModal}/>
        }
        <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            title={localization.WALLET_OPTIONS_SETTINGS[lang]}
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
 
export const GameOptionsSettings = withRouter(GameOptionsSettingsVO);
