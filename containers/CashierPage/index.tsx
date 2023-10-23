import * as React from 'react';
import {connect} from 'react-redux';
import {Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import api, {filterMenuItemsByRelease, getAdminPanelVersion, hasSettingsToRender} from 'app/const/api';
import {Row, Col, notification} from 'antd';
import {login} from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import NavBarHorizontal from "app/components/NavBarHorizontal";
import {NavBarVertical} from "app/components/NavBarVertical";
import {CurrencyReport} from "app/containers/CurrencyReport";
import roles from "app/const/roles";
import localization from "app/localization";
import {GamesReport} from "app/containers/GamesReport";
import {isDeviceMobileAndTablet, substituteQueryParam, openAccount} from "app/utils";
import {BackOfficeUsers} from "app/containers/UsersPage";
import {FaviconComponent} from "app/components/FaviconComponent";
import {HistoryDetails} from "app/containers/HistoryDetails";
import {Help} from "app/containers/Help";
import { Account } from "app/containers/Account";
import {previousPage, selectTimeZone} from "app/actions/filter";
import {BetsHistoryList} from "app/containers/BetsHistory";
import {TransfersHistoryList} from "app/containers/TransfersHistory";
import {CurrencySettings} from "app/containers/CurrencySettings";
import {DayReport} from "app/containers/DayReport";

let lang = localStorage.getItem('lang') || 'en';
const VERSION = getAdminPanelVersion();
let resizeId: any;
export namespace LoginPage {
  export interface Props extends RouteComponentProps<void> {
    logOut: any;
    currentTab: string;
    savePrevPageForHelp: any;
    selectTimeZone: (val: string) => void;
    timeZone: string;
  }

  export interface State {
  }
}

@connect((state): any => ({
    currentTab: state.router.location.pathname,
    timeZone: state.filter.timeZone
  }),
  (dispatch: any): any => ({
    logOut: (that: any) => {
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.LOGOUT);
      let data = {
        url: api.LOG_OUT,
        method: ajaxRequestTypes.METHODS.POST,
        params: {
          sessionId: (localStorage.getItem("sessionId") as string),
        }
      };
      login(types, data, that.props.history, dispatch).then((res) => {
        if (res) {
          localStorage.setItem('sessionId', '');
        }
      });
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    selectTimeZone: (val: string) => {
      dispatch(selectTimeZone(val))
    }
  })
)

class CashierPageVO extends React.Component<LoginPage.Props, LoginPage.State> {

  constructor(props: LoginPage.Props, context?: any) {
    super(props, context);
    this.logOut = this.logOut.bind(this);
    this.changeVerticalNavBarTab = this.changeVerticalNavBarTab.bind(this);
    this.pushToHistoryCurrencyReport = this.pushToHistoryCurrencyReport.bind(this);
    this.pushToHistoryGameReport = this.pushToHistoryGameReport.bind(this);
    this.pushToHistoryBackOfficeUsers = this.pushToHistoryBackOfficeUsers.bind(this);
    this.pushToHistoryCasinoUsers = this.pushToHistoryCasinoUsers.bind(this);
    this.pushToHistoryBetsHistory = this.pushToHistoryBetsHistory.bind(this);
    this.pushToHistoryTransfersHistory = this.pushToHistoryTransfersHistory.bind(this);
    this.pushToHistoryCurrencySetting = this.pushToHistoryCurrencySetting.bind(this);
    this.pushToHistoryDayReport = this.pushToHistoryDayReport.bind(this);
  }

  componentDidMount() {
    //open default report
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.currentTab === roles.CASHIER.route) {
      this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children["CURRENCIES_REPORT_" + VERSION]}?page=1&size=10`);
    } else {
      if (roleId != roles.CASHIER.id) {
        this.props.history.push(`/`);
      }
    }
    if (!isDeviceMobileAndTablet()) {
      window.addEventListener("resize", this.openNotificationWarningResize);
    }
  }

  componentWillUnmount() {
    if (!isDeviceMobileAndTablet()) {
      window.removeEventListener("resize", this.openNotificationWarningResize);
    }
  }

  openNotificationWarningResize() {
    clearTimeout(resizeId);
    resizeId = setTimeout(() => {
      if (window.innerWidth <= 767) {
        notification.destroy();
        notification.config({
          duration: 3,
          placement: 'bottomRight'
        });
        notification.warning({
          message: localization.RESIZE_WARNING_TITLE[lang],
          description: localization.RESIZE_WARNING_DESCRIPTION[lang],
        });
      } else {
        notification.destroy();
      }
    }, 500);
  }

  logOut() {
    this.props.logOut(this);
  }

  changeVerticalNavBarTab(): string[] {
    switch (this.props.currentTab) {
      case `${roles.CASHIER.route}${roles.CASHIER["CURRENCIES_REPORT_" + VERSION]}`:
        return ['v-1'];
      case `${roles.CASHIER.route}${roles.CASHIER["GAMES_REPORT_" + VERSION]}`:
        return ['v-2'];
      case `${roles.CASHIER.route}${roles.CASHIER.children.USERS_BACKOFFICE}`:
        return ['v-3'];
      case `${roles.CASHIER.route}${roles.CASHIER.children.USERS_CASINO}`:
        return ['v-4'];
      case `${roles.CASHIER.route}${roles.CASHIER.children.BETS_HISTORY}`:
        return ['v-6'];
      case `${roles.CASHIER.route}${roles.CASHIER.children.TRANSFERS_HISTORY}`:
        return ['v-61'];
      case `${roles.CASHIER.route}${roles.CASHIER.children.CURRENCY_SETTINGS}`:
        return ['v-7'];
      case `${roles.CASHIER.route}${roles.CASHIER.children.DAY_REPORT}`:
        return ['v-14'];
      default: {
        return [];
      }
    }
  }


  openHelp = () => {
    let help_url = `${roles.CASHIER.route}${roles.CASHIER.children.HELP}`;
    if (help_url === this.props.currentTab) {
      return;
    }
    this.props.savePrevPageForHelp(this.props.currentTab + this.props.history.location.search);
    this.props.history.push(help_url);
  };

  onTimeZoneChange = (val: string) => {
    this.props.selectTimeZone(val);
  };

  pushToHistoryCurrencyReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children["CURRENCIES_REPORT_" + VERSION]}${search}`)
  }

  pushToHistoryGameReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children["GAMES_REPORT_" + VERSION]}${search}`)
  }

  pushToHistoryBackOfficeUsers() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children.USERS_BACKOFFICE}${search}`)
  }

  pushToHistoryCasinoUsers() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children.USERS_CASINO}${search}`)
  }

  pushToHistoryBetsHistory() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children.BETS_HISTORY}${search}`)
  }

  pushToHistoryTransfersHistory() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children.TRANSFERS_HISTORY}${search}`)
  }

  pushToHistoryCurrencySetting() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children.CURRENCY_SETTINGS}${search}`)
  }

  pushToHistoryDayReport() {
    let search = this.resetPagination();
    this.props.history.push(`${roles.CASHIER.route}${roles.CASHIER.children.DAY_REPORT}${search}`)
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
        groupName: (localization.REPORTS_SUBMENU_ITEM as any)[lang],
        name: (localization.CURRENCY_REPORT_MENU_ITEM as any)[lang],
        pushToHistory: this.pushToHistoryCurrencyReport,
        isRelease:true
      },
      {
        id: 'v-2',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: (localization.REPORTS_SUBMENU_ITEM as any)[lang],
        name: (localization.GAME_REPORT_MENU_ITEM as any)[lang],
        pushToHistory: this.pushToHistoryGameReport,
        isRelease:true
      },
      {
        id: 'v-14',
        groupId: 'sub-1',
        itemIcon: null,
        groupIcon: 'pie-chart',
        groupName: localization.REPORTS_SUBMENU_ITEM[lang],
        name: localization.DAY_REPORT_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryDayReport,
        isRelease:true
      },
      {
        id: 'v-3',
        groupId: 'sub-2',
        itemIcon: null,
        groupIcon: 'solution',
        groupName: (localization.USERS_SUBMENU_ITEM as any)[lang],
        name: (localization.BACKOFFICE_USERS_MENU_ITEM as any)[lang],
        pushToHistory: this.pushToHistoryBackOfficeUsers,
        isRelease:true
      },
      {
        id: 'v-4',
        groupId: 'sub-2',
        itemIcon: null,
        groupIcon: 'solution',
        groupName: (localization.USERS_SUBMENU_ITEM as any)[lang],
        name: (localization.CASINO_USERS_MENU_ITEM as any)[lang],
        pushToHistory: this.pushToHistoryCasinoUsers,
        isRelease:true
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
        id: 'v-7',
        groupId: 'sub-4',
        itemIcon: null,
        groupIcon: 'setting',
        groupName: localization.SETTINGS_SUBMENU_ITEM[lang],
        name: localization.CURRENCY_MENU_ITEM[lang],
        pushToHistory: this.pushToHistoryCurrencySetting,
        isRelease: hasSettingsToRender()
      }
    ];

    menuItems = filterMenuItemsByRelease(menuItems);

    let menu_height = 46;
    let height: string = window.innerHeight - menu_height + 'px';
    let isMobileAndTablet = isDeviceMobileAndTablet();
    return (
      <div style={{width: '100%'}}>
        <FaviconComponent/>
        <Row>
          <NavBarHorizontal
            timeZone={this.props.timeZone}
            onTimeZoneChange={this.onTimeZoneChange}
            openAccount={openAccount(this, roles, 'CASHIER')}
            openHelp={this.openHelp}
            selectedKeyForVertical={currTab}
            menuItemsForVertical={menuItems}
            eventTypes={["touchstart"]}
            logOut={this.logOut}/>
        </Row>
        <Row>
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
          <Col id={'affix-scrollable-content'} xs={24} sm={24} md={isMobileAndTablet ? 24 : 21} lg={isMobileAndTablet ? 24 : 21} xl={21}
               style={{padding: '10px', overflowY: isMobileAndTablet ? 'visible' : 'auto', height}}>
            <Switch>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.HELP}`} component={Help}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.ACCOUNT}`} component={Account}/>

              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.CURRENCIES_REPORT_V3}`} component={CurrencyReport}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.CURRENCIES_REPORT_V3}/:currencyId`} component={CurrencyReport}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.CURRENCIES_REPORT_V3}/:currencyId/:officeId`} component={CurrencyReport}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.CURRENCIES_REPORT_V3}/:currencyId/:officeId/:roomId`} component={CurrencyReport}/>

              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.GAMES_REPORT_V3}`} component={GamesReport}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.GAMES_REPORT_V3}/:gameId`} component={GamesReport}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.GAMES_REPORT_V3}/:gameId/:platform`} component={GamesReport}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.GAMES_REPORT_V3}/:gameId/:platform/:officeId`} component={GamesReport}/>

              <Route path={`${roles.CASHIER.route}${roles.CASHIER.children.DAY_REPORT}`} component={DayReport}/>

              <Route path={`${roles.CASHIER.route}${roles.CASHIER.children.USERS_BACKOFFICE}`} component={BackOfficeUsers} key={window.location.pathname}/>
              <Route path={`${roles.CASHIER.route}${roles.CASHIER.children.USERS_CASINO}`} component={BackOfficeUsers} key={window.location.pathname}/>
              <Route path={`${roles.CASHIER.route}${roles.CASHIER.children.BETS_HISTORY}`} component={BetsHistoryList} key={window.location.pathname}/>
              <Route path={`${roles.CASHIER.route}${roles.CASHIER.children.TRANSFERS_HISTORY}`} component={TransfersHistoryList} key={window.location.pathname}/>

              <Route path={`${roles.CASHIER.route}${roles.CASHIER.children.CURRENCY_SETTINGS}`} component={CurrencySettings}/>

              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.HISTORY_LIST}/:id`} component={BetsHistoryList} key={window.location.pathname}/>
              <Route exact path={`${roles.CASHIER.route}${roles.CASHIER.children.HISTORY_LIST}`} component={BetsHistoryList} key={window.location.pathname}/>
              <Route exact
                     path={`${roles.CASHIER.route}${roles.CASHIER.children.HISTORY_LIST}/:id${roles.CASHIER.children.HISTORY_DETAILS}/:recordId`}
                     component={HistoryDetails}/>
            </Switch>
          </Col>
        </Row>
      </div>);
  }
}

export const CashierPage = withRouter(CashierPageVO);
