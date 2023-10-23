import * as React from 'react';
import {Modal, Form, Divider} from 'antd';
import {RowsWithInputs} from "app/components/RowsWithInputs";
import { EditGamificationDynamicFieldSet } from '../EditGamificationDynamicFieldSet';

export namespace EditModalComponentNamespace {
  export interface Props {
    handleOk:any;
    modalTitle:string;
    handleCancel:any;
    visible:boolean;
    loading?:boolean;
    
    filterInputs?: any[];
    editPrizes?: any[];
    removePrizePositionRow: any;
    filterInputsPrizePosition?: any[];
    addPrizePositionRow: any;
    filterInputsPrizeFund: any;
    elementsInRow?:number;
  }
}

export class EditGamificationModalComponent extends React.Component<EditModalComponentNamespace.Props, any> {
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
              inputs={this.props.filterInputs}
              dontShowHideIcon={true}/>
          }
        </Form>
        <div style={{fontSize: '1rem', color: 'rgba(0, 0, 0, 0.85)', fontWeight: 500}}>
          Add Prize Fund:
        </div>
        <Divider style={{margin: '1rem 0'}}/>
        <Form>
          {
            this.props.filterInputsPrizeFund &&
            <RowsWithInputs
              elementsInRow={this.props.elementsInRow}
              inputs={this.props.filterInputsPrizeFund}
              dontShowHideIcon={true}/>
          }
        </Form>
        <div style={{fontSize: '1rem', color: 'rgba(0, 0, 0, 0.85)', fontWeight: 500}}>
          Add Prize positions:
        </div>
        <Divider style={{margin: '1rem 0'}}/>
        <Form>
        {this.props.filterInputsPrizePosition &&
          <EditGamificationDynamicFieldSet 
            editPrizes={this.props.editPrizes}
            removeRow={this.props.removePrizePositionRow}
            filterInputsPrizePosition={this.props.filterInputsPrizePosition}
            addRow={this.props.addPrizePositionRow}
          />
          }
        </Form>
      </Modal>
    );
  }
}
