import * as React from 'react';
import {DatePicker, Select} from 'antd';
import shortcuts from "app/const/shortcuts";
import {getTodayEndTimestamp} from "app/utils";

let Option = Select.Option;
import localization from "app/localization";

let lang = localStorage.getItem('lang') || 'en';

export namespace MobileRangePickerNamespace {
  export interface Props {
    selectedValue: any[];
    dispatchStartValue: any;
    dispatchEndValue: any;
    handleChangeRangeOptions: any;
    selectedOptionRange: string;
    selectOptionRange: any;
  }
}

export class MobileRangePicker extends React.Component<MobileRangePickerNamespace.Props, any> {
  state = {
    startValue: null,
    endValue: null,
    endOpen: false
  };

  disabledStartDate = (startValue: any): boolean => {
    const endValue = this.props.selectedValue[1];
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > (endValue as any).valueOf() || startValue.valueOf() > getTodayEndTimestamp();
  };

  disabledEndDate = (endValue: any): boolean => {
    const startValue = this.props.selectedValue[0];
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() < (startValue as any).valueOf() || endValue.valueOf() > getTodayEndTimestamp();
  };

  onChange = (field: any, value: any) => {
    if (field === 'startValue') {
      this.props.dispatchStartValue(value);
    }
    if (field === 'endValue') {
      this.props.dispatchEndValue(value);
    }
    this.props.selectOptionRange('custom');
  };

  onStartChange = (value: any) => {
    this.onChange('startValue', value);
  };

  onEndChange = (value: any) => {
    this.onChange('endValue', value);
  };

  handleStartOpenChange = (open: any) => {
    if (!open) {
      this.setState({endOpen: true});
    }
  };

  handleEndOpenChange = (open: any) => {
    this.setState({endOpen: open});
  };

  render() {
    const {endOpen} = this.state;
    return (
      <div>
        <DatePicker
          style={{width: '100%'}}
          disabledDate={this.disabledStartDate}
          showTime
          format="YYYY/MM/DD HH:mm:ss"
          value={this.props.selectedValue[0]}
          placeholder={(localization.START_OPTION as any)[lang]}
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
        />
        <DatePicker
          style={{width: '100%'}}
          disabledDate={this.disabledEndDate}
          showTime
          format="YYYY/MM/DD HH:mm:ss"
          value={this.props.selectedValue[1]}
          placeholder={(localization.END_OPTION as any)[lang]}
          onChange={this.onEndChange}
          open={endOpen}
          onOpenChange={this.handleEndOpenChange}
        />
        <Select
          onChange={this.props.handleChangeRangeOptions}
          value={this.props.selectedOptionRange || shortcuts[0].type}>
          <Option
            disabled={true}
            key={"custom"}>
            {(localization.CUSTOM_OPTION as any)[lang]}
          </Option>
          {
            shortcuts.map((value: any) => {
              return (
                <Option
                  key={value.type}>
                  {value.text}
                </Option>);
            })
          }
        </Select>
      </div>
    );
  }
}
