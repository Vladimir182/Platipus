import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Icon, TreeSelect, Form, Input} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import {message} from 'antd';
import './style.css'

import {
  concatParamsToURL, convertSelectedTreeValuesToNumbers, formatNumberData, formatTableData, formatTreeData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,
  sortTableOrder
} from 'app/utils'
import {
  previousPage, selectRooms, selectWithoutKeysRooms
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
import {FilterColumn} from "app/components/FilterColumn";
import {AddPanel} from "app/components/AddPanel";
import {ModalComponent} from "app/components/ModalComponent";
import {IRoom} from "app/reducers/filter";

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

interface dataToSaveItemI {
  id: number;
  value: string;
}
 
interface dataToSaveI {
  names: dataToSaveItemI[];
}

export namespace ApiKeysSettings {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    addApiKeys: (that: any) => void;
    deleteOption: (that: any, id: number) => void;
    changeReport: (that: any, obj: any) => void;
    selectRooms: (arr: string[]) => void;
    selectWithoutKeysRooms: (arr: string[]) => void;
    getRoomList: (that: any) => void;
    getWithoutKeyRoomList: (that: any) => void;

    sort: ISort;
    report: any;
    reportTotal: any;
    loadingReport: boolean;
    loadingWithoutKeysRooms: boolean;
    pagination: IPagination;
    path: string;
    appliedColumnFilter: any;
    newRecordId: number;
    roomsList: IRoom[];
    withoutKeysRoomsList: IRoom[];
    selectedRooms: string[];
    selectedWithoutKeysRooms: string[];
  }

  export interface State {
    data: any;
    id: number | undefined;
    showModal: boolean;
    editingKey: any;
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
                <Form.Item style={{margin: 0}}>
                  {getFieldDecorator(dataIndex, {
                    rules: [{
                      required: true,
                      message: `${localization.PLEASE_INPUT[lang]} ${title}!`,
                    }],
                    initialValue: record[dataIndex],
                  })(this.getInput(onChangeInput, record, dataIndex))}
                </Form.Item>
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
    newRecordId: state.table.newRecordId,
    roomsList: state.filter.roomsList,
    withoutKeysRoomsList: state.filter.withoutKeysRoomsList,
    selectedRooms: state.filter.selectedRooms,
    selectedWithoutKeysRooms: state.filter.selectedWithoutKeysRooms,
    loadingWithoutKeysRooms: state.filter.loadingWithoutKeysRooms,
  }),
  (dispatch: any): any => ({
    getReport: (that: any, needResetPagination?: boolean) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        searchKey: 'name',
        searchValue: that.props.appliedColumnFilter.nameApiKey && that.props.appliedColumnFilter.nameApiKey[0] || '""',
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList),
      };
      let data = {
        url: concatParamsToURL(api.GET_API_KEYS, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params = {
        searchKey: 'name',
        searchValue: val.filter.nameApiKey && val.filter.nameApiKey[0] || '""',
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        roomsId: that.props.selectedRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedRooms, that.props.roomsList)
      };
      let data = {
        url: concatParamsToURL(api.GET_API_KEYS, params),
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
    addApiKeys: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        roomsId: that.props.selectedWithoutKeysRooms.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedWithoutKeysRooms, that.props.withoutKeysRoomsList)
      };
      let data = {
        url: api.GET_API_KEYS,
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
        url: api.GET_API_KEYS,
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
        url: api.GET_API_KEYS,
        method: ajaxRequestTypes.METHODS.PUT,
        params: {...obj, operation: 'edit'}
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({
            editingKey: '',
            dataToSave: {
              names: []
            }
          });
          that.props.getReport(that, false);
        }
      });
    },
    getRoomList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: api.GET_ROOM_LIST,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getWithoutKeyRoomList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.WITHOUT_KEY_ROOM_LIST);
      let data = {
        url: api.GET_WITHOUT_KEY_ROOM_LIST,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    selectRooms: (arr: string[]) => {
      dispatch(selectRooms(arr))
    },
    selectWithoutKeysRooms: (arr: string[]) => {
      dispatch(selectWithoutKeysRooms(arr))
    },
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    }
  })
)

class ApiKeysSettingsVO extends React.Component<ApiKeysSettings.Props, ApiKeysSettings.State> {

  constructor(props: ApiKeysSettings.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);

    this.state = {
      data: [],
      id: undefined,
      showModal: false,
      editingKey: '',
      dataToSave: {
        names: []
      }
    };
  }

  componentDidMount() {
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
      this.props.getRoomList(this);
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

  edit(key: any) {
    this.setState({editingKey: key});
  }

  save(form: any, key: any) {
    form.validateFields((error: any, row: any) => {
      if (error) {
        return;
      }

      if (this.state.dataToSave.names.length !== 0) {
        this.props.changeReport(this, this.state.dataToSave);
      }
    });
  }

  cancel = (key: any) => {
    this.setState({
      editingKey: '',
      dataToSave: {
        names: []
      }
    });
  };

  isEditing = (record: any) => {
    return record.key === this.state.editingKey;
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
          names: names
        }
      });
      console.log('names: ', names);
    } else {
      console.log('dataIndex does not exists')
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
        key: 'nameApiKey',
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
        filteredValue: appliedColumnFilter.nameApiKey || null,
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
        title: localization.ROOM_NAME_AND_ID_COLUMN[lang],
        dataIndex: 'roomName',
        key: 'roomName',
        render(value: any, row: any, i: number) {
          return {
            children: `${value}(#${row.roomId})`,
            props: {
              style: {
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: localization.USER_COLUMN[lang],
        dataIndex: 'userName',
        key: 'userName',
        render(value: any, row: any, i: number) {
          return {
            children: `${value}(#${row.userId})` ,
            props: {
              style: {
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
          const editable = this.isEditing(record);;
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
              )
              :
              (
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
      }
    ];

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
    this.props.getWithoutKeyRoomList(this);
    this.props.selectWithoutKeysRooms([]);
    this.setState({
      showModal: true,
      id: undefined
    })
  };

  render() {
    let buttons = [
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: localization.ADD_API_KEY[lang],
        loading:this.props.loadingReport
      },
      {
        onClick: this.onShowReportClick,
        icon: 'reload',
        text: localization.SHOW_DATE_BY_FILTER[lang],
        loading:this.props.loadingReport
      }
    ];
    const rooms = [
      {
        name: localization.PICK_ROOMS[lang],
        inputType: 'treeSelect',
        required: false,
        isNeedToRender: true,
        props: {
          allowClear: true,
          value: this.props.selectedRooms,
          treeData: formatTreeData(this.props.roomsList,true),
          onChange: this.props.selectRooms,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: localization.PLEASE_SELECT[lang]
        }
      }];
    const withoutKeysRooms = [
      {
        name: localization.PICK_WITHOUT_KEYS_ROOMS[lang],
        inputType: 'treeSelect',
        required: false,
        isNeedToRender: true,
        props: {
          allowClear: true,
          value: this.props.selectedWithoutKeysRooms,
          treeData: formatTreeData(this.props.withoutKeysRoomsList,true),
          onChange: this.props.selectWithoutKeysRooms,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: localization.PLEASE_SELECT[lang]
        }
      }];
    return (
      <div className={'gutter-box-padding'}>
        <ModalComponent
          loading={this.props.loadingWithoutKeysRooms}
          elementsInRow={1}
          handleOk={() => {
            this.props.addApiKeys(this)
          }}
          handleCancel={() => {
            this.setState({
              showModal: false
            })
          }}
          modalTitle={localization.ADD_API_KEY[lang]}
          filterInputs={withoutKeysRooms}
          visible={this.state.showModal}/>
        <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            filterInputs={rooms}
            title={localization.API_KEYS_SETTINGS[lang]}
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

export const ApiKeysSettings = withRouter(ApiKeysSettingsVO);
