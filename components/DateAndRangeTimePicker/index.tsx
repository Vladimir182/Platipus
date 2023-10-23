import * as React from 'react';
import {DatePicker, TimePicker, Col} from 'antd';
import localization from "app/localization";
import {getMoment, getTodayEndTimestamp, getDateString, isDeviceMobile} from "app/utils";

let lang = localStorage.getItem('lang') || 'en';

export namespace DateAndRangeTimePickerNamespace {
  export interface Props {
    selectDate: any;
    selectStartTime: any;
    selectEndTime: any;
    value: string[];
    activityDates?: string[];
  }
}

export class DateAndRangeTimePicker extends React.Component<DateAndRangeTimePickerNamespace.Props, any> {
  state = {
    startValue: null,
    endValue: null,
    endOpen: false
  };

  disabledDate = (date: any): boolean => {

    const dateString = getDateString(date); // '2021-08-12'
    const hasActivityDates = this.props.activityDates && this.props.activityDates.length > 0;
    const activityDates = hasActivityDates ? this.props.activityDates : [];

    if (!date) {
      return false;
    }
    const twoWeekInMs = 30 * 24 * 3600 * 1000;
    const defaultValue = date.valueOf() < (getTodayEndTimestamp() - twoWeekInMs) || date.valueOf() > getTodayEndTimestamp();
    const disabledValue = hasActivityDates ? !((activityDates as any).indexOf(dateString) > -1) : false;
    return hasActivityDates ? disabledValue : defaultValue;
  };

  getDate() {
    return getMoment(this.props.value[0]);
  }

  getStartTime() {
    return getMoment(this.props.value[0]);
  }

  getEndTime() {
    return getMoment(this.props.value[1]);
  }

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
    let props = isDeviceMobile()?{suffixIcon:<span/>}:{};
    return (
      <div className="gutter-row">
        <Col span={8} className="gutter-box">
          <DatePicker
            {...props}
            allowClear={false}
            showToday={false}
            style={{width: '100%', paddingRight: '4px'}}
            disabledDate={this.disabledDate}
            format="YYYY/MM/DD"
            value={this.getDate()}
            placeholder={(localization.DATE as any)[lang]}
            onChange={this.props.selectDate}
          />
        </Col>
        <Col span={16}>
          <Col span={11} className="gutter-box">
            <TimePicker
              allowEmpty={false}
              style={{width: '100%', paddingLeft: '4px', paddingRight: '4px'}}
              onChange={this.props.selectStartTime}
              value={this.getStartTime()}
              placeholder={localization.START_OPTION[lang]}
              onOpenChange={this.handleStartOpenChange}/>
          </Col>
          <Col span={2} style={{textAlign: 'center'}}>
            <span>~</span>
          </Col>
          <Col span={11} className="gutter-box">
            <TimePicker
              allowEmpty={false}
              style={{width: '100%', paddingLeft: '4px'}}
              placeholder={localization.END_OPTION[lang]}
              open={endOpen}
              value={this.getEndTime()}
              onOpenChange={this.handleEndOpenChange}
              onChange={this.props.selectEndTime}/>
          </Col>
        </Col>
      </div>
    );
  }
}
