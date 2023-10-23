import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Form, Input, Icon, Select} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import {FilterColumn} from "app/components/FilterColumn";
import localization from "app/localization";
import {message} from 'antd';

import './style.css'

const FormItem = Form.Item;
const {Option} = Select;
import {
  concatParamsToURL,
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
import {LINK_HISTORY_DETAILS} from "app/components/HelpComponent/anchorId";
import {AddPanel} from "app/components/AddPanel";
import {ModalComponent} from "app/components/ModalComponent";

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

interface dataToSaveI {
  id: number | undefined;
  name: string | undefined;

  [key: string]: any;
}

export namespace BetGroup {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    changeReport: (that: any, obj: any) => void;
    addGroup: (that: any, operation: 'create'|'copy', copyId?: number, copyName?: string) => void;
    deleteGroup: (that: any, id: number) => void;

    sort: ISort;
    report: any;
    metadata: any;
    loadingReport: boolean;
    pagination: IPagination;
    path: string;
    newRecordId: number;

    appliedColumnFilter: any;
  }

  export interface State {
    editingKey: any;
    showModal: boolean;
    id: string;
    name: string;
    minBet: number;
    maxBet: number;
    maxWin: number;
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
  getInput = (onChangeInput: any, record: any, dataIndex: any, inputType?: string) => {
    switch (inputType) {
      default: {
        return <Input onChange={(e: any) => {
          onChangeInput(e, record, dataIndex)
        }} size={'small'}/>;
      }
    }
  };

  render() {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      record,
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
                  })(this.getInput(onChangeInput, record, dataIndex, inputType))}
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
    currencyList: state.filter.currencyList,
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    loadingReport: state.table.loadingReport,
    path: state.router.location.pathname,
    newRecordId: state.table.newRecordId,
    metadata: state.table.metadata
  }),
  (dispatch: any): any => ({
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
        searchKey: 'name',
        searchValue: that.props.appliedColumnFilter.nameGroup && that.props.appliedColumnFilter.nameGroup[0] || '-1',
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.BET_GROUP_LIST, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params = {
        searchKey: 'name',
        searchValue: val.filter.nameGroup && val.filter.nameGroup[0] || '-1',
        page: val.pagination.current,
        limit: val.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.BET_GROUP_LIST, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    changeReport: (that: any, obj: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.BET_GROUP_LIST,
        method: ajaxRequestTypes.METHODS.PUT,
        params: obj
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({
            editingKey: '',
            dataToSave: {
              id: undefined,
              name: undefined
            }
          });
          that.props.getReport(that, false);
        }
      });
    },
    addGroup: (that: any, operation: 'create'|'copy', copyId?: number, copyName?: string) => {
      if (operation === 'create' && !that.state.name) { return }
      const isOperationCopy = operation === 'copy';
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        name: isOperationCopy ? copyName : that.state.name,
        minBet: -1,
        maxBet: that.state.maxBet,
        maxWin: -1,
        operation,
        id: isOperationCopy ? copyId : null
      };
      let data = {
        url: api.BET_GROUP_LIST,
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
    deleteGroup: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.DELETE_REPORT);
      let params = {
        id: id
      };
      let data = {
        url: api.BET_GROUP_LIST,
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
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    }
  })
)

class BetGroupVO extends React.Component<BetGroup.Props, BetGroup.State> {

  constructor(props: BetGroup.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);

    this.state = {
      editingKey: '',
      showModal: false,
      id: '',
      name: '',
      minBet: -1,
      maxBet: 50,
      maxWin: -1,
      dataToSave: {
        id: undefined,
        name: undefined
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

  goToBetGroup = (groupId: number) => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.BET_GROUP_SETTING}?groupId=${groupId}`);
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

  inputName = (e: any) => {
    this.setState({
      name: e.target.value
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

  save = (form: any, key: any) => {
    form.validateFields((error: any, row: any) => {
      if (error) {
        return;
      }
      if(this.state.dataToSave.name){
        this.props.changeReport(this, this.state.dataToSave);
      }
    });
  };

  cancel = () => {
    this.setState({
      editingKey: '',
      dataToSave: {
        id: undefined,
        name: undefined
      }
    });
  };

  isEditing = (record: any) => {
    return record.key === this.state.editingKey;
  };

  edit = (key: any, row:any) => {
    this.setState({
      editingKey: key,
      dataToSave: {
        ...this.state.dataToSave
      }
    });
  };

  onFilterColumn(selectedKeys: any, confirm: any) {
    confirm();
  }

  onResetFilterColumn(clearFilters: any) {
    clearFilters();
  }

  onChangeInput = (e: any, row: any, dataIndex: string, isSelect?: boolean) => {
    let prevValue: dataToSaveI = {
      id: this.state.dataToSave.id || row.id,
      name: this.state.dataToSave.name || row.name
    };
    let dataToSave = {
      ...prevValue,
      [dataIndex === 'gameName'?'name':dataIndex]: isSelect ? e : e.target.value
    };
    this.setState({
      dataToSave
    });
  };

  addHandler = () => {
    this.setState({
      showModal: true,
      id: '',
      name: ''
    })
  };

  setRowClassName = (record: any): string => {
    if (this.state.dataToSave.id === record.id) {
      return 'changed-row';
    }
    if (record.id === this.props.newRecordId) {
      return 'added-row';
    }
    return '';
  };

  maxBetOptions = (maxBets: string[]) => {
    return maxBets.map((option: string) => {
      return (
        <Option
          key={option}
          value={option}>{option}</Option>
      )
    })

  }


  uploadSuccessCallback = () => {
    this.setState({
      prevReport: this.props.report
    });
    this.props.getReport(this);
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
        title: localization.GROUP_COLUMN[lang],
        dataIndex: 'name',
        key: 'nameGroup',
        editable: true,
        render: (value: any, row: any, i: number) => {
          return {
            children: <a onClick={() => this.goToBetGroup(row.id)}>{`${value}`}</a>,
            props: {
              style: {
                 fontWeight: '700'
               }
            }
          };
        },
        filteredValue: appliedColumnFilter.nameGroup || null,
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
        title: 'Game Count',
        dataIndex: 'gameCount',
        key: 'gameCount',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: localization.ROOM_COUNT_COLUMN[lang],
        dataIndex: 'roomCount',
        key: 'roomCount',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value,
            props: {
              style: {
                fontStyle: 'italic'
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
                        onCancel={() => this.cancel()}
                      >
                        <a style={{marginRight: 8}}>
                          {localization.SAVE[lang]}
                        </a>
                      </Popconfirm>
                    )}
                  </EditableContext.Consumer>
                  <a
                    href="javascript:"
                    onClick={() => this.cancel()}>
                    {localization.CANCEL[lang]}
                  </a>
                </span>
              ) : (
                <span>
                  {
                    <Popconfirm
                      icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                      okType={'danger'}
                      title={'Sure to copy?'}
                      onConfirm={() => this.props.addGroup(this, 'copy', record.id, record.name)}
                      onCancel={() => {}}
                    >
                      <a style={{marginLeft: '10px'}}>{'Copy'}</a>
                    </Popconfirm>
                  }
                  <a style={{marginLeft: '10px'}} onClick={() => this.edit(record.key, record)}>{localization.EDIT[lang]}</a>
                  {
                    record.roomCount > 0 ? 
                      <span style={{marginLeft: '10px'}}>Delete</span> :
                      <Popconfirm
                        icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                        okType={'danger'}
                        title={localization.SURE_TO_DELETE[lang]}
                        onConfirm={() => this.props.deleteGroup(this, record.id)}
                        onCancel={() => {}}
                      >
                        <a style={{marginLeft: '10px'}}>{localization.DELETE[lang]}</a>
                      </Popconfirm> 
                  }
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
          inputType: col.inputType,
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

    let tableData = this.props.report.map((val: any, i: number) => Object.assign({}, val, {key: val.id}));
    
    //rooms field
    let loading = this.props.loadingReport;
    return (<DataTable
      rowClassName={this.setRowClassName}
      additionalComponents={components}
      columns={columns}
      onTableChange={this.onTableChange}
      loading={loading}
      pagination={this.props.pagination}
      data={tableData}/>)
  }

  selectMaxBet = (maxBet: number) => {
    this.setState({
      maxBet: +maxBet
    });
  }
  
  inputMaxWin = (maxWin: number) => {
    if (`${maxWin}`.match(/^[0-9-]+$/)) {
      this.setState({
        maxWin: +maxWin
      });
    } else {
      this.setState({
        maxWin: -1
      });
    }
  }

  render() {

    let buttons = [
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: 'Add Bet Group'
      }];

      const maxBets = '1;2;3;4;5;6;7;8;9'
        .split(';').map(x=>`${x};`)
        .map(x=> x
            .trim()
            .repeat(10)
            .slice(0, -1)
            .split(';')
            .map((x,i)=>+(x+'0'.repeat(i)))
            .filter(x=>x<=5000000)
        )
        .reduce((acc, cur)=>(acc=[...acc, ...cur],acc))
        .sort((a,b)=>a-b)
        .map(x=>`${x}`);

      let select = [
        {
          positionId: 1,
          inputType: 'textInput',
          required: true,
          isNeedToRender: true,
          value: this.state.name,
          placeholder: 'Bet Group Name',
          label: 'Input Bet Group Name',
          onChange: this.inputName
        },
        {
          positionId: 2,
          inputType: 'select',
          required: true,
          isNeedToRender: true,
          currValue: `${this.state.maxBet}`,
          name: 'Max Bet',
          title: 'Select Max Bet',
          customOptions: this.maxBetOptions,
          data: maxBets,
          handlers: {
            onChange: this.selectMaxBet,
            onFocus: this.onFocusHandler,
            onBlur: this.onBlurHandler
          }
        }/* ,
        {
          positionId: 3,
          inputType: 'numberValue',
          required: true,
          isNeedToRender: true,
          value: this.state.maxWin,
          min: -1,
          max: 500000000,
          name: 'Max Win',
          placeholder: 'Max Win',
          label: 'Input Max Win:',
          style: {width: '100%'},
          onChange: this.inputMaxWin
        } */
      ];

    // let uploadSuccessCallbackObj: any = {uploadSuccessCallback: this.uploadSuccessCallback};

    return (
      <div className={'gutter-box-padding'}>
        {<ModalComponent
          handleOk={() => {
            this.props.addGroup(this, 'create')
          }}
          handleCancel={() => {
            this.setState({
              showModal: false
            })
          }}
          filterInputs={select}
          modalTitle={'Add Bet Group'}
          visible={this.state.showModal}/>}
        <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            // uploadSuccessCallback= {this.uploadSuccessCallback}
            title={'Add Bet Group'}
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

export const BetGroup = withRouter(BetGroupVO);
