import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';

import api from 'app/const/api';
import {login} from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import NavBarHorizontal from "app/components/NavBarHorizontal";
import roles from "app/const/roles";
import {openAccount} from "app/utils";
import {previousPage, selectTimeZone} from "app/actions/filter";

export namespace NavBarHorizontalContainerNamespace {
  export interface Props extends RouteComponentProps<void> {
    logOut: any;
    savePrevPageForHelp: any;
    currentTab: string;
    selectTimeZone: (val: string) => void;

    currTab: any;
    menuItems: any;
    role: string;
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

class ConnectedNavBarHorizontalContainer extends React.Component<NavBarHorizontalContainerNamespace.Props, NavBarHorizontalContainerNamespace.State> {

  constructor(props: NavBarHorizontalContainerNamespace.Props, context?: any) {
    super(props, context);
    this.logOut = this.logOut.bind(this);
  }

  logOut() {
    this.props.logOut(this);
  }
  

  openHelp = () => {
    let help_url = `${roles[this.props.role].route}${roles[this.props.role].children.HELP}`;
    if (help_url === this.props.currentTab) {
      return;
    }
    this.props.savePrevPageForHelp(this.props.currentTab + this.props.history.location.search);
    this.props.history.push(help_url);
  };

  onTimeZoneChange = (val: string) => {
    this.props.selectTimeZone(val);
  };

  render() {
    return (
      <NavBarHorizontal
        timeZone={this.props.timeZone}
        onTimeZoneChange={this.onTimeZoneChange}
        openAccount={openAccount(this, roles, this.props.role)}
        openHelp={this.openHelp}
        selectedKeyForVertical={this.props.currTab}
        menuItemsForVertical={this.props.menuItems}
        eventTypes={["touchstart"]}
        logOut={this.logOut}/>)
  }
}

export const NavBarHorizontalContainer: any = withRouter(ConnectedNavBarHorizontalContainer);
