import * as React from 'react';
import {LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid/*, Brush*/} from 'recharts';
import {Icon} from 'antd';
import './style.css';
import {formatNumberData, shortFormatNumber} from "app/utils";
import {FORMATS} from "app/const/moneyFormatter";
import {LegendComponent} from "app/components/LineChartComponent/Legend";
// const Item = Form.Item;

export interface IOption {
  dataKey: string;
  name: string;
  color: string;
  className: string;
  checked: boolean;
}

export interface IChart {
  id: string;
  chartOptions: IOption[];
}

export namespace LineChartNamespace {
  export interface Props {
    data: any[];
    currency: string;
    chartsData: IChart[];
    selectedDataKeys: string[];
    closeChart: (chartKey: string) => void
    onChangeCheckbox: (chartKey: string,dataKey: string, cheked: boolean) => void;
    onCreateNewChart: (chartKey: string, dataKey: string) => void;
  }

  export interface State {
  }
}

export class LineChartComponent extends React.Component<LineChartNamespace.Props, LineChartNamespace.State> {
  constructor(props: any) {
    super(props);
  }

  customizedAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={16} textAnchor='middle' fill='#666'>{payload.value}</text>
      </g>
    )
  };

  customToolTip = (value: any, name: any, props: any) => {
    if(name !== "betCount" && name !== "giftSpins" && name !== "giftCount" && name !== "payout"){
      let val = formatNumberData(value);
      return (
        FORMATS[this.props.currency] ? `${FORMATS[this.props.currency]['symbol']} ${val}` : `${val} ${this.props.currency}`
      )
    } else {
      return name == "payout"? formatNumberData(value) + " %":formatNumberData(value, true);
    }
  };

  renderLine = (arr: IOption[]): JSX.Element[] => {
    let localArr = arr.filter((val: IOption) => val.checked);
    return localArr.map((val: any) => {
      return <Line key={val.dataKey} type="monotone" dataKey={val.dataKey} stroke={val.color} />
    });
  };

  render() {
    return (
      <div
        className="ant-advanced-search-form"
        style={{
          width: '100%', padding: '12px',
          background: '#fbfbfb',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          marginTop: "12px",
          marginBottom: "12px"
        }}>
        {
          this.props.chartsData.map((val: IChart, index: number) => {
            return(
              <div key={val.id}>
                {
                  index !== 0 &&
                  <a
                    onClick={() => {this.props.closeChart(val.id)}}
                    style={{fontSize: '25px', color: "red"}}
                    title={"Close Chart"}>
                    <Icon type={'close-circle'}/>
                  </a>
                }

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart width={400} height={400} data={this.props.data}
                             syncId="anyId"
                             margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={this.customizedAxisTick}/>
                    <YAxis tickFormatter={(val: any)=> shortFormatNumber(val)}/>
                    <CartesianGrid strokeDasharray="3 3" />
                    {/*{(index == this.props.chartsData.length - 1) && <Brush/>}*/}
                    <Tooltip
                      isAnimationActive={false}
                      formatter={this.customToolTip}
                    />
                    <Legend content={
                      <LegendComponent
                        chartKey={val.id}
                        chartOptions={val.chartOptions}
                        selectedDataKeys = {this.props.selectedDataKeys}
                        onChangeCheckbox={this.props.onChangeCheckbox}
                        onCreateNewChart={this.props.onCreateNewChart}
                      />}
                    />
                    {this.renderLine(val.chartOptions)}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          })
        }
      </div>
    );
  }
}
