import * as React from 'react';
import {Button, Row, Col, Icon, Affix, Form, Divider} from 'antd';
import localization from "app/localization";
import {isChrome, isDeviceMobile, isDeviceMobileAndTablet} from "app/utils";
import {RowsWithInputs} from "app/components/RowsWithInputs";

let lang = localStorage.getItem('lang') || 'en';

interface infoTextI {
  icon: string;
  text: string;
  title?: string;
  link?: () => void;
}

export namespace InfoPanelNamespace {
  export interface Props {
    goBack: any;
    refresh?: any;
    affixContainer?: any;
    goToDescriptionInHelp?: any;
    onPrintPage?: any;

    loading: boolean;
    infoText: infoTextI[];
    title: string;
    filterInputs?: any[];
  }
}

export class InfoPanel extends React.Component<InfoPanelNamespace.Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLocked: false,
      isCollapsed: false
    }
  }

  setLock = () => {
    this.setState({
      isLocked: !this.state.isLocked
    })
  };

  setCollapse = () => {
    this.setState({
      isCollapsed: !this.state.isCollapsed
    })
  };

  renderBackBtn() {
    return (
      this.props.affixContainer ?
        <Affix
          offsetTop={34}
          target={this.props.affixContainer}>
          <Button
            style={{marginRight: '5px'}}
            onClick={this.props.goBack}
            icon={'arrow-left'}
            type="danger">
            {(localization.BACK_HISTORY as any)[lang]}
          </Button>
        </Affix>
        :
        <Button
          style={{marginRight: '5px'}}
          onClick={this.props.goBack}
          icon={'arrow-left'}
          type="danger">
          {(localization.BACK_HISTORY as any)[lang]}
        </Button>
    )
  }

  renderFilter() {
    return (
      <Form
        className="ant-advanced-search-form"
        style={{
          width: '100%', padding: '12px',
          background: '#fbfbfb',
          border: '1px solid #d9d9d9',
          position: 'relative',
          borderRadius: '6px'
        }}>
        <div style={{fontSize: '25px', position: 'absolute', right: 12, top: 12, lineHeight: 1, zIndex: 1}}>
          {
            (this.props.goToDescriptionInHelp && !isDeviceMobile()) &&
            <a onClick={this.setLock}
               title={this.state.isLocked ? localization.UNLOCK_PANEL[lang] : localization.LOCK_PANEL[lang]}><Icon
              type={this.state.isLocked ? "lock" : "unlock"} theme="outlined"/>
            </a>
          }
          {
            (this.props.onPrintPage && !isDeviceMobile() && isChrome()) &&
            <a onClick={this.props.onPrintPage}
               style = {this.state.isLocked?{pointerEvents:'none', opacity: 0.5, marginLeft:'12px'}:{marginLeft:'12px'}}
               title={localization.PRINT_PAGE[lang]}><Icon type={'printer'}/>
            </a>
          }
          {
            this.props.goToDescriptionInHelp &&
            <a onClick={this.props.goToDescriptionInHelp}
               style={{marginLeft:'12px'}}
               title={localization.READ_MORE_ABOUT[lang]}><Icon type={'question-circle'}/>
            </a>
          }
        </div>
        <div style={{position: isDeviceMobileAndTablet() ? 'relative' : 'absolute'}}>
          {this.props.goBack && this.renderBackBtn()}
          {
            this.props.refresh ?
              <Button
                loading={this.props.loading}
                onClick={this.props.refresh}
                icon={'reload'}
                type="primary">
                {(localization.REFRESH_HISTORY as any)[lang]}
              </Button> : null
          }
        </div>

        <Row type="flex" justify="space-around" align="middle">
          <h1>
            {this.props.title}
          </h1>
        </Row>

        <Row type="flex" justify="center" align="top">
          {
            this.props.infoText.map((v: any, index: number) => {
              let props = v.component ?
                {
                  component: () => v.component
                } :
                {
                  type: v.icon
                };
              return (
                <Col key={index} className="gutter-row"
                     style={{textAlign: 'center', wordBreak: 'break-word', marginTop: '5px', marginBottom: '5px'}}
                     xs={24}
                     sm={24} md={24} lg={3} xl={3}>
                  {
                    v.link ?
                      <a title={v.title} onClick={v.link}><Icon {...props} />{v.text}</a>
                      :
                      <span><Icon {...props} />{v.text}</span>
                  }
                </Col>
              )
            })
          }
        </Row>
        {
          this.props.filterInputs && <Divider/>
        }
        {
          this.props.filterInputs &&
          <RowsWithInputs
            inputs={this.props.filterInputs}
            isCollapsed={this.state.isCollapsed}
            setCollapse={this.setCollapse}/>
        }
      </Form>
    )
  }

  render() {
    return (
      this.state.isLocked ?
        <Affix
          target={() => document.getElementById('affix-scrollable-content')}
          offsetTop={12}
          style={{
            width: '100%'
          }}>
          {
            this.renderFilter()
          }
        </Affix> : this.renderFilter()
    );
  }
}
