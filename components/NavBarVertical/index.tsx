import * as React from 'react';
import {Menu, Icon} from 'antd';

export interface IMenuItem {
  id: string;
  pushToHistory: any;
  name: string;
  groupId?: string
}

export namespace NavBarVerticalNamespace {
  export interface Props {
    selectedKey: string[];
    menuItems: IMenuItem[];
    height: string;
  }
}

export class NavBarVertical extends React.Component<NavBarVerticalNamespace.Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      openKeys: ['sub-1']
    };
    this.onSelect = this.onSelect.bind(this);
    this.onOpenChange = this.onOpenChange.bind(this);
  }

  componentDidMount() {
    let openKeys: (string | undefined)[] = [];
    if (this.props.menuItems.length > 0 && this.props.selectedKey[0]) {
      openKeys = [this.props.menuItems.filter((obj: any) => {
        return obj.id === this.props.selectedKey[0]
      })[0].groupId];
    }
    if (openKeys.length > 0) {
      this.setState({
        openKeys
      })
    }
  }

  onOpenChange(openKeys: string[]) {
    this.setState({
      openKeys
    })
  };

  onSelect(obj: any) {
    let {item, key} = obj;
    item = item;
    // console.log(key);
    for (let i = 0; i < this.props.menuItems.length; i++) {
      let item = this.props.menuItems[i];
      if (key === item.id) {
        this.setState({
          openKeys: [item.groupId]
        })
      }
    }
  }

  render() {

    let subMenu = this.props.menuItems.filter((obj: any, pos, arr) => {
      return arr.map((mapObj: any) => mapObj['groupId']).indexOf(obj['groupId']) === pos;
    });
    let menu = subMenu.map((sub: any) => {
      return (
        sub.groupName?
        <Menu.SubMenu
          key={sub.groupId}
          title={<span><Icon type={sub.groupIcon}/><span>{sub.groupName}</span></span>}>
          {
            this.props.menuItems.map((v: any) => {
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
        </Menu.SubMenu>:
        <Menu.Item key={sub.id} onClick={sub.pushToHistory}>
          {
            sub.itemIcon ?
              <Icon type={sub.itemIcon}/> : null
          }
          <span>{sub.name}</span>
        </Menu.Item>
      );
    });
    // console.log('RENDER: vertical navbar');
    return (
      <div style={{overflowY: 'hidden'}}>
        <Menu
          selectedKeys={this.props.selectedKey}
          mode="inline"
          openKeys={this.state.openKeys}
          style={{height: this.props.height, overflowY: 'auto'}}
          onSelect={this.onSelect}
          onOpenChange={this.onOpenChange}
          theme="dark">
          {menu}
        </Menu>
      </div>
    );
  }
}
