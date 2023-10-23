import * as React from 'react';
import { Icon, Form, Button, Row, Col } from 'antd';
import './style.css';
import { RowsWithInputs } from '../RowsWithInputs';

export namespace EditGamificationDynamicFieldSet {
  export interface Props {
    filterInputsPrizePosition: any;
    addRow: any;
    removeRow: any;
    editPrizes?: any;
  }
}

const Item = Form.Item;

export class EditGamificationDynamicFieldSet extends React.Component<EditGamificationDynamicFieldSet.Props, any> {
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
    let styles = {}
    if(window.innerWidth >= 991){
      styles = {
        textAlign: 'center',
        marginTop: '2.4rem'
      }
    } else {
      styles = {
        textAlign: 'center',
      }
    }
    return (
      <div>
        {
          this.props.editPrizes.map((col: any, index: number) => {
            return(
            <Item key={index} required={col.required} className="gutter-box">
              <div className='edit-gamification-wrap-field'>
                <Row justify='space-around' gutter={16}>
                  <Col span={20}>
                  {
                      this.props.filterInputsPrizePosition &&
                      <RowsWithInputs
                        inputs={this.props.filterInputsPrizePosition}
                        values={col}
                        index={index}
                        dontShowHideIcon={true}
                        />
                    } 
                  </Col>
                  { this.props.editPrizes.length === 1 ? '' :
                    (<Col span={4} style={styles}>
                      <a onClick={(e: any)=>{this.setDelete(index)}} className='edit-gamification-prize-delete-row'>
                        <Icon type="minus-circle" />
                      </a> 
                    </Col>)
                  }
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

