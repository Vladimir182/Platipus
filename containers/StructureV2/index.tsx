import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api, {isPanelAggregate} from 'app/const/api';
import {Row, Breadcrumb, message, Select, Popconfirm, Form, Input, Icon, Switch, Tag} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import localization from "app/localization";
import './style.css';
import {
  // addZoneOffsetToISOString,
  concatParamsToURL, formatTableData, validatePassword,
  getCorrectSortKey, getParameterByName, insertParam, isDeviceMobileAndTablet, //isoStringToUTCDate,
  sortTableOrder, uniqueObjectsArrayByProperty, isTest, validateLogin
} from 'app/utils'
import {
  previousPage, selectOfficesByPlatform,resetOfficesByPlatform,selectRoomsByOffice
} from "app/actions/filter";
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {default as roles, getRoleById} from "app/const/roles";
import {SpinComponent} from "app/components/SpinComponent";
import {LINK_GAME_DATA_REPORT} from "app/components/HelpComponent/anchorId";
import {AddPanel} from "app/components/AddPanel";
import {ModalComponent} from "app/components/ModalComponent";
import {IpEditForm} from "app/components/IpEditForm";
import {ICurrList} from "app/interfaces/IState";
import {IRoom} from "app/reducers/filter";

const {Option} = Select;
const FormItem = Form.Item;

const SORT_ARR = ['name', 'bet', 'win', 'betCount', 'avgBet', 'profit', 'payout'];
const SORT_DEFAULT = 'profit';
let lang = localStorage.getItem('lang') || 'en';

interface dataToSaveItemI {
  id: number;
  value: string;
}

enum StructureLevel {
  Platform = 1,
  // Distributor,
  Office,
  // Agent,
  Room,
  // Cashier,
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
  getInput = (onChangeInput: any, record: any, dataIndex: any, inputType?: string, list?: any, selectedItem?: any) => {
    switch (inputType) {
      case 'selects':
        return (
          <div>
            <Select
              showSearch
              style={{width: '100%'}}
              placeholder={localization.SELECT[lang]}
              size={'small'}
              value={selectedItem[dataIndex]}
              onChange={(e: any) => {
                onChangeInput(e, record, dataIndex);
              }}
              filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {
                list.map((option: any) => {
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
      list,
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
                  })(this.getInput(onChangeInput, record, dataIndex, inputType, list, selectedItem))}
                </FormItem>
              ) : restProps.children}
            </td>
          );
        }}
      </EditableContext.Consumer>
    );
  }
}

export namespace StructureVO {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: any;
    savePrevPage: (page: string) => void;
    addEntity: (that: any) => void;
    getCurrencyList: (that: any) => void;
    getGroupList: (that: any) => void;
    getWalletList: (that: any) => void;
    deleteRecord: (that: any, id: number) => void;
    disableUser: (that: any, id: number) => void;
    changePassword: (that: any) => void;
    changeIpAddress: (that: any, ipArr: any) => void;
    createPlayer: (that: any) => void;
    createAdmin: (that: any) => void;
    changeReport: (that: any, obj: any) => void;
    getOfficeList: (that: any, platform?: number) => void;

    sort: ISort;
    report: any;
    pagination: IPagination;
    path: string;
    currencyList: ICurrList;
    groupList: any;
    walletList: any;
    loadingCurrency: boolean;
    loadingGroups: boolean;
    loadingWallets: boolean;
    loadingReport: boolean;
    appliedColumnFilter: any;
    timeZone: string;
    match: any;
    metadata: any;

    roomsList: IRoom[];
    officeList: any;
    gameOptionRoomList: any;
    selectedOfficesByPlatform: string[];
    getRoomList: (that: any, platform?: string) => Promise<boolean>;
    selectOfficesByPlatform: (val: string[]) => void;
    resetOfficesByPlatform: () => void;
    selectRoomsByOffice: (val: string[]) => void;
  }

  export interface State {
    editingKey: any,
    showModal: boolean;
    showPasswordModal: boolean;
    name: string;
    login: string;
    password: string;
    ipAddress: string;
    balance: string;
    currencyId: number | undefined;
    groupId: number | undefined;
    walletId: string | undefined;
    checkedFun: boolean;

    showModalAdmin: boolean;
    showModalPlayer: boolean;
    modalPlayerRoomId: number;
    modalPlayerRoomName: string;
    modalPlayerBalance: number;
    modalPlayerLogin: string;
    modalPlayerPassword: string;

    [key: string]: any;
  }
}

@connect((state): any => ({
    sort: state.table.sort,
    pagination: state.table.pagination,
    appliedColumnFilter: state.table.filter,
    currencyList: state.filter.currencyList,
    groupList: state.filter.groupList,
    walletList: state.filter.walletList,
    report: state.table.report,
    loadingReport: state.table.loadingReport,
    loadingCurrency: state.table.loadingCurrency,
    loadingGroups: state.table.loadingGroups,
    loadingWallets: state.table.loadingWallets,
    path: state.router.location.pathname,
    metadata: state.table.metadata,
    timeZone: state.filter.timeZone,
    selectedOfficesByPlatform: state.filter.selectedOfficesByPlatform,
    roomsList: state.filter.roomsList,
    gameOptionRoomList: state.filter.gameOptionRoomList,
    officeList: state.filter.gameOptionOfficeList
  }),
  (dispatch: any): any => ({
    getReport: (that: any, needResetPagination?: boolean, levelObj?: any) => {
      that.resetPagination(needResetPagination);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let levelKey = levelObj ? levelObj.levelKey : that.getLevelKey();
      let levelValue = levelObj ? levelObj.levelValue : that.getLevelValue();
      // let sortArr = lvlKey === StructureLevel.Agent ? SORT_ARR.slice(1) : SORT_ARR;
      let sortArr = SORT_ARR;
      let params: any = {
        sortKey: getCorrectSortKey(that.props.sort.sortKey, sortArr, SORT_DEFAULT),
        platform: (levelObj && levelObj.levelKey === StructureLevel.Office) ? levelObj.levelValue : that.props.match.params.platform || "all",
        page: needResetPagination ? 1 : (page ? page : 1),
        limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
        sortDirection: that.props.sort.sortDirection,
        // levelKey: levelObj ? levelObj.levelKey : that.getLevelKey(),
        // levelValue: levelObj ? levelObj.levelValue : that.getLevelValue(),
        // officeIds: (lvlKey == StructureLevel.Office && (that.props.selectedOfficesByPlatform.length > 0) && that.props.selectedOfficesByPlatform) ? that.props.selectedOfficesByPlatform.join(',') : -1
      };    
      const method = ajaxRequestTypes.METHODS.GET;
      let url = '';
      if(+levelKey === StructureLevel.Platform) {
          url = concatParamsToURL(api.PLATFORM_V2, params);
      } else if(+levelKey === StructureLevel.Office) {
          params['platformId']= levelValue;
          url= concatParamsToURL(api.GET_OFFICE_V2, params);
      } else if(+levelKey === StructureLevel.Room) {
          params['officeId']= levelValue;
          url = concatParamsToURL(api.GET_ROOM_V2, params);
      }

      const data = { url, method };
      return req(types, data, that.props.history, dispatch);

    },
    getChangedReport: (that: any, val: ITable) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let lvlKey = that.getLevelKey();
      let params = {
        sortKey: getCorrectSortKey(val.sort.sortKey, SORT_ARR, SORT_DEFAULT),
        platform: that.props.match.params.platform || "all",
        page: val.pagination.current,
        limit: val.pagination.pageSize,
        sortDirection: val.sort.sortDirection,
        levelKey: that.getLevelKey(),
        levelValue: that.getLevelValue(),
        officesId: (lvlKey == StructureLevel.Office && (that.props.selectedOfficesByPlatform.length > 0) && that.props.selectedOfficesByPlatform) ? that.props.selectedOfficesByPlatform.join(',') : -1
      };
      let data = {
        url: concatParamsToURL(api.PLATFORM_V2, params),
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
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    savePrevPage(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'historyList'}))
    },
    addEntity: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ADD_REPORT);
      let matchParams = that.props.match.params;
      let distributorId = matchParams.distributorId;
      let officeId = matchParams.officeId;
      let agentId = matchParams.agentId;
      // let roomId = matchParams.roomId;
      let params = {};
      let url = '';
      switch (that.getLevelKey()) {
        case StructureLevel.Platform:
          url = api.PLATFORM_V2;
          params = {
            name: that.state.name,
          }
          break;
        case StructureLevel.Office:
          url = api.POST_STRUCTURE_OFFICE;
          params = {
            name: that.state.name,
            ownerId: distributorId
          };
          break;
        case StructureLevel.Room:
          url = api.POST_STRUCTURE_ROOM;
          params = {
            // name: that.state.name,
            currencyId: that.state.currencyId,
            groupId: that.state.groupId,
            isFun: that.state.checkedFun,
            walletId: that.state.walletId,
            officeId: officeId,
            ownerId: agentId
          };
          break;
      }
      let data = {
        url: url,
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
    getCurrencyList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CURRENCY_LIST);
      let data = {
        url: concatParamsToURL(api.GET_CURRENCY_LIST, {updateId: -1}),
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
    getOfficeList: (that: any, platformId: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.OFFICES_LIST);
      let data = {
        url: concatParamsToURL(api.GET_OFFICE_V2, {platformId}),
        // url: concatParamsToURL(api.GET_OFFICE_V2, {platform: platformId || (that.props.selectedPlatform || "all")}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    getRoomList: (that: any, officeId?: string) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.ROOM_LIST);
      let data = {
        url: concatParamsToURL(api.GET_ROOM_V2, {officeId}),
        // url: concatParamsToURL(api.GET_ROOM_V2, {platform: platform || (that.props.selectedPlatform || "all")}),
        method: ajaxRequestTypes.METHODS.GET
      };
      return req(types, data, that.props.history, dispatch);
    },
    selectOfficesByPlatform: (val: string[]) => {
      dispatch(selectOfficesByPlatform(val))
    },
    resetOfficesByPlatform: (val: string[]) => {
      dispatch(resetOfficesByPlatform(val))
    },
    selectRoomsByOffice: (val: string[]) => {
      dispatch(selectRoomsByOffice(val))
    },
    getWalletList: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.WALLET_LIST);
      let data = {
        url: concatParamsToURL(api.GET_WALLET_LIST, {}),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch);
    },
    deleteRecord: (that: any, id: number) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.DELETE_REPORT);
      let params = {
        id: id
      };
      let url = ``;
      switch (that.getLevelKey()) {
        case StructureLevel.Platform:
          url = api.PLATFORM_V2;
          break;
        case StructureLevel.Office:
          url = api.POST_STRUCTURE_OFFICE;
          break;
        case StructureLevel.Room:
          url = api.POST_STRUCTURE_ROOM;
          break;
      }
      let data = {
        url: url,
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
    disableUser: (that: any, id: number) => {
      // let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      // let disabled = that.getisDisableByGameId(id) === 0 ? 1 : 0;
      // let params = {
      //   disabled: disabled,
      //   gameId: id
      // };
      // let data = {
      //   url: api.PUT_DISABLE_GAME,
      //   method: ajaxRequestTypes.METHODS.PUT,
      //   params
      // };
      // req(types, data, that.props.history, dispatch).then((flag) => {
      //   if (flag) {
      //     message.success(that.getStatusNameById(disabled));
      //     that.props.getReport(that, false);
      //   }
      // });
    },
    changePassword: (that: any) => {
      
      if (!that.state.itemId) { return }
      
      const passwordValidated = validatePassword(that.state.password, that.state.itemLogin); 
        
      if (!passwordValidated.valid) { message.error(passwordValidated.message); return; }

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_PASSWORD);
    
      let params = { operation: 'password', id: that.state.itemId, password: that.state.password };
      let url = ``;
      switch (that.getLevelKey()) {
        // case StructureLevel.Distributor:
        //   url = api.POST_STRUCTURE_DISTRIBUTOR;
        //   break;
        // case StructureLevel.Agent:
        //   url = api.POST_STRUCTURE_AGENT;
        //   break;
        // case StructureLevel.Cashier:
        //   url = api.POST_STRUCTURE_CASHIER;
        //   break;
      }
      
      let data = {
        url: url,
        method: ajaxRequestTypes.METHODS.PUT,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success('Password has changed successfully!');
          that.setState({showPasswordModal: false});
          that.props.getReport(that, false);
        }
      });
    },

    changeIpAddress: (that: any, ipArr: any) => {
      if (!that.state.itemId) { return }
      


      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_USER_IP);
    
      let params = {id: that.state.itemId, ipAddress: ipArr };
      let url = api.USER_IP;
      let data = {
        url: url,
        method: ajaxRequestTypes.METHODS.PUT,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success('Ip has changed successfully!');
          that.setState({showIpAddressModal: false});
          that.props.getReport(that, false);
        }
      });
    },

    createPlayer: (that: any) => {

      const levelKey = that.getLevelKey();

      if (levelKey !== StructureLevel.Room) {return;}

      const hasLogin = that.state.modalPlayerLogin;
      const hasPassword = that.state.modalPlayerPassword;
      const hasBalance = +that.state.modalPlayerBalance === 0 || that.state.modalPlayerBalance;
      
      if (!hasLogin || !hasPassword || !hasBalance) { return }
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CREATE_PLAYER);
    
      let params = { 
        roomId: that.state.modalPlayerRoomId, 
        login: that.state.modalPlayerLogin, 
        password: that.state.modalPlayerPassword, 
        balance: that.state.modalPlayerBalance 
      };
      
      let data = {
        url: api.STRUCTURE_PLAYER,
        method: ajaxRequestTypes.METHODS.POST,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success('Player created succesfully!');
          that.setState({showModalPlayer: false});
          that.props.getReport(that, false);
        }
      });
    },
    createAdmin: (that: any) => {

      // const levelKey = that.getLevelKey();

      // if (levelKey !== StructureLevel.Distributor) {return;}

      const loginValidated = validateLogin(that.state.login);
      if (!loginValidated.valid) { message.error(loginValidated.message); return; }
      
      const passwordValidated = validatePassword(that.state.password, that.state.login);
      if (!passwordValidated.valid) { message.error(passwordValidated.message); return; }

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CREATE_PLAYER);
    
      let params = { 
        login: that.state.login,
        password: that.state.password
      };
      
      let data = {
        url: api.STRUCTURE_ADMIN,
        method: ajaxRequestTypes.METHODS.POST,
        params
      };
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success('Admin created succesfully!');
          that.setState({showModalAdmin: false, login: '', password: ''});
          that.props.getReport(that, false);
        }
      });
    },
    changeReport: (that: any, obj: any) => {
      const {names} = obj
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.CHANGE_REPORT);
      let url = ``;
      switch (that.getLevelKey()) {
        case StructureLevel.Platform:
          url = api.PLATFORM_V2;
          break;
        case StructureLevel.Office:
          url = api.POST_STRUCTURE_OFFICE;
          break;
        case StructureLevel.Room:
          url = api.POST_STRUCTURE_ROOM;
          break;
      }
      let data = {};
      if(that.getLevelKey() !== StructureLevel.Platform){
         data = {
          url: url,
          method: ajaxRequestTypes.METHODS.PUT,
          params: {...obj, operation: 'edit', level: that.getLevelKey()}
        };
      } else {
        data = {
          url: url,
          method: ajaxRequestTypes.METHODS.PUT,
          params: {names}
        };
      }
      
      req(types, data, that.props.history, dispatch).then((flag) => {
        if (flag) {
          message.success(localization.SAVED[lang]);
          that.setState({
            editingKey: '',
            dataToSave: {
              names: [],
              logins: [],
              currencies: [],
              groups: []
            }
          });
          that.props.getReport(that, false);
        }
      });
    }
  })
)

class StructureVO extends React.Component<StructureVO.Props, StructureVO.State> {

  constructor(props: StructureVO.Props, context?: any) {
    super(props, context);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);

    this.state = {
      editingKey: '',
      showModal: false,
      showPasswordModal: false,
      name: '',
      login: '',
      balance: '0',
      password: '',
      ipAddress: '',
      currencyId: undefined,
      groupId: undefined,
      checkedFun: false,
      walletId: 'default',
      itemId: undefined,
      itemLogin: undefined,
      itemIp: undefined,
      modalPlayerRoomId: -1,
      modalPlayerRoomName: '',
      modalPlayerBalance: 0,
      modalPlayerLogin: '',
      modalPlayerPassword: '',
      showModalPlayer: false,
      showModalAdmin: false,
      dataToSave: {
        names: [],
        logins: [],
        currencies: [],
        groups: []
      }
    };
  }

  componentDidMount() {
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.path.indexOf(getRoleById(roleId) as string) !== -1) {
      // if (level === StructureLevel.Office) { 
      //   this.props.getRoomList(this, this.props.match.params.platform); 
      // }
      this.props.getReport(this, false, this.levelObjByRole()).then((flag: any)=>{
        if(flag && this.getLevelKey() === 1 && !isPanelAggregate()){
          this.goToLevelByRole();
        }
      });
    }
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  };

  componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
    /*MAY BE BROKEN*/
    if (prevProps.path !== this.props.path && this.getLevelKey() === 1 && !this.props.loadingReport) {
      this.props.getReport(this, false, this.levelObjByRole()).then((flag: any)=>{
        if(flag && this.getLevelKey() === 1 && !isPanelAggregate()){
          this.goToLevelByRole();
        }
      });
    }
  }

  levelObjByRole(){
    let roleId = parseInt(localStorage.getItem('roleId') as string);
    let role = getRoleById(roleId) as string;
    let level;
    let levelValue = localStorage.getItem('userId') as string;
    switch(role){
      case roles.DISTRIBUTOR.name:{
        level = StructureLevel.Office;
        break;
      }
      case roles.AGENT.name:{
        level = StructureLevel.Room;
        break;
      }
    }
    if(!level){
      return false;
    }
    return {
      levelKey: level,
      levelValue: levelValue,
    };
  }

  goToLevelByRole(){
    let roleId = parseInt(localStorage.getItem('roleId') as string);
    let role = getRoleById(roleId) as string;
    let level;
    let levelValue = localStorage.getItem('userId') as string;
    let paramsArr: any = false;
    switch(role){
      case roles.ADMIN.name:{
        levelValue = this.props.report[0].id;
        level = StructureLevel.Platform;
        break;
      }
      case roles.DISTRIBUTOR.name:{
        paramsArr = [this.props.metadata.platformId,levelValue,,,];
        level = StructureLevel.Office;
        break;
      }
      case roles.AGENT.name:{
        paramsArr = [this.props.metadata.platformId,this.props.metadata.distributorId,this.props.metadata.officeId,levelValue,];
        level = StructureLevel.Room;
        break;
      }
      default: {
        levelValue = "all";
        level = StructureLevel.Platform;
      }
    }
    //[params.platform, params.distributorId, params.officeId, params.agentId, params.roomId]
    this.goToLevel(level, levelValue, paramsArr)
  }

  goToLevel(level: number, id: any, customParamsArr?: any[]) {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let r = roles[role];
    let levelValue = id;
    let params = this.props.match.params;

    let paramsArr = customParamsArr || [params.platform, params.distributorId, params.officeId, params.agentId, params.roomId];
    let url = `${r.route}${r.children.STRUCTURE_V2}`;
    for (let i = 0; i < (level - 1); i++) {
      let p = (i === (level - 2)) ? id : paramsArr[i];
      url += '/' + p
    }
    this.props.history.push(url);
    if (level < StructureLevel.Office) { this.props.resetOfficesByPlatform(); }
    // if (level === StructureLevel.Office) { this.props.getRoomList(this, this.props.match.params.platform); }
    this.props.getReport(this, true, {
      levelKey: level,
      levelValue: levelValue,
    });
  }

  getLevelKey(): number {
    let params = this.props.match.params;
    let platform = params.platform;
    let officeId = params.officeId;
    let roomId = params.roomId;
    let levelKey = 0;
    if (!platform && !officeId && !roomId) {
      levelKey = StructureLevel.Platform;
    } else if (platform && !officeId && !roomId) {
      levelKey = StructureLevel.Office;
    } else if (platform && officeId && !roomId) {
      levelKey = StructureLevel.Room;
    }
    return levelKey;
  }

  getLevelValue(): string {
    let params = this.props.match.params;
    let platform = params.platform;
    let officeId = params.officeId;
    let roomId = params.roomId;
    let levelValue = '';
    if (!platform && !officeId && !roomId) {
      levelValue = localization.PLATFORMS_HEADER[lang];
    } else if (platform && !officeId && !roomId) {
      levelValue = platform;
    } else if (platform && officeId && !roomId) {
      levelValue = officeId;
    } else if (platform && officeId && roomId) {
      levelValue = roomId;
    }
    return levelValue;
  }

  componentWillUnmount() {
    this.props.resetTableData();
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

  onTableChange(pagination: any, filter: any, sorter: any) {
    let sort = {
      sortKey: getCorrectSortKey(sorter.columnKey || this.props.sort.sortKey, SORT_ARR, SORT_DEFAULT),
      sortDirection: sortTableOrder(sorter.order) || "desc"
    };
    let current: number = (pagination.current == this.props.pagination.current
      || pagination.pageSize != this.props.pagination.pageSize) ? 1 : pagination.current;
    let params = {
      filter: this.props.appliedColumnFilter,
      sort,
      pagination: {...pagination, current}
    };
    this.props.history.push({
      search: `?page=${current}&size=${pagination.pageSize}`
    });
    this.props.tableChange(params, this);
  }

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_GAME_DATA_REPORT}`);
  };

  goToBetGroup = (groupId: number) => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.BET_GROUP_SETTING}?groupId=${groupId}`);
  };

  isFunCurrency = (record: any) => {
    return record && record.currencyId && +record.currencyId === 1;
  }

  renderOperationCell = (text: any, record: any) => {
    {
      const editable = this.isEditing(record);
      let level = this.getLevelKey();
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
              {/* {
                (level === StructureLevel.Distributor || level === StructureLevel.Agent || level === StructureLevel.Cashier) &&
                <a onClick={this.showPasswordChangeModal(record.id, record.login)}>{'Password'}</a> 
              }
              {
                (level === StructureLevel.Distributor || level === StructureLevel.Agent || level === StructureLevel.Cashier) &&
                <a onClick={this.showIpAddressChangeModal(record.id, record.login, record)} style={{marginLeft: '10px'}}>{'IP'}</a>
              } */}
              {
                (isTest() || this.isFunCurrency(record)) && (level === StructureLevel.Room) &&
                <a onClick={this.showPlayerCreateModal(record.id, record.name)}>{'Player'}</a>
              }
              <a style={{marginLeft: '10px'}}
                 onClick={() => this.edit(record.key, record)}>{localization.EDIT[lang]}</a>
              <Popconfirm
                icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}
                okType={'danger'}
                title={localization.SURE_TO_DELETE[lang]}
                onConfirm={() => this.props.deleteRecord(this, record.id)}
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
  };

  showPasswordChangeModal = (id: number, login: string) => () => {
    this.setState({
      showPasswordModal: true,
      itemId: id,
      itemLogin: login
    })
  };

  showIpAddressChangeModal = (id: number, login: string, ipAddress: string) => () => {
    this.setState({
      showIpAddressModal: true,
      itemId: id,
      itemLogin: login,
      itemIp: ipAddress
    })
  };

  showPlayerCreateModal = (roomId: number, roomName: string) => () => {
    this.setState({
      showModalPlayer: true,
      modalPlayerRoomId: roomId,
      modalPlayerRoomName: roomName
    })
  };
  
  showAdminCreateModal = () => {
    this.setState({
      showModalAdmin: true
    });
  };

  renderTable() {
    //table
    let columns: any = [];
    switch (this.getLevelKey()) {
      //Platform
      case StructureLevel.Platform: {
        columns = [
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
                    fontWeight: '700',
                  }
                }
              };
            }
          },
          {
            title: localization.NAME_COLUMN[lang],
            dataIndex: 'name',
            key: 'name',
            sorter: false,
            editable: true,
            render: (value: any, row: any, i: number) => {
              let level = this.getLevelKey() + 1;
              return {
                children:row.items > 0 ? <a onClick={() => this.goToLevel(level, row.id)}>{value}</a>:<a style={{color: 'rgba(0, 0, 0, 0.45)'}} onClick={() => this.goToLevel(level, row.id)}>{value}</a>,
                props: {
                  style: {
                    fontWeight: '700',
                  }
                }
              };
            }
          },
          {
            title: localization.OFFICE_COUNT_COLUMN[lang],
            dataIndex: 'items',
            key: 'items',
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
            render: this.renderOperationCell
          }];
        break;
      }
      //Office
      case StructureLevel.Office:
        columns = [
          {
            title: (localization.ID_COLUMN as any)[lang],
            dataIndex: 'id',
            key: 'id',
            sorter: false,
            render(value: any, row: any, i: number) {
              return {
                children: value,
                props: {
                  style: {
                    fontWeight: '700',
                  }
                }
              };
            }
          },
          {
            title: (localization.NAME_COLUMN as any)[lang],
            dataIndex: 'name',
            key: 'name',
            sorter: false,
            editable: true,
            render: (value: any, row: any, i: number) => {
              let level = this.getLevelKey() + 1;
              return {
                children: row.items > 0 ? <a onClick={() => this.goToLevel(level, row.id)}>{value}</a>:<a style={{color: 'rgba(0, 0, 0, 0.45)'}} onClick={() => this.goToLevel(level, row.id)}>{value}</a>,
                props: {
                  style: {
                    fontWeight: '700',
                  }
                }
              };
            }
          },
          {
            title: localization.ROOM_COUNT_COLUMN[lang],
            dataIndex: 'items',
            key: 'items',
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
            render: this.renderOperationCell
          }];
        break;
      //Rooms
      case StructureLevel.Room:
        columns = [
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
                    fontWeight: '700',
                  }
                }
              };
            }
          },
          {
            title: localization.NAME_COLUMN[lang],
            dataIndex: 'name',
            key: 'name',
            editable: true,
            render: (value: any, row: any, i: number) => {
              // let level = this.getLevelKey() + 1;
              return {
                children:row.items > 0 ? <span>{value}</span>:<span style={{color: 'rgba(0, 0, 0, 0.45)'}}>{value}</span>,
                props: {
                  style: {
                    fontWeight: '700',
                  }
                }
              };
            }
          },
          {
            title: localization.CURRENCY_COLUMN[lang],
            dataIndex: 'currencyId',
            key: 'currencyId',
            inputType: 'selects',
            editable: true,
            render: (value: any, row: any, i: number) => {
              return {
                children: `${row.currencyName} (#${value})`,
                props: {}
              };
            }
          },
          {
            title: localization.GROUP_COLUMN[lang],
            dataIndex: 'groupId',
            key: 'groupId',
            inputType: 'selects',
            editable: true,
            render: (value: any, row: any, i: number) => {
              return {
                children: <a onClick={() => this.goToBetGroup(value)}>{`${row.groupName} (#${value})`}</a>,
                props: {}
              };
            }
          },
          {
            title: localization.OFFICE_COLUMN[lang],
            dataIndex: 'officeId',
            key: 'officeId',
            render: (value: any, row: any, i: number) => {
              return {
                children: `${row.officeName} (#${value})`,
                props: {}
              };
            }
          },
          {
            title: localization.OPERATION_COLUMN[lang],
            sorter: false,
            dataIndex: 'operation',
            key: 'operation',
            render: this.renderOperationCell
          }];
        break;
    }
    let propertiesToConvert = ['balance'];
    let tableData = formatTableData(this.props.report.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
    let loading = this.props.loadingReport;

    columns = columns.map((col: any) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any) => (
          {
            record,
            list: col.dataIndex === "currencyId" ? this.props.currencyList.rates.map(rate => (rate['name'] = rate['value'], rate)) : col.dataIndex === "walletId" ? this.props.walletList :  this.props.groupList,
            inputType: col.inputType,
            dataIndex: col.dataIndex,
            title: col.title,
            editing: this.isEditing(record),
            onChangeInput: this.onChangeInput,
            selectedItem: {
              currencyId: this.state.dataToSave.currencies.filter((item: dataToSaveItemI) => record.id === item.id).length > 0 ? this.state.dataToSave.currencies.filter((item: dataToSaveItemI) => record.id === item.id)[0]['value'] : record.currencyId,
              groupId: this.state.dataToSave.groups.filter((item: dataToSaveItemI) => record.id === item.id).length > 0 ? this.state.dataToSave.groups.filter((item: dataToSaveItemI) => record.id === item.id)[0]['value'] : record.groupId
            }
        }),
      };
    });

    const components = {
      row: EditableFormRow,
      cell: EditableCell,
    };

    return (<DataTable
      title={this.renderTitle}
      columns={columns}
      onTableChange={this.onTableChange}
      additionalComponents={components}
      loading={loading}
      pagination={this.props.pagination}
      data={tableData}/>)
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

  renderStatusColumn(value: number, id: number) {
    return (
      <div style={{textAlign: 'center'}}>
        <Tag color={value === 0 ? "green" : "red"}>{this.getStatusNameById(value)}</Tag>
        <Switch
          onChange={() => {
            this.props.disableUser(this, id)
          }}
          // checked={value === 1}
          checkedChildren={<Icon type="check"/>}
          unCheckedChildren={<Icon type="close"/>}/>
      </div>);
  }

  renderBreadCrumb = () => {
    let params = this.props.match.params;
    let platform = params.platform;
    let officeId = params.officeId;
    let breadcrumb = [{
      levelKey: StructureLevel.Platform,
      levelValue: localization.PLATFORMS_HEADER[lang],
      title: localization.STRUCTURE_TITLE[lang],
      levelValueId: localization.PLATFORMS_HEADER[lang],
      isLink: this.getLevelKey() !== StructureLevel.Platform
    }];
    if (this.getLevelKey() >= StructureLevel.Office) {
      breadcrumb.push({
        levelKey: StructureLevel.Office,
        levelValue: this.props.metadata.platformName,
        levelValueId: platform,
        title: localization.DISTRIBUTOR_TITLE[lang],
        isLink: this.getLevelKey() !== StructureLevel.Office,
      })
    }
    if (this.getLevelKey() === StructureLevel.Room) {
      breadcrumb.push({
        levelKey: StructureLevel.Room,
        levelValue: this.props.metadata.officeName,
        levelValueId: officeId,
        title: localization.AGENT_TITLE[lang],
        isLink: this.getLevelKey() !== StructureLevel.Room,
      })
    }
    return (
      <Breadcrumb>
        {
          breadcrumb.map((val: any) => {
            return (
              <Breadcrumb.Item key={val.levelKey}>
                {val.isLink ?
                  <a title={val.title}
                     onClick={() => this.goToLevel(val.levelKey, val.levelValueId)}>
                    {val.levelValue}
                  </a> : <span title={val.title}>{val.levelValue}</span>}
              </Breadcrumb.Item>)
          })
        }
      </Breadcrumb>)
  };

  getLevelTitle = () => {
    let title = '';
    switch (this.getLevelKey()) {
      case StructureLevel.Platform: {
        title = localization.PLATFORMS_HEADER[lang];
        break;
      }
      case StructureLevel.Office: {
        title = localization.OFFICES_HEADER[lang];
        break;
      }
      case StructureLevel.Room: {
        title = localization.ROOMS_HEADER[lang];
        break;
      }
    }
    return title;
  };

  save = (form: any, key: any) => {
    form.validateFields((error: any, row: any) => {
      if (error) {
        return;
      }
      let validatedFields = false;
      switch (this.getLevelKey()) {
        case StructureLevel.Platform:
          validatedFields = this.state.dataToSave.names.length !== 0;
          break;
        case StructureLevel.Office:
          validatedFields = this.state.dataToSave.names.length !== 0;
          break;
        case StructureLevel.Room:
          validatedFields = this.state.dataToSave.names.length !== 0 || this.state.dataToSave.currencies.length !== 0 || this.state.dataToSave.groups.length !== 0;
          break;
      }

      if (validatedFields) {
          this.props.changeReport(this, this.state.dataToSave);
      }
    });
  };

  cancel = () => {
    this.setState({
      editingKey: '',
      dataToSave: {
        id: undefined,
        names: [],
        logins: [],
        currencies: [],
        groups: []
      }
    });
  };

  isEditing = (record: any) => {
    return record.key === this.state.editingKey;
  };

  edit = (key: any, row: any) => {
    if (this.getLevelKey() === StructureLevel.Room) {
      this.props.getCurrencyList(this);
      this.props.getGroupList(this);
    }
    this.setState({
      editingKey: key,
      dataToSave: {
        names: [],
        logins: [],
        currencies: [],
        groups: []
      }
    });
  };

  addHandler = () => {
    switch (this.getLevelKey()) {
      case StructureLevel.Room: {
        this.props.getCurrencyList(this);
        this.props.getGroupList(this);
        this.props.getWalletList(this);
      }
    }
    this.setState({
      showModal: true
    })
  };

  onShowReportClick = () => {
    this.props.getReport(this, true);
  }

  renderAddPanelBtns() {
    let text: string = this.renderModalTitle();
    
    let buttons = [
      {
        onClick: this.onShowReportClick,
        icon: 'reload',
        text: localization.SHOW_DATE_BY_FILTER[lang],
        loading:this.props.loadingReport
      }];

    // if (this.getLevelKey() === StructureLevel.Distributor) {
    //   buttons = [
    //     ...buttons,
    //     {
    //       onClick: this.showAdminCreateModal,
    //       icon: 'plus-circle',
    //       text: 'Create Admin',
    //       loading: false
    //     }
    //   ];
    // }
    
    return [
        ...buttons,
        ...([{
        onClick: this.addHandler,
        icon: 'plus-circle',
        text: text,
        loading: false, //this.props.loadingReport
      }]) || []
    ];
  }

  inputValue = (value: string | number | boolean, key: string) => {
    this.setState({
      [key]: value
    });
  };

  clearAllValues = () => {
    this.setState({
      name: '',
      login: '',
      password: '',
      ipAddress: '',
      balance: '0',
      currencyId: undefined,
      groupId: undefined,
      dataToSave: {
        names: [],
        logins: [],
        currencies: [],
        groups: []
      }
    });
  };

  onCancel = () => {
    this.clearAllValues();
    this.setState({
      showModal: false,
      showPasswordModal: false,
      showIpAddressModal: false,
      showModalPlayer: false,
      showModalAdmin: false
    })
  };

  onFocusHandler() {
    console.log('focus');
  }

  onBlurHandler() {
    console.log('blur');
  }

  groupOptions(arr: any[]) {
    return arr.map((option: any) => {
      return (
        <Option
          key={option.id}
          value={option.id}>{option.name}</Option>
      )
    })
  }

  renderAddPanelInputs() {
    let inputs: any[] = [];
    switch (this.getLevelKey()) {
      case StructureLevel.Platform:
         inputs = [
          {
            positionId: 1,
            inputType: 'textInput',
            required: true,
            isNeedToRender: true,
            value: this.state.name,
            placeholder: localization.NAME_INPUT[lang],
            label: localization.INPUT_NAME[lang],
            onChange: (e: any) => {
              this.inputValue(e.target.value, 'name')
            }
          }];
        break;
      case StructureLevel.Office:
        inputs = [
          {
            positionId: 1,
            inputType: 'textInput',
            required: true,
            isNeedToRender: true,
            value: this.state.name,
            placeholder: localization.NAME_INPUT[lang],
            label: localization.INPUT_NAME[lang],
            onChange: (e: any) => {
              this.inputValue(e.target.value, 'name')
            }
          }];
        break;
      case StructureLevel.Room:
        inputs = [
          {
            positionId: 1,
            inputType: 'select',
            required: true,
            isNeedToRender: true,
            currValue: this.state.currencyId,
            name: (localization.CURRENCY as any)[lang],
            title: (localization.PICK_CURRENCY as any)[lang],
            data: this.props.currencyList.rates,
            handlers: {
              onChange: (currencyId: number) => {
                this.inputValue(currencyId, 'currencyId')
              },
              onFocus: () => {
              },
              onBlur: () => {
              }
            }
          },
          {
            positionId: 2,
            inputType: 'select',
            required: true,
            isNeedToRender: true,
            currValue: this.state.groupId,
            name: localization.GROUP_SELECT_PLACEHOLDER[lang],
            title: localization.SELECT_GROUP[lang],
            data: this.props.groupList,
            customOptions: this.groupOptions,
            handlers: {
              onChange: (groupId: number) => {
                this.inputValue(groupId, 'groupId')
              },
              onFocus: () => {
              },
              onBlur: () => {
              }
            }
          },
          {
            positionId: 3,
            inputType: 'select',
            required: true,
            isNeedToRender: true,
            currValue: this.state.walletId,
            name: 'Wallet',
            title: 'Wallet Type',
            data: this.props.walletList,
            handlers: {
              onChange: (walletId: string) => {
                this.inputValue(walletId, 'walletId')
              },
              onFocus: () => {
              },
              onBlur: () => {
              }
            }
          },
          {
            positionId: 4,
            inputType: 'checkbox',
            isNeedToRender: true,
            children: [
              {
                isNeedToRenderChild: true,
                required: false,
                label: 'FUN',
                checked: this.state.checkedFun,
                onChange: (e: any) => this.inputValue(e.target.checked, 'checkedFun')
              }
            ]
          }
        ];
        break;
    }
    return inputs;
  }

  renderAddPanelFilters() {
    let level = this.getLevelKey();
    let value = this.getLevelValue();
    let multiSelect: any[] = [];
    let multiSelectOffices: any[] = [
      // {
      //   positionId: 4,
      //   name: (localization.PICK_GAME as any)[lang],
      //   props: {
      //     allowClear: true,
      //     value: this.props.selectedGames,
      //     treeData: formatTreeData(this.props.gamesList),
      //     onChange: this.onGamesFilterChangeHandler,
      //     showSearch: true,
      //     treeCheckable: true,
      //     showCheckedStrategy: TreeSelect.SHOW_PARENT,
      //     searchPlaceholder: (localization.PLEASE_SELECT as any)[lang]
      //   }
      // }
      {
        positionId: 3,
        inputType: 'multiSelect',
        required: false,
        isNeedToRender: true,
        name: localization.PLEASE_SELECT[lang],
        title: localization.SELECT_OFFICES[lang],
        data: uniqueObjectsArrayByProperty(this.props.roomsList, "categoryId")
          .filter((val:any)=>`${val.platformId}`===`${value}`)
          .map((val:any)=> {
            return {...val, id:val.categoryPlatformId, name: val.categoryName}
          }
        ),
        currValue: this.props.selectedOfficesByPlatform,
        handlers: {
          onChange: this.props.selectOfficesByPlatform,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      }
    ];
    let multiSelectPlatform: any[] = [
      {
        positionId: 3,
        inputType: 'multiSelect',
        required: false,
        isNeedToRender: true,
        name: localization.PLEASE_SELECT[lang],
        title: `${localization.SELECT_PLATFORM[lang]}s`,
        data: uniqueObjectsArrayByProperty(this.props.roomsList, "categoryId")
          .filter((val:any)=>`${val.platformId}`===`${value}`)
          .map((val:any)=> {
            return {...val, id:val.categoryPlatformId, name: val.categoryName}
          }
        ),
        currValue: this.props.selectedOfficesByPlatform,
        handlers: {
          onChange: this.props.selectOfficesByPlatform,
          onFocus: this.onFocusHandler,
          onBlur: this.onBlurHandler
        }
      }
    ];

    if (level === StructureLevel.Office ) { multiSelect = [...multiSelectOffices];  }
    if (level === StructureLevel.Platform ) { multiSelect = [...multiSelectPlatform];  }

    return multiSelect.length ? multiSelect : null;
  }

  renderPasswordPanelInputs() {
    return [
      {
        positionId: 2,
        inputType: 'passwordInput',
        required: true,
        isNeedToRender: true,
        value: this.state.password,
        placeholder: localization.PASSWORD_INPUT[lang],
        label: localization.INPUT_PASSWORD[lang],
        onChange: (e: any) => {
          this.inputValue(e.target.value, 'password')
        }
      }];
  }

  renderIpAddressPanelInputs(that: any) {
    let ipArr = [''];
    if(that.state.itemIp) {
      ipArr = !that.state.itemIp.ipAddress.length && [''] || that.state.itemIp.ipAddress.split(',')
    };

    const IpAddressPanelInputDef = (ip :string, i :number) => {
      return {
        positionId: i,
        inputType: 'textInput',
        required: true,
        isValid: true,
        isNeedToRender: true,
        value: ip,
        placeholder: 'Input Ip:',
        label: `Ip[${i}]`,
        onChange: (e: any) => {
          this.inputValue(e.target.value, 'ipAddress')
        }
      }
    }
    
    return ipArr.map((reptile, i) => IpAddressPanelInputDef(reptile, i));
  }

  renderCreatePlayerPanelInputs() {
    return [
      {
        positionId: 1,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.modalPlayerLogin,
        placeholder: 'Login',
        label: 'Input login:',
        onChange: (e: any) => {
          this.inputValue(e.target.value, 'modalPlayerLogin')
        }
      },
      {
        positionId: 2,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.modalPlayerPassword,
        placeholder: 'Password',
        label: 'Input password:',
        onChange: (e: any) => {
          this.inputValue(e.target.value, 'modalPlayerPassword')
        }
      },
      {
        positionId: 3,
        inputType: 'numberValue',
        required: true,
        isNeedToRender: true,
        value: this.state.modalPlayerBalance,
        min: 0,
        max: 1000000000,
        placeholder: 'Balance',
        label: 'Input balance:',
        style: {width: '100%'},
        onChange: (e: any) => {
          this.inputValue(e, 'modalPlayerBalance')
        }
      }
    ];
  }

  renderCreateAdminPanelInputs() {
    return [
      {
        positionId: 1,
        inputType: 'textInput',
        required: true,
        isNeedToRender: true,
        value: this.state.login,
        placeholder: 'Login',
        label: 'Input login:',
        onChange: (e: any) => {
          this.inputValue(e.target.value, 'login')
        }
      },
      {
        positionId: 2,
        inputType: 'passwordInput',
        required: true,
        isNeedToRender: true,
        value: this.state.password,
        placeholder: 'Password',
        label: 'Input password:',
        onChange: (e: any) => {
          this.inputValue(e.target.value, 'password')
        }
      }
    ];
  }

  renderTitle = () => {
    return (<div>
      <Row type="flex" justify="space-around" align="middle">
        <h2>{this.getLevelTitle()}</h2>
      </Row>
      {this.renderBreadCrumb()}
    </div>);
  };

  renderModalTitle = () => {
    let title = '';
    switch (this.getLevelKey()) {
      case StructureLevel.Platform:
        title = 'Platform' || localization.ADD_PLATFORM[lang];
        break;
      case StructureLevel.Office:
        title = localization.ADD_OFFICE[lang];
        break;
      case StructureLevel.Room:
        title = localization.ADD_ROOM[lang];
        break;
    }
    return title;
  };

  onChangeInput = (e: any, row: any, dataIndex: any) => {
    if (dataIndex === 'login') {
      let logins: dataToSaveItemI[] = [...this.state.dataToSave.logins];
      let filteredValue = logins.filter((val: any) => {
        return val.id === row.id
      })[0];
      if (filteredValue) {
        for (let i = 0; i < this.state.dataToSave.logins.length; i++) {
          let ver = this.state.dataToSave.logins[i];
          if (ver.id === row.id) {
            logins[i].value = e.target.value;
          }
        }
      } else {
        logins.push({
          id: row.id,
          value: e.target.value
        });
      }
      this.setState({
        dataToSave: {
          logins: logins,
          names: [...this.state.dataToSave.names],
          currencies: [...this.state.dataToSave.currencies],
          groups: [...this.state.dataToSave.groups]
        }
      });
    } else if (dataIndex === 'name') {
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
          logins: [...this.state.dataToSave.logins],
          currencies: [...this.state.dataToSave.currencies],
          groups: [...this.state.dataToSave.groups]
        }
      });
    } else if (dataIndex === 'currencyId') {
      let currencies: dataToSaveItemI[] = [...this.state.dataToSave.currencies];
      let filteredValue = currencies.filter((val: any) => {
        return val.id === row.id
      })[0];
      if (filteredValue) {
        for (let i = 0; i < this.state.dataToSave.currencies.length; i++) {
          let item = this.state.dataToSave.currencies[i];
          if (item.id === row.id) {
            currencies[i].value = e;
          }
        }
      } else {
        currencies.push({
          id: row.id,
          value: e
        });
      }
      this.setState({
        dataToSave: {
          names: [...this.state.dataToSave.names],
          logins: [...this.state.dataToSave.logins],
          currencies: currencies,
          groups: [...this.state.dataToSave.groups]
        }
      });
    } else if (dataIndex === 'groupId') {
      let groups: dataToSaveItemI[] = [...this.state.dataToSave.groups];
      let filteredValue = groups.filter((val: any) => {
        return val.id === row.id
      })[0];
      if (filteredValue) {
        for (let i = 0; i < this.state.dataToSave.groups.length; i++) {
          let item = this.state.dataToSave.groups[i];
          if (item.id === row.id) {
            groups[i].value = e;
          }
        }
      } else {
        groups.push({
          id: row.id,
          value: e
        });
      }
      this.setState({
        dataToSave: {
          names: [...this.state.dataToSave.names],
          logins: [...this.state.dataToSave.logins],
          groups: groups,
          currencies: [...this.state.dataToSave.currencies]
        }
      });
    } else {
      console.log('other');
    }
   
  };

  render() {
    return (
      <div className={'gutter-box-padding'}>
        <ModalComponent
          loading={this.props.loadingCurrency || this.props.loadingGroups || this.props.loadingWallets}
          elementsInRow={3}
          handleOk={() => {
            this.props.addEntity(this)
          }}
          handleCancel={this.onCancel}
          modalTitle={this.renderModalTitle()}
          filterInputs={this.renderAddPanelInputs()}
          visible={this.state.showModal}/>
        <ModalComponent
          elementsInRow={1}
          handleOk={() => {
            this.props.changePassword(this);
          }}
          handleCancel={this.onCancel}
          modalTitle={`Change Password. Login: ${this.state.itemLogin} (#${this.state.itemId})`}
          filterInputs={this.renderPasswordPanelInputs()}
          visible={this.state.showPasswordModal}/>
        <IpEditForm
          elementsInRow={1}
          handleOk={(ipArr: any) => {
            this.props.changeIpAddress(this, ipArr);
          }}
          handleCancel={this.onCancel}
          key={this.state.showIpAddressModal}
          modalTitle={`Change Ip. Login: ${this.state.itemLogin} (#${this.state.itemId})`}
          filterInputs={this.renderIpAddressPanelInputs(this)}
          visible={this.state.showIpAddressModal}/>
        <ModalComponent
          elementsInRow={1}
          handleOk={() => {
            this.props.createPlayer(this);
          }}
          handleCancel={this.onCancel}
          modalTitle={`Create casino player. Room: ${this.state.modalPlayerRoomName} (#${this.state.modalPlayerRoomId})`}
          filterInputs={this.renderCreatePlayerPanelInputs()}
          visible={this.state.showModalPlayer}/>
        <ModalComponent
          elementsInRow={1}
          handleOk={() => {
            this.props.createAdmin(this);
          }}
          handleCancel={this.onCancel}
          modalTitle={`Create admin`}
          filterInputs={this.renderCreateAdminPanelInputs()}
          visible={this.state.showModalAdmin}/>
        <Row type="flex" justify="space-around" align="middle">
          <AddPanel
            buttons={this.renderAddPanelBtns()}
            title={localization.STRUCTURE_TITLE[lang]}
            goToDescriptionInHelp={this.goToDescriptionInHelp}
            filterInputs={this.renderAddPanelFilters()}
          />
        </Row>
        <Row type="flex" justify="space-around" align="middle">
          {this.props.report ? this.renderTable() : <SpinComponent/>}
        </Row>
      </div>);
  }
}


export const StructureV2 = withRouter(StructureVO);
