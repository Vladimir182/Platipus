import * as React from 'react';
import {Row, Button, Col, Form, Icon, Affix, Divider} from 'antd';
import localization from "app/localization";
import './style.css';
import {isDeviceMobile, isDeviceMobileAndTablet} from "app/utils";
import {RowsWithInputs} from "app/components/RowsWithInputs";
import {DownloadButton} from "app/components/DownloadButton";

let lang = localStorage.getItem('lang') || 'en';

interface infoTextI {
  icon: string;
  text: string;
  title?: string;
  link?: () => void;
}

interface ISelectedItem {
  id: number;
  value: string;
}

export interface IField {
  positionId?: number;
  required?: boolean;
  allowClear?: boolean;
  name: string;
  title?: string;
  data: ISelectedItem[];
  currValue?: number;
  handlers: {
    onChange: (val: any) => void;
    onBlur: () => void;
    onFocus: () => void;
  }
}

interface IInfoText {
  icon: string;
  text: string;
}

export interface ITReeField {
  name: any;
  props: {
    allowClear: boolean,
    value: string[],
    treeData: any[];
    onChange: (val: string[]) => void;
    showSearch: boolean;
    treeCheckable: boolean;
    showCheckedStrategy: any;
    searchPlaceholder: string;
  }
}

export namespace FilterNamespace {
  export interface Props {
    fields: IField[];
    onChangeRangePickerHandler?: (dates: Date[]) => void;
    onShowReportClick: () => void;
    selectedDateRange?: string[];
    loadingButton: boolean;
    treeProps: ITReeField[];
    onChangeCheckboxRooms?: (e: any) => void;
    onChangeCheckboxFun?: (check: boolean) => void;
    onChangeCheckboxGift?: (e: any) => void;
    onChangeCheckboxBuy?: (e: any) => void;
    checkedRooms?: boolean;
    checkedFun?: boolean;
    checkedGift?: boolean;
    checkedBuy?: boolean;
    onTimeZoneChange?: (val: string) => void;
    timeZone?: string;
    onSaveExcelButton?: () => void;
    mobileRangePicker?: {
      dispatchEndValue: (val: Date) => void;
      dispatchStartValue: (val: Date) => void;
      handleChangeRangeOptions: (value: string) => void;
      selectedOptionRange: string;
      selectOptionRange: (val: string) => void;
    },
    pageTitle?: string;
    infoText?: infoTextI[]|null;
    customTextShowDataButton?: IInfoText;
    infoPanel?: IInfoText[];
    goToDescriptionInHelp?: () => void;
    additionalFields?: any[];
    goBack?: any;
    goBackPlayer?: any;
    affixContainer?: any;
  }
}

export class Filter extends React.Component<FilterNamespace.Props, any> {
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

  renderBackPlayerBtn() {
    return (
      this.props.affixContainer ?
        <Affix
          offsetTop={34}
          target={this.props.affixContainer}>
          <Button
            style={{marginRight: '5px'}}
            onClick={this.props.goBackPlayer}
            icon={'arrow-left'}
            type="danger">
            {(localization.BACK_HISTORY as any)[lang]}
          </Button>
        </Affix>
        :
        <Button
          style={{marginRight: '5px'}}
          onClick={this.props.goBackPlayer}
          icon={'arrow-left'}
          type="danger">
          {(localization.BACK_HISTORY as any)[lang]}
        </Button>
    )
  }

  renderFilter() {
    let selectFields = this.props.fields.map((val: any) => {
      return (
        {
          ...val,
          inputType: 'select',
          required: (typeof val.required !== 'undefined')?val.required:true,
          isNeedToRender: true
        }
      )
    });

    let treeFields = this.props.treeProps.map((val: any) => {
      return (
        {
          positionId: val.positionId,
          inputType: 'treeSelect',
          required: false,
          isNeedToRender: true,
          name: val.name,
          props: {...val.props}
        }
      )
    });

    let checkboxFields = [
      {
        inputType: 'checkbox',
        isNeedToRender: typeof this.props.checkedRooms !== 'undefined' || typeof this.props.checkedGift !== 'undefined' || typeof this.props.checkedBuy !== 'undefined',
        children: [
          {
            isNeedToRenderChild: typeof this.props.checkedRooms !== 'undefined',
            required: false,
            label: localization.SEARCH_BY_ROOMS[lang],
            checked: this.props.checkedRooms,
            onChange: this.props.onChangeCheckboxRooms
          },
          {
            isNeedToRenderChild: typeof this.props.checkedGift !== 'undefined',
            required: false,
            label: localization.SEARCH_WITH_GIFT[lang],
            checked: this.props.checkedGift,
            onChange: this.props.onChangeCheckboxGift
          },
          {
            isNeedToRenderChild: typeof this.props.checkedBuy !== 'undefined',
            required: false,
            label: 'Show buys:' || localization.SEARCH_WITH_GIFT[lang],
            checked: this.props.checkedBuy,
            onChange: this.props.onChangeCheckboxBuy
          }
        ]
      },
      {
        inputType: 'checkbox',
        isNeedToRender: typeof this.props.checkedFun !== 'undefined',
        children: [
          {
            isNeedToRenderChild: typeof this.props.checkedFun !== 'undefined',
            required: false,
            childType: 'switch',
            label: localization.SEARCH_WITH_FUN[lang],
            checked: this.props.checkedFun,
            onChange: this.props.onChangeCheckboxFun
          }
        ]
      }];

    let rangePickerField = {
      isNeedToRender: this.props.selectedDateRange,
      label: localization.PICK_RANGE[lang],
      inputType: 'rangePicker',
      required: true,
      onTimeZoneChange: this.props.onTimeZoneChange,
      timeZone: this.props.timeZone,
      selectedValue: this.props.selectedDateRange,
      mobileRangePicker: this.props.mobileRangePicker,
      onChange: this.props.onChangeRangePickerHandler,
    };

    let additionFields = this.props.additionalFields ? this.props.additionalFields : [];

    let rowsData = [
      rangePickerField,
      ...selectFields,
      ...treeFields,
      ...additionFields,
      ...checkboxFields
    ];
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
        {
          this.props.goToDescriptionInHelp &&
          <a onClick={this.props.goToDescriptionInHelp}
             style={{fontSize: '25px', position: 'absolute', right: 12, top: 12, lineHeight: 1, zIndex: 1}}
             title={(localization.READ_MORE_ABOUT as any)[lang]}><Icon type={'question-circle'}/>
          </a>
        }
        {
          (this.props.goToDescriptionInHelp && !isDeviceMobile()) &&
          <a onClick={this.setLock}
             style={{fontSize: '25px', position: 'absolute', right: 49, top: 12, lineHeight: 1, zIndex: 1}}
             title={this.state.isLocked ? localization.UNLOCK_PANEL[lang] : localization.LOCK_PANEL[lang]}><Icon
            type={this.state.isLocked ? "lock" : "unlock"} theme="outlined"/>
          </a>
        }
        <div style={{position: isDeviceMobileAndTablet() ? 'relative' : 'absolute'}}>
          {this.props.goBackPlayer && this.renderBackPlayerBtn()}
        </div>
        {
          /* isDeviceMobileAndTablet() &&  */this.props.pageTitle ?
            <Row type="flex" justify="space-around" align="middle">
              <h1>
                {this.props.pageTitle}
              </h1>

            </Row> : null
        }
        { this.props.infoText ? 
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
          </Row> : null
        }
        {
          this.props.infoText && <Divider/>
        }
        <div style={{position: isDeviceMobileAndTablet() ? 'relative' : 'absolute'}}>
          {this.props.goBack && this.renderBackBtn()}
        </div>
        <RowsWithInputs
          isCollapsed={this.state.isCollapsed}
          setCollapse={this.setCollapse}
          inputs={rowsData}/>
        <Row>
          <Col span={24} style={{textAlign: 'right'}}>
            <span style={{marginRight: '20px'}}>
              {
                this.props.infoPanel ?
                  this.props.infoPanel.map((item: any, i: number) => {
                    return (
                      <span key={i} style={{marginRight: '5px'}}><Icon type={item.icon}/> {item.text}</span>
                    )
                  }) : null
              }
            </span>
            <Button
              type="primary"
              htmlType="submit"
              loading={this.props.loadingButton}
              onClick={this.props.onShowReportClick}
              icon={this.props.customTextShowDataButton ? this.props.customTextShowDataButton.icon : 'reload'}
              className="login-form-button">
              {this.props.customTextShowDataButton ?
                <span>{this.props.customTextShowDataButton.text}</span> : localization.SHOW_DATE_BY_FILTER[lang]}
            </Button>
            {
              this.props.onSaveExcelButton?
                <span style={{marginLeft:"12px"}}>
                  <DownloadButton
                    btnOnly={true}
                    onSaveExcelButton={this.props.onSaveExcelButton}
                    loading={this.props.loadingButton}/>
                </span>
                :null
            }
          </Col>
        </Row>
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
