import * as React from 'react';
import {Modal, Form} from 'antd';
import { EditGamificationGroupDynamicFieldSet } from '../EditGamificationGroupDynamicFieldSet';

export namespace EditGamificationGroupModalComponentNamespace {
  export interface Props {
    handleOk:any;
    modalTitle:string;
    handleCancel:any;
    visible:boolean;
    loading?:boolean;
    
    groups?: any[];
    elementsInRow?: number;
    filterInputsGroup?: any[];
  }
}

export class EditGamificationGroupModalComponent extends React.Component<EditGamificationGroupModalComponentNamespace.Props, any> {
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
          <EditGamificationGroupDynamicFieldSet 
            elementsInRow={this.props.elementsInRow}
            groups={this.props.groups}
            filterInputsGroup={this.props.filterInputsGroup}
          />
          }
        </Form>
      </Modal>
    );
  }
}
