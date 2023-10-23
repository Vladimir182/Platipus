import * as React from 'react';
import {Icon, Row, /*Col,*/ Menu, Select, Popover} from 'antd';
import localization from "app/localization";
import {getRoleById} from "app/const/roles";
import {isDeviceMobile, isDeviceMobileAndTablet} from "app/utils";
import {IMenuItem} from "app/components/NavBarVertical";
import './style.css'
import {switchAdminPanelName} from "app/const/api";
import timezones from "app/const/timezones";

const {Option} = Select;
export namespace NavBarHorizontalNamespace {
  export interface Props {
    logOut: any;
    selectedKeyForVertical: string[],
    menuItemsForVertical: IMenuItem[],
    openAccount: any,
    openHelp: any;
    onTimeZoneChange: (val: any) => void;
    eventTypes?: any;
    timeZone?: any;
  }
}
let lang = localStorage.getItem('lang') || 'en';

class NavBarHorizontal extends React.Component<NavBarHorizontalNamespace.Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      openedKeys: []
    };
    this.onTitleClick = this.onTitleClick.bind(this);
    this.onOpenChange = this.onOpenChange.bind(this);
  }

  onTitleClick(e: any) {
    if (this.state.openedKeys.indexOf(e.key) === -1) {
      this.setState({
        openedKeys: [e.key]
      })
    } else {
      this.setState({
        openedKeys: []
      })
    }
  }

  onOpenChange(openedKeys: string[]) {
    this.setState({
      openedKeys
    })
  };

  renderLeftSubMenu() {
    let subMenu = this.props.menuItemsForVertical.filter((obj: any, pos, arr) => {
      return arr.map((mapObj: any) => mapObj['groupId']).indexOf(obj['groupId']) === pos;
    });
    return (
      <Menu
        onOpenChange={this.onOpenChange}
        onClick={this.onTitleClick}
        openKeys={this.state.openedKeys}
        selectedKeys={this.props.selectedKeyForVertical}
        mode="horizontal"
        theme="dark"
      >
        <Menu.SubMenu
          style={{fontSize: '30px'}}
          key="sub2"
          onTitleClick={this.onTitleClick}
          title={<span><Icon type="area-chart"/></span>}
        >
          {
            subMenu.map((sub: any) => {
              return (
                sub.groupName ?
                  <Menu.SubMenu
                    className={'mobile-menu-items-submenu-popup'}
                    key={sub.groupId}
                    title={<span><Icon type={sub.groupIcon}/><span>{sub.groupName}</span></span>}>
                    {
                      this.props.menuItemsForVertical.map((v: any) => {
                        return (
                          sub.groupId === v.groupId ?
                            <Menu.Item key={v.id} onClick={v.pushToHistory}>
                              {
                                v.itemIcon ?
                                  <Icon type={v.itemIcon}/> : null
                              }
                              <span>{v.name}</span>
                            </Menu.Item> : null
                        )
                      })
                    }
                  </Menu.SubMenu> :
                  <Menu.Item key={sub.id} onClick={sub.pushToHistory}>
                    {
                      sub.itemIcon ?
                        <Icon type={sub.itemIcon}/> : null
                    }
                    <span>{sub.name}</span>
                  </Menu.Item>
              );
            })
          }
        </Menu.SubMenu>
      </Menu>
    );
  }

  renderRightSubMenu() {
    let zone = new Date().getTimezoneOffset() / (-60);
    let content =
      <span className={'menu-item-padding'}>
        <Row>
          <Icon type="clock-circle-o"/>
          UTC{zone > 0 ? `+${zone}` : zone}
        </Row>
        <Row>
          <Select
            size={"small"}
            /*onChange={col.onTimeZoneChange}
            value={col.timeZone}*/
            style={{width: 90}}>
            {
              timezones.map((option: string) => {
                return (
                  <Option
                    key={option}
                    value={option}>{option}</Option>
                )
              })
            }
          </Select>
        </Row>

        <Row onClick={this.props.openAccount}>
          <Icon type="user"/>
          {`${getRoleById(parseInt(localStorage.getItem('roleId') as string))}: ${localStorage.getItem('login') || ''}`}
        </Row>
        <Row onClick={this.props.openHelp}>
          <Icon type="question-circle-o"/>
          {(localization.HELP as any)[lang]}
        </Row>
        <Row>
          <Icon type="logout"/>
          <span>{(localization.LOGOUT as any)[lang]}</span>
        </Row>
      </span>;

    return (
      <Popover placement="bottomRight" content={content} trigger="click">
        <Icon style={{fontSize: '30px', float: 'right'}} type="bars"/>
      </Popover>
    )
  }

  render() {
    let zone = new Date().getTimezoneOffset() / (-60);
    let isMobile = isDeviceMobile();
    let subMenu = this.props.menuItemsForVertical.filter((obj: any, pos, arr) => {
      return arr.map((mapObj: any) => mapObj['groupId']).indexOf(obj['groupId']) === pos;
    });
    let mobilePanelNameStyles = isMobile ? {
        color: 'rgba(255, 255, 255, 0.65)',
        opacity: 1,
        marginLeft: '20px',
        maxWidth: 'calc(100vw - 150px)',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        paddingLeft: 0,
        overflow: 'hidden'
      } :
      {
        color: 'rgba(255, 255, 255, 0.65)',
        opacity: 1,
        marginLeft: '20px'
      };
    /*return (
      <div style={{
        color: 'rgba(255, 255, 255, 0.65)', fontSize: '16px',
        background: '#001529'
      }}>
        <Row>
          <Col xs={6} sm={6} md={8} lg={12} xl={3}>
            {
              isDeviceMobileAndTablet() ?
                this.renderLeftSubMenu() : null
            }
            <span style={mobilePanelNameStyles as any}>{switchAdminPanelName()}</span>
          </Col>
          <Col xs={18} sm={18} md={16} lg={12} xl={8}
               style={{float: 'right', verticalAlign: 'center'}}>
            {
              !isMobile ?
                <div style={{float: 'right', height: '46px'}}>
                  <span style={{color: 'rgba(255, 255, 255, 0.65)', opacity: 1, marginRight: '20px'}}>
                    <Icon type="clock-circle-o"/>
                    UTC{zone > 0 ? `+${zone}` : zone}
                  </span>
                  <span style={{marginRight: '20px'}}>
                    <Select
                      size={"small"}
                      /!*onChange={col.onTimeZoneChange}
                      value={col.timeZone}*!/
                      style={{width: 90}}>
                        {
                          timezones.map((option: string) => {
                            return (
                              <Option
                                key={option}
                                value={option}>{option}</Option>
                            )
                          })
                        }
                    </Select>
                  </span>
                  <span style={{color: 'rgba(255, 255, 255, 0.65)', opacity: 1, marginRight: '20px'}}>
                    <Icon type="user"/>
                    {`${getRoleById(parseInt(localStorage.getItem('roleId') as string))}: ${localStorage.getItem('login') || ''}`}
                  </span>
                  <a onClick={this.props.openHelp} style={{marginRight: '20px'}}>
                    <Icon type="question-circle-o"/>
                    {(localization.HELP as any)[lang]}
                  </a>
                  <a onClick={this.props.logOut} style={{marginRight: '20px'}}>
                    <Icon type="logout"/>
                    <span>{(localization.LOGOUT as any)[lang]}</span>
                  </a>
                </div> : this.renderRightSubMenu()
            }
          </Col>
        </Row>
      </div>
    )*/
    return (
      <Menu
        onOpenChange={this.onOpenChange}
        onClick={this.onTitleClick}
        openKeys={this.state.openedKeys}
        selectedKeys={this.props.selectedKeyForVertical}
        mode="horizontal"
        theme="dark"
      >

        {
          isDeviceMobileAndTablet() ?
            <Menu.SubMenu
              style={{fontSize: '30px'}}
              key="sub2"
              onTitleClick={this.onTitleClick}
              title={<span><Icon style={{fontSize: '30px'}} type="area-chart"/></span>}
            >
              {
                subMenu.map((sub: any) => {
                  return (
                    sub.groupName ?
                      <Menu.SubMenu
                        className={'mobile-menu-items-submenu-popup'}
                        key={sub.groupId}
                        title={<span><Icon type={sub.groupIcon}/><span>{sub.groupName}</span></span>}>
                        {
                          this.props.menuItemsForVertical.map((v: any) => {
                            return (
                              sub.groupId === v.groupId ?
                                <Menu.Item key={v.id} onClick={v.pushToHistory}>
                                  {
                                    v.itemIcon ?
                                      <Icon type={v.itemIcon}/> : null
                                  }
                                  <span>{v.name}</span>
                                </Menu.Item> : null
                            )
                          })
                        }
                      </Menu.SubMenu> :
                      <Menu.Item key={sub.id} onClick={sub.pushToHistory}>
                        {
                          sub.itemIcon ?
                            <Icon type={sub.itemIcon}/> : null
                        }
                        <span>{sub.name}</span>
                      </Menu.Item>
                  );
                })
              }
            </Menu.SubMenu>
            : null
        }
        <Menu.Item
          disabled
          style={{cursor: 'default', paddingRight: 0, ...mobilePanelNameStyles}}
          key="1"
        >
          <span style={{color: 'rgba(255, 255, 255, 0.65)', opacity: 1}}>{switchAdminPanelName()}</span>
        </Menu.Item>
        {
          isMobile ?
            <Menu.SubMenu
              onTitleClick={this.onTitleClick}
              key="sub1"
              title={<span><Icon style={{fontSize: '30px', marginRight: 0}} type="bars"/></span>}
              style={{float: 'right', fontSize: '30px'}}>
              <Menu.ItemGroup>
                <Menu.Item
                  disabled
                  style={{cursor: 'default'}}
                  key="5">
                  <span style={{color: 'rgba(255, 255, 255, 0.65)', opacity: 1}}>
                    <Icon type="clock-circle-o"/>
                    UTC{zone > 0 ? `+${zone}` : zone}
                  </span>
                </Menu.Item>
                {/*<Menu.Item
                  key="4555">
                  <Select
                    // getPopupContainer={(triggerNode:any) => triggerNode.parentNode}
                    size={"small"}
                    showArrow={false}
                    onChange={this.props.onTimeZoneChange}
                    value={this.props.timeZone}
                    style={{width: 90}}>
                    {
                      timezones.map((option: string) => {
                        return (
                          <Option
                            key={option}
                            value={option}>{option}</Option>
                        )
                      })
                    }
                  </Select>
                </Menu.Item>*/}
                <Menu.Item
                  style={{cursor: 'default'}}
                  key="3">
                  <a onClick={this.props.openAccount} style={{color: 'rgba(255, 255, 255, 0.65)', opacity: 1}}>
                    <Icon type="user"/>
                    {`${getRoleById(parseInt(localStorage.getItem('roleId') as string))}: ${localStorage.getItem('login') || ''}`}
                  </a>
                </Menu.Item>
                <Menu.Item
                  key="10">
                  <a onClick={this.props.openHelp}>
                    <Icon type="question-circle-o"/>
                    {(localization.HELP as any)[lang]}
                  </a>
                </Menu.Item>
                <Menu.Item
                  key="2"
                  onClick={this.props.logOut}>
                  <Icon type="logout"/>
                  <span>{(localization.LOGOUT as any)[lang]}</span>
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu.SubMenu> : null
        }
        {
          !isMobile ?
            <Menu.Item
              style={{float: 'right'}}
              key="2"
              onClick={this.props.logOut}>
              <Icon type="logout"/>
              <span>{(localization.LOGOUT as any)[lang]}</span>
            </Menu.Item> : null
        }
        {
          !isMobile ?
            <Menu.Item
              style={{float: 'right'}}
              key="10">
              <a onClick={this.props.openHelp}>
                <Icon type="question-circle-o"/>
                {(localization.HELP as any)[lang]}
              </a>
            </Menu.Item> : null
        }
        {
          !isMobile ?
            <Menu.Item
              style={{float: 'right', cursor: 'default'}}
              key="3">
              <a onClick={this.props.openAccount} style={{color: 'rgba(255, 255, 255, 0.65)', opacity: 1}}>
                <Icon type="user"/>
                {`${getRoleById(parseInt(localStorage.getItem('roleId') as string))}: ${localStorage.getItem('login') || ''}`}
              </a>
            </Menu.Item> : null
        }
        {
          !isMobile ?
            <Menu.Item
              style={{float: 'right'}}
              key="4">
              <Select
                size={"small"}
                showArrow={false}
                onChange={this.props.onTimeZoneChange}
                value={this.props.timeZone}
                style={{width: 90}}>
                {
                  timezones.map((option: string) => {
                    return (
                      <Option
                        key={option}
                        value={option}>{option}</Option>
                    )
                  })
                }
              </Select>
            </Menu.Item> : null
        }
        {
          !isMobile ?
            <Menu.Item
              disabled
              style={{float: 'right', cursor: 'default'}}
              key="5">
              <span style={{color: 'rgba(255, 255, 255, 0.65)', opacity: 1}}>
                <Icon type="clock-circle-o"/>
                UTC{zone > 0 ? `+${zone}` : zone}
              </span>
            </Menu.Item> : null
        }
      </Menu>
    );
  }
}

export default NavBarHorizontal;
