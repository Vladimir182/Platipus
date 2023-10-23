import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Form, Input, TreeSelect} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {Filter, IField} from "app/components/Filter";
import {DataTable} from "app/components/Table";
import {ModalComponent} from "app/components/ModalComponent";
import localization from "app/localization";
import {message} from 'antd';

import * as baccaratConfig from './baccaratConfig';
import * as rouletteConfig from './rouletteConfig';

import './style.css';

const FormItem = Form.Item;
import {
  concatParamsToURL, convertSelectedTreeValuesToNumbers, convertGamesListToLinesCategory, formatTreeData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,
  sortTableOrder,
  isInOrderAsc
} from 'app/utils'
import {
  previousPage,
  searchByRooms, searchWithGift, selectCurrency, selectCurrencyDate, selectDateRange, selectEndDate,
  selectGames, selectGroup,
  selectOptionRange,
  selectRooms, selectStartDate
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import { gameCategory, CasinoGameCategory } from "app/const/gameCategory";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
import {ICurrList} from "app/interfaces/IState";
import {bindActionCreators} from "redux";

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

const keysToReset: {
  editingKey: string;
  editingBets: string;
  editingMinBet: string;
  editingMaxBet: string;
  editingRTP: number;
  selectedRowKeys: number[]|string[];
  [key: string]: any;
} = {
  editingKey: '',
  editingBets: '',
  editingMinBet: '',
  editingMaxBet: '',
  editingRTP: -1,
  selectedRowKeys: [],
  ...baccaratConfig.keys.reduce((acc: any, cur) => { acc[cur.key] = ''; return acc; }, {}),
  ...rouletteConfig.keys.reduce((acc: any, cur) => { acc[cur.key] = ''; return acc; }, {})
}

const isCasinoHoldemCategory = (row: any) => row && row['categoryId'] === CasinoGameCategory.HoldemCasino;

const getRowValue = (row: any, dataIndex: string) => { 
  if (isCasinoHoldemCategory(row) && dataIndex === 'minBet') {
    return `${row[`minBet1`]};${row[`minBet2`]}`
  } else if (isCasinoHoldemCategory(row) && dataIndex === 'maxBet') {
    return `${row[`maxBet2`]};${row[`maxBet1`]}`;
  } else {
    return row[dataIndex]
  }
  
};

export namespace BetGroupSetting {
  export interface Props extends RouteComponentProps<void> {
    getDateForCurrencyList: any;
    selectCurrencyDate: any;
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    getGamesList: (that: any) => void;
    getGroupList: (that: any) => void;
    changeReport: (that: any, obj: any) => void;
    selectGames: (val: string[]) => void;
    selectGroup: (val: number) => void;

    currencyList: ICurrList;
    selectedCurrencyDate: number;
    sort: ISort;
    report: any;
    reportTotal: any;
    loadingReport: boolean;
    loadingCurrency: boolean;
    pagination: IPagination;
    path: string;
    timeZone: string;
    selectedGames: string[];
    gamesList: any[];
    groupList: any[];
    metadata: any;

    prevPage: any;
  }

  export interface State {
    categoryId: number;
    selectedGroup: number;
    
    selectedRowKeys: string[]|number[];
    
    editingKey: any;
    editingMinBet?: any;
    editingMaxBet?: any;
    editingBets?: any;
    editingRTP?: number;

    selectedRowKeysPrev: string[]|number[];

    showModal: boolean;
    record: any;

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
                    rules: [
                      {
                        required: true,
                        // pattern: /^[0-9.;-]+$/,
                        message: `${localization.PLEASE_INPUT[lang]} ${title}!`,
                      },
                      {
                        required: true,
                        pattern: /^[0-9.;-]+$/,
                        message: `Incorrect symbols!`,
                      }
                  ],
                    initialValue: getRowValue(record, dataIndex),
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
    selectedCurrencyDate: state.filter.selectedCurrencyDate,
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    reportTotal: state.table.reportTotal,
    loadingReport: state.table.loadingReport,
    loadingCurrency: state.filter.loadingCurrency,
    path: state.router.location.pathname,
    timeZone: state.filter.timeZone,
    selectedGames: state.filter.selectedGames,
    gamesList: state.filter.gamesList,
    groupList: state.filter.groupList,
    metadata: state.table.metadata,
    prevPage: state.filter.previousPage
  }),
  (dispatch: any): any => ({
    ...bindActionCreators({
      selectGames,
      selectGroup
    }, dispatch),
    getGamesList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAME_LIST);
      let data = {
        url: concatParamsToURL(api.GET_GAME_LIST, {}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getGroupList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GROUP_LIST);
      let data = {
        url: concatParamsToURL(api.BET_GROUP_LIST, {}),
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
      that.resetEditingData();
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let groupIdParsed = parseInt(getParameterByName('groupId', that.props.location.search));
      const groupId = groupIdParsed ? groupIdParsed : -1;
      // let categoryId = parseInt(getParameterByName('categoryId', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = {
        gamesId: that.props.selectedGames.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, convertGamesListToLinesCategory(that.props.gamesList)),
        groupId: +groupId,
        categoryId: that.state.categoryId,
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.BET_GROUP_SETTING, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      that.resetEditingData();
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let groupIdParsed = parseInt(getParameterByName('groupId', that.props.location.search));
      const groupId = groupIdParsed ? groupIdParsed : -1;
      // let categoryId = parseInt(getParameterByName('categoryId', that.props.location.search));
      let params = {
        gamesId: that.props.selectedGames.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, convertGamesListToLinesCategory(that.props.gamesList)),
        groupId: +groupId,
        categoryId: that.state.categoryId,
        page: val.pagination.current,
        limit: val.pagination.pageSize
      };
      let data = {
        url: concatParamsToURL(api.BET_GROUP_SETTING, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    changeReport: (that: any, obj: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.BET_GROUP_SETTING,
        method: ajaxRequestTypes.METHODS.PUT,
        params: obj
      };
      const selectedRowKeysPrev = obj && obj['ids'] && obj['ids'].length ? obj['ids'] : [];
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.resetEditingData(selectedRowKeysPrev);
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

class BetGroupSettingVO extends React.Component<BetGroupSetting.Props, BetGroupSetting.State> {

  constructor(props: BetGroupSetting.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);

    let groupIdParsed = parseInt(getParameterByName('groupId', this.props.location.search));
    const groupId = groupIdParsed ? groupIdParsed : -1;
    this.state = {
      categoryId: CasinoGameCategory.Slot,
      selectedGroup: groupId,     
      selectedRowKeysPrev: [],
      showModal: false,
      record: {},
      ...keysToReset
    };
  }

  componentDidMount() {
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
      this.props.getReport(this);
    }
    this.props.getGamesList(this);
    this.props.getGroupList(this);
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

  resetEditingData = (selectedRowKeys?: number[]|string[]) => {

    let additionalData: any = {};
    if (selectedRowKeys && selectedRowKeys.length) {
      additionalData['selectedRowKeysPrev'] = selectedRowKeys;
    }

    this.setState({ 
      ...keysToReset,
      ...additionalData
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
    this.props.getReport(this, true);
  }

  onDateChangeHandler = (val: number) => {
    this.props.selectCurrencyDate(val);
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

  inputValueAsync = (value: string | number | boolean, key: string) => {
    this.setState({ ...this.state, [key]: value });
    return Promise.resolve({...this.state});
  };

  inputValue = (value: string | number | boolean, key: string) => {
    this.setState({ ...this.state, [key]: value });
  };

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_GAME_DATA_REPORT}`);
  };

  edit(key: any) {
    this.setState({editingKey: key, selectedRowKeys: [...this.state.selectedRowKeys, key]});
  }

  onChangeInput = (e: any, row: any, dataIndex: string) => {

    let rowMinBet = row.minBet;
    let rowMaxBet = row.maxBet;

    if (isCasinoHoldemCategory(row)) {
      rowMinBet = getRowValue(row, 'minBet')
      rowMaxBet = getRowValue(row, 'maxBet')
    }

    if (dataIndex === 'bet')    { 
      this.setState({ 
        editingBets: e.target.value, 
        editingMinBet: !this.state.editingMinBet ? rowMinBet : this.state.editingMinBet,
        editingMaxBet: !this.state.editingMaxBet ? rowMaxBet : this.state.editingMaxBet
      }); 
    }
    if (dataIndex === 'minBet') { 
      this.setState({ 
        editingBets: !this.state.editingBets ? row.bet : this.state.editingBets, 
        editingMinBet: e.target.value,
        editingMaxBet: !this.state.editingMaxBet ? rowMaxBet : this.state.editingMaxBet
      }); 
    }
    if (dataIndex === 'maxBet') { 
      this.setState({ 
        editingBets:  !this.state.editingBets ? row.bet : this.state.editingBets, 
        editingMinBet: !this.state.editingMinBet ? rowMinBet : this.state.editingMinBet,
        editingMaxBet: e.target.value 
      }); 
    }
    if (dataIndex === 'rtp') { 
      this.setState({ 
        editingRTP:  +e.target.value
      }); 
    }

  };

  formatBet = () => {
    let bet = '';
    switch (this.state.categoryId) {
      case CasinoGameCategory.Slot:         bet = this.formatBetSlot();           break;
      case CasinoGameCategory.BlackJack:    bet = this.formatBetBlackjack();      break;
      case CasinoGameCategory.Roulette:     bet = this.formatBetRoulette();       break;
      case CasinoGameCategory.Baccarat:     bet = this.formatBetBaccarat();       break;
      case CasinoGameCategory.VideoPoker:   bet = this.formatBetSlot();           break;
      case CasinoGameCategory.Holdem:       bet = this.formatBetBlackjack();      break;
      case CasinoGameCategory.HoldemCasino: bet = this.formatBetHoldemCasino();   break;
      default:                              bet = '';                             break;
    }
    return bet;
  }

  formatBetSlot = () => this.state.editingBets;

  formatBetBlackjack = () => {

    let coins = this.state.editingBets.trim();
    let min = +this.state.editingMinBet;
    let max = +this.state.editingMaxBet;
    if (coins[0] === ';') coins = coins.slice(1);
    if (coins[coins.length-1] === ';') coins = coins.slice(0, -1);

    if (!coins || !min || !max) return '';
  
    return [ min, coins, max ].join(';');

  }

  formatBetHoldemCasino = () => {

    let coins = this.state.editingBets.trim();
    let min = this.state.editingMinBet.trim();
    let max = this.state.editingMaxBet.trim();
    if (coins[0] === ';') coins = coins.slice(1);
    if (coins[coins.length-1] === ';') coins = coins.slice(0, -1);

    if (!coins || !min || !max) return '';
  
    return [ min, coins, max ].join(';');

  }

  formatBetRoulette = () => {
    return [
      this.state.rouletteStraight,
      this.state.rouletteSplit,   
      this.state.rouletteStreet,  
      this.state.rouletteCorner,  
      this.state.rouletteCorner,  
      this.state.rouletteLine,    
      this.state.rouletteColumn,  
      this.state.rouletteHalf,    
      this.state.rouletteTable,   
      this.state.bet           
    ].join(';');
  }

  formatBetBaccarat = () => {
    return [
      this.state.baccaratPlayer,    
      this.state.baccaratBanker,    
      this.state.baccaratTie,       
      this.state.baccaratPlayerPair,
      this.state.baccaratBankerPair,
      this.state.baccaratEitherPair,
      this.state.baccaratPerfectPair,
      this.state.baccaratBig,       
      this.state.baccaratSmall,     
      this.state.bet            
    ].join(';');
  }

  isValidBet = (bet: string, key: string) => typeof bet === 'string' && `${bet}`.length && `${bet}`.match(key === 'bet' ? /^[0-9.;-]+$/ : /^[0-9.-]+$/);

  saveModal = () => {
    const validBaccarat = !baccaratConfig.keys.map(x=> this.isValidBet(this.state[x.key], x.key) ? true : false).filter(x => x === false).length;
    const validRoulette = !rouletteConfig.keys.map(x=> this.isValidBet(this.state[x.key], x.key) ? true : false).filter(x => x === false).length;
    let isValid = false;
    switch (this.state.categoryId) {
      case CasinoGameCategory.Slot:         isValid = false;          break;
      case CasinoGameCategory.BlackJack:    isValid = false;          break;
      case CasinoGameCategory.Roulette:     isValid = validRoulette;  break;
      case CasinoGameCategory.Baccarat:     isValid = validBaccarat;  break;
      case CasinoGameCategory.VideoPoker:   isValid = false;          break;
      case CasinoGameCategory.Holdem:       isValid = false;          break;
      case CasinoGameCategory.HoldemCasino: isValid = false;          break;
      default:                              isValid = false;          break;
    }
    
    if (!isValid) { return; }

    let key = this.state.record['id'];
    this.props.changeReport(this, { 
      id: key,
      bet: this.formatBet(), 
      categoryId: this.state.categoryId,
      ids: this.state.selectedRowKeys,
      rtp: this.state.editingRTP
    });
    this.setState({showModal: false})
  }

  save(form: any, key: any) {
    const hasEditedMainKeys = this.state.editingBets || this.state.editingMinBet || this.state.editingMaxBet || this.state.editingRTP !== -1
    form.validateFields((error: any, row: any) => {
      if (error || !hasEditedMainKeys) { return; }   
        this.props.changeReport(this, { 
          id: key,
          bet: this.formatBet(), 
          categoryId: this.state.categoryId,
          ids: this.state.selectedRowKeys,
          rtp: this.state.editingRTP
        });
    });
  }

  cancel = (key: any) => {
    this.setState({
      ...keysToReset
    });
  };

  isEditing = (record: any) => {
    return this.isEditableCategory(record.categoryId) && record.key === this.state.editingKey;
  };

  deleteLineBet = (id: number) => {
    console.log('delete');
  };

  isEditableCategory = (categoryId: number) => {
    return [
      CasinoGameCategory.Slot, 
      CasinoGameCategory.BlackJack, 
      CasinoGameCategory.VideoPoker,
      CasinoGameCategory.Holdem,
      CasinoGameCategory.HoldemCasino
    ].indexOf(+categoryId) > -1;
  }

  onSelectChange = (selectedRowKeys: any) => {
    this.setState({ selectedRowKeys });
  }; 

  setRowClassName = (record: any): string => {
    for (let i = 0; i < this.state.selectedRowKeysPrev.length; i++) {
      const curSelectedRow = this.state.selectedRowKeysPrev[i];
      if (curSelectedRow === record.id) {
        // return 'changed-row';
        return 'added-row';
      }
    }
    return '';
  };

  pageToGoBack = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let page = this.props.prevPage && this.props.prevPage.help && this.props.prevPage.help.length ?
      this.props.prevPage.help : `${(roles as any)[role].route}${(roles as any)[role].children.BET_GROUP}`;
    this.props.history.push(page)
  };

  isEditableBetLimit = (context: this) => [
    CasinoGameCategory.BlackJack,
    CasinoGameCategory.Holdem,
    CasinoGameCategory.HoldemCasino
  ].indexOf(+context.state.categoryId) > -1;

  renderTable() {
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
        dataIndex: 'groupName',
        key: 'groupName',
        sorter: false,
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: `${value} (#${row.groupId})`,
            props: {}
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
        title: 'Game ID',
        dataIndex: 'gameId',
        key: 'gameId',
        editable: false,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                // fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'Lines',
        dataIndex: 'lineCount',
        key: 'lineCount',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value,
            props: {}
          };
        }
      },
      {
        title: 'Min Bet',
        dataIndex: 'minBet',
        key: 'minBet',
        sorter: false,
        editable: this.isEditableBetLimit(this) ? true : false,
        render: (value: any, row: any, i: number) => {

          if (isCasinoHoldemCategory(row)) {
            value = getRowValue(row, 'minBet')
          }

          return {
            children: value,
            props: {
              style: {
                fontWeight: '700',
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: 'Max Bet',
        dataIndex: 'maxBet',
        key: 'maxBet',
        sorter: false,
        editable: this.isEditableBetLimit(this) ? true : false,
        render: (value: any, row: any, i: number) => {

          if (isCasinoHoldemCategory(row)) {
            value = getRowValue(row, 'maxBet')
          }

          return {
            children: value,
            props: {
              style: {
                fontWeight: '700',
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: this.state.categoryId !== CasinoGameCategory.Slot ? 'Coins' : 'Bets Per Line',
        dataIndex: 'bet',
        key: 'bet',
        sorter: false,
        editable: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                fontStyle: 'italic',
                fontWeight: '700',
                background: isInOrderAsc(value) ? '#90ee90' : '#FFCCCB' // #90ee90 - green, #FFCCCB - red
              }
            }
          };
        }
      },
      {
        title: localization.RTP_COLUMN[lang],
        dataIndex: 'rtp',
        key: 'rtp',
        sorter: false,
        editable: true,
        render(value: any, row: any, i: number) {
          return {
            children: value,
            props: {
              style: {
                fontStyle: 'italic',
                fontWeight: '700'
              }
            }
          };
        }
      },
      {
        title: 'Max Exposure',
        dataIndex: 'maxWin',
        key: 'maxWin',
        sorter: false,
        editable: false,
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
                this.isEditableCategory(record.categoryId) ? 
                  <span>
                    <a onClick={() => this.edit(record.key)}>{localization.EDIT[lang]}</a>
                  </span> : 
                  <span>
                    <a onClick={() => this.editSettings(record)}>{localization.EDIT[lang]}</a>
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
          inputType: col.dataIndex === 'age' ? 'number' : 'text',
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

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record: any) => ({
        disabled: record.categoryId !== CasinoGameCategory.Slot
      })
    };

    let loading = false;
    return (<DataTable
      rowClassName={this.setRowClassName}
      rowSelection = {rowSelection}
      additionalComponents={components}
      columns={columns}
      onTableChange={this.onTableChange}
      loading={loading}
      pagination={this.props.pagination}
      data={tableData}/>)
  }

  renderFilter() {

    let fields: IField[] = [
      {
        name: localization.PLEASE_SELECT[lang],
        title: 'Select category:',
        data: gameCategory,
        currValue: this.state.categoryId,
        handlers: {
          onChange: (categoryId: string) => {
            this.inputValueAsync(categoryId, 'categoryId')
              .then(() => { this.props.selectGames([]); })
              .then(() => { this.props.getReport(this, true); });
          },
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      }
    ];

    const tProps = [
      {
        name: localization.PICK_GAME[lang],
        positionId: 2,
        props: {
          allowClear: true,
          value: this.props.selectedGames,
          treeData: formatTreeData(convertGamesListToLinesCategory(this.props.gamesList)),
          onChange: this.props.selectGames,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: localization.PLEASE_SELECT[lang]
        }
      }];
    let loading = false;

    const currentGroupId = this.state.selectedGroup;
    const currenctGroupName = this.props.groupList.filter(gl => gl.id === currentGroupId).length ? 
      this.props.groupList.filter(gl => gl.id === currentGroupId)[0]['name'] : 
      `Unknown`;

    return (<Filter
      goToDescriptionInHelp={this.goToDescriptionInHelp}
      pageTitle={`Bet Group: ${currenctGroupName} (#${currentGroupId})`}
      goBackPlayer={this.pageToGoBack}
      fields={fields}
      onShowReportClick={this.onShowReportClick}
      loadingButton={loading}
      treeProps={this.state.categoryId === 1 ? tProps : []}
      timeZone={this.props.timeZone}/>)
  }

  onCancelModal = () => {
    this.setState({
      showModal: false,
      record: {},
      ...keysToReset
    })
  };

  editSettings = (record: any) => {
    this.setState({
      showModal: true,
      selectedRowKeys: [...this.state.selectedRowKeys, record.id],
      ...baccaratConfig.keys.reduce((acc: any, cur) => { acc[cur.key] = record[cur.key]; return acc; }, {}),
      ...rouletteConfig.keys.reduce((acc: any, cur) => { acc[cur.key] = record[cur.key]; return acc; }, {}),
      record
    })
  };

  renderEditInputs() {
    let inputs: any[] = [];
    let info: any[] = [];

    if (this.state.categoryId === CasinoGameCategory.Baccarat) info = baccaratConfig.keys;
    if (this.state.categoryId === CasinoGameCategory.Roulette) info = rouletteConfig.keys;

    inputs = info.map(x => ({
      positionId: x.id,
      inputType: 'textInput',
      required: true,
      isNeedToRender: true,
      value: this.state[x.key],
      placeholder: x.name,
      label: x.name,
      validateStatus: this.isValidBet(this.state[x.key], x.key) ? 'success' : 'error',
      help: this.isValidBet(this.state[x.key], x.key) ? '' : 'Incorrect symbols or empty!',
      onChange: (e: any) => { this.inputValue(e.target.value, x.key) }
    }));

    return inputs;
  }

  isModalEdit(categoryId: number) {
    return [
      CasinoGameCategory.Roulette,
      CasinoGameCategory.Baccarat
    ].indexOf(+categoryId) > -1
  }

  render() {
    return (
      <div className={'gutter-box-padding'}>
        {
          this.isModalEdit(this.state.categoryId) ? 
          <ModalComponent
            elementsInRow={3}
            handleOk={this.saveModal}
            handleCancel={this.onCancelModal}
            modalTitle={`Edit ${this.state.record['gameName']} (#${this.state.record['gameId']}) in ${this.state.record['groupName']} (#${this.state.record['groupId']})`}
            filterInputs={this.renderEditInputs()}
            visible={this.state.showModal}/> :
            null
        }
        <Row type="flex" justify="space-around" align="middle">
          {this.renderFilter()}
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.props.report ? this.renderTable() : <SpinComponent/>}
        </Row>
      </div>);
  }
}

export const BetGroupSetting = withRouter(BetGroupSettingVO);
