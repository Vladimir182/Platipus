import * as React from 'react';
import {Route, Switch} from 'react-router';
import {hot} from 'react-hot-loader';
import {LoginPage} from 'app/containers/LoginPage';
import {AdminPage} from 'app/containers/AdminPage';
import {CashierPage} from 'app/containers/CashierPage';
import {AgentPage} from 'app/containers/AgentPage';
import {DistributorPage} from 'app/containers/DistributorPage';
import role from './const/roles'
import {HistoryDetails} from "app/containers/HistoryDetails";
import {ErrorComponent} from "app/components/ErrorComponent";

export const App = hot(module)(() => (
  <Switch>
    <Route exact path={role.UNAUTHORIZED.route} component={LoginPage}/>
    <Route path={role.ADMIN.route} component={AdminPage}/>
    <Route path={role.CASHIER.route} component={CashierPage}/>
    <Route path={role.DISTRIBUTOR.route} component={DistributorPage}/>
    <Route path={role.AGENT.route} component={AgentPage}/>
    <Route path={"/round-history"} component={HistoryDetails}/>
    <Route path={"/round-details"} component={HistoryDetails}/>
    <Route path={"/error"} component={ErrorComponent}/>
    <Route path={"/get-hash"} component={LoginPage}/>
  </Switch>
));
