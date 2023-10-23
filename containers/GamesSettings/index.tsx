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

import './style.css';

const FormItem = Form.Item;
const {Option} = Select;
import {
  concatParamsToURL, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,
  sortTableOrder
} from 'app/utils';
import { gameCategory } from "app/const/gameCategory";
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
  categoryId: number | undefined;
  lineCount: string | undefined;
  maxWinMultiplier: string | undefined;

  [key: string]: any;
}

export namespace GamesSettings {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    changeReport: (that: any, obj: any) => void;
    addGames: (that: any) => void;
    deleteGames: (that: any, id: number) => void;

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
    categoryId: number | undefined;
    lineCount: string;
    maxWinMultiplier: string;
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
  getInput = (onChangeInput: any, record: any, dataIndex: any, inputType?: string, selectedItem?:any) => {
    switch (inputType) {
      case 'selects':
        return (
          <div>
            <Select
              style={{width: '48%'}}
              placeholder={localization.SELECT[lang]}
              size={'small'}
              value={selectedItem.categoryId}
              onChange={(e: any) => {
                onChangeInput(e, record, 'categoryId', true)
              }}
            >
              {
                gameCategory.map((option: any) => {
                  return (
                    <Option
                      key={option.id}
                      value={option.id}>{option.name}</Option>
                  )
                })
              }
            </Select>
          </div>);
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
      selectedItem,
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
                  })(this.getInput(onChangeInput, record, dataIndex, inputType, selectedItem))}
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
        searchValue: that.props.appliedColumnFilter.nameGame && that.props.appliedColumnFilter.nameGame[0] || '-1',
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.GET_GAMES_LIST_SETTING, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params = {
        searchKey: 'name',
        searchValue: val.filter.nameGame && val.filter.nameGame[0] || '-1',
        page: val.pagination.current,
        limit: val.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.GET_GAMES_LIST_SETTING, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    changeReport: (that: any, obj: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.GET_GAMES_LIST_SETTING,
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
              name: undefined,
              categoryId: undefined,
              lineCount: undefined,
              maxWinMultiplier: undefined
            }
          });
          that.props.getReport(that, false);
        }
      });
    },
    addGames: (that: any) => {
      if (!that.state.id &&
          !that.state.name &&
          !that.state.categoryId &&
          !that.state.lineCount &&
          !that.state.maxWinMultiplier
          ) {
        return
      }
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let params = {
        id: +that.state.id,
        name: that.state.name,
        categoryId: +that.state.categoryId,
        lineCount: +that.state.lineCount,
        maxWinMultiplier: +that.state.maxWinMultiplier
      };
      let data = {
        url: api.GET_GAMES_LIST_SETTING,
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
    deleteGames: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.DELETE_REPORT);
      let params = {
        id: id
      };
      let data = {
        url: api.GET_GAMES_LIST_SETTING,
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

class GamesSettingsVO extends React.Component<GamesSettings.Props, GamesSettings.State> {

  constructor(props: GamesSettings.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);

    this.state = {
      editingKey: '',
      showModal: false,
      id: '',
      name: '',
      categoryId: undefined,
      lineCount: '',
      maxWinMultiplier: '',
      dataToSave: {
        id: undefined,
        name: undefined,
        categoryId: undefined,
        lineCount: undefined,
        maxWinMultiplier: undefined
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

  inputId = (e: any) => {
    this.setState({
      id: e.target.value
    });
  };

  inputName = (e: any) => {
    this.setState({
      name: e.target.value
    });
  };

  inputLineCount = (e: any) => {
    this.setState({
      lineCount: e.target.value
    });
  };

  inputMaxWinMultiplier = (e: any) => {
    this.setState({
      maxWinMultiplier: e.target.value
    });
  };

  selectCategoryId = (id: number) => {
    this.setState({
      categoryId: id
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
      if(this.state.dataToSave.name ||
        this.state.dataToSave.categoryId ||
        this.state.dataToSave.lineCount || 
        this.state.dataToSave.maxWinMultiplier
        ){
        this.props.changeReport(this, this.state.dataToSave);
      }
    });
  };

  cancel = () => {
    this.setState({
      editingKey: '',
      dataToSave: {
        id: undefined,
        name: undefined,
        categoryId: undefined,
        lineCount: undefined,
        maxWinMultiplier: undefined
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
        ...this.state.dataToSave,
        id: row.id,
        categoryId: row.categoryId
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
      name: this.state.dataToSave.name, // || row.gameName,
      categoryId: this.state.dataToSave.categoryId || row.categoryId,
      lineCount: this.state.dataToSave.lineCount || row.lineCount,
      maxWinMultiplier: this.state.dataToSave.maxWinMultiplier || row.maxWinMultiplier
    };
    let dataToSave = {
      ...prevValue,
      [dataIndex === 'gameName'? 'name' : dataIndex]: isSelect ? e : e.target.value
    };
    this.setState({
      dataToSave
    });
  };

  addHandler = () => {
    this.setState({
      showModal: true,
      id: '',
      name: '',
      categoryId: undefined,
      lineCount: '',
      maxWinMultiplier: ''
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
        title: localization.GAME_COLUMN[lang],
        dataIndex: 'gameName',
        key: 'nameGame',
        editable: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
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
        title: 'Category',
        dataIndex: 'categoryName',
        key: 'categoryName',
        inputType: 'selects',
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
        title: 'Max Bet Multiplier',
        dataIndex: 'lineCount',
        key: 'lineCount',
        sorter: false,
        editable: true,
        render: (value: any, row: any, i: number) => {
          return {
            children: value,
            props: {}
          };
        }
      },
      {
        title: 'Max Win Multiplier',
        dataIndex: 'maxWinMultiplier',
        key: 'maxWinMultiplier',
        sorter: false,
        editable: true,
        render: (value: any, row: any, i: number) => {
          return {
            children: value,
            props: {}
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
                  <a onClick={() => this.edit(record.key, record)}>{localization.EDIT[lang]}</a>
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
          onChangeInput: this.onChangeInput,
          selectedItem: this.state.dataToSave
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

  render() {
    let select = [
      {
        positionId: 1,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.id,
        placeholder: localization.ID_INPUT[lang],
        label: localization.INPUT_ID[lang],
        onChange: this.inputId
      },
      {
        positionId: 2,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.name,
        placeholder: localization.GAME_NAME_INPUT[lang],
        label: localization.INPUT_GAME_NAME[lang],
        onChange: this.inputName
      },
      {
        positionId: 3,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.categoryId,
        name: localization.TYPE_SELECT[lang],
        title: localization.SELECT_TYPE[lang],
        customOptions: this.categoryIdOptions,
        data: gameCategory,
        handlers: {
          onChange: this.selectCategoryId,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 5,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.lineCount,
        placeholder: localization.LINE_COUNT_INPUT[lang],
        label: localization.INPUT_LINE_COUNT[lang],
        onChange: this.inputLineCount
      },
      {
        positionId: 6,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.maxWinMultiplier,
        placeholder: 'Max Win Multiplier',
        label: 'Input multiplier',
        onChange: this.inputMaxWinMultiplier
      }
    ];

    let buttons = [
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: localization.ADD_GAME[lang]
      }];

    // let uploadSuccessCallbackObj: any = {uploadSuccessCallback: this.uploadSuccessCallback};

    return (
      <div className={'gutter-box-padding'}>
        <ModalComponent
          handleOk={() => {
            this.props.addGames(this)
          }}
          handleCancel={() => {
            this.setState({
              showModal: false
            })
          }}
          filterInputs={select}
          modalTitle={localization.ADD_GAME[lang]}
          visible={this.state.showModal}/>
        <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            // uploadSuccessCallback= {this.uploadSuccessCallback}
            title={localization.GAME_SETTINGS[lang]}
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

export const GamesSettings = withRouter(GamesSettingsVO);
