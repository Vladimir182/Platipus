import * as React from 'react';
import {Row, Anchor, Col, List, Divider, BackTop, Icon} from 'antd';

const {Link} = Anchor;
import {help, ItemLocalization} from "app/localization";
import './style.css';
import {isDeviceMobile, isDeviceMobileAndTablet} from "app/utils";
import {
  LINK_ADMIN_PANEL_INTRODUCTION,
  LINK_ALL_USERS, LINK_BET_BOOK, LINK_CHART, LINK_DAY_REPORT,
  LINK_DOWNLOAD,
  LINK_FOR_FUN,
  LINK_GAME_DATA_REPORT, LINK_GAME_VERSIONS,
  LINK_HISTORY,
  LINK_HISTORY_DETAILS,
  LINK_HISTORY_DETAILS_INFO, LINK_HISTORY_DETAILS_PRINT,
  LINK_ONLINE_USERS,
  LINK_RANGE_PICKER, LINK_REPORT_LEVEL,
  LINK_ROOMS,
  LINK_SELECT_CURRENCY, LINK_SELECT_PLATFORM, LINK_SETTINGS, LINK_SETTINGS_CURRENCY,
  LINK_SHOW_DATA,
  LINK_SHOW_GIFT,
  LINK_USER_REPORTS
} from "app/components/HelpComponent/anchorId";
import {default as roles, getRoleById} from "app/const/roles";

let lang = localStorage.getItem('lang') || 'en';
export namespace HelpNamespace {
  export interface Props {
  }
}

export class HelpComponent extends React.Component<HelpNamespace.Props, any> {
  constructor(props: any) {
    super(props);
  }

  renderMainFieldsItem(item: string) {
    let res = item.split('%s');
    return (<div>
      <strong>{res[0]}</strong>{res[1]}
    </div>);
  }

  componentDidMount() {
    window.location.hash = (window as any).decodeURIComponent(window.location.hash);
    setTimeout(() => {
      const hashParts = window.location.hash.split('#');
      console.log(hashParts);
      if (hashParts.length > 1) {
        let aim = (document.querySelector(`#${hashParts[1]}`) as any);
        aim.scrollIntoView();
      }
      //S_U_P_E_R K_O_S_T_Y_L'
      let container = !isDeviceMobileAndTablet() ? (document.getElementById('help-container') as any).parentElement : window;
      container.scrollBy(0, 1);
      setTimeout(() => {
        container.scrollBy(0, -1);
      }, 0);
    }, isDeviceMobileAndTablet() ? 250 : 0);
  }

  renderAnchor(anchor_props: any) {
    return (
      <Anchor
        {...anchor_props}
        affix={true}>
        <Link href={`#${LINK_ADMIN_PANEL_INTRODUCTION}`} title={help.LINK_ADMIN_PANEL_INTRODUCTION[lang]}/>
        <Link href={`#${LINK_GAME_DATA_REPORT}`} title={help.LINK_GAME_REPORT[lang]}>
          <Link href={`#${LINK_RANGE_PICKER}`} title={help.LINK_RANGE [lang]}/>
          <Link href={`#${LINK_SELECT_CURRENCY}`} title={help.LINK_CURRENCY[lang]}/>
          <Link href={`#${LINK_SELECT_PLATFORM}`} title={help.LINK_SELECT_PLATFORM[lang]}/>
          <Link href={`#${LINK_ROOMS}`} title={help.LINK_ROOMS[lang]}/>
          <Link href={`#${LINK_SHOW_GIFT}`} title={help.LINK_GIFT[lang]}/>
          <Link href={`#${LINK_FOR_FUN}`} title={help.LINK_ENABLE_FUN[lang]}/>
          <Link href={`#${LINK_SHOW_DATA}`} title={help.LINK_SHOW_DATA[lang]}/>
          <Link href={`#${LINK_REPORT_LEVEL}`} title={help.LINK_REPORT_LEVEL[lang]}/>
          <Link href={`#${LINK_DOWNLOAD}`} title={help.LINK_DOWNLOAD[lang]}/>
          <Link href={`#${LINK_DAY_REPORT}`} title={help.LINK_DAY_REPORT[lang]}/>
          <Link href={`#${LINK_CHART}`} title={help.LINK_CHART[lang]}/>
        </Link>
        <Link href={`#${LINK_USER_REPORTS}`} title={help.LINK_USERS[lang]}>
          <Link href={`#${LINK_ALL_USERS}`} title={help.LINK_ALL_USERS[lang]}/>
          <Link href={`#${LINK_ONLINE_USERS}`} title={help.LINK_ONLINE_USERS[lang]}/>
          <Link href={`#${LINK_HISTORY}`} title={help.LINK_HISTORY[lang]}>
            <Link href={`#${LINK_HISTORY_DETAILS}`} title={help.LINK_HISTORY_DETAILS[lang]}/>
            <Link href={`#${LINK_HISTORY_DETAILS_INFO}`} title={help.LINK_HISTORY_DETAILS_INFO[lang]}/>
            <Link href={`#${LINK_HISTORY_DETAILS_PRINT}`} title={help.LINK_HISTORY_DETAILS_PRINT[lang]}/>
          </Link>
          <Link href={`#${LINK_BET_BOOK}`} title={help.LINK_BET_BOOK[lang]}/>
        </Link>
        {
          HelpComponent.isAllowForRole([roles.ADMIN.name,roles.DISTRIBUTOR.name]) && <Link href={`#${LINK_SETTINGS}`} title={help.LINK_SETTINGS[lang]}>
            <Link href={`#${LINK_GAME_VERSIONS}`} title={help.LINK_GAME_VERSIONS[lang]}/>
            <Link href={`#${LINK_SETTINGS_CURRENCY}`} title={help.LINK_SETTINGS_CURRENCY[lang]}/>
          </Link>
        }
      </Anchor>
    );
  }

  static parseTextNeedTextStyling(text: string) {
    return (
      text.indexOf('%S') !== -1 ||
      text.indexOf('%b') !== -1 ||
      text.indexOf('%n') !== -1 ||
      text.indexOf('%c') !== -1 ||
      text.indexOf('%i') !== -1 ||
      text.indexOf('%g') !== -1 ||
      text.indexOf('%a') !== -1)
  }

  static parseText(item: ItemLocalization, textColor?: string, backColor?: string, url?: string) {
    let text: string = item[lang];
    if (item.KEY.indexOf('S_') === -1) {
      return text;
    }
    let splitedTextArr = text.split('%s');

    return (
      <span>
        {
          splitedTextArr.map((wordOV: string, index: number) => {
            let word: string = wordOV.slice(0);
            if (HelpComponent.parseTextNeedTextStyling(word)) {
              let style: any = {};
              let breakLine = null;
              if (word.indexOf('%g') !== -1) {
                word = "\xa0\xa0\xa0\xa0" + word.replace('%g', '');
              }
              if (word.indexOf('%S') !== -1) {
                style = {...style, fontWeight: 'bold'};
                word = word.replace('%S', '');
              }
              if (word.indexOf('%i') !== -1) {
                style = {...style, fontStyle: 'italic'};
                word = word.replace('%i', '');
              }
              if (word.indexOf('%c') !== -1) {
                style = {...style, color: textColor || '#094979'};
                word = word.replace('%c', '');
              }
              if (word.indexOf('%b') !== -1) {
                style = {...style, backgroundColor: backColor || '#009600', color: textColor || '#ffffff'};
                word = word.replace('%b', '');
              }
              if (word.indexOf('%n') !== -1) {
                breakLine = <br/>;
                word = word.replace('%n', '');
              }
              if (word.indexOf('%a') !== -1) {
                word = word.replace('%a', '');
                return (<a key={index} href={url || word.trim()} style={style} target="_blank">{word}</a>);
              }
              return (<span key={index} style={style}>{breakLine}{word}</span>);
            } else {
              return (<span key={index}>{word}</span>)
            }
          })
        }
      </span>
    )
  }

  static getImg(url: string) {
    let src='';
    try {
      src = require(`./img/${url}`);
    }catch (err){
      src = require(`./img/default.svg`);
    }
    return src;
  }

  private static isAllowForRole(allowedRoles:string[] | string):boolean{
    let roleId = localStorage.getItem('roleId') as string;
    let role: string | undefined = getRoleById(parseInt(roleId));
    if(typeof allowedRoles === "string"){
      return role === allowedRoles
    }else{
      for(let i = 0; i < allowedRoles.length; i++){
        if(role === allowedRoles[i]){
          return true;
        }
      }
      return false;
    }
  }

  private static crossIcon(){
    return(
      <svg viewBox="64 64 896 896" data-icon="close-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
      </svg>
    )
  }

  render() {
    let anchor_props = isDeviceMobileAndTablet() ?
      {
        offsetTop: 10
      }
      :
      {
        getContainer: () => (isDeviceMobileAndTablet() ? window : document.getElementById('help-container') as any).parentElement,
        offsetTop: 10
      };
    const data_1 = [
      help.LIST_1_1[lang],
      help.LIST_1_2[lang],
      help.LIST_1_3[lang],
      help.LIST_1_4[lang],
      help.LIST_1_5[lang],
      help.LIST_1_6[lang],
      help.LIST_1_7[lang]
    ];
    const data_2 = [
      help.S_LIST_2_1[lang],
      help.S_LIST_2_2[lang],
      help.S_LIST_2_3[lang],
      help.S_LIST_2_4[lang],
      help.S_LIST_2_5[lang],
      help.S_LIST_2_6[lang],
      help.S_LIST_2_7[lang],
      help.S_LIST_2_8[lang]
    ];
    const data_3 = [
      help.S_LIST_3_1[lang],
      help.S_LIST_3_2[lang],
      help.S_LIST_3_3[lang],
      help.S_LIST_3_4[lang],
      help.S_LIST_3_4_1[lang],
      help.S_LIST_3_5[lang],
      help.S_LIST_3_6[lang],
      help.S_LIST_3_7[lang],
      help.S_LIST_3_8[lang],
      help.S_LIST_3_9[lang],
      help.S_LIST_3_10[lang]
    ];
    const data_4 = [
      help.S_LIST_4_1,
      help.S_LIST_4_2,
      help.S_LIST_4_3,
      help.S_LIST_4_4,
      help.S_LIST_4_5,
      help.S_LIST_4_6,
      help.S_LIST_4_7,
      help.S_LIST_4_8,
      help.S_LIST_4_9,
      help.S_LIST_4_10,
      help.S_LIST_4_11,
      help.S_LIST_4_12
    ];
    const data_5 = [
      help.S_LIST_5_1,
      help.S_LIST_5_2,
      help.S_LIST_5_3,
      help.S_LIST_5_4,
      help.S_LIST_5_5,
      help.S_LIST_5_6,
      help.S_LIST_5_7,
      help.S_LIST_5_8,
      help.S_LIST_5_9,
      help.S_LIST_5_9_1
    ];
    const data_5_1 = [
      help.S_LIST_5_10,
      help.S_LIST_5_11,
      help.S_LIST_5_12,
      help.S_LIST_5_13,
      help.S_LIST_5_14
    ];
    const data_6 = [
      help.S_LIST_6_1[lang],
      help.S_LIST_6_2[lang],
      help.S_LIST_6_3[lang],
      help.S_LIST_6_4[lang],
      help.S_LIST_6_5[lang],
      help.S_LIST_6_6[lang],
      help.S_LIST_6_7[lang],
      help.S_LIST_6_8[lang],
      help.S_LIST_6_8_1[lang],
      help.S_LIST_6_9[lang],
      help.S_LIST_6_10[lang]
    ];
    const data_7 = [
      help.S_LIST_7_1[lang],
      help.S_LIST_7_2[lang],
      help.S_LIST_7_3[lang],
      help.S_LIST_7_4[lang],
      help.S_LIST_7_5[lang],
      help.S_LIST_7_6[lang],
      help.S_LIST_7_7[lang],
      help.S_LIST_7_8[lang],
      help.S_LIST_7_9[lang],
      help.S_LIST_7_10[lang]
    ];
    const data_8 = [
      help.PLAYER_HISTORY_3_4_2[lang],
      help.PLAYER_HISTORY_3_4_3[lang]
    ];
    const data_9 = [
      help.S_LIST_9_1,
      help.S_LIST_9_2,
      help.S_LIST_9_3,
      help.S_LIST_9_4,
      help.S_LIST_9_5
    ];
    const data_10_1 = [
      help.S_LIST_10_1,
      help.S_LIST_10_2
    ];
    const data_10_2 = [
      help.S_LIST_10_3
    ];

    const data_10_3 = [
      help.S_LIST_10_4
    ];
    const data_11 = [
      help.S_LIST_11_1,
      help.S_LIST_11_2,
      help.S_LIST_11_3,
      help.S_LIST_11_3_1,
      help.S_LIST_11_4,
      help.S_LIST_11_4_1
    ];
    const data_11_1 = [
      help.S_LIST_11_5,
      help.S_LIST_11_6,
      help.S_LIST_11_7,
      help.S_LIST_11_8,
      help.S_LIST_11_9
    ];
    const data_12 = [
      help.S_LIST_12_1,
      help.S_LIST_12_2,
      help.S_LIST_12_3,
      help.S_LIST_12_4,
      help.S_LIST_12_5,
      help.S_LIST_12_6
    ];
    const data_13 = [
      help.S_LIST_13_1,
      help.S_LIST_13_2,
      help.S_LIST_13_3
    ];
    const data_14 = [
      help.S_LIST_14_1,
      help.S_LIST_14_2,
      help.S_LIST_14_3,
      help.S_LIST_14_4
    ];
    const data_15 = [
      help.S_LIST_15_1,
      help.S_LIST_15_2,
      help.S_LIST_15_3,
      help.S_LIST_15_4
    ];
    const data_16 = [
      help.DAY_REPORT_6_1[lang],
      help.DAY_REPORT_6_2[lang]
    ];
    return (
      <div style={{width: '100%', marginTop: '10px'}}>
        {isDeviceMobile() && <BackTop/>}
        <Row type="flex" justify="space-around" align="top">
          <Col xs={0} sm={0} md={0} lg={0} xl={2}/>
          <Col xs={24} sm={24} md={20} lg={20} xl={20} style={{fontSize: isDeviceMobile() ? '18px' : '20px'}}>
            <Row type="flex" justify="space-around" align="middle">
              <h1 id={LINK_ADMIN_PANEL_INTRODUCTION}>{HelpComponent.parseText(help.ADMIN_PANEL)}</h1>
            </Row>

            <p>{HelpComponent.parseText(help.S_ADMIN_PANEL_1)}
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <h2 id={LINK_GAME_DATA_REPORT}
                  style={{color: '#094979'}}>{HelpComponent.parseText(help.GAME_REPORT_1)}</h2>
            </Row>

            <p>{HelpComponent.parseText(help.S_GAME_REPORT_2)}​</p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_3)}​</p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_4)}​</p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_5)}​</p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_6)}​</p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_4[lang])}`}/>
              </div>
            </Row>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.TITLE_LIST_9[lang]}​ </span>}
                dataSource={data_9}
                renderItem={(item: any) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.GAME_REPORT_5_1)}​</p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_5_2, '#1890ff')}​</p>
            <p>{HelpComponent.parseText(help.GAME_REPORT_6)}​</p>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}} id={LINK_RANGE_PICKER}>{HelpComponent.parseText(help.S_GAME_REPORT_7)}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_OK_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
              </div>
            </Row>
            <p>{HelpComponent.parseText(help.GAME_REPORT_8)}​</p>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'} style={{display: 'inline-block', whiteSpace: 'nowrap'}}>
                <div style={{float: 'left', marginRight: '10px'}}>
                  <List
                    size="small"
                    bordered
                    dataSource={data_1}
                    renderItem={(item: any) => (<List.Item>{item}</List.Item>)}
                  />
                </div>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_8[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_9)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_9[lang])}`}/>
              </div>
            </Row>
            <Divider/>

            <p id={LINK_SELECT_CURRENCY}>{HelpComponent.parseText(help.S_GAME_REPORT_10)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_11[lang])}`}/>
              </div>
            </Row>
            <Divider/>

            <p id={LINK_SELECT_PLATFORM}>{HelpComponent.parseText(help.S_GAME_REPORT_11)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_10[lang])}`}/>
              </div>
            </Row>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_11_1)}
              &nbsp;
            ​  <Icon component={HelpComponent.crossIcon} style={{ color: "rgba(0,0,0,0.25)" }}/>
            </p>
            <Divider/>

            <p id={LINK_ROOMS}>{HelpComponent.parseText(help.S_GAME_REPORT_12)}​
            </p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_12_1)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_12[lang])}`}/>
              </div>
            </Row>
            <Divider/>

            <Row>
              <div className={'overflow-img-wrapper'}>
                <Col span={12} style={{width: '130px', marginRight: '10px'}}>
                  <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_16[lang])}`}/>
                </Col>
                <Col span={21} style={{width: 'calc(100% - 150px)'}}>
                  <p id={LINK_SHOW_GIFT}>{HelpComponent.parseText(help.S_GAME_REPORT_16)}​</p>
                  <p>{HelpComponent.parseText(help.S_GAME_REPORT_16_1)}​</p>
                  <p>{HelpComponent.parseText(help.S_GAME_REPORT_16_2)}​</p>
                </Col>
              </div>
            </Row>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_16_1[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_15[lang])}`}
                     style={{float: 'left', marginRight: '10px'}}/>
                <p id={LINK_FOR_FUN}>{HelpComponent.parseText(help.S_GAME_REPORT_15)}​
                </p>
              </div>
            </Row>
            <Divider/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}} id={LINK_SHOW_DATA}>{help.GAME_REPORT_17[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_SHOWDATA_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.GAME_REPORT_17_1_1[lang]}​</p>
              </div>
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17[lang])}`}/>
              </div>
            </Row>
            <br/>

            <Divider/>
            <p id={LINK_REPORT_LEVEL}>{HelpComponent.parseText(help.S_GAME_REPORT_17_1)}​
            </p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_2)}​
            </p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_3)}​
            </p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_4)}​
            </p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_5)}​
            </p>

            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_6[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_6)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_7[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_7)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_8[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_8)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_9[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_9)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_10[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_10)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_11[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_11)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_12[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_12)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_13[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_13)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_14[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_14)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_15[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_15)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_16[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_16)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_17[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_17_17)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_17_18[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]}​ </span>}
                dataSource={data_2}
                renderItem={(item: any) => {
                  return (<List.Item>{this.renderMainFieldsItem(item)}</List.Item>)
                }}
              />
            </Row>

            <br/>
            <p>{HelpComponent.parseText(help.GAME_REPORT_18)}​
            </p>
            <p>{HelpComponent.parseText(help.GAME_REPORT_19)}​
            </p>
            <Divider/>

            <Row>
              <div className={'overflow-img-wrapper'}>
                <p id={LINK_DOWNLOAD} style={{display:"inline"}}>{help.GAME_REPORT_20[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_20_1[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.GAME_REPORT_21_1[lang]}​</p>
              </div>
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_20[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.GAME_REPORT_21)}​
            </p>
            <p>{HelpComponent.parseText(help.S_GAME_REPORT_22)}​
            </p>
            <p>{HelpComponent.parseText(help.GAME_REPORT_23)}​
            </p>
            <Row>
              <List
                size="small"
                dataSource={data_15}
                renderItem={(item: any) => (<List.Item>{HelpComponent.parseText(item)}</List.Item>)}
              />
            </Row>
            <Divider/>

            <p id={LINK_DAY_REPORT}>{HelpComponent.parseText(help.S_DAY_REPORT_1)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_1[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{help.DAY_REPORT_2[lang]}​
            </p>
            <p>{help.DAY_REPORT_2_1_1[lang]}​
            </p>
            <p>{HelpComponent.parseText(help.S_DAY_REPORT_2_1_2)}​
            </p>
            <p>{help.DAY_REPORT_2_1[lang]}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_2_1[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'} id={LINK_CHART}>
                <img src={`${HelpComponent.getImg(help.IMG_DAYE_REPORT_3[lang])}`}
                     style={{float: 'left', marginRight: '10px'}}/>
                <p>{HelpComponent.parseText(help.S_DAY_REPORT_3)}​
                </p>
              </div>
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_DAYE_REPORT_4[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{help.DAY_REPORT_4[lang]}​
            </p>
            <p>{help.DAY_REPORT_5[lang]}​
            </p>
            <p>{HelpComponent.parseText(help.S_DAY_REPORT_4)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_DAYE_REPORT_5[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{help.DAY_REPORT_6[lang]}​
            </p>
            <Row>
              <List
                size="small"
                dataSource={data_16}
                renderItem={(item: any) => {
                  return (<List.Item>{this.renderMainFieldsItem(item)}</List.Item>)
                }}
              />
            </Row>
            <br/>
            <p>{help.DAY_REPORT_7[lang]}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_7[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{help.DAY_REPORT_7_1[lang]}​
            </p>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{help.DAY_REPORT_7_2[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_7_2[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.DAY_REPORT_7_3[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_7_3[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.DAY_REPORT_7_4[lang]}​</p>
              </div>
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_7_5[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{HelpComponent.parseText(help.S_DAY_REPORT_7_5)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_7_4[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{help.DAY_REPORT_7_6[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_DAY_REPORT_7_6[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.DAY_REPORT_7_7[lang]}​</p>
              </div>
            </Row>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{help.DAY_REPORT_8[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_20_1[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
              </div>
            </Row>

            <Row type="flex" justify="space-around" align="middle">
              <h2 id={LINK_USER_REPORTS} style={{color: '#094979'}}>{help.USER_REPORT[lang]}</h2>
            </Row>
            <p>{HelpComponent.parseText(help.S_USER_REPORT_1)}​
            </p>
            <p id={LINK_ALL_USERS}>{HelpComponent.parseText(help.S_USER_REPORT_2)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_USER_REPORT_2[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}} id={LINK_SHOW_DATA}>{help.S_USER_REPORT_3[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_REFRESH_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
              </div>
            </Row>
            <p>{help.USER_REPORT_4[lang]}
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_USER_REPORT_3[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]} </span>}
                dataSource={data_3}
                renderItem={(item: any) => (<List.Item>{this.renderMainFieldsItem(item)}</List.Item>)}
              />
            </Row>
            <br/>
            <p>{help.USER_REPORT_6[lang]}
            </p>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{help.USER_REPORT_7[lang]}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_REFRESH_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.USER_REPORT_7_1[lang]}​</p>
              </div>
            </Row>
            <Divider/>

            <p id={LINK_ONLINE_USERS}>{HelpComponent.parseText(help.S_USER_REPORT_8)}​
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_USER_REPORT_8[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]}​ </span>}
                dataSource={data_4}
                renderItem={(item: any) => (<List.Item>{HelpComponent.parseText(item)}</List.Item>)}
              />
            </Row>
            <br/>
            <p>{help.USER_REPORT_9[lang]}</p>
            <p>{HelpComponent.parseText(help.S_USER_REPORT_10)}​
            </p>
            <p>{help.USER_REPORT_11[lang]}</p>

            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_USER_REPORT_11[lang])}`}/>
              </div>
            </Row>
            <br/>

            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{HelpComponent.parseText(help.S_USER_REPORT_12)}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_SEARCH_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.USER_REPORT_12_1[lang]}
                </p>
                <img src={`${HelpComponent.getImg(help.IMG_RESET_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.USER_REPORT_12_2[lang]}
                </p>
              </div>
            </Row>
            <Divider/>

            <p id={LINK_HISTORY}>​{HelpComponent.parseText(help.S_PLAYER_HISTORY_1)}​
            </p>
            <p>{help.PLAYER_HISTORY_2[lang]}
            </p>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_PLAYER_HISTORY_2[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{help.PLAYER_HISTORY_3[lang]}
            </p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_PLAYER_HISTORY_3_1[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{help.PLAYER_HISTORY_3_1[lang]}​
            </p>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{HelpComponent.parseText(help.S_PLAYER_HISTORY_3_2)}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_OK_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
              </div>
            </Row>
            <p>{HelpComponent.parseText(help.S_PLAYER_HISTORY_3_3)}​
            </p>
            <p>{HelpComponent.parseText(help.S_PLAYER_HISTORY_3_4)}​
            </p>
            <Row>
              <List
                size="small"
                header={<span style={{fontWeight: 'bold'}}>{help.PLAYER_HISTORY_3_4_1[lang]}​ </span>}
                dataSource={data_8}
                renderItem={(item: any) => (<List.Item>{item}</List.Item>)}
              />
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{HelpComponent.parseText(help.PLAYER_HISTORY_3_5)}​</p>
                <img src={`${HelpComponent.getImg(help.IMG_REFRESH_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{HelpComponent.parseText(help.PLAYER_HISTORY_3_5_1)}​</p>
              </div>
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_PLAYER_HISTORY_3[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]}</span>}
                dataSource={data_5}
                renderItem={(item: any) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
              <Divider style={{margin:0, marginBottom: '4px'}}/>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Icon
                theme="twoTone"
                twoToneColor="#52c41a"
                type={'check-circle'}
              /> <span style={{lineHeight: 1.5}}>{help.LIST_5_9_2[lang]}</span>
              <Divider style={{margin:0, marginTop: '4px', marginBottom: '4px'}}/>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Icon
                type={'loading'}
              /> <span  style={{lineHeight: 1.5}}>{help.LIST_5_9_3[lang]}</span>
              <Divider style={{margin:0, marginTop: '4px'}}/>
              <List
                size="small"
                dataSource={data_5_1}
                renderItem={(item: any) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
            </Row>
            <Divider/>

            <p id={LINK_HISTORY_DETAILS}>​{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_1)}​</p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_1[lang])}`}/>
              </div>
            </Row>
            <br/>
            <p>{help.HISTORY_ACTION_DETAILS_2[lang]}</p>
            <p>{help.HISTORY_ACTION_DETAILS_3[lang]}</p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_3[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]}​ </span>}
                dataSource={data_6}
                renderItem={(item: any) => {
                  return (<List.Item>{this.renderMainFieldsItem(item)}</List.Item>)
                }}
              />
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_3_1[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <List
                size="small"
                header={<span style={{
                  color: '#094979',
                  fontWeight: 'bold'
                }}>{HelpComponent.parseText(help.S_LIST_7_TITLE)}​ </span>}
                dataSource={data_7}
                renderItem={(item: any) => {
                  return (<List.Item>{this.renderMainFieldsItem(item)}</List.Item>)
                }}
              />
            </Row>
            <br/>
            <p>{help.HISTORY_ACTION_DETAILS_4[lang]}</p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_4[lang])}`}/>
              </div>
            </Row>

            <Divider/>
            <p id={LINK_HISTORY_DETAILS_INFO}>{HelpComponent.parseText(help.HISTORY_ACTION_DETAILS_4_1)}</p>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_5[lang])}`}
                     style={{float: 'left', marginRight: '10px'}}/>
                <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_5)}​
                </p>
              </div>
            </Row>
            <br/>

            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_5_1[lang])}`}/>
              </div>
            </Row>

            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_6[lang])}`}
                     style={{float: 'left', marginRight: '10px'}}/>
                <p>{help.HISTORY_ACTION_DETAILS_6_1[lang]}​
                </p>
              </div>
            </Row>

            <br/>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_6)}</p>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_7)}</p>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_8)}</p>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_9)}</p>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_9_1)}</p>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_10)}</p>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_10_1)}</p>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_10_2)}</p>

            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_10[lang])}`}/>
              </div>
            </Row>

            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_11[lang])}`}
                     style={{float: 'left', marginRight: '10px'}}/>
                <p>{help.HISTORY_ACTION_DETAILS_11[lang]}​
                </p>
              </div>
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_11_1[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_12[lang])}`}
                     style={{float: 'left', marginRight: '10px'}}/>
                <p>{help.HISTORY_ACTION_DETAILS_12[lang]}​
                </p>
              </div>
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_13[lang])}`}
                     style={{float: 'left', marginRight: '10px'}}/>
                <p>{help.HISTORY_ACTION_DETAILS_13[lang]}​
                </p>
              </div>
            </Row>

            <Divider/>
            <Row>
              <div id={LINK_HISTORY_DETAILS_PRINT} className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{help.HISTORY_ACTION_DETAILS_14[lang]}</p>
                <img src={`${HelpComponent.getImg(help.IMG_PRINT_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.HISTORY_ACTION_DETAILS_15[lang]}</p>
              </div>
            </Row>
            <p>{HelpComponent.parseText(help.S_HISTORY_ACTION_DETAILS_16)}</p>
            <p>{help.HISTORY_ACTION_DETAILS_17[lang]}​</p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_HISTORY_ACTION_DETAILS_17[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{help.HISTORY_ACTION_DETAILS_18[lang]}</p>
                <img src={`${HelpComponent.getImg(help.IMG_SAVE_BTN2[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.HISTORY_ACTION_DETAILS_19[lang]}</p>
              </div>
            </Row>

            <Divider/>
            <p id={LINK_BET_BOOK}>{HelpComponent.parseText(help.S_BET_BOOK_TITLE)}</p>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_BET_BOOK_1[lang])}`}/>
              </div>
            </Row>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]}​ </span>}
                dataSource={data_10_1}
                renderItem={(item: any, i:number) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_SELECT_CURRENCY_ROOM[lang])}`}/>
              </div>
            </Row>
            <br/>
            <Row>
              <List
                size="small"
                dataSource={data_10_2}
                renderItem={(item: any, i:number) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_13[lang])}`}/>
              </div>
            </Row>
            <Row>
              <List
                size="small"
                dataSource={data_10_3}
                renderItem={(item: any, i:number) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
            </Row>
            <Row>
              <div className={'overflow-img-wrapper'}>
                <p style={{display:"inline"}}>{help.BET_BOOK_4_1[lang]}</p>
                <img src={`${HelpComponent.getImg(help.IMG_SHOWDATA_BTN[lang])}`}
                     style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                <p style={{display:"inline"}}>{help.BET_BOOK_4_2[lang]}</p>
              </div>
            </Row>
            <br/>
            <Row type="flex" justify="space-around" align="middle">
              <div className={'overflow-img-wrapper'}>
                <img src={`${HelpComponent.getImg(help.IMG_BET_BOOK_5[lang])}`}/>
              </div>
            </Row>
            <Row>
              <List
                size="small"
                header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]}</span>}
                dataSource={data_11}
                renderItem={(item: any) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
              <Divider style={{margin:0, marginBottom: '4px'}}/>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Icon
                theme="twoTone"
                twoToneColor="#52c41a"
                type={'check-circle'}
              /> <span style={{lineHeight: 1.5}}>{help.LIST_11_4_2[lang]}</span>
              <Divider style={{margin:0, marginTop: '4px', marginBottom: '4px'}}/>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <Icon
                type={'loading'}
              /> <span  style={{lineHeight: 1.5}}>{help.LIST_11_4_3[lang]}</span>
              <Divider style={{margin:0, marginTop: '4px'}}/>
              <List
                size="small"
                dataSource={data_11_1}
                renderItem={(item: any) => {
                  return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                }}
              />
            </Row>

            {
              HelpComponent.isAllowForRole([roles.ADMIN.name,roles.DISTRIBUTOR.name]) && <div>
                <Divider/>
                <Row type="flex" justify="space-around" align="middle">
                  <h2 id={LINK_SETTINGS} style={{color: '#094979'}}>{help.SETTINGS_HEADER[lang]}</h2>
                </Row>
                <p>{HelpComponent.parseText(help.S_SETTINGS_1)}</p>
                <p>{HelpComponent.parseText(help.S_SETTINGS_2)}</p>
                <p id={LINK_GAME_VERSIONS}>{HelpComponent.parseText(help.S_GAME_VERSION_1)}</p>
                <p>{HelpComponent.parseText(help.S_GAME_VERSION_2)}</p>

                <Row type="flex" justify="space-around" align="middle">
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_VERSION_2[lang])}`}/>
                  </div>
                </Row>

                <Row>
                  <List
                    size="small"
                    header={<span style={{color: '#094979', fontWeight: 'bold'}}>{help.MAIN_FIELDS[lang]}​ </span>}
                    dataSource={data_12}
                    renderItem={(item: any, i:number) => {
                      return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                    }}
                  />
                </Row>
              </div>
            }
            {
              HelpComponent.isAllowForRole(roles.ADMIN.name) && <div>
                <br/>
                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_VERSION_3[lang])}`}
                         style={{float: 'left', marginRight: '10px'}}/>
                    <p>{help.S_GAME_VERSION_3[lang]}​
                    </p>
                  </div>
                </Row>
                <Row type="flex" justify="space-around" align="middle">
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_VERSION_4[lang])}`}/>
                  </div>
                </Row>
                <br/>
                <Row>
                  <List
                    size="small"
                    dataSource={data_13}
                    renderItem={(item: any, i:number) => {
                      return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                    }}
                  />
                </Row>
                <br/>
                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <p style={{display:"inline"}}>{help.GAME_VERSION_4[lang]}</p>
                    <img src={`${HelpComponent.getImg(help.IMG_OK_BTN[lang])}`}
                         style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                    <p style={{display:"inline"}}>{help.GAME_VERSION_4_1[lang]}</p>
                    <img src={`${HelpComponent.getImg(help.IMG_CANCEL_BTN[lang])}`}
                         style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                    <p style={{display:"inline"}}>{help.GAME_VERSION_4_2[lang]}</p>
                  </div>
                </Row>
                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_VERSION_5[lang])}`}
                         style={{float: 'left', marginRight: '10px'}}/>
                    <p>{help.GAME_VERSION_5[lang]}​
                    </p>
                  </div>
                </Row>
                <Row type="flex" justify="space-around" align="middle">
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_VERSION_5_1[lang])}`}/>
                  </div>
                </Row>
                <br/>
                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <p style={{display:"inline"}}>{help.GAME_VERSION_6[lang]}</p>
                    <img src={`${HelpComponent.getImg(help.IMG_SAVE_BTN[lang])}`}
                         style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                    <p style={{display:"inline"}}>{help.GAME_VERSION_6_1[lang]}</p>
                    <img src={`${HelpComponent.getImg(help.IMG_CANCEL2_BTN[lang])}`}
                         style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                    <p style={{display:"inline"}}>{help.GAME_VERSION_6_2[lang]}</p>
                  </div>
                </Row>
                <br/>
                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_VERSION_6[lang])}`}
                         style={{float: 'left', marginRight: '10px'}}/>
                    <p>{help.GAME_VERSION_7[lang]}​
                    </p>
                  </div>
                </Row>
                <br/>
                <p>{HelpComponent.parseText(help.GAME_VERSION_8)}</p>
                <Row type="flex" justify="space-around" align="middle">
              <pre>
                {help.CODE_GAME_VERSION_9[lang]}
              </pre>
                </Row>
                <p>{HelpComponent.parseText(help.S_GAME_VERSION_10)}</p>
                <p>{HelpComponent.parseText(help.S_GAME_VERSION_11)}</p>
                <p>{HelpComponent.parseText(help.GAME_VERSION_12)}</p>

                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_VERSION_13[lang])}`}
                         style={{float: 'left', marginRight: '10px'}}/>
                    <p>{HelpComponent.parseText(help.GAME_VERSION_13)}​
                    </p>
                  </div>
                </Row>
              </div>
            }
            <div>
                <Divider/>
                <p id={LINK_SETTINGS_CURRENCY}>{HelpComponent.parseText(help.S_CURRENCY_SETTINGS_1)}​
                </p>
                <p>{HelpComponent.parseText(help.S_CURRENCY_SETTINGS_2)}​
                </p>
                <Row type="flex" justify="space-around" align="middle">
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_CURRENCY_SETTINGS_2[lang])}`}/>
                  </div>
                </Row>
                <br/>
                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <p style={{display:"inline"}}>{HelpComponent.parseText(help.S_CURRENCY_SETTINGS_3)}​</p>
                    <img src={`${HelpComponent.getImg(help.IMG_OK_BTN[lang])}`}
                         style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                  </div>
                </Row>
                <p>{HelpComponent.parseText(help.S_CURRENCY_SETTINGS_3_1)}​
                </p>
                <p>{HelpComponent.parseText(help.S_CURRENCY_SETTINGS_3_2)}​
                </p>
                <br/>
                <Row>
                  <List
                    size="small"
                    dataSource={data_14}
                    renderItem={(item: any, i:number) => {
                      return (<List.Item>{HelpComponent.parseText(item)}</List.Item>)
                    }}
                  />
                </Row>
                <br/>
                <Row>
                  <div className={'overflow-img-wrapper'}>
                    <p id={LINK_DOWNLOAD} style={{display:"inline"}}>{help.CURRENCY_SETTINGS_8[lang]}​</p>
                    <img src={`${HelpComponent.getImg(help.IMG_GAME_REPORT_20_1[lang])}`}
                         style={{marginLeft: '10px', marginRight: '10px', display:"inline"}}/>
                    <p style={{display:"inline"}}>{help.CURRENCY_SETTINGS_8_1[lang]}​</p>
                  </div>
                </Row>
                <br/>
                <Row type="flex" justify="space-around" align="middle">
                  <div className={'overflow-img-wrapper'}>
                    <img src={`${HelpComponent.getImg(help.IMG_CURRENCY_SETTINGS_8[lang])}`}/>
                  </div>
                </Row>
                <br/>
                <p>{HelpComponent.parseText(help.S_CURRENCY_SETTINGS_9)}​
                </p>
                <br/>
              </div>
            <Divider/>
            <p>{help.FOOTER_1[lang]}
              <a href={"mailto:" + help.FOOTER_1_1[lang]}> {help.FOOTER_1_1[lang]}</a>
            </p>
            {help.FOOTER_2 && <p>{help.FOOTER_2[lang]}
              <a href={"https://" + help.FOOTER_2_1[lang]} target="_blank"> {help.FOOTER_2_1[lang]}</a>
            </p>}
          </Col>
          <Col xs={0} sm={0} md={4} lg={4} xl={2}>
            <Row>
              <Col offset={1} span={23}>
                {this.renderAnchor(anchor_props)}
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}
