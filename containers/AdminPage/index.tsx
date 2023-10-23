import * as React from 'react';
import {Row, Col, notification /*Affix, Layout*/} from 'antd';
import {FaviconComponent} from "app/components/FaviconComponent";
import {isDeviceMobileAndTablet} from "app/utils";
import localization from "app/localization";
import {ContentComponent} from "app/components/ContentComponent";
import {NavigationComponent} from "app/components/NavigationComponent";


let lang = localStorage.getItem('lang') || 'en';
let resizeId: any;
export namespace AdminPage {
  export interface Props {
  }

  export interface State {
  }
}

class AdminPageVO extends React.Component<AdminPage.Props, AdminPage.State> {

  constructor(props: AdminPage.Props, context?: any) {
    super(props, context);
  }

  componentDidMount() {
    //open default report
    if (!isDeviceMobileAndTablet()) {
      window.addEventListener("resize", this.openNotificationWarningResize);
    }
  }

  componentWillUnmount() {
    if (!isDeviceMobileAndTablet()) {
      window.removeEventListener("resize", this.openNotificationWarningResize);
    }
  }

  shouldComponentUpdate(){
    return false;
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

  render() {
    let menu_height = 46/*64*/;
    let height: string = `calc(100vh - ${menu_height}px)`;
    let isMobileAndTablet = isDeviceMobileAndTablet();
    // console.log('RENDER: admin page');
    return (
      <div style={{width: '100%'}}>
        <FaviconComponent/>
        <Row>
          <div id={'print-not-visible'}>
            <NavigationComponent/>
          </div>
          <Col id={'affix-scrollable-content'} xs={24} sm={24} md={isMobileAndTablet ? 24 : 21} lg={isMobileAndTablet ? 24 : 21} xl={21}
               style={{padding: '10px', overflowY: isMobileAndTablet ? 'visible' : 'auto', height}}>
            <ContentComponent/>
          </Col>
        </Row>
      </div>);
  }
}

export const AdminPage = AdminPageVO;
