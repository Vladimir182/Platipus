import * as React from 'react';
import { Input, Icon, Form, Button } from 'antd';
import './style.css';

export namespace DynamicFieldSetNamespace {
  export interface Props {
    filterInputs: any;
    updateInputArray: any;
    inputValue: any;
    inputPlaceholder: any;
    inputLabel: any;
  }
}

const Item = Form.Item;

export class DynamicFieldSet extends React.Component<DynamicFieldSetNamespace.Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      filterInputs: []
    };
  }

  // inputValue = (e: any, index: number) => {
  //   let updInput = this.state.filterInputs[index];
  //   updInput.value = e.value;
  //   let updInputArr = this.state.filterInputs;
  //   updInputArr[index] = updInput;
  //   this.setState({
  //     filterInputs: updInputArr
  //   });
  //   this.props.updateInputArray(this.state.filterInputs)
  // };

  add = (e: any) => {
    let newInput = {
        positionId: this.state.filterInputs.length,
        inputType: 'textInput',
        required: true,
        isValid: true,
        isNeedToRender: true,
        value: '',
        placeholder: `${this.props.inputPlaceholder}`,
        label: `${this.props.inputLabel}[]`,
        onChange: (e: any) => {
          this.props.inputValue(e.target, e.target.tabIndex);
        }
      }
    let newInputArr = this.state.filterInputs;
    newInputArr[newInputArr.length] = newInput;
    newInputArr.forEach((el: any, i: number) => {el.positionId = i});
    this.setState({
      filterInputs: newInputArr
    });
    setTimeout(() => {
      this.props.updateInputArray(this.state.filterInputs)
    });
  }
  
  setDelete = (e: any, col: any) => {
    let newInputArr = this.state.filterInputs.filter((el: any) => el.positionId != col.positionId);
    newInputArr.forEach((el: any, index: number) => { 
      el.positionId = index;
    });
    this.setState({
      filterInputs: newInputArr
    });
    setTimeout(() => {
      this.props.updateInputArray(this.state.filterInputs)
    });
  }

  componentDidMount() {
    let inputArr = this.props.filterInputs;
    inputArr.forEach((el: any) => { 
      el.onChange = (e: any) => {
        this.props.inputValue(e.target, e.target.tabIndex);
      }
    });
    this.setState({
        filterInputs: this.state.filterInputs.concat(inputArr)
    });
  }

  render() {
    return (
      <div>
        {
          this.state.filterInputs.map((col: any, index: number) => (
            <Item key={index} required={col.required} className="gutter-box" label={`${this.props.inputLabel}[${index}]`}>
              <div className={`delete-row-wrap ${!col.isValid ? "validation-err":""}`}>
                <Input
                  value={col.value}
                  placeholder={col.placeholder}
                  tabIndex = {col.positionId}
                  onChange={col.onChange}
                />
                { 
                  // this.state.filterInputs.length>1 ? : null
                  <a onClick={(e: any)=>{this.setDelete(e, col)}} className='delete-row'>
                    <Icon type="minus-circle" />
                  </a> 
                } 
              </div>
            </Item>
          ))
        }
        <Button type="dashed" onClick={(e: any)=>{this.add(e)}} style={{ width: 'calc(100% - 1.2rem - 10px)' }}>
          <Icon type="plus" /> Add field
        </Button> 
      </div>
    );
  }
}
