import * as React from 'react';
import { Tabs, Badge } from 'antd';
import {shortFormatNumber} from "app/utils";
import './style.css';
const { TabPane } = Tabs;

export namespace TabsNamespace {
  export interface Props {
    withBudge:boolean;
    tabsArr:any[];
    selectedTab?:string;
    title?:string;
    onChange:(activeKey:string) => void;
  }
}

export class TabsComponent extends React.Component<TabsNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  renderSpaces = (name:string, count:number) => {
    let countArr = count.toString().split('');
    return (<span title={this.props.title} style={{cursor: 'pointer'}}>{name}&nbsp;&nbsp;&nbsp;{countArr.map(()=> "\xa0")}</span>);
  };

  render() {
    return (
      <Tabs onChange={this.props.onChange} activeKey={this.props.selectedTab} tabPosition={"top"}>
        {this.props.tabsArr.map((val:any) => (
          <TabPane
            tab={
              this.props.withBudge?
              <Badge title={val.items} style={{ backgroundColor: '#41881a' }} overflowCount={1000000} count={shortFormatNumber(val.items, true)} showZero>
                {this.renderSpaces(val.name, val.items)}
              </Badge>:<span title={this.props.title} style={{cursor:'pointer'}}>{val.name}</span>
            }
            key={val.id}/>
        ))}
      </Tabs>
    );
  }
}
