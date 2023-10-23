import * as React from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {Col, /*Affix, Layout*/} from 'antd';
import {NavBarVertical} from "app/components/NavBarVertical";
import {NavBarHorizontalContainer} from "app/containers/NavBarHorizontalContainer";
import {isDeviceMobileAndTablet, substituteQueryParam} from "app/utils";
import roles from   "app/const/roles";
import localization from "app/localization";
import {filterMenuItems, getAdminPanelVersion, isPanelAggregate} from "app/const/api";


let lang = localStorage.getItem('lang') || 'en';
const VERSION = getAdminPanelVersion();
export namespace NavigationComponent {
  export interface Props extends RouteComponentProps<void> {
  }

  export interface State {
  }
}

class NavigationComponentWithRouter extends React.Component<NavigationComponent.Props, NavigationComponent.State> {

  constructor(props: NavigationComponent.Props, context?: any) {
    super(props, context);
    this.changeVerticalNavBarTab = this.changeVerticalNavBarTab.bind(this);
    this.pushToHistoryCurrencyReport = this.pushToHistoryCurrencyReport.bind(this);
    this.pushToHistoryGameReport = this.pushToHistoryGameReport.bind(this);
    this.pushToHistoryBackOfficeUsers = this.pushToHistoryBackOfficeUsers.bind(this);
    this.pushToHistoryCasinoUsers = this.pushToHistoryCasinoUsers.bind(this);
    this.pushToHistoryOfficeReport = this.pushToHistoryOfficeReport.bind(this);
    this.pushToHistoryBetsHistory = this.pushToHistoryBetsHistory.bind(this);
    this.pushToHistoryTransfersHistory = this.pushToHistoryTransfersHistory.bind(this);
    this.pushToHistoryCurrencySetting = this.pushToHistoryCurrencySetting.bind(this);
    this.pushToHistoryLineBetSetting = this.pushToHistoryLineBetSetting.bind(this);
    this.pushToHistoryGameVersionSetting = this.pushToHistoryGameVersionSetting.bind(this);
    this.pushToHistoryWalletOptionsSetting = this.pushToHistoryWalletOptionsSetting.bind(this);
    this.pushToHistoryGameOptionsSetting = this.pushToHistoryGameOptionsSetting.bind(this);
    this.pushToHistoryApiKeysSetting = this.pushToHistoryApiKeysSetting.bind(this);
    this.pushToHistoryGamesSetting = this.pushToHistoryGamesSetting.bind(this);
    this.pushToHistoryStructure = this.pushToHistoryStructure.bind(this);
    this.pushToHistoryStructureV2 = this.pushToHistoryStructureV2.bind(this);
    this.pushToHistoryDayReport = this.pushToHistoryDayReport.bind(this);
    this.pushToHistoryCountryReport = this.pushToHistoryCountryReport.bind(this);
    this.pushToHistoryDeviceReport = this.pushToHistoryDeviceReport.bind(this);
    this.pushToHistoryGamificationInfo = this.pushToHistoryGamificationInfo.bind(this);
  }

  changeVerticalNavBarTab(): string[] {
    switch (this.props.history.location.pathname) {
      case `${roles.ADMIN.route}${roles.ADMIN.children["CURRENCIES_REPORT_" + VERSION]}`:
        return ['v-2'];
      case `${roles.ADMIN.route}${roles.ADMIN.children["GAMES_REPORT_" + VERSION]}`:
        return ['v-3'];
      case `${roles.ADMIN.route}${roles.ADMIN.children["OFFICE_REPORT_" + VERSION]}`:
        return ['v-1'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.USERS_BACKOFFICE}`:
        return ['v-4'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.USERS_CASINO}`:
        return ['v-5'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.BETS_HISTORY}`:
        return ['v-6'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.TRANSFERS_HISTORY}`:
        return ['v-61'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.CURRENCY_SETTINGS}`:
        return ['v-7'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.BET_GROUP}`:
        return ['v-8'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.GAME_VERSION_SETTINGS}`:
        return ['v-9'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.WALLET_OPTIONS_SETTINGS}`:
        return ['v-10'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.API_KEYS_SETTINGS}`:
        return ['v-11'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.GAMES_SETTINGS}`:
        return ['v-12'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}`:
        return ['v-13'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.COUNTRY_REPORT}`:
        return ['v-14'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.DEVICE_REPORT}`:
        return ['v-15'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.DAY_REPORT}`:
        return ['v-16'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.GAMIFICATION}`:
        return ['v-17'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.GAME_OPTIONS_SETTINGS}`:
        return ['v-18'];
      case `${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE_V2}`:
        return ['v-19'];  
      default: {
        return [];
      }
    }
  }

  // shouldComponentUpdate(nextProps: any, nextState: any) {
  //   return nextProps.history.location.pathname !== this.props.history.location.pathname;
  // }

  pushToHistoryCurrencyReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children["CURRENCIES_REPORT_" + VERSION]}${search}`)
  }

  pushToHistoryGameReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children["GAMES_REPORT_" + VERSION]}${search}`)
  }

  pushToHistoryOfficeReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children["OFFICE_REPORT_" + VERSION]}${search}`)
  }

  pushToHistoryBackOfficeUsers() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.USERS_BACKOFFICE}${search}`)
  }

  pushToHistoryCasinoUsers() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.USERS_CASINO}${search}`)
  }

  pushToHistoryBetsHistory() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.BETS_HISTORY}${search}`)
  }

  pushToHistoryTransfersHistory() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.TRANSFERS_HISTORY}${search}`)
  }

  pushToHistoryCurrencySetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.CURRENCY_SETTINGS}${search}`)
  }

  pushToHistoryLineBetSetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.BET_GROUP}${search}`)
  }

  pushToHistoryGameVersionSetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.GAME_VERSION_SETTINGS}${search}`)
  }

  pushToHistoryWalletOptionsSetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.WALLET_OPTIONS_SETTINGS}${search}`)
  }

  pushToHistoryGameOptionsSetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.GAME_OPTIONS_SETTINGS}${search}`)
  }

  pushToHistoryApiKeysSetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.API_KEYS_SETTINGS}${search}`)
  }

  pushToHistoryGamesSetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.GAMES_SETTINGS}${search}`)
  }

  pushToHistoryStructure() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}${search}`)
  }

  pushToHistoryStructureV2() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE_V2}${search}`)
  }

  pushToHistoryDayReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.DAY_REPORT}${search}`)
  }

  pushToHistoryCountryReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.COUNTRY_REPORT}${search}`)
  }

  pushToHistoryDeviceReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.DEVICE_REPORT}${search}`)
  }

  pushToHistoryGamificationInfo() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children.GAMIFICATION}${search}`)
  }

  resetPagination(){
    return substituteQueryParam(this.props.location.search,
      [
      {
        key: 'page',
        value: 1
      }
    ]);
  }

  render() {
    let currTab = this.changeVerticalNavBarTab();
    let menuItems = [
      {
        id: 'v-1',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: localization.REPORTS_SUBMENU_ITEM[lang],
        name: localization.OFFICE_REPORT_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryOfficeReport,
        isRelease:true,
      },
      {
        id: 'v-2',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: localization.REPORTS_SUBMENU_ITEM[lang],
        name: localization.CURRENCY_REPORT_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryCurrencyReport,
        isRelease:true,
      },
      {
        id: 'v-3',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: localization.REPORTS_SUBMENU_ITEM[lang],
        name: localization.GAME_REPORT_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryGameReport,
        isRelease:true,
      },
      {
        id: 'v-14',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: 'Country',
        name: 'Country',
        pushToHistory: this.pushToHistoryCountryReport,
        isRelease: true
      },
      {
        id: 'v-15',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: 'Device',
        name: 'Device',
        pushToHistory: this.pushToHistoryDeviceReport,
        isRelease: true
      },
      {
        id: 'v-16',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: localization.REPORTS_SUBMENU_ITEM[lang],
        name: localization.DAY_REPORT_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryDayReport,
        isRelease:true
      },
      {
        id: 'v-4',
        groupId: 'sub-2',
        itemIcon: null,
        groupIcon: 'solution',
        groupName: localization.USERS_SUBMENU_ITEM[lang],
        name: localization.BACKOFFICE_USERS_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryBackOfficeUsers,
        isRelease:true,
      },
      {
        id: 'v-5',
        groupId: 'sub-2',
        itemIcon: null,
        groupIcon: 'solution',
        groupName: localization.USERS_SUBMENU_ITEM[lang],
        name: localization.CASINO_USERS_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryCasinoUsers,
        isRelease:true,
      },
      {
        id: 'v-6',
        groupId: 'sub-3',
        itemIcon: 'book',
        groupIcon: null,
        groupName: null,
        name: localization.BETS_HISTORY_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryBetsHistory,
        isRelease:true
      },
      {
        id: 'v-61',
        groupId: 'sub-8',
        itemIcon: 'transaction',
        groupIcon: null,
        groupName: null,
        name: 'Transfer History',
        pushToHistory: this.pushToHistoryTransfersHistory,
        isRelease: true,
        removeForAggregate: true
      },
      {
        id: 'v-12',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: 'Game',
        pushToHistory: this.pushToHistoryGamesSetting,
        isRelease: !isPanelAggregate() // isTest()
      },
      {
        id: 'v-9',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: localization.GAME_VERSION_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryGameVersionSetting,
        isRelease:true,
        removeForAggregate:true
      },
      {
        id: 'v-18',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: 'Game Option',
        pushToHistory: this.pushToHistoryGameOptionsSetting,
        isRelease: true,
        removeForAggregate: true
      },
      {
        id: 'v-8',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: 'Bet Group',
        pushToHistory: this.pushToHistoryLineBetSetting,
        isRelease: !isPanelAggregate() // isTest()
      },
      {
        id: 'v-7',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: localization.CURRENCY_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryCurrencySetting,
        isRelease:true
      },
      {
        id: 'v-10',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: 'Wallet Option',
        pushToHistory: this.pushToHistoryWalletOptionsSetting,
        isRelease: !isPanelAggregate()
      },
      {
        id: 'v-11',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: 'API Key',
        pushToHistory: this.pushToHistoryApiKeysSetting,
        isRelease: !isPanelAggregate()
      },
      {
        id: 'v-13',
        groupId: 'sub-5',
        itemIcon: 'apartment',
        groupIcon: null,
        groupName: null,
        name: localization.STRUCTURE_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryStructure,
        isRelease: !isPanelAggregate()
      },
      {
        id: 'v-19',
        groupId: 'sub-7',
        itemIcon: 'apartment',
        groupIcon: null,
        groupName: null,
        name: localization.STRUCTURE_MENU_ITEM[lang]+' V2',
        pushToHistory: this.pushToHistoryStructureV2,
        isRelease: false,
        removeForAggregate: true
      },
      {
        id: 'v-17',
        groupId: 'sub-6',
        itemIcon: 'trophy',
        groupIcon: null,
        groupName: null,
        name: `Gamification`,
        pushToHistory: this.pushToHistoryGamificationInfo,
        isRelease: true,
        removeForAggregate:true
      },
    ];

    menuItems = filterMenuItems(menuItems);

    let menu_height = 46/*64*/;
    let height: string = `calc(100vh - ${menu_height}px)`;
    let isMobileAndTablet = isDeviceMobileAndTablet();
    
    return (
      <div>
        <Col span={24}>
          <NavBarHorizontalContainer
            menuItems={menuItems}
            currTab={currTab}
            role={"ADMIN"}
          />
        </Col>
        <Col span={3}>
          {
            !isMobileAndTablet ?
              <NavBarVertical
                height={height}
                selectedKey={currTab}
                menuItems={menuItems}/>
              : null
          }
        </Col>
      </div>);
  }
}

export const NavigationComponent = withRouter(NavigationComponentWithRouter);
