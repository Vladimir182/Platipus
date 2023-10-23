import * as React from 'react';
import {Modal, Form} from 'antd';
import {RowsWithInputs} from "app/components/RowsWithInputs";

export namespace ModalComponentNamespace {
  export interface Props {
    handleOk:any;
    modalTitle:string;
    handleCancel:any;
    visible:boolean;
    loading?:boolean;

    filterInputs?: any[];
    elementsInRow?:number;
  }
}

export class ModalComponent extends React.Component<ModalComponentNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Modal
        width={800}
        confirmLoading={this.props.loading}
        title={this.props.modalTitle}
        visible={this.props.visible}
        onOk={this.props.handleOk}
        onCancel={this.props.handleCancel}
      >
        <Form>
          {
            this.props.filterInputs &&
            <RowsWithInputs
              elementsInRow={this.props.elementsInRow}
              inputs={this.props.filterInputs}
              dontShowHideIcon={true}/>
          }
        </Form>
      </Modal>
    );
  }
}
