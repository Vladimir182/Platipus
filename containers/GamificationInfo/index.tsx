import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import {Row, Popconfirm, Form, Icon, Select, TreeSelect} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import {FilterColumn} from "app/components/FilterColumn";
import {hasPrizeDuplicates} from "app/utils";
import localization from "app/localization";
import {message} from 'antd';
import * as moment from 'moment';

import './style.css';

// const FormItem = Form.Item;
const {Option} = Select;
import {
  concatParamsToURL, formatNumberData, formatTableData,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet,
  addZoneOffsetToISOStringForRequest,sortTableOrder, formatTreeData, convertSelectedTreeValuesToNumbers,
  groupPrizePosition,
  flatternEditPrizes,
  flatternPrizeFund,
  getConvertPrizeFund,
  getConvertIntoMinutes,
  convertExchangeSettings,
  getTodayRulesTime,
} from 'app/utils';
// import { gameCategory } from "app/const/gameCategory";
import { gamificationInfoState } from "app/const/gamificationInfoState";
import { gamificationScoreType } from "app/const/gamificationScoreType";
import { gamificationType } from "app/const/gamificationType";
import { ExchangeSettings, ExchangeSettingsType } from 'app/const/gamificationExchangeSettingsType';
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
import {GamificationModalComponent} from "app/components/GamificationModalComponent";
import { bindActionCreators } from 'redux';
import shortcuts from 'app/const/shortcuts';
import { gamificationPrizeType } from 'app/const/gamificationPrizeType';
import { EditGamificationModalComponent } from 'app/components/EditGamificationModalComponent';
import { ICurrList } from 'app/interfaces/IState';
import { ModalComponent } from 'app/components/ModalComponent';

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

export namespace GamificationInfo {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    changeReport: (that: any, obj: any) => void;
    addTournament: (that: any) => void;
    addCopyTournament: (that: any) => void;
    EditTournament: (that: any) => void;
    selectGames: (val: string[]) => string[];
    getGamificationResource: (val: any) => void;
    getCurrencyList: (that: any) => void;
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

    getGamesList: any;
    gamesList: any[];
    currencyList: ICurrList;
    gamificationsResourceList: any;

    sort: ISort;
    report: any;
    metadata: any;
    loadingReport: boolean;
    pagination: IPagination;
    path: string;
    newRecordId: number;

    appliedColumnFilter: any;

    selectedGames: string[];
  }

  export interface State {
    showModal: boolean;
    id: string;
    name: string;
    selectedResourceList?: string;
    gamificationType?: number | null;
    exchangeSettingsType?: number | null;
    currencyType?: number | null;
    categoryScoreTypeId?: number | null;
    countDown: number | null;
    graceTime: number | null;
    scoreMultiplier: number | null;
    valueBet: number | null;
    topCount: number | null;
    switchSimulation: boolean | null;
    // switchAllGames: boolean | null; 
    prizes: any[];
    prevReport: any[];
    // record: any;

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
    gamesList: state.filter.gamesList,
    selectedGames: state.filter.selectedGames,
    gamificationsResourceList: state.filter.gamificationsResourceList,
    selectedOptionRange: state.filter.selectedOptionRange,
    selectedDateRange: state.filter.selectedDateRange,
    timeZone: state.filter.timeZone,
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
      let params: any = {
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
      };
      let data = {
        url: concatParamsToURL(api.GAMIFICATION_INFO, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params = {
        page: val.pagination.current,
        limit: val.pagination.pageSize,
      };
      let data = {
        url: concatParamsToURL(api.GAMIFICATION_INFO, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    changeReport: (that: any, obj: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let data = {
        url: api.GAMIFICATION_INFO,
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
    addTournament: (that: any) => {
      const { 
        name, 
        gamificationType, 
        countDown, 
        graceTime, 
        categoryScoreTypeId, 
        scoreMultiplier,
        topCount,
        Currency,
        selectedResourceList,
        prizes,
        currencyType,
        exchangeSettingsType
      } = that.state;
      if (!name){
        message.warn('Input Name is required')
        return
      } else if(!gamificationType){
        message.warn('Gamification type is required')
        return
      } else if(!countDown && countDown !== 0){
        message.warn('Input Count down is required')
        return
      } else if(!graceTime && graceTime !== 0){
        message.warn('Input Grace Time is required')
        return
      } else if(!categoryScoreTypeId){
        message.warn('Score type is required')
        return
      } else if(!scoreMultiplier){
        message.warn('Score multiplier is required')
        return
      } else if(!topCount && topCount !== 0){
        message.warn('Score multiplier is required')
        return
      } else if(!Currency){
        message.warn('Currency is required')
        return
      } else if(!selectedResourceList){
        message.warn('Resource is required')
        return
      } else if(exchangeSettingsType === ExchangeSettings.exchangeToYourCurrency  && !currencyType) {
        message.warn('Currency is required for Exchange settings')
        return
      } else if(prizes) {
          for (let key of prizes) {
            if(key['prizePosition'] === null) {
                message.warn('Position is required')
                return
              } else if(key['prizeTypeId'] === null) {
                message.warn('Prize is required')
                return
              } else if(key['prizeCount'] === null || key['prizeCount'] === undefined) {
                message.warn('Count is required')
                return
              }
        }
        if (hasPrizeDuplicates(prizes)) {
          message.warn('It is not possible to create a prize position with identical PrizeType');
          return;
        }
      }
      let gameIds: any = that.state && that.state.Games.indexOf(0) > -1 ? [0] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, that.props.gamesList);
      let convertPrizeFund = getConvertPrizeFund(that.state.PrizeFund)
      let valueMinimalBet = that.state.switchMinimalBet ? that.state.valueBet : null;
      let convertCurrency = that.props.currencyList && that.props.currencyList.rates.find((el: any) => el.id === that.state.Currency).value;

      if(gameIds.length === 0){
        message.warn('Games are missing')
        return
      }

      if(convertPrizeFund.length === 0){
        message.warn('One of the fields of the PrizeFund is required')
        return
      }
      // let gameIds: any = that.state.switchAllGames ? [0] : that.props.selectedGames.length === 0 ? [-1] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, that.props.gamesList);
      let convertGameIds = gameIds.map((id: any) => Number(id));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT); 
      let params = {
        operation: 'create',
        name: that.state.name,
        startTime: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endTime: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        gamificationType: that.state.gamificationType,
        countDown: that.state.countDown,
        graceTime: that.state.graceTime,
        isSimulation: that.state.switchSimulation,
        // switchAllGames: that.state.switchAllGames,
        resource: that.state.selectedResourceList,
        settings:{
          ExchangeSettings: convertExchangeSettings(that.state.exchangeSettingsType, that.state.currencyType),
          MinimalBet: valueMinimalBet,
          RulesCreationTime: that.state.RulesCreationTime,
          PrizeFund: convertPrizeFund,
          Currency: convertCurrency,
          Games: convertGameIds,
          ScoreMultiplier: that.state.scoreMultiplier,
          PrizePositions: groupPrizePosition(that.state.prizes),
          ScoreType: that.state.categoryScoreTypeId,
          TopCount: that.state.topCount,
        },       
      };
      let data = {
        url: api.GAMIFICATION_INFO,
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
    addCopyTournament:(that: any) => {

      const {gamificationCopyId, copyName, selectedResourceList} = that.state

      if (!copyName){
        message.warn('Input Name is required')
        return
      } else if(!selectedResourceList){
        message.warn('Resource is required')
        return
      }

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT); 
      let params = {
        gamificationId: gamificationCopyId,
        operation: 'copy',
        name: that.state.copyName,
        startTime: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[0], that.props.timeZone),
        endTime: addZoneOffsetToISOStringForRequest(that.props.selectedDateRange[1], that.props.timeZone),
        resource: that.state.selectedResourceList,
      }
      let data = {
        url: api.GAMIFICATION_INFO,
        method: ajaxRequestTypes.METHODS.POST,
        params
      };

      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({showGamificationCopy: false});
          that.props.getReport(that, false);
        }
      });
    },
    EditTournament:(that: any) => {
      const {editPrizes} = that.state.saveEditData;
      const {CurrencyId, Type} = that.state.saveEditData.settings.ExchangeSettings;
      let gameIds: any = that.state.saveEditData.settings && that.state.saveEditData.settings.Games.indexOf(0) > -1 ? [0] : convertSelectedTreeValuesToNumbers(that.props.selectedGames, that.props.gamesList);

      if (!that.state.saveEditData.name){
        message.warn('Input Name is required')
        return
      } 
      // else {
      //   if(!/^(|[a-zA-Z0-9][a-zA-Z0-9\s]*)$/.test(that.state.saveEditData.name)){
      //     message.warn('The field is empty or contains leading spaces')
      //     return
      //   }
      // }
      if(gameIds.length === 0){
        message.warn('Games are missing')
        return
      }

      if(Type === ExchangeSettings.exchangeToYourCurrency && !CurrencyId){
        message.warn('Currency is required for Exchange settings')
        return
      }

      if(editPrizes) {
        for (let key of editPrizes) {
          if(key['prizePosition'] === null) {
              message.warn('Position is required')
              return
            } else if(key['prizeTypeId'] === null) {
              message.warn('Prize is required')
              return
            } else if(key['prizeCount'] === null || key['prizeCount'] === undefined) {
              message.warn('Count is required')
              return
            }
        } 

        if (hasPrizeDuplicates(editPrizes)) {
          message.warn('It is not possible to create a prize position with identical PrizeType');
          return;
        }

      }
      let convertGameIds = gameIds.map((el: any) => Number(el));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT); 
      let settings = {
        ...that.state.putEditData.settings,
        PrizeFund: that.state.putEditData.settings && getConvertPrizeFund(that.state.putEditData.settings.PrizeFund),
        Games: convertGameIds
      }
      if (that.state.putEditData.settings && that.state.putEditData.settings.ExchangeSettings && that.state.putEditData.settings.ExchangeSettings.Type) {
        const exchangeSettingsType = that.state.putEditData.settings.ExchangeSettings.Type
        const exchangeSettingsCurrencyId = that.state.putEditData.settings.ExchangeSettings.CurrencyId;
        const ExchangeSettings = convertExchangeSettings(exchangeSettingsType, exchangeSettingsCurrencyId);
        settings = {...settings, ExchangeSettings};
      }
      let params: any;
        params = {
          ...that.state.putEditData,
          settings
        };
      let data = {
        url: api.GAMIFICATION_INFO,
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
        url: api.GAMIFICATION_INFO,
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
    getCurrencyList: (that: any, updateId: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CURRENCY_LIST);
      let data = {
        url: concatParamsToURL(api.GET_CURRENCY_LIST, {updateId: -1}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getGamificationResource: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAMIFICATION_RESOURCE_LIST);
      let data = {
        url: api.GET_GAMIFICATION_RESOURCE,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getRoomList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: api.GET_ROOM_LIST,
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getGamesList: (that: any, platform?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.GAME_LIST);
      let params = {platform: platform};
      let data = {
        url: concatParamsToURL(api.GET_GAME_LIST, params),
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

class GamificationInfoVO extends React.Component<GamificationInfo.Props, GamificationInfo.State> {

  constructor(props: GamificationInfo.Props, context?: any) {
    super(props, context);
    this.onShowReportClick = this.onShowReportClick.bind(this);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.state = {
      showModal: false,
      showEditModal: false,
      showGamificationCopy: false,
      gamificationCopyId: null,
      id: '',
      name: '',
      gamificationType: undefined,
      exchangeSettingsType: undefined,
      currencyType: undefined,
      categoryScoreTypeId: undefined,
      countDown: null,
      graceTime: null,
      valueBet: null,
      scoreMultiplier: 1,
      topCount: null,
      switchSimulation: false,
      switchMinimalBet: false,
      Games: [],
      Currency: '',
      prizes: [],
      RulesCreationTime: [],
      selectedResourceList: undefined,
      PrizeFund: {
        Cache: null,
        FreeSpin: null,
        RaffleTicket: null,
        Gift: null,
      },
      saveEditData: {
        editPrizes: [],
        saveEditRangePicker: []     
      },
      putEditData: {},
      prevReport: [],
      lastEditMinimalBet: 0
    };

  };

  componentDidMount() {
    this.setState((state) =>({
      prizes: [ 
        ...state.prizes,
        {prizePosition: null, prizeTypeId: null, prizeCount: null}
      ]
    }));
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
      this.props.getReport(this);
      this.props.getGamesList(this);

    }
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  };

  getIsDisabledByGameId(id: number) {
    for (let i = 0; i < this.props.report.length; i++) {
      let item = this.props.report[i];
      if (item.id === id) {
        return item.disabled;
      }
    }
  };

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
  };

  componentWillUnmount() {
    this.props.resetTableData();
  };

  onFocusHandler() {
    console.log('focus');
  };

  onBlurHandler() {
    console.log('blur');
  };

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
  };

  onShowReportClick() {
    this.props.getReport(this);
  };

  inputName = (value: string | number | boolean, key: string) => {
    this.setState((state) =>({ 
      ...state,
      [key]: value
    }));
  };

  inputNameEdit = (value: string | number | boolean, key: string) => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        [key]: value
      },
      putEditData: {
        ...this.state.putEditData,
        [key]: value
      }
    });
  };

  inputsPrizeFund = (value: string | number | boolean, key: string) => {
    this.setState((state) => ({
      ...state,
      PrizeFund: {
        ...state.PrizeFund,
        [key]: value
      }
    })) 
  };

  EditInputsPrizeFund = (value: string | number | boolean, key: string) => {
    this.setState((state) => ({
      saveEditData: {
        ...state.saveEditData,
        settings: {
          ...state.saveEditData.settings,
          PrizeFund: {
            ...state.saveEditData.settings.PrizeFund,
            [key]: value
          }
        }
      },
      putEditData: {
        ...state.putEditData,
        settings:{
          ...state.putEditData.settings,
          PrizeFund: { 
            ...state.saveEditData.settings.PrizeFund,
            [key]: value
          }
        }
        
      }
    })) 
  };

  handlerEditCurrency = (currencyId: number) => {

    let convertCurrency = this.props.currencyList && this.props.currencyList.rates.find((el: any) => el.id === currencyId).value;

    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        settings: {...this.state.saveEditData.settings, Currency: convertCurrency}
      },
      putEditData: {
        ...this.state.putEditData,
        settings: {...this.state.putEditData.settings, Currency: convertCurrency}
      }
    })
  };

  handlerSwitch = () => {
    this.setState({
      switchSimulation: !this.state.switchSimulation
    })
  };

  handlerEditSwitchSimulation = () => {

    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        isSimulation: !this.state.saveEditData.isSimulation
      },
      putEditData: {
        ...this.state.putEditData,
        isSimulation: !this.state.saveEditData.isSimulation
      }
    })
  };

  handlerSwitchEditMinimalBet = () => {
    
    const curMinBet = this.getCurEditMinimalBet();
    const curLastEditMinimalBet = this.getLastEditMinimalBet();
    const lastEditMinimalBet = typeof curMinBet === 'number' ? curMinBet : curLastEditMinimalBet;
    const MinimalBet = !this.isMinimalBet() ? lastEditMinimalBet : null;
    
    let saveEditData = {
      ...this.state.saveEditData,
        settings: {
          ...this.state.saveEditData.settings,
          MinimalBet
        }
    };
    const putEditData = {
      ...this.state.putEditData,
      settings: {
        ...this.state.putEditData.settings,
        MinimalBet
      }
    }
    const stateToUpdate = {
      saveEditData,
      putEditData,
      lastEditMinimalBet
    }

    this.setState(stateToUpdate);
  };

  handlerSwitchAllGames = () => {
    this.setState((state) =>({
      ...state,
      Games: this.isCreateAllGames() ? [] : [0],
    }));
    this.props.selectGames([])
  };

  handlerSwitchMinimalBet = () => {
    this.setState((state) => ({
      ...state,
      switchMinimalBet: !this.state.switchMinimalBet
    }))
  };

  handlerEditSwitchAllGames = () => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,   
        settings: {
          ...this.state.saveEditData.settings,
           Games: this.isAllGames() ? [] : [0]
          }
      }
    });
    this.props.selectGames([])
  };

  selectGamificationType = (id: number) => {
    this.setState({
      gamificationType: id
    });
  };

  handlerExchangeSettingsType = (id: number) => {
    this.setState({
      exchangeSettingsType: id
    })
  };

  handlerCurrencyType = (id: number) => {
    this.setState({
      currencyType: id
    }) 
  };

  handlerEditCurrencyType = (id: number) => {
    this.setState((state) => ({
      saveEditData: {
        ...state.saveEditData,
        settings: { ...state.saveEditData.settings,
          ExchangeSettings: {
            ...state.saveEditData.settings.ExchangeSettings,
            CurrencyId: id
          }
        }
      },
      putEditData: {
        ...state.putEditData,
        settings: { ...state.putEditData.settings,
          ExchangeSettings: {
            ...state.saveEditData.settings.ExchangeSettings,
            CurrencyId: id
          }
        }
      }
    }))
  };

  handlerEditExchangeSettingsType = (id: number) => {

    const ExchangeSettings = {
      ...this.state.saveEditData.settings.ExchangeSettings,
      Type: id
    };

    this.setState({
      saveEditData:{
        ...this.state.saveEditData,
        settings: { 
          ...this.state.saveEditData.settings,
          ExchangeSettings
        }  
      },
      putEditData:{
        ...this.state.putEditData,
        settings: { 
          ...this.state.putEditData.settings,
          ExchangeSettings
        }      
      }      
    })
  };

  selectEditGamificationType = (id: number) => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        gamificationType: id
      },
      putEditData: {
        ...this.state.putEditData,
        gamificationType: id
      }
    });
  };

  selectScoreType = (id: number) => {
    this.setState({
      categoryScoreTypeId: id
    })
  };

  selectEditScoreType = (id: number) => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        settings: {...this.state.saveEditData.settings, ScoreType: id} 
      },
      putEditData: {
        ...this.state.putEditData,
        settings: {...this.state.putEditData.settings, ScoreType: id}
      }
    })
  };

  selectValue = (value: string | number | boolean, key: string) => {
    this.setState({
      [key]: value
    })
  };

  selectEditValue = (value: string | number | boolean, key: string) => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        [key]: value
      },
      putEditData: {
        ...this.state.putEditData,
        [key]: value
      }
    })
  };
  
  selectEditValueBet = (value: string | number | boolean, key: string) => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        settings: {...this.state.saveEditData.settings, [key]: value}
      },
      putEditData: {
        ...this.state.putEditData,
        settings: {...this.state.putEditData.settings, [key]: value}
      }
    })
  };

  selectEditScoreMultiplierValue = (value: string | number | boolean, key: string) => {
    this.setState({
      saveEditData:{
        ...this.state.saveEditData,
        settings: {...this.state.saveEditData.settings, ScoreMultiplier: Number(value)}
      },
      putEditData: {
        ...this.state.putEditData,
        settings: {...this.state.putEditData.settings, ScoreMultiplier: Number(value)}
      }
    })
  };

  selectEditTopCountValue = (value: string | number | boolean, key: string) => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        settings:{...this.state.saveEditData.settings, TopCount: Number(value)}
      },
      putEditData: {
        ...this.state.putEditData,
        settings:{...this.state.putEditData.settings, TopCount: Number(value)}
      }
    })
  };

  onChangeRangePickerHandler = (dates: Date[]) => {
    this.props.selectDateRange([dates[0].toISOString(), dates[1].toISOString()]);
  };

  editChangeRangePickerHandler = (dates: Date[]) => {
    this.props.selectDateRange([dates[0].toISOString(), dates[1].toISOString()]);
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        saveEditRangePicker: [dates[0].toISOString(), dates[1].toISOString()],
        startTime: dates[0].toISOString(),
        endTime: dates[1].toISOString(),
      },
      putEditData: {
        ...this.state.putEditData,        
        startTime: dates[0].toISOString(),
        endTime: dates[1].toISOString(),
      }
    })
  };

  createTournamentDataPicker = (date: moment.Moment) => {
    this.setState((state) => ({
      ...state,
      RulesCreationTime: date.toISOString()
    }))
  };

  editTournamentChangeDataPicker = (date: moment.Moment) => {
    this.setState((state) =>({
      saveEditData: {
        ...state.saveEditData,
        settings: {
          ...state.saveEditData.settings,
          RulesCreationTime: date.toISOString()
        }
      },
      putEditData: {
        ...state.putEditData,
        settings: {
          ...state.putEditData.settings,
          RulesCreationTime: date.toISOString()
        }
      }
    }))
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
  };

  onFilterColumn(selectedKeys: any, confirm: any) {
    confirm();
  };

  onResetFilterColumn(clearFilters: any) {
    clearFilters();
  };

  goToGamificationGroup = (gamificationId: any) => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.GAMIFICATION_GROUP}/${gamificationId}`);
  };

  goToGamificationRating = (gamificationId: any) => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.GAMIFICATION_RATING}/${gamificationId}`);
  };


  addHandler = () => {
    this.props.getGamificationResource(this)
    this.props.getCurrencyList(this);
    this.setState({
      showModal: true,
      name: '',
      gamificationType: undefined,
      exchangeSettingsType: ExchangeSettings.exchangeToEUR,
      currencyType: undefined,
      selectedResourceList: undefined,
      categoryScoreTypeId: undefined,
      countDown: 0,
      graceTime: 0,
      scoreMultiplier: 1,
      valueBet: 0,
      topCount: 0,
      switchSimulation: false,
      Currency: '',
      Games: [],
      prizes:[{
        prizePosition: null, 
        prizeTypeId: null, 
        prizeCount: null
      }],
      RulesCreationTime: getTodayRulesTime(),
      PrizeFund: {
        Cache: null,
        FreeSpin: null,
        RaffleTicket: null,
        Gift: null,
      }
    })
    this.props.selectGames([])
  };

  CancelAddTournament = () => {
    this.setState({
      showModal: false,
      name: '',
      gamificationType: undefined,
      exchangeSettingsType: undefined,
      currencyType: undefined,
      selectedResourceList: undefined,
      categoryScoreTypeId: undefined,
      countDown: 0,
      graceTime: 0,
      scoreMultiplier: 1,
      valueBet: 0,
      topCount: 0,
      switchSimulation: false,
      Games: [],
      Currency: '',
      prizes:[],
      RulesCreationTime: [],
      PrizeFund: {
        Cache: null,
        FreeSpin: null,
        RaffleTicket: null,
        Gift: null,
      },
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
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        editable: false,
        render: (value: any, row: any, i: any) => {
          return {
            // children: value,
            children: row.items > 0 ? <a onClick={() => this.goToGamificationGroup(row.id)}>{value}</a> :
            <a style={{color: 'rgba(0, 0, 0, 0.45)'}} onClick={() => this.goToGamificationGroup(row.id)}>{value}</a>,
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
        title: 'Status',
        dataIndex: 'Status',
        key: 'Status',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          let toDay = moment(new Date()).toISOString();
          let status = '';

          if(!moment(row.endTime).isAfter(toDay)){
            status = 'Finished';
          } else if(moment(toDay).isBefore(row.startTime)){
            status = 'Not Started';
          } else if(moment(row.startTime).isBefore(row.endTime)){
            status ='In Progress';
          }

          return {
            children: status,
            props: {
              style: status === 'Finished' ? {background: '#ff9900', textAlign: 'center', fontWeight: '700'} : status === 'Not Started' ? {background: '#b7b7b7',textAlign: 'center', fontWeight: '700'} : {background: '#90ee90', textAlign: 'center', fontWeight: '700'}
            }
          };
        }
      },
      {
        title: 'Start time' || (localization.TIME_COLUMN as any)[lang],
        dataIndex: 'startTime',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value
          }
        }
      },
      {
        title: 'End time' || (localization.TIME_COLUMN as any)[lang],
        dataIndex: 'endTime',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value,
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: 'Count Down',
        dataIndex: 'countDown',
        key: 'countDown',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value && getConvertIntoMinutes(value),
            props: {}
          };
        }
      },
      {
        title: 'Grace Time',
        dataIndex: 'graceTime',
        key: 'graceTime',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value && getConvertIntoMinutes(value) ,
            props: {}
          };
        }
      },
      {
        title: 'Is simulation',
        dataIndex: 'isSimulation',
        key: 'isSimulation',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value ? 'Yes' : 'No',
            props: {}
          };
        }
      },
      {
        title: 'Gamification type',
        dataIndex: 'gamificationType',
        key: 'gamificationType',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          let result = gamificationType.filter(el => el.id === value)
          return {
            children: result.length? gamificationType.filter(el => el.id === value)[0]['name'] : 1,       
            props: {}
          };
        }
      },
      {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        sorter: false,
        editable: false,
        render: (value: any, row: any, i: number) => {
          let result = gamificationInfoState.filter(el => el.id === value)
          return {
            children: result.length ? gamificationInfoState.filter(el=> el.id === value)[0]['name'] : 'unknown',
            props: {}
          };
        }
      },
      {
        title: 'Resource',
        dataIndex: 'resource',
        key: 'resource',
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
                  <a onClick={() => this.goToGamificationRating(record.id)}>Rating</a>
                  <a style={{marginLeft: '10px'}} onClick={() => this.handlerCreateGamificationCopy(record.id)}>Copy</a>
                  <a style={{marginLeft: '10px'}} onClick={() => this.handlerShowEditModal(record)}>{localization.EDIT[lang]}</a>
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

  handleChangeRangeOptions = (value: string) => {
    // this.props.selectOptionRange(value);
    for (let i = 0; i < shortcuts.length; i++) {
      let item = shortcuts[i];
      if (value === item.type) {
        this.props.dispatchRangePickerStartValue(item.start);
        this.props.dispatchRangePickerEndValue(item.end);
        break;
      }
    }
  };

  updateChildrenState = (event: any, index: any) => {
    event.persist();
    this.setState(
      (state) => ({
        ...state,
        prizes: [
          ...state.prizes.slice(0, index),
          {
            ...state.prizes[index],
            [event.target.name]: event.target.value
          },
          ...state.prizes.slice(index + 1)
        ]
      })
    );
  }

  editUpdateChildrenState = (event: any, index: any) => {
    event.persist();
    this.setState(
      (state) => {
        return ({
          saveEditData: {
            ...state.saveEditData,
            editPrizes: [
              ...state.saveEditData.editPrizes.slice(0, index),
              {
                ...state.saveEditData.editPrizes[index],
                [event.target.name]: event.target.value
              },
              ...state.saveEditData.editPrizes.slice(index + 1)
              ]
            },
          putEditData: {
            ...state.putEditData,
            settings: {
              ...state.putEditData.settings,
              PrizePositions: groupPrizePosition([
                  ...state.saveEditData.editPrizes.slice(0, index),
                  {
                    ...state.saveEditData.editPrizes[index],
                    [event.target.name]: event.target.value
                  },
                  ...state.saveEditData.editPrizes.slice(index + 1)
                ])
              }
            }
        }) 
      }    
    );
  };

   PrizePositionsConfig = [
    {
      width: 3,
      inputType: 'textInputPrizes',
      required: false,
      isNeedToRender: true,
      name: 'prizePosition',
      style: {width: '100%'},
      placeholder: 'Position',
      label: 'Position',
      onChange: (index: any) => (e: any) => this.updateChildrenState(e, index)
    },
    {
      width: 3,
      inputType: 'selectPrize',
      required: false,
      isNeedToRender: true,
      name: 'prizeTypeId',
      title: 'Prize',
      customOptions: this.categoryIdOptions,
      data: gamificationPrizeType,
      handlers: {
        // onChange: this.selectPrizeType,
        onChange: (index: any) => (e: any) => this.updateChildrenState(e, index),
        onFocus: this.onFocusHandler,
        onBlur: this.onBlurHandler
      }
    },
    {
      width: 3,
      inputType: 'prizeNumberValue',
      name: 'prizeCount',
      required: false,
      min: 0,
      max: 1000000000,
      isNeedToRender: true,
      style: {width: '100%'},
      placeholder: 'Count',
      label: 'Count',
      onChange: (index: any) =>(e: any) => this.updateChildrenState(e, index)
    },
  ];
  // PrizePositions
  getEditPrizePositionsConfig = () => {
   let EditPrizePositionsConfig = [
      {
        width: 3,
        inputType: 'textInputPrizes',
        required: true,
        isNeedToRender: true,
        name: 'prizePosition',
        style: {width: '100%'},
        placeholder: 'Position',
        label: 'Position',
        onChange: (index: any) => (e: any) => this.editUpdateChildrenState(e, index)
      },
      {
        width: 3,
        inputType: 'selectEditPrize',
        required: true,
        isNeedToRender: true,
        name: 'prizeTypeId',
        title: 'Prize',
        customOptions: this.categoryIdOptions,
        currValue: this.state.saveEditData.editPrizes.map((item: any) => item.prizeTypeId),
        data: gamificationPrizeType,
        handlers: {
          onChange: (index: any) => (e: any) => this.editUpdateChildrenState(e, index),
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        width: 3,
        inputType: 'prizeNumberValue',
        name: 'prizeCount',
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        style: {width: '100%'},
        placeholder: 'Count',
        label: 'Count',
        onChange: (index: any) =>(e: any) => this.editUpdateChildrenState(e, index)
      },
    ];
    return EditPrizePositionsConfig;
  };

  getEditPrizeFundConfig = () => {
    let EditPrizeFundConfig = [
      {
        positionId: 1,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.saveEditData.settings && this.state.saveEditData.settings.PrizeFund && this.state.saveEditData.settings.PrizeFund.Cache,
        style: {width: '100%'},
        placeholder: 'Cache',
        label: 'Cache',
        onChange: (e: any) => this.EditInputsPrizeFund(e , 'Cache')
      },
      {
        positionId: 2,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.saveEditData.settings && this.state.saveEditData.settings.PrizeFund && this.state.saveEditData.settings.PrizeFund.FreeSpin,
        style: {width: '100%'},
        placeholder: 'FreeSpin',
        label: 'FreeSpin',
        onChange: (e: any) => this.EditInputsPrizeFund(e , 'FreeSpin')
      },
      {
        positionId: 3,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value:this.state.saveEditData.settings && this.state.saveEditData.settings.PrizeFund && this.state.saveEditData.settings.PrizeFund.RaffleTicket,
        style: {width: '100%'},
        placeholder: 'RaffleTicket',
        label: 'RaffleTicket',
        onChange: (e: any) => this.EditInputsPrizeFund(e , 'RaffleTicket')
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.saveEditData.settings && this.state.saveEditData.settings.PrizeFund && this.state.saveEditData.settings.PrizeFund.Gift,
        style: {width: '100%'},
        placeholder: 'Gift',
        label: 'Gift',
        onChange: (e: any) => this.EditInputsPrizeFund(e , 'Gift')
      },
    ];
    return EditPrizeFundConfig;
  };
 
  removePrizePositionRow = (index: any) => {
    let formValues = this.state.prizes;
    formValues.splice(index, 1);
    this.setState({ formValues });
  };

  removeEditPrizePositionRow = (index: any) => {
    let formValues = this.state.saveEditData.editPrizes;
    formValues.splice(index, 1);
    this.setState({ 
      saveEditData:{
        ...this.state.saveEditData,
        settings: {
          ...this.state.saveEditData.settings,
          PrizePositions: groupPrizePosition(formValues)
        }
      },
      putEditData:{
        ...this.state.putEditData,
        settings: {
          ...this.state.putEditData.settings,
          PrizePositions: groupPrizePosition(formValues)
        }
      }
    })
  };

  addPrizePositionInputRow = () => {
    const newRow = this.mapConfigToFormRow(this.PrizePositionsConfig);
    this.setState((state) =>({
      ...state,
      prizes: [...state.prizes, newRow]
    }))  
  };

  addEditPrizePositionInputRow = () => {
    const newRow = this.mapConfigToFormRow(this.getEditPrizePositionsConfig());
    this.setState((state) => ({
      saveEditData: {
        ...state.saveEditData,
        editPrizes: [...state.saveEditData.editPrizes, newRow]
      }
    }))  
  };

  mapConfigToFormRow(configItems: any){
    return configItems.reduce((accumulator: any, configItem: any) => {
      accumulator[configItem.name] = null;
      return accumulator;
    }, {});
  };
  
  handlerCreateGamificationCopy = (id: any) => {
    this.props.getGamificationResource(this)
    this.setState({
      ...this.state,
      gamificationCopyId: id,
      showGamificationCopy: true,
      copyName: '',
    })
  };

  handlerShowEditModal = (record: any) => {
    this.props.getGamificationResource(this);
    this.props.getCurrencyList(this);
    const convertGamesRecord: string[] = record.settings.Games.map((key: any) => {
      return (`${key.Name}:${key.categoryId}-${key.Id}`)
    });
    let gameIds: any = record.settings && record.settings.Games.indexOf(0) > -1 ? [0] : convertSelectedTreeValuesToNumbers(convertGamesRecord , this.props.gamesList);
    const itemGames = gameIds.map((el: any) => this.props.gamesList.filter(game => game.id === el))
    const convertGames = itemGames.map( (el: any) => {
      const newMas = [];
      for( let key of el ){
       newMas.push(`${key.name}:${key.categoryId}-${key.id}`)
      }
      const result = newMas.join();
      return result
    })

    this.setState({
      showEditModal: true,
      saveEditData: {
        ...this.state.saveEditData,
        ...record,
        saveEditRangePicker: [record.startTime, record.endTime],
        startTime: record.startTime,
        endTime: record.endTime,
        editPrizes: flatternEditPrizes(record.settings.PrizePositions),
        countDown: getConvertIntoMinutes(record.countDown),
        graceTime: getConvertIntoMinutes(record.graceTime),
        settings:{
          ...record.settings,
          // ExchangeSettings: record.settings.ExchangeSettings,
          PrizeFund: record.settings.PrizeFund ? flatternPrizeFund(record.settings.PrizeFund) : [],
          Games: record.settings.Games.map((x: any) => x.Id),
        }
      },
      putEditData: {
        id: record.id
      }
    });
   convertGames[0] === '' ? 
    this.props.selectGames([]) : 
    this.props.selectGames(convertGames);
  };

  CancelEditModal = () => {
    this.setState({
      showEditModal: false,
      saveEditData: {
        name: '',
        selectedResourceList: undefined,
        gamificationType: undefined,
        exchangeSettingsType: undefined,
        currencyType: undefined,
        categoryScoreTypeId: undefined,
        countDown: 0,
        graceTime: 0,
        scoreMultiplier: 1,
        valueBet: 0,
        topCount: 0,
        switchSimulation: false,
        saveEditRangePicker: [],
        editPrizes: [],
        Games: [],
        RulesCreationTime: []
      }
    })
  };

  cancelGamificationCopyModal = () => {
    this.setState({
      showGamificationCopy: false,
      copyName: '',
      selectedResourceList: undefined,
    })
  };

  isCreateAllGames() {
    return  this.state && this.state.Games.indexOf(0) > -1;
  };

  isAllGames() {
   return  this.state.saveEditData.settings && this.state.saveEditData.settings.Games.indexOf(0) > -1;
  };

  isMinimalBet() {
    const minimalBet = this.getCurEditMinimalBet(); 
    return typeof minimalBet === 'number';
  };

  getCurEditMinimalBet () {
    return this.state.saveEditData.settings && this.state.saveEditData.settings.MinimalBet;
  };

  getLastEditMinimalBet () {
    return this.state.lastEditMinimalBet;
  };
  
  getMobileRangePickerHandlers = () => {
    return {
      dispatchStartValue: this.props.dispatchRangePickerStartValue,
      dispatchEndValue: this.props.dispatchRangePickerEndValue,
      handleChangeRangeOptions: this.handleChangeRangeOptions,
      selectedOptionRange: this.props.selectedOptionRange,
      selectOptionRange: this.props.selectOptionRange
    };
  };

  handlerSelectedResource = (value: any) => {
    this.setState((state) => ({
      ...state,
      selectedResourceList: value
    }))
  };

  handlerEditResource = (value: string | number | boolean, key: string) => {
    this.setState({
      saveEditData: {
        ...this.state.saveEditData,
        [key]: value
      },
      putEditData: {
        ...this.state.putEditData,
        [key]: value
      }
    });
  };

  getCopyTournamentConfig = () => {
    const mobileRangePickerHandlers = this.getMobileRangePickerHandlers();
    let CopyTournamentConfig = [
      {
        positionId: 1,
        width: 3,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.copyName,
        placeholder: localization.NAME_INPUT[lang],
        label: localization.INPUT_NAME[lang],
        onChange: (e: any) => this.inputName(e.target.value, 'copyName')
      },
      {
        positionId: 2,
        width: 1.5,
        inputType: 'rangePickerTournament',
        isNeedToRender: this.props.selectedDateRange,
        label: localization.PICK_RANGE[lang],
        required: false,
        timeZone: this.props.timeZone,
        selectedValue: this.props.selectedDateRange,
        mobileRangePicker: mobileRangePickerHandlers,
        onChange: this.onChangeRangePickerHandler,
      },
      {
        width: 1,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        name: 'Resource',
        title: 'Resource',
        allowClear: true,
        customOptions: this.categoryIdOptions,
        style: {width: '100%'},
        data: this.props.gamificationsResourceList,
        currValue: this.state.selectedResourceList,
        handlers: {
          // onChange: this.selectPrizeType,
          onChange: this.handlerSelectedResource,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
    ];
    return CopyTournamentConfig;
  };

  getTornamentInputsConfig = () => {
    const mobileRangePickerHandlers = this.getMobileRangePickerHandlers();
    let TornamentInputsConfig = [
      {
        positionId: 1,
        width: 3,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.name,
        placeholder: localization.NAME_INPUT[lang],
        label: localization.INPUT_NAME[lang],
        onChange: (e: any) => this.inputName(e.target.value, 'name')
      },
      {
        positionId: 2,
        width: 1.5,
        inputType: 'rangePickerTournament',
        isNeedToRender: this.props.selectedDateRange,
        label: localization.PICK_RANGE[lang],
        required: false,
        timeZone: this.props.timeZone,
        selectedValue: this.props.selectedDateRange,
        mobileRangePicker: mobileRangePickerHandlers,
        onChange: this.onChangeRangePickerHandler,
      },
      {
        positionId: 4,
        width: 3,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.gamificationType,
        name: localization.TYPE_SELECT[lang],
        title: 'Gamification type',
        customOptions: this.categoryIdOptions,
        data: gamificationType,
        handlers: {
          onChange: this.selectGamificationType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.countDown,
        style: {width: '100%'},
        placeholder: 'Countdown',
        label: 'Input Count down (min)',
        onChange: (e: any) => this.selectValue(e , 'countDown')
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.graceTime,
        style: {width: '100%'},
        placeholder: 'Grace Time',
        label: 'Input Grace Time (min)',
        onChange:  (e: any) => this.selectValue(e , 'graceTime')
      },
      {
        positionId: 4,
        inputType: 'select',
        width: 3,
        required: true,
        isNeedToRender: true,
        currValue: this.state.categoryScoreTypeId,
        name: 'Select score type',
        title: 'Score type' || localization.SELECT_TYPE[lang],
        customOptions: this.categoryIdOptions,
        data: gamificationScoreType,
        handlers: {
          onChange: this.selectScoreType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 1,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.scoreMultiplier,
        style: {width: '100%'},
        placeholder: 'Score multiplier',
        label: 'Score multiplier',
        onChange: (e: any) => this.selectValue(e, 'scoreMultiplier')
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.topCount,
        style: {width: '100%'},
        placeholder: 'Top count',
        label: 'Top count',
        onChange: (e: any) => this.selectValue(e , 'topCount')
      },
      {
        positionId: 5,
        inputType: 'checkbox',
        isNeedToRender: true,
        elementsInRow: 1,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            childType: 'switch',
            label: 'Simulation',
            checked: this.state.switchSimulation,
            onChange: this.handlerSwitch
          }
        ]
      },
      {
        width: 1.5,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        name: 'Resource',
        title: 'Resource',
        allowClear: true,
        customOptions: this.categoryIdOptions,
        style: {width: '100%'},
        data: this.props.gamificationsResourceList,
        currValue: this.state.selectedResourceList,
        handlers: {
          // onChange: this.selectPrizeType,
          onChange: this.handlerSelectedResource,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 6,
        inputType: 'checkbox',
        isNeedToRender: true,
        elementsInRow: 1,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            childType: 'switch',
            label: 'All games',
            checked: this.isCreateAllGames(),
            onChange: this.handlerSwitchAllGames
          }
        ]
      },
      {
        positionId: 6,
        name: localization.PICK_GAME[lang],
        inputType: 'treeSelect',
        width: 1.5,
        required: true,
        isNeedToRender: true,
        props: {
          disabled: this.isCreateAllGames(),
          allowClear: true,
          value: this.props.selectedGames,
          treeData: formatTreeData(this.props.gamesList),
          onChange: this.props.selectGames,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: this.isCreateAllGames() ? 'All games selected' : (localization.PLEASE_SELECT as any)[lang]
        }
      },
      {
        positionId: 7,
        width: 3,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.Currency,
        name: 'Currency',
        title: 'Currency',
        data: this.props.currencyList.rates,
        handlers: {
          onChange: (e: any) => this.inputName(e, 'Currency'),
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 7,
        width: 1.5,
        inputType: 'DatePickerTournament',
        isNeedToRender: true,
        label: 'Rules creation time',
        required: false,
        // onTimeZoneChange: this.props.onTimeZoneChange,
        timeZone: this.props.timeZone,
        selectedValue: this.state.RulesCreationTime,
        // mobileRangePicker: mobileRangePickerHandlers,
        onChange: this.createTournamentDataPicker,
      },
      {
        positionId: 8,
        inputType: 'checkbox',
        isNeedToRender: true,
        width: 4,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            childType: 'switch',
            label: 'Minimal bet',
            checked: this.state.switchMinimalBet,
            onChange: this.handlerSwitchMinimalBet
          }
        ]
      },
      {
        positionId: 9,
        inputType: 'numberValue',
        width: 4,
        required: true,
        disabled: !this.state.switchMinimalBet,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: !this.state.switchMinimalBet ? '' : this.state.valueBet,
        style: {width: '100%'},
        placeholder: 'Value',
        label: 'Value',
        onChange: (e: any) => this.selectValue(e , 'valueBet')
      },
      {
        positionId: 10,
        width: 4,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.exchangeSettingsType,
        name: localization.TYPE_SELECT[lang],
        title: 'Exchange settings',
        customOptions: this.categoryIdOptions,
        data: ExchangeSettingsType,
        handlers: {
          onChange: this.handlerExchangeSettingsType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 11,
        width: 4,
        inputType: 'select',
        required: true,
        disabled: this.state.exchangeSettingsType === ExchangeSettings.exchangeToYourCurrency ? false : true,
        isNeedToRender: true,
        currValue: this.state.exchangeSettingsType === ExchangeSettings.exchangeToYourCurrency ? this.state.currencyType : 'Currency',
        name: 'Select currency' || localization.TYPE_SELECT[lang],
        title: 'Select your currency',
        // customOptions: this.categoryIdOptions,
        data: this.props.currencyList.rates,
        handlers: {
          onChange: this.handlerCurrencyType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
    ];

    return TornamentInputsConfig;

  };

  getPrizeFundConfig = () => {
    let PrizeFundConfig = [
      {
        positionId: 1,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.PrizeFund.Cache,
        style: {width: '100%'},
        placeholder: 'Cache',
        label: 'Cache',
        onChange: (e: any) => this.inputsPrizeFund(e , 'Cache')
      },
      {
        positionId: 2,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.PrizeFund.FreeSpin,
        style: {width: '100%'},
        placeholder: 'FreeSpin',
        label: 'FreeSpin',
        onChange: (e: any) => this.inputsPrizeFund(e , 'FreeSpin')
      },
      {
        positionId: 3,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.PrizeFund.RaffleTicket,
        style: {width: '100%'},
        placeholder: 'RaffleTicket',
        label: 'RaffleTicket',
        onChange: (e: any) => this.inputsPrizeFund(e , 'RaffleTicket')
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 4,
        required: false,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.PrizeFund.Gift,
        style: {width: '100%'},
        placeholder: 'Gift',
        label: 'Gift',
        onChange: (e: any) => this.inputsPrizeFund(e , 'Gift')
      },
    ];
    return PrizeFundConfig;
  };

  getEditInputsTornamentConfig = () => {
    const mobileRangePickerHandlers = this.getMobileRangePickerHandlers();
    let EditInputsTornamentConfig = [
      {
        positionId: 1,
        width: 3,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.saveEditData.name,
        placeholder: localization.NAME_INPUT[lang],
        label: localization.INPUT_NAME[lang],
        onChange: (e: any) => this.inputNameEdit(e.target.value, 'name')
      },
      {
        positionId: 2,
        width: 1.5,
        inputType: 'rangePickerTournament',
        isNeedToRender: this.props.selectedDateRange,
        label: localization.PICK_RANGE[lang],
        required: false,
        // onTimeZoneChange: this.props.onTimeZoneChange,
        timeZone: this.props.timeZone,
        selectedValue: this.state.saveEditData.saveEditRangePicker,
        mobileRangePicker: mobileRangePickerHandlers,
        onChange: this.editChangeRangePickerHandler,
      },
      {
        positionId: 4,
        width: 3,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.saveEditData.gamificationType,
        name: localization.TYPE_SELECT[lang],
        title: 'Gamification type',
        customOptions: this.categoryIdOptions,
        data: gamificationType,
        handlers: {
          onChange: this.selectEditGamificationType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.saveEditData.countDown,
        style: {width: '100%'},
        placeholder: 'Countdown',
        label: 'Input Count down (min)',
        onChange: (e: any) => this.selectEditValue(e , 'countDown')
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.saveEditData.graceTime,
        style: {width: '100%'},
        placeholder: 'Grace Time',
        label: 'Input Grace Time (min)',
        onChange:  (e: any) => this.selectEditValue(e , 'graceTime')
      },
      {
        positionId: 4,
        inputType: 'select',
        width: 3,
        required: true,
        isNeedToRender: true,
        currValue: this.state.saveEditData.settings && this.state.saveEditData.settings.ScoreType,
        name: 'Select score type',
        title: 'Score type' || localization.SELECT_TYPE[lang],
        customOptions: this.categoryIdOptions,
        data: gamificationScoreType,
        handlers: {
          onChange: this.selectEditScoreType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.saveEditData.settings && this.state.saveEditData.settings.ScoreMultiplier,
        style: {width: '100%'},
        placeholder: 'Score multiplier',
        label: 'Score multiplier',
        onChange: (e: any) => this.selectEditScoreMultiplierValue(e, 'scoreMultiplier')
      },
      {
        positionId: 4,
        inputType: 'numberValue',
        width: 3,
        required: true,
        min: 0,
        max: 1000000000,
        isNeedToRender: true,
        value: this.state.saveEditData.settings && this.state.saveEditData.settings.TopCount,
        style: {width: '100%'},
        placeholder: 'Top count',
        label: 'Top count',
        onChange: (e: any) => this.selectEditTopCountValue(e , 'TopCount')
      },
      {
        positionId: 5,
        inputType: 'checkbox',
        isNeedToRender: true,
        elementsInRow: 1,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            childType: 'switch',
            label: 'Simulation',
            checked: this.state.saveEditData.isSimulation,
            onChange: this.handlerEditSwitchSimulation
          }
        ]
      },
      {
        width: 1.5,
        inputType: 'select',
        required: false,
        isNeedToRender: true,
        title: 'Resource',
        customOptions: this.categoryIdOptions,
        style: {width: '100%'},
        data: this.props.gamificationsResourceList,
        currValue: this.state.saveEditData.resource,
        handlers: {
          // onChange: this.selectPrizeType,
          // onChange: this.handlerSelectedResource,
          onChange: (e: any) => this.handlerEditResource(e, 'resource'),
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 6,
        inputType: 'checkbox',
        isNeedToRender: true,
        elementsInRow: 1,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            childType: 'switch',
            label: 'All games',
            checked: this.isAllGames(),
            onChange: this.handlerEditSwitchAllGames
          }
        ]
      },
      {
        positionId: 6,
        name: localization.PICK_GAME[lang],
        inputType: 'treeSelect',
        width: 1.5,
        required: true,
        isNeedToRender: true,
        props: {
          disabled: this.isAllGames(),
          allowClear: true,
          value: this.props.selectedGames,
          treeData: formatTreeData(this.props.gamesList),
          onChange: this.props.selectGames,
          showSearch: true,
          treeCheckable: true,
          showCheckedStrategy: TreeSelect.SHOW_PARENT,
          searchPlaceholder: this.isAllGames() ? 'All games selected' : (localization.PLEASE_SELECT as any)[lang]
        }
      },
      {
        positionId: 7,
        width: 3,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.saveEditData.settings && this.state.saveEditData.settings.Currency,
        name: 'Currency',
        title: 'Currency',
        data: this.props.currencyList.rates,
        handlers: {
          // onChange: this.handlerCurrencyType,
          onChange: this.handlerEditCurrency,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 7,
        width: 1.5,
        inputType: 'DatePickerTournament',
        isNeedToRender: true,
        label: 'Rules creation time',
        required: false,
        // onTimeZoneChange: this.props.onTimeZoneChange,
        timeZone: this.props.timeZone,
        selectedValue: this.state.saveEditData.settings && this.state.saveEditData.settings.RulesCreationTime,
        mobileRangePicker: mobileRangePickerHandlers,
        onChange: this.editTournamentChangeDataPicker,
      },
      {
        positionId: 8,
        inputType: 'checkbox',
        isNeedToRender: true,
        width: 4,
        // elementsInRow: 1,
        children: [
          {
            isNeedToRenderChild: true,
            required: false,
            childType: 'switch',
            label: 'Minimal bet',
            checked: this.isMinimalBet(), 
            onChange: this.handlerSwitchEditMinimalBet
          }
        ]
      },
      {
        positionId: 9,
        inputType: 'numberValue',
        width: 4,
        required: true,
        min: 0,
        max: 1000000000,
        disabled: !this.isMinimalBet(),
        isNeedToRender: true,
        value: this.state.saveEditData.settings && this.state.saveEditData.settings.MinimalBet,
        style: {width: '100%'},
        placeholder: 'Value',
        label: 'Value',
        onChange: (e: any) => this.selectEditValueBet(e , 'MinimalBet')
      },
      {
        positionId: 10,
        width: 4,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        currValue: this.state.saveEditData.settings && this.state.saveEditData.settings.ExchangeSettings && this.state.saveEditData.settings.ExchangeSettings.Type,
        name: localization.TYPE_SELECT[lang],
        title: 'Exchange settings',
        customOptions: this.categoryIdOptions,
        data: ExchangeSettingsType,
        handlers: {
          onChange: this.handlerEditExchangeSettingsType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
      {
        positionId: 11,
        width: 4,
        inputType: 'select',
        required: true,
        isNeedToRender: true,
        disabled: this.state.saveEditData.settings && this.state.saveEditData.settings.ExchangeSettings.Type === ExchangeSettings.exchangeToYourCurrency ? false : true,
        title: 'Select your currency',
        name: localization.TYPE_SELECT[lang],
        currValue: this.state.saveEditData.settings && this.state.saveEditData.settings.ExchangeSettings.CurrencyId,
        data: this.props.currencyList.rates,
        handlers: {
          onChange: this.handlerEditCurrencyType,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      },
    ];

    return EditInputsTornamentConfig;
  };

  render() {

    let buttons = [
      {
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: 'Add Tournament'
      },
    ];

    return (
      <div className={'gutter-box-padding'}>
        <ModalComponent
            handleOk={() => this.props.addCopyTournament(this)}
            handleCancel={this.cancelGamificationCopyModal}
            modalTitle={`Copy Tournament (#${this.state.gamificationCopyId})`}
            filterInputs={this.getCopyTournamentConfig()}
            visible={this.state.showGamificationCopy}/>
        <GamificationModalComponent
          elementsInRow={4}
          prizes={this.state.prizes}
          removePrizePositionRow={(index: any) => this.removePrizePositionRow(index)}
          handleOk={() => this.props.addTournament(this)}
          handleCancel={() => this.CancelAddTournament()}
          filterInputs={this.getTornamentInputsConfig()}
          filterInputsPrizePosition={this.PrizePositionsConfig}
          filterInputsPrizeFund={this.getPrizeFundConfig()}
          addPrizePositionRow={this.addPrizePositionInputRow}
          modalTitle={'Add Tournament'}
          visible={this.state.showModal}/>

        <EditGamificationModalComponent
          elementsInRow={4}
          editPrizes={this.state.saveEditData.editPrizes}
          removePrizePositionRow={(index: any) => this.removeEditPrizePositionRow(index)}
          handleOk={() => this.props.EditTournament(this)}
          handleCancel={() => this.CancelEditModal() }
          filterInputs={this.getEditInputsTornamentConfig()}
          filterInputsPrizePosition={this.getEditPrizePositionsConfig()}
          filterInputsPrizeFund={this.getEditPrizeFundConfig()}
          addPrizePositionRow={this.addEditPrizePositionInputRow}
          modalTitle={`Edit ${this.state.saveEditData['name']} (#${this.state.saveEditData['id']})`}
          visible={this.state.showEditModal}/>
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

export const GamificationInfo = withRouter(GamificationInfoVO);
