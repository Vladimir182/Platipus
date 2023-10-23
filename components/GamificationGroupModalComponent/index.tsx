import * as React from 'react';
import {Modal, Form} from 'antd';
import { GamificationGroupDynamicFieldSet } from '../GamificationGroupDynamicFieldSet';

export namespace GamificationGroupModalComponentNamespace {
  export interface Props {
    handleOk:any;
    modalTitle:string;
    handleCancel:any;
    visible:boolean;
    loading?:boolean;
    filterInputsGroup?: any[];
    addGroupRow: any;
    removeGroupRow: any;
    filterInputs?: any[];
    elementsInRow?:number;
    groups: any[];
  }
}

export class GamificationGroupModalComponent extends React.Component<GamificationGroupModalComponentNamespace.Props, any> {
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
        {this.props.filterInputsGroup &&
          <GamificationGroupDynamicFieldSet
            elementsInRow={this.props.elementsInRow}
            groups={this.props.groups}
            removeRow={this.props.removeGroupRow}
            filterInputsGroup={this.props.filterInputsGroup}
            addRow={this.props.addGroupRow}
          />
          }
        </Form>
      </Modal>
    );
  }
}
