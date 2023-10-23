import * as React from 'react';
import {Table} from 'antd';
import localization from "app/localization";
import {formatNumberData, formatTableData, generateValueWithCurrency, generateValueWithoutCurrency, generateValueWithPercent} from "app/utils";
import {IPagination} from "app/actions/table";
import './style.css';
// import {FORMATS} from "app/const/moneyFormatter";

export namespace TableNamespace {
  export interface Props {
    columns: any[];
    data: any;
    onTableChange: any;
    totalData?: any;
    loading: boolean;
    checkedBuy?: boolean;
    pagination?: IPagination|null;
    onSaveExcelButton?: () => void;
    expandedRowRender?: any;
    rowSelection?: any;
    rowClassName?: any;
    title?:()=> any;
    expandIconColumnIndex?: number;
    additionalComponents?: any;
    metadata?: any;
  }

}
// let tableCellStyle = {padding: "16px 16px", wordBreak:"break-word"};
let lang = localStorage.getItem('lang') || 'en';

export class DataTable extends React.Component<TableNamespace.Props, any> {
  constructor(props: any) {
    super(props);
    this.BodyWrapper = this.BodyWrapper.bind(this);
  }

  formatNumberData(num: number) {
    return num.toFixed(2)
  }

  getStylesForProfitAndPayout(val: any) {
    let color: string;
    if (val.dataIndex === 'profit') {
      let num = this.props.totalData[val.dataIndex];
      if (num >= 0) {
        color = '#90ee90';
      } else {
        color = '#FFCCCB';
      }
      if (typeof num === 'undefined') {
        color = '';
      }
    } else if (val.dataIndex === 'payout') {
      let num = this.props.totalData[val.dataIndex];
      if (num <= 100) {
        color = '#90ee90';
      } else {
        color = '#FFCCCB';
      }
      if (typeof num === 'undefined') {
        color = '';
      }
    } else {
      color = ''
    }
    return {
      style: {
        background: color
      }
    }
  }

  renderTotalCell(dataIndex: string, currencyName: string, isCurrencySymbol: boolean, hideBuy?: boolean) {
    // let totalData = this.props.totalData;
    let propertiesToConvert = ['buyBet', 'buyWin', 'buyAvgBet', 'buyProfit', 'buyPayout'];
    let totalData = formatTableData([this.props.totalData].map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert)[0];
    switch (dataIndex) {
      case 'name': {
        return (localization.TOTAL as any)[lang];
      }
      case 'giftSpins': {
        return `${totalData['giftCount']}(${totalData['giftSpins']})`;
      }
      default: {
        let res = formatNumberData(totalData[dataIndex], dataIndex === 'betCount');
        if(dataIndex == "betCount"){
          res = generateValueWithoutCurrency(res, totalData, 'buyCount', hideBuy);
        }
        if(dataIndex == "payout"){
          res = generateValueWithPercent(res, totalData, 'buyPayout', hideBuy);
        }
        if(isCurrencySymbol && currencyName){
          switch (dataIndex) {
            case 'bet':     res = generateValueWithCurrency(res, totalData, currencyName, 'buyBet', hideBuy);     break;
            case 'win':     res = generateValueWithCurrency(res, totalData, currencyName, 'buyWin', hideBuy);     break;
            case 'avgBet':  res = generateValueWithCurrency(res, totalData, currencyName, 'buyAvgBet', hideBuy);  break;
            case 'profit':  res = generateValueWithCurrency(res, totalData, currencyName, 'buyProfit', hideBuy);  break;
            default:        res = generateValueWithCurrency(res, totalData, currencyName, dataIndex, true);       break;
          }
        }
        return res;
      }
    }
  };

  BodyWrapper(props: any) {
    let totalData = this.props.totalData;
    let currency: string = (this.props.metadata && this.props.metadata.currencyReport && this.props.metadata.currencyReport.name) || "";
    return (
      <React.Fragment>
        <tbody {...props} />
        {
          totalData ?
            <tfoot>
            <tr className="ant-table-row" style={{fontWeight: 'bold'}}>
              {
                this.props.columns.map((val: any, i: number) => (<td key={i} {...this.getStylesForProfitAndPayout(val)}>
                  {this.renderTotalCell(val.dataIndex,  currency, val.currencySymbol, !this.props.checkedBuy)}
                </td>))
              }
            </tr>
            </tfoot> : null
        }
      </React.Fragment>
    );
  }

  render() {
    let components: any;
    if (this.props.additionalComponents) {
      components = {body: {wrapper: this.BodyWrapper, ...this.props.additionalComponents}};
    } else {
      components = {body: {wrapper: this.BodyWrapper}}
    }

    let pagination: any;
    if(this.props.pagination){
      pagination={
      ...this.props.pagination,
          position: 'both',
          pageSizeOptions: ['10', '50', '100'],
          showSizeChanger: true
      }
    }else{
      pagination = false;
    }
    return (
      <Table
        title={this.props.title}
        expandIconColumnIndex={this.props.expandIconColumnIndex}
        expandIconAsCell={false}
        rowClassName={this.props.rowClassName}
        expandedRowRender={this.props.expandedRowRender ? this.props.expandedRowRender : null}
        columns={this.props.columns}
        style={{marginTop: '10px', width: '100%'}}
        components={components}
        dataSource={this.props.data}
        size="middle"
        bordered
        rowSelection={this.props.rowSelection ? this.props.rowSelection : null}
        pagination={pagination}
        loading={this.props.loading}
        onChange={this.props.onTableChange}
      />
    );
  }
}
