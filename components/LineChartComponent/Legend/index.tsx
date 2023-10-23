import * as React from 'react';
import {Row, Col, Checkbox, Popconfirm} from 'antd';
import {IOption} from "app/components/LineChartComponent";

export namespace LegendNamespace {
  export interface Props {
    chartKey: string;
    chartOptions: IOption[];
    selectedDataKeys: string[];
    onChangeCheckbox: (chartKey: string, dataKey: string, cheked: boolean) => void;
    onCreateNewChart: (chartKey: string, dataKey: string) => void;
  }
}

export class LegendComponent extends React.Component<LegendNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  getColWidthByDataKey(dataKey: string):number{
    if(dataKey == "bet"
      || dataKey == "win"
      || dataKey == "profit"){
      return 2;
    }else{
      return 3;
    }
  }

  render() {

    return (
      <Row type="flex" justify="space-around" align="middle">
        {
          this.props.chartOptions.map((val: IOption)=>{
            return(
              //812px
              <Col className="gutter-row"
                   key={val.dataKey}
                   xs={8} sm={8} md={8}
                   lg={this.getColWidthByDataKey(val.dataKey)}
                   xl={this.getColWidthByDataKey(val.dataKey)}
                   style={{textAlign: 'right'}}>
                <span>{val.name}: </span>
                {
                  val.checked?
                    <Checkbox
                      className={val.className}
                      checked={val.checked}
                      onChange={() => {this.props.onChangeCheckbox(this.props.chartKey, val.dataKey, !val.checked)}}
                    >
                    </Checkbox> :
                    <Popconfirm
                      title={"Draw line on this chart or create new?"}
                      okText={"New"}
                      cancelText={"This"}
                      onCancel={() => {this.props.onChangeCheckbox(this.props.chartKey, val.dataKey, !val.checked)}}
                      onConfirm={() => {this.props.onCreateNewChart(this.props.chartKey, val.dataKey)}}
                    >
                      <Checkbox
                        disabled={val.checked?false:this.props.selectedDataKeys.indexOf(val.dataKey) !== -1}
                        className={val.className}
                        checked={val.checked}
                      >
                      </Checkbox>
                    </Popconfirm>
                }
              </Col>
            )
          })
        }
      </Row>
    );
  }
}
