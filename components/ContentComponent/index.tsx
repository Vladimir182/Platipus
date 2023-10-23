import * as React from 'react';
import {Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {CurrencyReport} from "app/containers/CurrencyReport";
import {GamesReport} from "app/containers/GamesReport";
import {CountryReport} from "app/containers/CountryReport";
import {BackOfficeUsers} from "app/containers/UsersPage";
import {HistoryDetails} from "app/containers/HistoryDetails";
import {OfficeReport} from "app/containers/PlatformReport";
import {Help} from "app/containers/Help";
import { Account } from "app/containers/Account";
import {BetsHistoryList} from "app/containers/BetsHistory";
import {TransfersHistoryList} from "app/containers/TransfersHistory";
import roles from "app/const/roles";
import {CurrencySettings} from "app/containers/CurrencySettings";
import {BetGroupSetting} from "app/containers/BetGroupSetting";
import {BetGroup} from "app/containers/BetGroup";
import {GameVersionSettings} from "app/containers/GameVersionSettings";
import {WalletOptionsSettings} from "app/containers/WalletOptionsSettings";
import {ApiKeysSettings} from "app/containers/ApiKeysSettings";
import {GamesSettings} from "app/containers/GamesSettings";
import {Structure} from "app/containers/Structure";
import {getAdminPanelVersion} from "app/const/api";
import {DayReport} from "app/containers/DayReport";
import {DeviceReport} from "app/containers/DeviceReport";
import { GamificationInfo } from 'app/containers/GamificationInfo';
import { GamificationGroupInfo } from 'app/containers/GamificationGroupInfo';
import { GamificationRating } from 'app/containers/GamificationRating';
import { GameOptionsSettings } from 'app/containers/GameOptionsSettings';
import { StructureV2 } from 'app/containers/StructureV2';

const VERSION = getAdminPanelVersion();
export namespace LoginPage {
  export interface Props extends RouteComponentProps<void> {
  }

  export interface State {
  }
}

class ContentComponentWithRoute extends React.Component<LoginPage.Props, LoginPage.State> {

  constructor(props: LoginPage.Props, context?: any) {
    super(props, context);
  }

  componentDidMount() {
    //open default report
    let roleId = parseInt(localStorage.getItem("roleId")as any);
    if (this.props.history.location.pathname === roles.ADMIN.route) {
      this.props.history.push(`${roles.ADMIN.route}${roles.ADMIN.children["OFFICE_REPORT_" + VERSION]}?page=1&size=10`);
    } else {
      if (roleId != roles.ADMIN.id) {
        this.props.history.push(`/`);
      }
    }
  }

  render() {
    // console.log('RENDER: content component');
    return (
      <Switch>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.HELP}`} component={Help}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.ACCOUNT}`} component={Account}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.COUNTRY_REPORT}`} component={CountryReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.COUNTRY_REPORT}/:countryId`} component={CountryReport}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.CURRENCIES_REPORT_V3}`} component={CurrencyReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.CURRENCIES_REPORT_V3}/:currencyId`} component={CurrencyReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.CURRENCIES_REPORT_V3}/:currencyId/:officeId`} component={CurrencyReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.CURRENCIES_REPORT_V3}/:currencyId/:officeId/:roomId`} component={CurrencyReport}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMES_REPORT_V3}`} component={GamesReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMES_REPORT_V3}/:gameId`} component={GamesReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMES_REPORT_V3}/:gameId/:platform`} component={GamesReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMES_REPORT_V3}/:gameId/:platform/:officeId`} component={GamesReport}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.OFFICE_REPORT_V3}`} component={OfficeReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.OFFICE_REPORT_V3}/:platform`} component={OfficeReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.OFFICE_REPORT_V3}/:platform/:officeId`} component={OfficeReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.OFFICE_REPORT_V3}/:platform/:officeId/:roomId`} component={OfficeReport}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.DAY_REPORT}`} component={DayReport}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.DEVICE_REPORT}`} component={DeviceReport}/>

        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.USERS_BACKOFFICE}`} component={BackOfficeUsers} key={window.location.pathname}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.USERS_CASINO}`} component={BackOfficeUsers} key={window.location.pathname}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.BETS_HISTORY}`} component={BetsHistoryList} key={window.location.pathname}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.TRANSFERS_HISTORY}`} component={TransfersHistoryList} key={window.location.pathname}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.CURRENCY_SETTINGS}`} component={CurrencySettings}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.BET_GROUP_SETTING}`} component={BetGroupSetting}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.BET_GROUP}`} component={BetGroup}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.GAME_VERSION_SETTINGS}`} component={GameVersionSettings}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.WALLET_OPTIONS_SETTINGS}`} component={WalletOptionsSettings}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.GAME_OPTIONS_SETTINGS}`} component={GameOptionsSettings}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.API_KEYS_SETTINGS}`} component={ApiKeysSettings}/>
        <Route path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMES_SETTINGS}`} component={GamesSettings}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.HISTORY_LIST}/:id`} component={BetsHistoryList} key={window.location.pathname}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.HISTORY_LIST}`} component={BetsHistoryList} key={window.location.pathname}/>
        <Route exact
               path={`${roles.ADMIN.route}${roles.ADMIN.children.HISTORY_LIST}/:id${roles.ADMIN.children.HISTORY_DETAILS}/:recordId`}
               component={HistoryDetails}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}`} component={Structure}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}/:platform`} component={Structure}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}/:platform/:distributorId`} component={Structure}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}/:platform/:distributorId/:officeId`} component={Structure}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}/:platform/:distributorId/:officeId/:agentId`} component={Structure}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE}/:platform/:distributorId/:officeId/:agentId/:roomId`} component={Structure}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE_V2}`} component={StructureV2}/> 
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE_V2}/:platform`} component={StructureV2}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.STRUCTURE_V2}/:platform/:officeId`} component={StructureV2}/>

        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMIFICATION}`} component={GamificationInfo}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMIFICATION_GROUP}/:gamificationId`} component={GamificationGroupInfo}/>
        <Route exact path={`${roles.ADMIN.route}${roles.ADMIN.children.GAMIFICATION_RATING}/:gamificationId`} component={GamificationRating}/>

      </Switch>);
  }
}

export const ContentComponent = withRouter(ContentComponentWithRoute);
