import * as React from 'react';
import { Form, Row, Col } from 'antd';
import './style.css';
import { RowsWithInputs } from '../RowsWithInputs';

export namespace EditGamificationGroupDynamicFieldSet {
  export interface Props {
    filterInputsGroup?: any[];
    elementsInRow?: any;
    groups?: any;
  }
}

const Item = Form.Item;

export class EditGamificationGroupDynamicFieldSet extends React.Component<EditGamificationGroupDynamicFieldSet.Props, any> {
  constructor(props: any) {
    super(props);
    console.log('groups', this.props.filterInputsGroup)
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
              </div>
            </Item>
          )})
        }
      </div>
    );
  }
}

