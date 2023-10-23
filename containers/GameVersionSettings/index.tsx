import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Form, Input, Icon, Switch, Tag} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import {message} from 'antd';

import './style.css'

const FormItem = Form.Item;
import {
  concatParamsToURL, downloadObjectAsJson, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,
  sortTableOrder
} from 'app/utils'
import {
  previousPage,
  searchByRooms, searchWithGift, selectCurrency, selectCurrencyDate, selectDateRange, selectEndDate,
  selectOptionRange,
  selectRooms, selectStartDate
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_GAME_VERSIONS} from "app/components/HelpComponent/anchorId";
import {AddPanel} from "app/components/AddPanel";
import {ModalComponent} from "app/components/ModalComponent";

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';


interface dataToSaveItemI {
  gameId: number;
  value: string;
}

interface dataToSaveI {
  versions: dataToSaveItemI[];
  launchNames: dataToSaveItemI[];
}

export namespace GameVersionSettings {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    getMissedGamesList: (that: any) => void;
    changeReport: (that: any, obj: any) => void;
    addVersion: (that: any) => void;
    deleteVersion: (that: any, id: number) => void;
    disableGame: (that: any, id: number) => void;

    missedVersionList: any;
    sort: ISort;
    report: any;
    metadata: any;
    loadingReport: boolean;
    loadingMissedVersion: boolean;
    pagination: IPagination;
    path: string;
    newRecordId: number;
  }

  export interface State {
    isEditing: boolean;
    showModal: boolean;
    launchName: string;
    version: string;
    gameId: number | undefined;
    dataToSave: dataToSaveI;
    prevReport: any[];
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
    currencyList: state.filter.currencyList,
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    loadingReport: state.table.loadingReport,
    loadingMissedVersion: state.filter.loadingMissedVersion,
    path: state.router.location.pathname,
    missedVersionList: state.filter.missedVersionList,
    newRecordId: state.table.newRecordId,
    metadata: state.table.metadata
  }),
  (dispatch: any): any => ({
    getMissedGamesList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.MISSED_VERSION_LIST);
      let data = {
        url: api.GET_GAME_MISSED_VERSIONS,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
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
        url: concatParamsToURL(api.GET_GAME_VERSIONS_SETTING, params),
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
        url: concatParamsToURL(api.GET_GAME_VERSIONS_SETTING, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    changeReport: (that: any, obj: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.GET_GAME_VERSIONS_SETTING,
        method: ajaxRequestTypes.METHODS.PUT,
        params: obj
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({
            isEditing: false,
            dataToSave: {
              versions: [],
              launchNames: []
            }
          });
          that.props.getReport(that, false);
        }
      });
    },
    addVersion: (that: any) => {
      if (!that.state.gameId) {
        return
      }
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        gameId: that.state.gameId,
        launchName: that.state.launchName,
        version: that.state.version
      };
      let data = {
        url: api.GET_GAME_VERSIONS_SETTING,
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
    deleteVersion: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.DELETE_REPORT);
      let params = {
        gameId: id
      };
      let data = {
        url: api.GET_GAME_VERSIONS_SETTING,
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
    getRoomList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: api.GET_ROOM_LIST,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
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
    disableGame: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let disabled = that.getIsDisabledByGameId(id) === 0 ? 1 : 0;
      let params = {
        disabled: disabled,
        gameId: id
      };
      let data = {
        url: api.PUT_DISABLE_GAME,
        method: ajaxRequestTypes.METHODS.PUT,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(that.getStatusNameById(disabled));
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

class GameVersionSettingsVO extends React.Component<GameVersionSettings.Props, GameVersionSettings.State> {

  constructor(props: GameVersionSettings.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);

    this.state = {
      isEditing: false,
      showModal: false,
      launchName: '',
      version: '',
      gameId: undefined,
      dataToSave: {
        versions: [],
        launchNames: []
      },
      prevReport: []
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
      default:
        return localization.ENABLED[lang];
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

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_GAME_VERSIONS}`);
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

  inputVersion = (e: any) => {
    this.setState({
      version: e.target.value
    });
  };

  inputLaunch = (e: any) => {
    this.setState({
      launchName: e.target.value
    });
  };

  selectMissedVersion = (selectedGame: number) => {
    this.setState({
      gameId: selectedGame
    });
  };

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

  save = () => {
    if (this.state.dataToSave.versions.length !== 0 || this.state.dataToSave.launchNames.length !== 0) {
      this.props.changeReport(this, this.state.dataToSave);
      this.setState({
        prevReport: this.props.report
      });
    }
  };

  cancel = () => {
    this.setState({
      isEditing: false,
      dataToSave: {
        versions: [],
        launchNames: []
      }
    });
  };

  isEditing = () => {
    return this.state.isEditing;
  };

  edit = () => {
    this.setState({isEditing: true});
  };

  onChangeInput = (e: any, row: any, dataIndex: any) => {
    if (dataIndex === 'version') {
      let versions: dataToSaveItemI[] = [...this.state.dataToSave.versions];
      let filteredValue = versions.filter((val: any) => {
        return val.gameId === row.id
      })[0];

      if (filteredValue) {
        for (let i = 0; i < this.state.dataToSave.versions.length; i++) {
          let ver = this.state.dataToSave.versions[i];
          if (ver.gameId === row.id) {
            versions[i].value = e.target.value;
          }
        }
      } else {
        versions.push({
          gameId: row.id,
          value: e.target.value
        });
      }

      this.setState({
        dataToSave: {
          versions: versions,
          launchNames: [...this.state.dataToSave.launchNames]
        }
      });
      console.log('versions: ', versions);
    } else {
      let launchNames: dataToSaveItemI[] = [...this.state.dataToSave.launchNames];
      let filteredValue = launchNames.filter((val: any) => {
        return val.gameId === row.id
      })[0];

      if (filteredValue) {
        for (let i = 0; i < this.state.dataToSave.launchNames.length; i++) {
          let ver = this.state.dataToSave.launchNames[i];
          if (ver.gameId === row.id) {
            launchNames[i].value = e.target.value;
          }
        }
      } else {
        launchNames.push({
          gameId: row.id,
          value: e.target.value
        });
      }

      this.setState({
        dataToSave: {
          versions: [...this.state.dataToSave.versions],
          launchNames: launchNames
        }
      });
      console.log('launchNames: ', launchNames);
    }
  };

  addHandler = () => {
    this.props.getMissedGamesList(this);
    this.setState({
      showModal: true,
      launchName: '',
      version: '',
      gameId: undefined
    })
  };

  setRowClassName = (record: any): string => {
    for (let i = 0; i < this.state.dataToSave.versions.length; i++) {
      let ver = this.state.dataToSave.versions[i];
      if (ver.gameId === record.id) {
        return 'changed-row';
      }
    }
    for (let i = 0; i < this.state.dataToSave.launchNames.length; i++) {
      let launchNames = this.state.dataToSave.launchNames[i];
      if (launchNames.gameId === record.id) {
        return 'changed-row';
      }
    }
    if (record.id === this.props.newRecordId) {
      return 'added-row';
    }
    for (let i = 0; i < this.state.prevReport.length; i++) {
      let prevRecord = this.state.prevReport[i];
      if (prevRecord.id === record.id && (prevRecord.launchName !== record.launchName || prevRecord.version !== record.version)) {
        return 'added-row';
      }
    }
    return '';
  };


  uploadSuccessCallback = () => {
    this.setState({
      prevReport: this.props.report
    });
    this.props.getReport(this);
  };

  downloadJson = () => {
    let data: any = this.props.report.map((val: any)=>{
      return ({launch_name:val.launchName, version:val.version});
    });
    let name = 'game_versions_'+ new Date().toISOString();
    downloadObjectAsJson(data,name);
  };

  renderTable() {
    //table
    let columns: any = [
      {
        title: localization.GAME_ID_COLUMN[lang],
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
        title: localization.GAME_COLUMN[lang],
        dataIndex: 'gameName',
        key: 'gameName',
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
        title: localization.LAUNCH_NAME_COLUMN[lang],
        dataIndex: 'launchName',
        key: 'launchName',
        sorter: false,
        editable: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {}
          };
        }
      },
      {
        title: localization.VERSION_COLUMN[lang],
        dataIndex: 'version',
        key: 'version',
        sorter: false,
        editable: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {}
          };
        }
      },
      {
        title: localization.STATUS_COLUMN[lang],
        dataIndex: 'disabled',
        key: 'disabled',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: (
              <div style={{textAlign:'center'}}>
                <Popconfirm
                  icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                  okType={'danger'}
                  title={value === 1?localization.SURE_TO_ENABLE[lang]:localization.SURE_TO_DISABLE[lang]}
                  onConfirm={() => this.props.disableGame(this, row.id)}
                  onCancel={() => {
                  }}
                >
                  <Tag color={value === 0 ? "green" : "red"}>{this.getStatusNameById(value)}</Tag>
                  <Switch
                    checked={value === 1}
                    checkedChildren={<Icon type="check"/>}
                    unCheckedChildren={<Icon type="close"/>}/>
                </Popconfirm>
              </div>),
            props: {}
          };
        }
      },
      // {
      //   title: "Active",
      //   dataIndex: 'active',
      //   key: 'active',
      //   sorter: false,
      //   editable: false,
      //   render: (value: any, row: any, i: number) => {
      //     return {
      //       children: (
      //         <div style={{textAlign:'center'}}>
      //           <Tag color={value === 0 ? "green" : "red"}>{this.getStatusNameById(value)}</Tag>
      //           <Switch
      //             onChange={() => {
      //               //this.props.disableGame(this, row.id)
      //             }}
      //             checked={value === 1}
      //             checkedChildren={<Icon type="check"/>}
      //             unCheckedChildren={<Icon type="close"/>}/>
      //         </div>),
      //       props: {}
      //     };
      //   }
      // },
      {
        title: localization.OPERATION_COLUMN[lang],
        sorter: false,
        dataIndex: 'operation',
        key: 'operation',
        render: (text: any, record: any) => {
          return (
            <div>
              <Popconfirm
                icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                okType={'danger'}
                title={localization.SURE_TO_DELETE[lang]}
                onConfirm={() => this.props.deleteVersion(this, record.id)}
                onCancel={() => {
                }}
              >
                <a style={{marginLeft: '10px'}}>{localization.DELETE[lang]}</a>
              </Popconfirm>
            </div>
          );
        }
      }];

    let roleId = localStorage.getItem('roleId') as string;
    let role: string | undefined = getRoleById(parseInt(roleId));
    if (role === roles.DISTRIBUTOR.name) {
      columns.pop();
    }
    if (this.props.metadata.canDisable === 0) {
      columns.pop();
    }

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
          editing: this.isEditing(),
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
    //rooms field
    let loading = this.props.loadingReport;
    return (<DataTable
      rowClassName={this.setRowClassName}
      additionalComponents={components}
      columns={columns}
      onTableChange={this.onTableChange}
      loading={loading}
      data={tableData}/>)
  }

  render() {
    let select = [
      {
        positionId: 1,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.gameId,
        name: localization.GAME_INPUT[lang],
        title: localization.PICK_GAME[lang],
        data: this.props.missedVersionList.map((val: any) => ({...val, value: val.name})),
        handlers: {
          onChange: this.selectMissedVersion,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 2,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.version,
        placeholder: localization.VERSION_INPUT[lang],
        label: localization.INPUT_VERSION[lang],
        onChange: this.inputVersion
      },
      {
        positionId: 3,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.launchName,
        placeholder: localization.LAUNCH_NAME_INPUT[lang],
        label: localization.INPUT_LAUNCH_NAME[lang],
        onChange: this.inputLaunch
      }];

    let buttons = [
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: localization.ADD_GAME_VERSION[lang]
      },
      {
        onClick: this.edit,
        icon: 'edit',
        text: localization.EDIT[lang],
        isNextState: this.state.isEditing,
        nextStateBtns: [
          {
            popconfirm: {
              title: localization.SURE_TO_SAVE[lang],
              onConfirm: this.save,
              onCancel: this.cancel
            },
            onClick: () => {
            },
            icon: 'save',
            text: localization.SAVE[lang]
          },
          {
            onClick: this.cancel,
            icon: 'meh',
            className: 'margin-top-for-upload-btn',
            text: localization.CANCEL[lang]
          }
        ]
      },
      {
        onClick: this.downloadJson,
        icon: 'download',
        text: localization.CLICK_TO_DOWNLOAD[lang],
        type: 'default',
        omitRender: isDeviceMobileAndTablet()
      }
    ];

    let uploadSuccessCallbackObj: any = {uploadSuccessCallback: this.uploadSuccessCallback};

    let roleId = localStorage.getItem('roleId') as string;
    let role: string | undefined = getRoleById(parseInt(roleId));
    if (role === roles.DISTRIBUTOR.name) {
      buttons = [];
      uploadSuccessCallbackObj = {};
    }
    return (
      <div className={'gutter-box-padding'}>
        <ModalComponent
          handleOk={() => {
            this.props.addVersion(this)
          }}
          handleCancel={() => {
            this.setState({
              showModal: false
            })
          }}
          loading={this.props.loadingMissedVersion}
          filterInputs={select}
          modalTitle={localization.ADD_GAME_VERSION[lang]}
          visible={this.state.showModal}/>
        <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            isAddPanelLocked={true}
            {...uploadSuccessCallbackObj}
            title={localization.GAME_VERSION_SETTINGS[lang]}
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

export const GameVersionSettings = withRouter(GameVersionSettingsVO);
