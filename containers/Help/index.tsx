import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Row} from 'antd';
import localization from "app/localization";
import {resetTableData} from "app/actions/table";
import {InfoPanel} from "app/components/InfoPanel";
import {HelpComponent} from "app/components/HelpComponent";
import {default as roles, getRoleById} from "app/const/roles";
import {isDeviceMobileAndTablet} from "app/utils";

let lang = localStorage.getItem('lang') || 'en';
export namespace Help {
  export interface Props extends RouteComponentProps<void> {
    resetTableData: any;
    prevPage: any;
  }

  export interface State {
  }
}

@connect((state): any => ({
    prevPage: state.filter.previousPage,
  }),
  (dispatch: any, ownProps: any): any => ({
    resetTableData() {
      dispatch(resetTableData())
    }
  })
)

class HelpVO extends React.Component<Help.Props, Help.State> {

  constructor(props: Help.Props, context?: any) {
    super(props, context);
  }

  componentWillUnmount() {
    this.props.resetTableData();
  }

  pageToGoBack = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let page = this.props.prevPage && this.props.prevPage.help ? this.props.prevPage.help : `${(roles as any)[role].route}${(roles as any)[role].children.OFFICE_REPORT}?page=1&size=10`;
    this.props.history.push(page)
  };

  render() {
    return (
      <div className={'gutter-box-padding'} id={'help-container'}>
        <InfoPanel
          goBack={this.pageToGoBack}
          loading={false}
          affixContainer={() => (!isDeviceMobileAndTablet() ? (document.getElementById('help-container') as any).parentElement : window)}
          infoText={[]}
          title={(localization.HELP as any)[lang]}/>
        <Row type="flex" justify="space-around" align="middle">
          <HelpComponent/>
        </Row>
      </div>);
  }
}

export const Help = withRouter(HelpVO);


