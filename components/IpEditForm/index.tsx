import * as React from 'react';
import { Modal } from 'antd';
import {DynamicFieldSet} from "app/components/DynamicFieldSet";

export namespace IpEditFormNamespace {
  export interface Props {
    handleOk:any;
    modalTitle:string;
    handleCancel:any;
    visible:boolean;
    loading?:boolean;
    filterInputs: any;
    elementsInRow?:number;
  }
}


export class IpEditForm extends React.Component<IpEditFormNamespace.Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      filterInputs: []
    };
  }
  
  inputValue = (e: any, index: number) => {
    let updInput = this.state.filterInputs[index];
    updInput.value = e.value;
    updInput.isValid = true;
    let updInputArr = this.state.filterInputs;
    updInputArr[index] = updInput;
    this.setState({
      filterInputs: updInputArr
    });
  };

  updateInputArray = (inputArray: any) => {
    this.setState(({
        filterInputs: inputArray
    }));
  }

  
  
  handleOk() {
    this.state.filterInputs.forEach((el: any) => {
      if (this.isIpV4(el.value) || this.isIpV6(el.value)) {
        el.isValid = true;
      } else {
        el.isValid = false;
        let updInput = this.state.filterInputs[el.positionId];
        updInput.isValid = false;
        let updInputArr = this.state.filterInputs;
        updInputArr[el.positionId] = updInput;
        this.setState({
          filterInputs: updInputArr
        });
      }
    })
    if(this.state.filterInputs.filter((el: any) => el.isValid == false).length == 0){
      this.props.handleOk((this.state.filterInputs.map((el: any) => el.value)).join());
    }
  }

  isIpV4 = (ip: string) => {
    const regexExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/gi;
    return regexExp.test(ip);
  }
  isIpV6 = (ip: string) => {
    const regexExp = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;
    return regexExp.test(ip);
  }
  
  
  handleCancel() {
    this.setState((state: any, props: any) => ({
        filterInputs: props.filterInputs
    }));
  }

  componentDidMount() {

    this.setState((state: any, props: any) => ({
      filterInputs: state.filterInputs.concat(props.filterInputs)
    }));
  }

  render() {
    return (
      <Modal
          width={800}
          confirmLoading={this.props.loading}
          title={this.props.modalTitle}
          visible={this.props.visible}
          onOk={()=>{this.handleOk()}}
          onCancel={()=>{this.handleCancel(); this.props.handleCancel()}}
        >
        <form>
          <DynamicFieldSet
            filterInputs={
              this.state.filterInputs
            }
            updateInputArray={(arr: any)=>{this.updateInputArray(arr)}}
            inputValue={(e: any, index: number) =>{this.inputValue(e, index) }}
            inputPlaceholder = "Input Ip:"
            inputLabel = "Ip"
          />
        </form>
      </Modal>
    );



  }
}
