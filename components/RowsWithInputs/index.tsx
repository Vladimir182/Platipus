import * as React from 'react';
import {
  Row,
  Col,
  Form,
  DatePicker,
  Select,
  TreeSelect,
  Checkbox,
  Switch,
  Icon,
  Tooltip,
  Tag,
  Input,
  InputNumber
} from 'antd';
import {
  getMomentDatePicker,
  getMomentFormattedRange,
  getTodayEndTimestamp,
  isDeviceMobileAndTablet,
  isoStringToUTCDate
} from 'app/utils';
import { MobileRangePicker } from 'app/components/MobileRangePicker';
import shortcuts from 'app/const/shortcuts';
import localization from 'app/localization';
import { DateAndRangeTimePicker } from 'app/components/DateAndRangeTimePicker';

let lang = localStorage.getItem('lang') || 'en';
const Item = Form.Item;
const RangePicker = DatePicker.RangePicker;
const Search = Input.Search;
const { Option } = Select;
export namespace RowsWithInputsNamespace {
  export interface Props {
    inputs: any[];
    values?: any;
    index?: any;
    dontShowHideIcon?: boolean;
    elementsInRow?: number;
    isCollapsed?: boolean;
    setCollapse?: any;
  }
  export interface State {
    openKeys: string[];
  }
}

export class RowsWithInputs extends React.Component<
  RowsWithInputsNamespace.Props,
  RowsWithInputsNamespace.State
> {
  constructor(props: any) {
    super(props);
    this.state = {
      openKeys: []
    };
  }

  private static getRandomColorForTag(indx?: number) {
    let colors = ['magenta', 'red', 'volcano', 'orange', /*'gold','lime','green','cyan',*/'blue', 'geekblue', 'purple'];
    let number = typeof indx !== 'undefined' ? indx : Math.floor(Math.random() * colors.length);
    return colors[number];
  }

  private static disabledStartDate(val: any) {
    if (!val) {
      return false;
    }
    return val.valueOf() > getTodayEndTimestamp()
  }

  private static filterTreeNode(inputValue: string, treeNode: any) {
    return treeNode.props.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
  };

  private static renderInput(col: any, values: any, index: number) {
    switch (col.inputType) {
      case 'search': {
        return RowsWithInputs.searchInput(col);
      }
      case 'textInput': {
        return RowsWithInputs.textInput(col);
      }
      case 'passwordInput': {
        return RowsWithInputs.passwordInput(col);
      }
      case 'rangePicker': {
        return RowsWithInputs.rangePicker(col);
      }
      case 'rangePickerTournament': {
        return RowsWithInputs.rangePickerTournament(col);
      }
      case 'DatePickerTournament': {
        return RowsWithInputs.DatePickerTournament(col);
      }
      case 'select': {
        return RowsWithInputs.select(col);
      }
      case 'selectPrize': {
        return RowsWithInputs.selectPrize(col, values, index);
      }
      case 'selectEditPrize': {
        return RowsWithInputs.selectEditPrize(col, values, index);
      }
      case 'selectGroupPlatform': {
        return RowsWithInputs.selectGroupPlatform(col, values, index);
      }
      case 'selectGroupOffice': {
        return RowsWithInputs.selectGroupOffice(col, values, index);
      }
      case 'selectGroupRoom': {
        return RowsWithInputs.selectGroupRoom(col, values, index);
      }
      case 'selectEditGroupPlatform': {
        return RowsWithInputs.selectEditGroupPlatform(col, values, index);
      }
      case 'selectEditGroupOffice': {
        return RowsWithInputs.selectEditGroupOffice(col, values, index);
      }
      case 'selectEditGroupRoom': {
        return RowsWithInputs.selectEditGroupRoom(col, values, index);
      }
      case 'treeSelect': {
        return RowsWithInputs.treeSelect(col);
      }
      case 'checkbox': {
        return RowsWithInputs.checkbox(col);
      }
      case 'dateAndRangeTime': {
        return RowsWithInputs.dateAndRangeTime(col);
      }
      case 'multiSelect': {
        return RowsWithInputs.multiSelect(col);
      }
      case 'numberValue': {
        return RowsWithInputs.numberValue(col);
      }
      case 'prizeNumberValue': {
        return RowsWithInputs.prizeNumberValue(col, values, index);
      }
      case 'textInputPrizes': {
        return RowsWithInputs.textInputPrizes(col, values, index);
      }
    }
    return
  }

  private static renderMinimizeInput(col: any, indx: number) {
    switch (col.inputType) {
      case 'search': {
        return RowsWithInputs.minimizeSearchInput(col, indx);
      }
      case 'rangePicker': {
        return RowsWithInputs.minimizeRangePicker(col, indx);
      }
      case 'select': {
        return RowsWithInputs.minimizeSelect(col, indx);
      }
      case 'treeSelect': {
        return RowsWithInputs.minimizeTreeSelect(col, indx);
      }
      case 'checkbox': {
        return RowsWithInputs.minimizeCheckbox(col, indx);
      }
      case 'dateAndRangeTime': {
        return RowsWithInputs.minimizeDateAndRangeTime(col, indx);
      }
      case 'multiSelect': {
        return RowsWithInputs.minimizeMultiSelect(col, indx);
      }
    }
    return
  }

  private static minimizeCheckbox(col: any, inx: number) {
    return (
      col.children.map((child: any, key: number) => {
        return (
          child.isNeedToRenderChild &&
          <span key={key}><strong>{child.label}</strong>: <Tag
            color={RowsWithInputs.getRandomColorForTag(inx)}>{child.checked ? localization.ON_CHECKBOX[lang] : localization.OFF_CHECKBOX[lang]}</Tag>; </span>
        )
      })
    )
  }

  private static checkbox(col: any) {
    return (
      <Item required={col.required} className="gutter-box" label={col.label}>
        {
          col.children.map((child: any, key: number) => {
            if (child.childType === 'switch') {
              return (
                child.isNeedToRenderChild &&
                <Col key={key} className="gutter-row" span={12}>
                  <Form.Item label={child.label}>
                    <Switch
                      onChange={child.onChange}
                      checked={child.checked}
                      checkedChildren={<Icon type="check"/>}
                      unCheckedChildren={<Icon type="close"/>}/>
                  </Form.Item>
                </Col>
              )
            } else {
              return (
                child.isNeedToRenderChild &&
                <Col key={key} className="gutter-row" span={12}>
                  <Form.Item label={child.label}>
                    <Checkbox
                      checked={child.checked}
                      onChange={child.onChange}>
                    </Checkbox>
                  </Form.Item>
                </Col>
              )
            }
          })
        }
      </Item>
    )
  }

  private static minimizeLabelForTreeSelect(col: any) {
    let n = col.name;
    return `${n.options[0]} ${n.value ? n.options[2] : n.options[1]}`
  }

  private static minimizeTreeSelect(col: any, inx: number) {
    let text = col.props.value.length > 0 ? col.props.value.map((item: any, i: number) => (
        <Tag key={item} color={RowsWithInputs.getRandomColorForTag(inx)}>{item.split(":")[0]}</Tag>)) :
      <span>{'- '}</span>;
    return (
      col.isNeedToRender &&
      <span><strong>{typeof col.name === 'string' ? col.name : RowsWithInputs.minimizeLabelForTreeSelect(col)}</strong>: {text}; </span>
    )
  }

  private static switchFieldLabel(col: any) {
    let n = col.name;
    return (
      <span>
        {n.options[0]} &nbsp;
        <Switch
          loading={n.loading}
          onChange={n.onChange}
          checked={n.value}
          disabled={n.disabled}
          checkedChildren={<span>{n.options[2]}</span>}
          unCheckedChildren={<span>{n.options[1]}</span>}/>
      </span>
    )
  }

  private static treeSelect(col: any) {
    let dropdownStyle = {
      height: '300px'
    };
    return (
      <Item required={col.required} className="gutter-box"
            label={typeof col.name === 'string' ? col.name : RowsWithInputs.switchFieldLabel(col)}>
        <TreeSelect
          disabled={col.props.disabled}
          maxTagCount={10}
          dropdownStyle={dropdownStyle}
          //treeExpandedKeys={[]}
          filterTreeNode={RowsWithInputs.filterTreeNode}
          treeNodeFilterProp={'title'}
          {...col.props}
        />
      </Item>
    )
  }

  private static minimizeSelect(col: any, inx: number) {
    let selectText = col.data.filter((option: any) => col.currValue === option.id)[0];
    return (
      col.isNeedToRender && <span><strong>{col.title}</strong>: <Tag
        color={RowsWithInputs.getRandomColorForTag(inx)}>{(selectText && selectText.value)||"-"}</Tag>; </span>
    )
  }

  private static selectPrize(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          disabled={col.disabled}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(col.data, col.optionFilterId)
              : col.data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static selectEditPrize(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
        let result: any = col.currValue.filter((id: any) => id === values.prizeTypeId)
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          value={result}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(col.data, col.optionFilterId)
              : col.data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static selectGroupPlatform(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
        let result: any = col.currValue && col.currValue.filter((id: any): any => id === values.platformId)

        // curreValue is Array!
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          value={result}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(col.data, col.optionFilterId)
              : col.data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static selectGroupOffice(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
        let result: any = col.currValue && col.currValue.filter((id: any): any => id === values.officeId);

        const platformId = values['platformId'];
        const data = col.data && col.data.has(platformId) ? col.data.get(platformId) : [];

        // curreValue is Array!
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          value={result}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(data, col.optionFilterId)
              : data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static selectGroupRoom(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
        let result: any = col.currValue && col.currValue.filter((id: any): any => id === values.roomId);

        const officeId = values['officeId'];
        const data = col.data && col.data.has(officeId) ? col.data.get(officeId) : [];

        // curreValue is Array!
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          value={result}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(data, col.optionFilterId)
              : data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static selectEditGroupPlatform(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
        let result: any = col.currValue && col.currValue.filter((id: any): any => id === values.platformId);

        // curreValue is Array!
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          value={result}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(col.data, col.optionFilterId)
              : col.data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static selectEditGroupOffice(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
        let result: any = col.currValue && col.currValue.filter((id: any): any => id === values.officeId)

        const platformId = values['platformId'];
        const data = col.data && col.data.has(platformId) ? col.data.get(platformId) : [];
        // curreValue is Array!
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          value={result}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(data, col.optionFilterId)
              : data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static selectEditGroupRoom(col: any, values: any, index: number) {
    const onChange = (event: any) => {
      col.handlers.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
        let result: any = col.currValue && col.currValue.filter((id: any): any => id === values.roomId);

        const officeId = values['officeId'];
        const data = col.data && col.data.has(officeId) ? col.data.get(officeId) : [];

        // curreValue is Array!
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          value={result}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(data, col.optionFilterId)
              : data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.values}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static select(col: any) {
    let value = (col.currValue === null) ? {} : {value: col.currValue};
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          {...value}
          showSearch
          disabled={col.disabled}
          allowClear={col.allowClear}
          placeholder={col.name}
          optionFilterProp="children"
          onChange={col.handlers.onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            col.customOptions ?
              col.customOptions(col.data, col.optionFilterId)
              : col.data.map((option: any) => {
                return (
                  <Option
                    key={option.id}
                    value={option.id}>{option.value}</Option>
                )
              })
          }
        </Select>
      </Item>
    )
  }

  private static minimizeMultiSelect(col: any, inx: number) {
    let res = [];
    for(let i = 0; i < col.currValue.length; i ++){
      let val = col.currValue[i];
      let localRes = col.data.filter((option: any) => val == option.id)[0];
      if(localRes){
        res.push(localRes);
      }
    }
    let text: any = res.map((item: any, i: number) => (
        <Tag key={item} color={RowsWithInputs.getRandomColorForTag(inx)}>{item.name}</Tag>));
    if(!(text && text.length > 0)){
      text = <Tag color={RowsWithInputs.getRandomColorForTag(inx)}>{'-'}</Tag>
    }
    return (
      col.isNeedToRender && <span><strong>{col.title}</strong>: {text}; </span>
    )
  }

  private static multiSelect(col: any) {
    return (
      <Item required={col.required} className="gutter-box" label={col.title}>
        <Select
          showSearch
          maxTagCount={10}
          allowClear={true}
          mode="multiple"
          placeholder={col.name}
          value={col.currValue}
          optionFilterProp="children"
          onChange={col.handlers.onChange}
          filterOption={(input: any, option: any) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          {...col.handlers.onSearch && { onSearch: col.handlers.onSearch }}
          {...col.handlers.onBlur && { onBlur: col.handlers.onBlur }}
        >
          {col.data.map((option: any) => {
            return (
              <Option key={option.id} value={option.id} {...(option.title && { title: option.title })}>
                {option.name || option.value}
              </Option>
            );
          })}
        </Select>
      </Item>
    );
  }

  private static minimizeRangePicker(col: any, inx: number) {
    return (
      col.isNeedToRender && <span><strong>{col.label}</strong>: <Tag
        color={RowsWithInputs.getRandomColorForTag(inx)}>{isoStringToUTCDate(col.selectedValue[0])} ~ {isoStringToUTCDate(col.selectedValue[1])}</Tag>; </span>
    )
  }

  private static rangePicker(col: any) {
    if (isDeviceMobileAndTablet()) {

      return (
        <Item required={col.required} className="gutter-box" label={col.label}>
          <MobileRangePicker
            selectedValue={getMomentFormattedRange(col.selectedValue)}
            dispatchStartValue={col.mobileRangePicker.dispatchStartValue}
            dispatchEndValue={col.mobileRangePicker.dispatchEndValue}
            handleChangeRangeOptions={col.mobileRangePicker.handleChangeRangeOptions}
            selectedOptionRange={col.mobileRangePicker.selectedOptionRange}
            selectOptionRange={col.mobileRangePicker.selectOptionRange}
          />
        </Item>
      )
    } else {
      let ranges = {};
      for (let i = 0; i < shortcuts.length; i++) {
        (ranges as any)[shortcuts[i].text] = [shortcuts[i].start, shortcuts[i].end];
      }
      return (
        <Item required={col.required} className="gutter-box" label={col.label}>
          <RangePicker
            dropdownClassName={'custom-calendar'}
            style={{width: '100%'}}
            value={getMomentFormattedRange(col.selectedValue)}
            disabledDate={RowsWithInputs.disabledStartDate}
            ranges={ranges}
            showTime
            allowClear={false}
            format="YYYY/MM/DD HH:mm:ss"
            onChange={col.onChange}
          />
        </Item>
      )
    }
  }

  private static rangePickerTournament(col: any) {
    if (isDeviceMobileAndTablet()) {

      return (
        <Item required={col.required} className="gutter-box" label={col.label}>
          <MobileRangePicker
            selectedValue={getMomentFormattedRange(col.selectedValue)}
            dispatchStartValue={col.mobileRangePicker.dispatchStartValue}
            dispatchEndValue={col.mobileRangePicker.dispatchEndValue}
            handleChangeRangeOptions={col.mobileRangePicker.handleChangeRangeOptions}
            selectedOptionRange={col.mobileRangePicker.selectedOptionRange}
            selectOptionRange={col.mobileRangePicker.selectOptionRange}
          />
        </Item>
      )
    } else {
      let ranges = {};
      for (let i = 0; i < shortcuts.length; i++) {
        (ranges as any)[shortcuts[i].text] = [shortcuts[i].start, shortcuts[i].end];
      }
      return (
        <Item required={col.required} className="gutter-box" label={col.label}>
          <RangePicker
            dropdownClassName={'custom-calendar'}
            style={{width: '100%'}}
            value={getMomentFormattedRange(col.selectedValue)}
            ranges={ranges}
            showTime
            allowClear={false}
            format="YYYY/MM/DD HH:mm:ss"
            onChange={col.onChange}
          />
        </Item>
      )
    }
  }
  private static DatePickerTournament(col: any) {
      let result = getMomentDatePicker(col.selectedValue)
      return (
        <Item required={col.required} className="gutter-box" label={col.label}>
          <DatePicker
            showTime
            format="YYYY/MM/DD HH:mm:ss"
            style={{width: '100%'}}
            value={result}
            placeholder="Select Time"
            onChange={col.onChange}
            />
        </Item>
      )
    }

  private static minimizeSearchInput(col: any, indx: number) {
    return (
      col.isNeedToRender && <span><strong>{col.label}</strong>: {col.value ?
        <Tag color={RowsWithInputs.getRandomColorForTag(indx)}>{col.value}</Tag> : '- '}; </span>
    )
  }

  private static searchInput(col: any) {
    return (
      <Item required={col.required} className="gutter-box" label={col.label}>
        <Tooltip placement="top" title={col.tooltipMsg} visible={col.visibleTooltip}>
          <Search
            placeholder={col.placeholder}
            onSearch={col.onSearch}
            onChange={col.onChange}
            value={col.value}
            enterButton
          />
        </Tooltip>

      </Item>
    )
  }

  private static numberValue(col: any) {
    return <Item
        required={col.required}
        className="gutter-box"
        label={col.label}
      >
        <InputNumber
          disabled={col.disabled}
          size="default"
          placeholder={col.placeholder}
          defaultValue={col.value}
          value={col.value}
          min={col.min} max={col.max}
          style={col.style ? col.style : {width: '120px'}}
          onChange={col.onChange}
        />
      </Item>;
  }

  private static prizeNumberValue(col: any, values: any, index: any) {
    const onChange = (event: any) => {
      col.onChange(index)({target: { name: col.name, value: event}, persist(){} });
    }
    return <Item
        required={col.required}
        className="gutter-box"
        label={col.label}
      >
        <InputNumber
          size="default"
          placeholder={col.placeholder}
          defaultValue={values[col.name]}
          value={values[col.name]}
          min={col.min} max={col.max}
          style={col.style ? col.style : {width: '120px'}}
          onChange={onChange}
        />
      </Item>;
  }
  private static textInputPrizes(col: any, values: any, index: any) {
    return  (
      <Item
      required={col.required}
      className="gutter-box"
      label={col.label}
      validateStatus={col.validateStatus}
      help={col.help}
    >
      <Input
        name={col.name}
        value={values[col.name]}
        placeholder={col.placeholder}
        onChange={col.onChange(index)}
      />
    </Item>
    )
  }

  private static passwordInput(col: any) {
    return (
      <Item required={col.required} className="gutter-box" label={col.label}>
        <Input
          type="password"
          value={col.value}
          placeholder={col.placeholder}
          onChange={col.onChange}
        />
      </Item>
    )
  }

  private static textInput(col: any) {
    if (col.validateStatus) {
      return (
        <Item
          required={col.required}
          className="gutter-box"
          label={col.label}
          validateStatus={col.validateStatus}
          help={col.help}
        >
          <Input
            value={col.value}
            placeholder={col.placeholder}
            onChange={col.onChange}
          />
        </Item>
      )
    } else {
      return (
        <Item required={col.required} className="gutter-box" label={col.label}>
          <Input
            value={col.value}
            placeholder={col.placeholder}
            onChange={col.onChange}
          />
        </Item>
      )
    }
  }

  private static minimizeDateAndRangeTime(col: any, inx: number) {
    return (
      col.isNeedToRender && <span><strong>{col.label}</strong>: <Tag
        color={RowsWithInputs.getRandomColorForTag(inx)}>{isoStringToUTCDate(col.value[0])} ~ {isoStringToUTCDate(col.value[1])}</Tag>; </span>
    )
  }

  private static dateAndRangeTime(col: any) {
    return (
      <Item required={col.required} className="gutter-box" label={col.label}>
        <DateAndRangeTimePicker
          selectDate={col.selectDate}
          selectStartTime={col.selectStartTime}
          selectEndTime={col.selectEndTime}
          value={col.value}
          activityDates={col.activityDates ? col.activityDates : []}/>
      </Item>
    )
  }


  render() {
    let newInputs: any[][] = [];

    let elInRow: number = this.props.elementsInRow || 3;

    let flag = 0;
    let filteredInputs = this.props.inputs.filter((input) => input.isNeedToRender);
    if (filteredInputs[0] && filteredInputs[0].positionId) {
      filteredInputs = filteredInputs.sort(function (a, b) {
        return a.positionId - b.positionId;
      });
    }
    if(filteredInputs.length === 18 ){
      let rowsTournamentConfig = [2, 3, 3, 2, 2, 2, 4];
      newInputs = rowsTournamentConfig.map((rowsTournamentConfig) => {
        return new Array(rowsTournamentConfig).fill(null).map(() => filteredInputs.shift());
      });
    } else if(filteredInputs.length === 16) {
      let rowsTournamentConfig = [1, 2, 2, 2, 2, 1, 2, 2, 2];
      newInputs = rowsTournamentConfig.map((rowsTournamentConfig) => {
        return new Array(rowsTournamentConfig).fill(null).map(() => filteredInputs.shift());
      });
    } else {
      for (let i = 0; i < filteredInputs.length; i++) {
        if (Number.isInteger(i / elInRow)) {
          flag++;
          newInputs.push([])
        }
        newInputs[flag - 1].push(filteredInputs[i]);
      }
    }
    return (
      <div>
        {
          !this.props.dontShowHideIcon &&
          <Row>
            <a onClick={this.props.setCollapse}
               title={this.props.isCollapsed ? localization.SHOW_FILTERS[lang] : localization.HIDE_FILTERS[lang]}>
              <Icon type={this.props.isCollapsed ? "down" : "up"} theme="outlined"/>
            </a>
          </Row>
        }
        {
          !this.props.isCollapsed && newInputs.map((row: any[], key: number) => {
            return (
              <Row key={key} gutter={16}>
                {
                  row.map((col: any, key: number) => {
                    const {values, index} = this.props;
                    return (
                      col.isNeedToRender &&
                      <Col key={key} className="gutter-row" xs={24} sm={24} md={24}
                          lg={col.width ? 24 / col.width : 24 / elInRow}>
                        {
                          RowsWithInputs.renderInput(col, values, index)
                        }
                      </Col>
                    )
                  })
                }
              </Row>
            )
          })
        }
        {
          this.props.isCollapsed &&
          <Row>
            <Col span={24} style={{lineHeight: '25px'}}>
              {
                filteredInputs.map((col: any, key: number) => {
                  return col.isNeedToRender && <span key={key}>{(RowsWithInputs.renderMinimizeInput(col, key))}</span>
                })
              }
            </Col>
          </Row>
        }
      </div>
    );
  }
}
