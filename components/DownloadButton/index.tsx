import * as React from 'react';
import {Button} from 'antd';
import localization from "app/localization";
import './style.css';
import {isDeviceMobile} from "app/utils";

let lang = localStorage.getItem('lang') || 'en';
export namespace DownloadButtonNamespace {
  export interface Props {
    onSaveExcelButton: any;
    loading: boolean;
    btnOnly?: boolean;
  }
}

export class DownloadButton extends React.Component<DownloadButtonNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  renderBtn(){
    return(
      <Button
        onClick={this.props.onSaveExcelButton}
        loading={this.props.loading}
        icon={'file-excel'}
        className={'download-button'}
        type="primary">
        {(localization.DOWNLOAD_FILTER as any)[lang]}
      </Button>
    )
  }

  render() {
    return (
      this.props.btnOnly?
        this.renderBtn()
        :
        <div
          className="ant-advanced-search-form"
          style={{
            width: '100%', padding: '12px',
            marginBottom: isDeviceMobile()?"12px":0,
            background: '#fbfbfb',
            border: '1px solid #d9d9d9',
            position: 'relative',
            borderRadius: '6px'
          }}>
          {
            this.renderBtn()
          }
        </div>
    );
  }
}
