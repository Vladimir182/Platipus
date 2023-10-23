import * as React from 'react';
import {Input, Button} from 'antd';
import './style.css'
import localization from "app/localization";

let lang = localStorage.getItem('lang') || 'en';
export namespace FilterColumnNamespace {
  export interface Props {
    selectedKeys: any[];
    setSelectedKeys: any;
    confirm: any;
    clearFilters: any;
    handleSearch: any;
    handleReset: any;
    searchPlaceholder: string;
  }
}

export class FilterColumn extends React.Component<FilterColumnNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="custom-filter-dropdown">
        <Input
          placeholder={this.props.searchPlaceholder}
          value={this.props.selectedKeys[0]}
          onChange={(e) => {
            this.props.setSelectedKeys(e.target.value ? [e.target.value] : [])
          }}
          onPressEnter={() => {
            this.props.handleSearch(this.props.selectedKeys, this.props.confirm)
          }}
        />
        <Button type="primary" onClick={() => {
          this.props.handleSearch(this.props.selectedKeys, this.props.confirm);
        }}>{(localization.SEARCH_COLUMN_FILTER as any)[lang]}</Button>
        <Button onClick={() => {
          this.props.handleReset(this.props.clearFilters)
        }}>{(localization.RESET_COLUMN_FILTER as any)[lang]}</Button>
      </div>
    );
  }
}
