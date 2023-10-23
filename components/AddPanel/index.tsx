import * as React from 'react';
import {Button, Row, Icon, Form, Divider, Popconfirm, Upload, Affix, message} from 'antd';
import localization from "app/localization";
import {isDeviceMobile, isDeviceMobileAndTablet} from "app/utils";
import {RowsWithInputs} from "app/components/RowsWithInputs";
import './style.css'
import api from "app/const/api";

let lang = localStorage.getItem('lang') || 'en';

export namespace AddPanelNamespace {
  export interface Props {
    buttons?: any[];
    uploadSuccessCallback?: any;

    loading?: boolean;
    title?: string;
    alwaysShowTitle?: boolean;
    filterInputs?: any[]|null;
    goToDescriptionInHelp?: any;
    isAddPanelLocked?: boolean;
    pageTitle?: any;
  }
}


function beforeUpload(file: File) {
  const isFile = file.type === 'application/json';
  if (!isFile) {
    message.error(localization.ONLY_JSON_FILES[lang]);
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error(localization.MUST_BE_SMALLER[lang]);
  }
  return isFile && isLt2M;
}

export class AddPanel extends React.Component<AddPanelNamespace.Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isLocked: this.props.isAddPanelLocked || false,
      fileList: []
    }
  }
  
  setLock = () => {
    this.setState({
      isLocked: !this.state.isLocked
    })
  };

  renderFilter() {
    let id = (localStorage.getItem('sessionId') as string);
    const props = {
      action: api.POST_GAME_VERSIONS_CONFIG,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-request-sign': id
      },
      multiple: false,
      onChange: (info: any) => {
        let fileList = info.fileList;
        fileList = fileList.slice(-1);
        console.log(info);
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} ${localization.SUCCESS_UPLOAD[lang]}`);
          if (this.props.uploadSuccessCallback) {
            this.props.uploadSuccessCallback();
          }
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} ${localization.FAILED_UPLOAD[lang]}`);
        }
        return fileList;
      },
      beforeUpload: beforeUpload
    };
    return (
      <Form
        className="ant-advanced-search-form"
        style={{
          width: '100%', padding: '12px',
          background: '#fbfbfb',
          border: '1px solid #d9d9d9',
          position: 'relative',
          borderRadius: '6px',
          minHeight: '52px'
        }}>
        {
          this.props.goToDescriptionInHelp &&
          <a onClick={this.props.goToDescriptionInHelp}
             style={{fontSize: '25px', position: 'absolute', right: 12, top: 12, lineHeight: 1, zIndex: 1}}
             title={localization.READ_MORE_ABOUT[lang]}><Icon type={'question-circle'}/>
          </a>
        }
        {
          (this.props.goToDescriptionInHelp && !isDeviceMobile()) &&
          <a onClick={this.setLock}
             style={{fontSize: '25px', position: 'absolute', right: 49, top: 12, lineHeight: 1, zIndex: 1}}
             title={this.state.isLocked ? localization.UNLOCK_PANEL[lang] : localization.LOCK_PANEL[lang]}><Icon
            type={this.state.isLocked ? "lock" : "unlock"} theme="outlined"/>
          </a>
        }
        {
          (this.props.alwaysShowTitle || isDeviceMobileAndTablet()) && this.props.title ?
            <Row type="flex" justify="space-around" align="middle">
              <h1>
                {this.props.title}
              </h1>

            </Row> : null
        }
        <Row type="flex" align="middle">
          {
            this.props.buttons && this.props.buttons.map((val: any, index: number) => {
              return (
                val.isNextState ?
                  val.nextStateBtns.map((nextVal: any, nextIndex: number) => (
                    nextVal.popconfirm ?
                      <Popconfirm
                        key={nextIndex}
                        title={localization.SURE_TO_SAVE[lang]}
                        onConfirm={nextVal.popconfirm.onConfirm}
                        onCancel={nextVal.popconfirm.onCancel}
                      >
                        <Button
                          style={{marginRight: 8}}
                          onClick={nextVal.onClick}
                          icon={nextVal.icon}
                          type="primary">
                          {nextVal.text}
                        </Button>
                      </Popconfirm>
                      :
                      <Button
                        style={{marginRight: 8}}
                        className={nextVal.className ? nextVal.className : ''}
                        key={nextIndex}
                        onClick={nextVal.onClick}
                        icon={nextVal.icon}
                        type="primary">
                        {nextVal.text}
                      </Button>
                  ))
                  :
                    !val.omitRender && <Button
                      loading={val.loading}
                      style={{marginRight: 8}}
                      key={index}
                      onClick={val.onClick}
                      icon={val.icon}
                      className = {val.className}
                      type={val.type || "primary"}>
                      {val.text}
                    </Button>
              )
            })
          }
          {
            this.props.uploadSuccessCallback ?
              <Upload
                listType={"text"}
                showUploadList={false}
                {...props}>
                <Button
                  className={'margin-top-for-upload-btn'}>
                  <Icon type="upload"/> {localization.CLICK_TO_UPLOAD[lang]}
                </Button>
              </Upload> : null
          }
        </Row>
        { this.props.pageTitle ?
            <Row type="flex" justify="space-around" align="middle">
              <h1>
                {this.props.pageTitle}
              </h1>
            </Row> : null
        }
        {
          this.props.filterInputs && <Divider/>
        }
        {
          this.props.filterInputs &&
          <RowsWithInputs inputs={this.props.filterInputs}/>
        }
      </Form>
    );
  }

  render() {
    return (
      this.state.isLocked ?
        <Affix
          target={() => document.getElementById('affix-scrollable-content')}
          offsetTop={12}
          style={{
            width: '100%'
          }}>
          {
            this.renderFilter()
          }
        </Affix> : this.renderFilter()
    );
  }
}
