import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Form, Input, Icon} from 'antd';
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
  sortTableOrder
} from 'app/utils'
import {
  previousPage
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
import {FilterColumn} from "app/components/FilterColumn";
import {AddPanel} from "app/components/AddPanel";
import {ModalComponent} from "app/components/ModalComponent";
 
const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';
 
 
interface dataToSaveItemI {
  id: number;
  value: string;
}
 
interface dataToSaveI {
  names: dataToSaveItemI[];
  values: dataToSaveItemI[];
}
 
export namespace WalletOptionsSettings {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    addWalletOption: (that: any) => void;
    deleteOption: (that: any, id: number) => void;
    changeReport: (that: any, obj: any) => void;
 
    sort: ISort;
    report: any;
    reportTotal: any;
    loadingReport: boolean;
    pagination: IPagination;
    path: string;
    appliedColumnFilter: any;
    newRecordId: number;
  }
 
  export interface State {
    data: any;
    editingKey: any;
    id: number | undefined;
    showModal: boolean;
    walletName: string;
    walletValue: string;
    dataToSave: dataToSaveI;
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
 
// const rowSelection = {
//   onChange: (selectedRowKeys: any,selectedRows: any)=>{
//     console.log(selectedRowKeys, selectedRows)
//   }
// };
 
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
        searchKey: 'name',
        searchValue: that.props.appliedColumnFilter.nameWalletOption && that.props.appliedColumnFilter.nameWalletOption[0] || '""',
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.GET_WALLET_OPTIONS, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params = {
        searchKey: 'name',
        searchValue: val.filter.nameWalletOption && val.filter.nameWalletOption[0] || '""',
        page: val.pagination.current,
        limit: val.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.GET_WALLET_OPTIONS, params),
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
    addWalletOption: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        name: that.state.walletName,
        value: that.state.walletValue
      };
      let data = {
        url: api.GET_WALLET_OPTIONS,
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
    deleteOption: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.DELETE_REPORT);
      let params = {
        id: id
      };
      let data = {
        url: api.GET_WALLET_OPTIONS,
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
 
class WalletOptionsSettingsVO extends React.Component<WalletOptionsSettings.Props, WalletOptionsSettings.State> {
 
  constructor(props: WalletOptionsSettings.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
 
    this.state = {
      data: [],
      editingKey: '',
      id: undefined,
      showModal: false,
      walletName: '',
      walletValue: '',
      dataToSave: {
        names: [],
        values: []
      }
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
 
  componentWillUnmount() {
    this.props.resetTableData();
  }
 
  onFocusHandler() {
    console.log('focus');
  }
 
  onBlurHandler() {
    console.log('blur');
  }
 
  setRowClassName = (record: any): string => {
    for (let i = 0; i < this.state.dataToSave.names.length; i++) {
      let ver = this.state.dataToSave.names[i];
      if (ver.id === record.id) {
        return 'changed-row';
      }
    }
    for (let i = 0; i < this.state.dataToSave.values.length; i++) {
      let values = this.state.dataToSave.values[i];
      if (values.id === record.id) {
        return 'changed-row';
      }
    }
    if(record.id === this.props.newRecordId) {
      return 'added-row';
    }
    return '';
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
 
  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_GAME_DATA_REPORT}`);
  };
 
  edit(key: any) {
    this.setState({editingKey: key});
  }
 
  save(form: any, key: any) {
    form.validateFields((error: any, row: any) => {
      if (error) {
        return;
      }
      if (this.state.dataToSave.names.length !== 0 || this.state.dataToSave.values.length !== 0) {
        this.props.changeReport(this, this.state.dataToSave);
      }
    });
  }
 
  cancel = (key: any) => {
    this.setState({
      editingKey: '',
      dataToSave: {
        names: [],
        values: []
      }
    });
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
      console.log('names: ', names);
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
      console.log('values: ', values);
    }
  };
 
  renderTable() {
    //table
    let appliedColumnFilter = this.props.appliedColumnFilter || {};
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
        title: (localization.NAME_COLUMN as any)[lang],
        dataIndex: 'name',
        key: 'nameWalletOption',
        sorter: false,
        editable: true,
        render: (text: any, record: any) => {
          return {
            children: text,
            props: {
              style: {
                fontWeight: '700',
              }
            }
          };
        },
        filteredValue: appliedColumnFilter.nameWalletOption || null,
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
        title: localization.VALUE_COLUMN[lang],
        dataIndex: 'value',
        key: 'value',
        editable: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                fontWeight: '700',
                textAlign: 'left'
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
          const editable = this.isEditing(record);
          return (
            <div>
              {editable ? (
                <span>
                  <EditableContext.Consumer>
                    {form => (
                      <Popconfirm
                        title={localization.SURE_TO_SAVE[lang]}
                        onConfirm={() => this.save(form, record.key)}
                        onCancel={() => this.cancel(record.key)}
                      >
                        <a style={{marginRight: 8}}>
                          {localization.SAVE[lang]}
                        </a>
                      </Popconfirm>
                    )}
                  </EditableContext.Consumer>
                  <a
                    href="javascript:"
                    onClick={() => this.cancel(record.key)}>
                    {localization.CANCEL[lang]}
                  </a>
                </span>
              ) : (
                <span>
                  <a onClick={() => this.edit(record.key)}>{localization.EDIT[lang]}</a>
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
              )}
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

    return (<DataTable
      // rowSelection = {rowSelection}
      // rowClassName={this.setRowClassName}
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
      walletName: '',
      walletValue: ''
    })
  };
 
  inputWalletValue = (e: any) => {
    this.setState({
      walletValue: e.target.value
    });
  };
 
  inputWalletName = (e: any) => {
    this.setState({
      walletName: e.target.value
    });
  };
 
  render() {
    let buttons = [
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: localization.ADD_WALLET_OPTION[lang]
      },
      {
        onClick: this.onShowReportClick,
        icon: 'reload',
        text: localization.SHOW_DATE_BY_FILTER[lang],
        loading:this.props.loadingReport
      }
    ];
    let select = [
      {
        positionId: 1,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.walletName,
        placeholder: localization.NAME_INPUT[lang],
        label: localization.INPUT_NAME[lang],
        onChange: this.inputWalletName
      },
      {
        positionId: 2,
        inputType: 'textInput',
        required: false,
        isNeedToRender: true,
        value: this.state.walletValue,
        placeholder: localization.VALUE_INPUT[lang],
        label: localization.INPUT_VALUE[lang],
        onChange: this.inputWalletValue
      }
    ];
    return (
      <div className={'gutter-box-padding'}>
        <ModalComponent
          handleOk={() => {
            this.props.addWalletOption(this)
          }}
          handleCancel={() => {
            this.setState({
              showModal: false
            })
          }}
          modalTitle={localization.ADD_WALLET_OPTION[lang]}
          filterInputs={select}
          visible={this.state.showModal}/>
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
 
export const WalletOptionsSettings = withRouter(WalletOptionsSettingsVO);
