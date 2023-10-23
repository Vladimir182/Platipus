import * as React from 'react';
import { Icon, Form, Button, Row, Col } from 'antd';
import './style.css';
import { RowsWithInputs } from '../RowsWithInputs';

export namespace GamificationGroupDynamicFieldSet {
  export interface Props {
    filterInputsGroup?: any[];
    addRow: any;
    removeRow: any;
    elementsInRow?: any;
    groups?: any;
  }
}

const Item = Form.Item;

export class GamificationGroupDynamicFieldSet extends React.Component<GamificationGroupDynamicFieldSet.Props, any> {
  constructor(props: any) {
    super(props);
  }

  add = (e: any) => {
   this.props.addRow()
  }
  
  setDelete = (index: any) => {
    this.props.removeRow(index);
  }

  render() {
    return (
      <div>
        {
          this.props.groups.map((col: any, index: number) => {
            return(
            <Item key={index} required={col.required} className="gutter-box">
              <div className='gamification-group-wrap-field'>
                <Row justify='space-around' gutter={16}>
                  <Col>
                     {
                      this.props.filterInputsGroup &&
                      <RowsWithInputs
                        elementsInRow={this.props.elementsInRow}
                        inputs={this.props.filterInputsGroup}
                        values={col}
                        index={index}
                        dontShowHideIcon={true}
                      />
                    } 
                  </Col>
                </Row>  
                <Row>
                  <Col span={4} style={{width: '100%', textAlign: 'center'}}>
                    <a onClick={(e: any)=>{this.setDelete(index)}} className='gamification-group-delete-row'>
                      <Icon type="minus-circle" />
                    </a> 
                  </Col>
                </Row>            
              </div>
            </Item>
          )})
        }
        <Button type="dashed" onClick={(e: any)=>{this.add(e)}} style={{ width: '100%'}}>
          <Icon type="plus" /> Add field
        </Button> 
      </div>
    );
  }
}

