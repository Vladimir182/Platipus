import * as React from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import api from 'app/const/api';
import timezones from "app/const/timezones";
import {Row, Divider} from 'antd';
import req from "app/actions/ajaxRequest";
import {ajaxRequestTypes} from "app/actionTypes";
import {DataTable} from "app/components/Table";
import {NoFound} from "app/components/NoFound";
import localization from "app/localization";
import './style.css';
import {
  addZoneOffsetToISOString,
  concatParamsToURL,
  formatNumberData,
  formatTableData,
  getParameterByName,
  insertParam,
  isDeviceMobileAndTablet,
  isDeviceIos,
  isHidden,
  isoStringToUTCDate, /*isPageError,*/
  isPageGameHistory,
  isPageRoundDetails,
  onAllimagesLoaded,
  shortFormatNumber,
  sortTableOrder,
  isVideoPoker,
  isHoldem,
  isSlotWithCounter,
  roundValue,
  removeLoginSuffix,
  transformNetFromLeftToRight,
} from 'app/utils'
import {IPagination, ISort, ITable, resetTableData, tableAction} from "app/actions/table";
import {SpinComponent} from "app/components/SpinComponent";
import {InfoPanel} from "app/components/InfoPanel";
import {FORMATS} from "app/const/moneyFormatter";
import BonusDetails from "app/containers/HistoryDetails/BonusDetails";
import {createCardsContent} from "app/containers/HistoryDetails/CardsLayout";
import {getVideoPokerColumns} from "app/containers/HistoryDetails/VideoPokerColumns";
import {getHoldemColumns} from "app/containers/HistoryDetails/HoldemColumns";
import {default as roles, getRoleById} from "app/const/roles";
import {LINK_HISTORY_DETAILS} from "app/components/HelpComponent/anchorId";
import {previousPage, selectTimeZone} from "app/actions/filter";
import ALL_GAMES from "app/const/allGames";
import GameHelper from "app/containers/HistoryDetails/GameHelper";

let lang = localStorage.getItem('lang') || 'en';
export namespace HistoryDetails {
  export interface Props extends RouteComponentProps<void> {
    getReport: any;
    tableChange: any;
    getChangedReport: any;
    sortAndPaginate: any;
    resetTableData: any;
    savePrevPageForHelp: (page: string) => void;
    savePrevPage: (page: string) => void;
    selectTimeZone: (val: string) => void;

    sort: ISort;
    report: any;
    metadata: any;
    reportTotal: any;
    loadingReport: boolean;
    pagination: IPagination;
    path: string;
    userId: string;
    appliedColumnFilter: any;
    prevPage: any;
    timeZone: string;
    error: any;
  }

  export interface State {
    isPrint: boolean;
  }
}

@connect((state): any => ({
    sort: state.table.sort,
    pagination: state.table.pagination,
    report: state.table.report,
    reportTotal: state.table.reportTotal,
    metadata: state.table.metadata,
    loadingReport: state.table.loadingReport,
    path: state.router.location.pathname,
    prevPage: state.filter.previousPage,
    appliedColumnFilter: state.table.filter,
    timeZone: state.filter.timeZone,
    error: state.request.error
  }),
  (dispatch: any, ownProps: any): any => ({
    getReport: (that: any, needResetPagination?: boolean) => {
      that.resetPagination(needResetPagination);
      let platform = getParameterByName('platform', that.props.location.search);
      let page = parseInt(getParameterByName('page', that.props.location.search));
      let size = parseInt(getParameterByName('size', that.props.location.search));
      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let params: any = isPageGameHistory() ?
        {
          betId: getParameterByName('roundId', that.props.location.search),
          page: needResetPagination ? 1 : (page ? page : 1),
          limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
          hash: getParameterByName('hash', that.props.location.search)
        }
        : isPageRoundDetails() ?
        {
          playerId: getParameterByName('playerId', that.props.location.search),
          roundId: getParameterByName('roundId', that.props.location.search),
          roomId: getParameterByName('roomId', that.props.location.search)
        }
        :
        {
          userId: that.props.match.params.id,
          page: needResetPagination ? 1 : (page ? page : 1),
          limit: size && !isNaN(size) ? size : that.props.pagination.pageSize,
          betId: that.props.match.params.recordId,
          platform
        };
      let data = {
        url: concatParamsToURL(isPageGameHistory()? api.GET_ROUND_DETAIL : isPageRoundDetails() ? api.GET_ROUND_DETAILS : api.GET_HISTORY_DETAILS, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch, isPageGameHistory());
    },
    getChangedReport: (that: any, val: ITable) => {

      let types = ajaxRequestTypes.standartAsyncTypes(ajaxRequestTypes.REPORT);
      let platform = getParameterByName('platform', that.props.location.search);

      let params = isPageGameHistory()?
        {
          betId: getParameterByName('roundId', that.props.location.search),
          page: val.pagination.current,
          limit: val.pagination.pageSize,
          hash: getParameterByName('hash', that.props.location.search)
        }
        : isPageRoundDetails() ?
        {
          playerId: getParameterByName('playerId', that.props.location.search),
          roundId: getParameterByName('roundId', that.props.location.search),
          roomId: getParameterByName('roomId', that.props.location.search)
        }
        :
        {
          page: val.pagination.current,
          limit: val.pagination.pageSize,
          userId: that.props.match.params.id,
          platform,
          betId: that.props.match.params.recordId
        };
      let data = {
        url: concatParamsToURL(isPageGameHistory() ? api.GET_ROUND_DETAIL : isPageRoundDetails() ? api.GET_ROUND_DETAILS : api.GET_HISTORY_DETAILS, params),
        method: ajaxRequestTypes.METHODS.GET
      };
      req(types, data, that.props.history, dispatch, isPageGameHistory());
    },
    tableChange: (val: ITable, that: any) => {
      if (val.sort.sortDirection !== that.props.sortDirection && val.sort.sortKey !== that.props.sortKey || val.pagination.current !== that.props.current) {
        that.props.sortAndPaginate(val);
        that.props.getChangedReport(that, val);
      }
    },
    sortAndPaginate: (val: ITable) => {
      dispatch(tableAction(val));
    },
    resetTableData() {
      dispatch(resetTableData())
    },
    savePrevPageForHelp(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'help'}))
    },
    savePrevPage(page: string) {
      dispatch(previousPage({pageValue: page, pageType: 'historyList'}))
    },
    selectTimeZone: (val: string) => {
      dispatch(selectTimeZone(val))
    }
  })
)

class HistoryDetailsVO extends React.Component<HistoryDetails.Props, HistoryDetails.State> {

  private TIME_ZONE_COLUMN = 'Transaction ID (Round ID)';

  private ACCOUNT_TITLE = 'Account';

  constructor(props: HistoryDetails.Props, context?: any) {
    super(props, context);
    this.onTableChange = this.onTableChange.bind(this);
    this.resetPagination = this.resetPagination.bind(this);
    this.state = {
      isPrint: false
    }
  }

  componentDidMount() {
    this.props.getReport(this);
    if (isDeviceMobileAndTablet()) {
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    this.props.resetTableData();
    // if(!isPageError()){
    //   this.resetPagination(true);
    // }
  }

  componentDidUpdate() {
    if(this.state.isPrint){
      window.print();
    }
  }

  getSearchTimeZone() {
    return getParameterByName('timeZone', this.props.location.search)
      || getParameterByName('timezone', this.props.location.search);
  }

  hasSearchTimeZone() {
    let timeZone = this.getSearchTimeZone();
    return timeZone && typeof timeZone === 'string';
  }

  getSelectedTimeZone() {
    let timeZone = this.getSearchTimeZone();
    if (this.hasSearchTimeZone()) {
      timeZone = timeZone.trim();
      timeZone = `${['+', '-'].includes(timeZone.slice(0,1)) ? '' : '+'}${timeZone}`;
      if (timezones.includes(timeZone)) {
        return timeZone;
      } else {
        return '+00:00';
      }
    } else {
      return this.props.timeZone;
    }
  }

  getIdColumnName() {
    return this.hasSearchTimeZone() ? this.TIME_ZONE_COLUMN : (localization.ID_COLUMN as any)[lang];
  }

  resetPagination(needResetPagination?: boolean) {
    let page = parseInt(getParameterByName('page', this.props.location.search));
    let size = parseInt(getParameterByName('size', this.props.location.search));
    let tableConfig = {
      pagination: {
        current: needResetPagination ? 1 : page ? page : 1,
        pageSize: size && !isNaN(size) ? size : this.props.pagination.pageSize,
        total: this.props.pagination.total
      },
      sort: {
        sortKey: this.props.sort.sortKey,
        sortDirection: this.props.sort.sortDirection
      },
      filter: this.props.appliedColumnFilter
    };
    this.props.sortAndPaginate(tableConfig);
    if (!isPageRoundDetails()) insertParam([
      {
        key: 'page',
        value: needResetPagination ? 1 : page ? page : 1
      },
      {
        key: 'size',
        value: size && !isNaN(size) ? size : this.props.pagination.pageSize
      }
    ], this.props);
  }

  onTableChange(pagination: any, filter: any, sorter: any) {
    let sort = {
      sortKey: null,
      sortDirection: sortTableOrder(sorter.order) || this.props.sort.sortDirection
    };
    let current: number = (pagination.current == this.props.pagination.current
      || pagination.pageSize != this.props.pagination.pageSize) ? 1 : pagination.current;
    let params = {
      filter,
      sort,
      pagination: {...pagination, current}
    };
    if (!isPageRoundDetails()) insertParam([
      {
        key: 'page',
        value: current
      },
      {
        key: 'size',
        value: pagination.pageSize
      }
    ], this.props);
    this.props.tableChange(params, this);
  }

  isZeroLineWithNoWin = (l: {
    Line: number;
    Position: number[];
    countSymbol: number;
    symbol: number;
    win: number;
  }) => l.Line === 0 && l.win === 0;

  removeZeroLineWithNoWin = (winLines: {
    Line: number;
    Position: number[];
    countSymbol: number;
    symbol: number;
    win: number;
  }[]) => {
    return winLines.filter(l => !this.isZeroLineWithNoWin(l));
  };

  expandedRowRender = (record: any) => {

    let row = record.data ? record.data : record;
    const gameId = record && record.gameId ? +record.gameId : -1; //: 541
    let gameName = this.getGameServerNameById(gameId);
    const hasBlocks = this.isGameWithBlocks(gameId);
    const hasLineBlock = this.isLineBlock(gameId);
    const hasCombination = this.isCombination(gameId);

    let winLines: any[] = [];

    if (hasBlocks) {
      if (row.winpos2) {
        winLines = [ ...row.winpos2 ]
      }
    } else if (hasLineBlock || hasCombination) {
      winLines = [
        ...(row.winpos2 && row.winpos2.length > 0 ?
            row.winpos2.map((x: any, i: number)=>(x['line']= i > 10 ? i-10 : i, x)).filter((x:any)=>x['position']) : [])
      ];
    } else {
      winLines = [...row.winscatter, ...row.winpos];
      if (row.pseudo) {
        winLines = [...winLines, ...row.pseudo]
      }
      winLines = this.removeZeroLineWithNoWin(winLines);
      if (['frozenmirror'].indexOf(gameName) > -1) {
        winLines = winLines.map((l: any) => {
          return l.symbol && l.symbol === 1 && l.Line === 0 ? {...l, wheels: row.wheels} : l;
        });
      }

      if (['waysofthegauls'].indexOf(gameName) > -1) {
        let wheelHeight = row.wheelHeight;
        winLines = winLines.map(x => ({ ...x, wheelHeight }));
      }
    }

    return (<div className={'winline-wrapper'}
                 dangerouslySetInnerHTML={{
                      __html: hasBlocks || hasLineBlock ?
                        this.drawWinBlocks(
                          winLines,
                          parseInt(this.getGameRowCountById(record.gameId)),
                          hasBlocks
                          ) :
                        hasCombination ?
                          this.drawWinCombination(
                            winLines,
                            parseInt(this.getGameRowCountById(record.gameId))
                            ) :
                        this.drawWinLines(
                          winLines,
                          +record.gameId === 544 ? 3 : parseInt(this.getGameRowCountById(record.gameId)),
                          this.isGameWithWays(record.gameId),
                          gameId
                        )
                  }}/>)
  };

  isGameWithWays(id: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === id) {
        return !!item.isWays;
      }
    }
  }

  isGameWithBlocks(id: number): any {
    const game = ALL_GAMES.filter(item => +item.id === +id);
    return game.length && game[0].isBlocks === true ? true : false;
  }

  isLineBlock(id: number): any {
    const game = ALL_GAMES.filter(item => +item.id === +id);
    return game.length && game[0].isLineBlock === true ? true : false;
  }

  isCombination(id: number): any {
    const game = ALL_GAMES.filter(item => +item.id === +id);
    return game.length && game[0].isCombination === true ? true : false;
  }

  hasWheelsValuesMultiplier(id: number): any {
    const game = ALL_GAMES.filter(item => +item.id === +id);
    return game.length && game[0].hasWheelsValuesMultiplier === true ? true : false;
  }

  hasWheelsValuesCoin(id: number): any {
    const game = ALL_GAMES.filter(item => +item.id === +id);
    return game.length && game[0].hasWheelsValuesCoin === true ? true : false;
  }

  hasMultiplierFeature(id: number): any {
    const game = ALL_GAMES.filter(item => +item.id === +id);
    return game.length && game[0].multiplierFeature === true ? true : false;
  }

  drawWinBlocks(winPosition: {
    countSymbol: number;
    position: number[][];
    symbol: number;
    win: number;
    win_type: number;
    line?: number;
  }[], rowCount: any, isBlock: boolean) :string {
    const selectedLineColor: string = "#40a9ff";
    const lineColor: string = "#FFFFFF";
    const divX: number = 10;
    const cellSize: number = 9;
    let currency = this.props.metadata.currency;

    let maxWinSymbolCount: number = 0;
    for (let i: number = 0; i < winPosition.length; i++) {
      let winPosVO = winPosition[i];
      let winStr = `${winPosVO.win}`;
      maxWinSymbolCount = Math.max(maxWinSymbolCount, winStr.length);
    }
    let maxWinWidth: number = maxWinSymbolCount * 0.67;

    let result: string = "";
    result += `<div class='ant-row-flex ant-row-flex-space-around ant-row-flex-middle'>
                <h4>${'Winning paylines'}</h4>
              </div>`;

    for (let i: number = 0; i < winPosition.length; i++) {
      let winPosVO: any = winPosition[i];
      let winPos: number[][] = winPosVO.position;
      let width: number = winPos.length * cellSize + divX * 2;
      let height: number = rowCount * cellSize;
      let win = formatNumberData(winPosVO.win);
      let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;

      result += "<div class='details_line_win'>";
      result += `${isBlock ? 'Block' : 'Line'} ${isBlock ? i+1 : winPosVO['line']}`;
      if ((winPosVO.Line||winPosVO.line) < 10) {
        result += " &nbsp;";
      }

      result += "<svg width='" + width + "' height='" + height + "' xmlns='http://www.w3.org/2000/svg'>\n";
      result += "<g>\n";

      for (let columnId: number = 0; columnId < winPos.length; columnId++) {
        for (let rowId: number = 0; rowId < rowCount; rowId++) {
          const curColumnSelectedRowIds = winPos[columnId];
          let x: number = cellSize * columnId + divX;
          let y: number = cellSize * rowId;
          let cellColor: string = curColumnSelectedRowIds.indexOf(rowId) > -1 ? selectedLineColor : lineColor;
          result += "<rect x='" + x + "' y='" + y + "' height='" + cellSize + "' width='" + cellSize + "' stroke-width='1.5' stroke='#000000' fill='" + cellColor + "'/>";
          result += "\n";
        }
      }

      maxWinWidth = winStr.length * 0.5;

      result += "</g>\n";
      result += "</svg>\n";
      result += "<div style='width: " + maxWinWidth + "rem'>" + winStr + "</div>";
      result += "</div>";
    }

    return result;
  }

  drawWinCombination(winPosition: {
    countSymbol: number;
    position: number[][];
    symbol: number;
    win: number;
    win_type: number;
    line?: number;
  }[], rowCount: any) :string {
    const selectedLineColor: string = "#40a9ff";
    const lineColor: string = "#FFFFFF";
    const divX: number = 10;
    const cellSize: number = 9;
    let currency = this.props.metadata.currency;

    let maxWinSymbolCount: number = 0;
    for (let i: number = 0; i < winPosition.length; i++) {
      let winPosVO = winPosition[i];
      let winStr = `${winPosVO.win}`;
      maxWinSymbolCount = Math.max(maxWinSymbolCount, winStr.length);
    }
    let maxWinWidth: number = maxWinSymbolCount * 0.67;

    let result: string = "";
    result += `<div class='ant-row-flex ant-row-flex-space-around ant-row-flex-middle'>
                <h4>${'Winning paylines'}</h4>
              </div>`;

    for (let i: number = 0; i < winPosition.length; i++) {
      let winPosVO: any = winPosition[i];
      let winPos: number[][] = winPosVO.position;
      let width: number = winPos.length * cellSize + divX * 2;
      let height: number = rowCount * cellSize;
      let win = formatNumberData(winPosVO.win);
      let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;

      result += "<div class='details_line_win'>";
      result += `Combination ${i+1}`;
      if ((winPosVO.Line||winPosVO.line) < 10) {
        result += " &nbsp;";
      }

      result += "<svg width='" + width + "' height='" + height + "' xmlns='http://www.w3.org/2000/svg'>\n";
      result += "<g>\n";

      for (let columnId: number = 0; columnId < winPos.length; columnId++) {
        for (let rowId: number = 0; rowId < rowCount; rowId++) {
          const curColumnSelectedRowIds = winPos[columnId];
          let x: number = cellSize * columnId + divX;
          let y: number = cellSize * rowId;
          let cellColor: string = curColumnSelectedRowIds.indexOf(rowId) > -1 ? selectedLineColor : lineColor;
          result += "<rect x='" + x + "' y='" + y + "' height='" + cellSize + "' width='" + cellSize + "' stroke-width='1.5' stroke='#000000' fill='" + cellColor + "'/>";
          result += "\n";
        }
      }

      maxWinWidth = winStr.length * 0.5;

      result += "</g>\n";
      result += "</svg>\n";
      result += "<div style='width: " + maxWinWidth + "rem'>" + winStr + "</div>";
      result += "</div>";
    }

    return result;
  }

  drawWinLines(winPosition: any[], rowCount: number, isWays: boolean, gameId: number): string {
    let gameName = this.getGameServerNameById(gameId);

    const selectedLineColor: string = "#40a9ff";
    const lineColor: string = "#FFFFFF";
    const divX: number = 10;
    const cellSize: number = 9;
    let currency = this.props.metadata.currency;

    let isOffbeatWheels = [541, 574].indexOf(gameId) > -1;

    let maxWinSymbolCount: number = 0;
    for (let i: number = 0; i < winPosition.length; i++) {
      let winPosVO: any = winPosition[i];
      let winStr = winPosVO.win;
      maxWinSymbolCount = Math.max(maxWinSymbolCount, winStr.length);
    }
    let maxWinWidth: number = maxWinSymbolCount * 0.67;

    let result: string = "";
    result += `<div class='ant-row-flex ant-row-flex-space-around ant-row-flex-middle'>
                <h4>${'Winning paylines'}</h4>
              </div>`;
    for (let i: number = 0; i < winPosition.length; i++) {
      let winPosVO: any = winPosition[i];
      if (['extragems'].indexOf(gameName) > -1) {
        const position = winPosVO.Position;
        let newPosition = [];
        for (let i = 0; i < 6; i++) {
          newPosition[i] = position[i] ? position[i] : 0;
          if (newPosition[i] > 0 && newPosition[i] < 4) { newPosition[i] = newPosition[i] + 1; }
          else if (newPosition[i] === 4) { newPosition[i] = 1 };
        }
        winPosVO.Position = newPosition;
      }
      let winPos: Array<number> = winPosVO.Position;
      let width: number = winPos.length * cellSize + divX * 2;
      let height: number = rowCount * cellSize;
      let win = formatNumberData(winPosVO.win);
      let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;

      let wheels = winPosVO && winPosVO.wheels;
      let hasWheels = ['frozenmirror'].indexOf(gameName) > -1 && wheels;
      let wheelsTransformed: number[][] = [];
      if (hasWheels) {
        wheelsTransformed = [
          [wheels[0],  wheels[1],  wheels[2]  ],
          [wheels[3],  wheels[4],  wheels[5]  ],
          [wheels[6],  wheels[7],  wheels[8]  ],
          [wheels[9],  wheels[10], wheels[11] ],
          [wheels[12], wheels[13], wheels[14] ]
        ]
      };

      result += "<div class='details_line_win'>";
      result += (isWays ? localization.WAY_HISTORY[lang] : localization.LINE_HISTORY[lang]) + (isWays ? '' : " " + winPosVO.Line);
      if (winPosVO.Line < 10) {
        result += " &nbsp;";
      }

      if (['waysofthegauls'].indexOf(gameName) > -1) { width = 5 * cellSize + divX * 2 }

      result += "<svg width='" + width + "' height='" + height + "' xmlns='http://www.w3.org/2000/svg'>\n";
      result += "<g>\n";

      if (['waysofthegauls'].indexOf(gameName) > -1) {

        const position = winPosVO.Position;
        const wheelHeight = winPosVO.wheelHeight;

        result += `
          <rect x="19" y="0" height="${cellSize}" width="${cellSize}" stroke-width="1.5" stroke="#000000" fill="${position[1] === 7 ? selectedLineColor : lineColor }"></rect>
          <rect x="28" y="0" height="${cellSize}" width="${cellSize}" stroke-width="1.5" stroke="#000000" fill="${position[2] === 7 ? selectedLineColor : lineColor }"></rect>
          <rect x="37" y="0" height="${cellSize}" width="${cellSize}" stroke-width="1.5" stroke="#000000" fill="${position[3] === 7 ? selectedLineColor : lineColor }"></rect>`;

        for (let columnId = 0; columnId < wheelHeight.length; columnId++) {
          let x = (columnId*cellSize) + divX;
          const curPos = position[columnId];
          for (let i = 0; i < wheelHeight[columnId]; i++) {
            const curHeight = (height-cellSize)/wheelHeight[columnId];
            let y = cellSize + curHeight*i;

            const curColor = curPos === i+1 ? selectedLineColor : lineColor;
            result += `<rect x="${x}" y="${y}" height="${curHeight}" width="${cellSize}" stroke-width="1.5" stroke="#000000" fill="${curColor}"></rect>`;
          }
        }

      } else {

        for (let columnId: number = 0; columnId < winPos.length; columnId++) {
          for (let rowId: number = 0; rowId < rowCount; rowId++) {
            if (['extragems'].indexOf(gameName) > -1 && (rowId === 0 && (columnId === 0 || columnId === 5))) continue;
            if (['ninegems'].indexOf(gameName) > -1 && (rowId === 0 || rowId === 4)) continue;
            if (['ninedragonkings'].indexOf(gameName) > -1 && (rowId === 0 || rowId === 2)) continue;
            let selectedRow: number = winPos[columnId] - 1;
            let x: number = cellSize * columnId + divX;
            let y: number = cellSize * rowId;
            let cellColor: string = rowId == selectedRow ? selectedLineColor : lineColor;


            if (hasWheels) {
              cellColor = wheelsTransformed[columnId][rowId] === 1 ? selectedLineColor : lineColor;
            }

            if (isOffbeatWheels) {
              if ([ 0, 4 ].indexOf(columnId) > -1 && [ 0,1,2,3,4 ].indexOf(rowId) > -1) y = y + 9;
              if ([ 1, 3 ].indexOf(columnId) > -1 && [ 0,1,2,3,4 ].indexOf(rowId) > -1) y = y + 4.5;
              if (([ 0, 4 ].indexOf(columnId) > -1 && [ 3, 4 ].indexOf(rowId) > -1) || ([ 1, 3 ].indexOf(columnId) > -1 && [ 4 ].indexOf(rowId) > -1)) {
                result += "<rect opacity=0 x='" + x + "' y='" + y + "' height='" + cellSize + "' width='" + cellSize + "' stroke-width='1.5' stroke='#000000' fill='" + cellColor + "'/>";
              } else {
                result += "<rect x='" + x + "' y='" + y + "' height='" + cellSize + "' width='" + cellSize + "' stroke-width='1.5' stroke='#000000' fill='" + cellColor + "'/>";
              }
            }
            else {
              result += "<rect x='" + x + "' y='" + y + "' height='" + cellSize + "' width='" + cellSize + "' stroke-width='1.5' stroke='#000000' fill='" + cellColor + "'/>";
            }
            result += "\n";
          }
        }

      }

      result += "</g>\n";
      result += "</svg>\n";
      result += "<div style='width: " + maxWinWidth + "rem'>" + winStr + "</div>";
      result += "</div>";
    }

    return result;
  }

  getGameServerNameById(id: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === id) {
        return item.serverName;
      }
    }
  }

  getGameTotalLinesById(id: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === id) {
        return item.lines;
      }
    }
  }

  getGameReelCountById(id: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === id) {
        return item.reelCount;
      }
    }
  }

  getGameRowCountById(id: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === id) {
        return item.rowCount;
      }
    }
  }

  replaceWheelsWithOverload(wheels: number[], overload: number[]) {
    let newWheel: number[] = [];
    for (let i = 0; i < wheels.length; i++) {
      if (overload[i] !== 0) {
        newWheel[i] = overload[i];
      } else {
        newWheel[i] = wheels[i];
      }
    }
    return newWheel;
  }

  replaceWheelsWithExtendedWild(wheels: number[], extendedWild: number[], rowCount: number) {
    let newWheel: number[] = [...wheels];
    for (let i = 0; i < wheels.length; i++) {
      if (extendedWild[i] !== 0) {
        let reelId = Math.trunc(i / rowCount);
        let replacedSymbolCount: number = 0;
        for (let j = 0; j < wheels.length; j++) {
          let symbolOnReelId = Math.trunc(j / rowCount);
          if (symbolOnReelId === reelId) {
            newWheel[j] = extendedWild[i];
            replacedSymbolCount++;
            if (replacedSymbolCount === rowCount) {
              break;
            }
          }
        }
      }
    }
    return newWheel;
  }

  replaceWheelsWithExtraWild(wheels: number[], extraWild: number, gameName: string) {
    let newWheel: number[] = [];
    for (let i = 0; i < wheels.length; i++) {
      if (extraWild === wheels[i]) {
        switch (gameName) {
          case 'bewitchtorich':
          case 'richywitchy': {
            const bias = 9;
            newWheel[i] = extraWild + bias;
            break;
          }
          default: {
            newWheel[i] = wheels[i];
          }
        }

      } else {
        newWheel[i] = wheels[i];
      }
    }
    return newWheel;
  }

  getBoostIdxs = (i: number, boostSize: number) => {

    if (boostSize === 2) return [i, i+1, i+8, i+9];

    if (boostSize === 3) return [
      i,    i+1,  i+2,
      i+8,  i+9,  i+10,
      i+16, i+17, i+18
    ];

    if (boostSize === 6) return [
      i,    i+1,  i+2,  i+3,  i+4,  i+5,
      i+8,  i+9,  i+10, i+11, i+12, i+13,
      i+16, i+17, i+18, i+19, i+20, i+21,
      i+24, i+25, i+26, i+27, i+28, i+29,
      i+32, i+33, i+34, i+35, i+36, i+37,
      i+40, i+41, i+42, i+43, i+44, i+45
    ];

    return [];

  }

  getInfoTransformedFruitBoost = (info: any) => {
    return [
      info[0], info[8],  info[16], info[24], info[32], info[40], info[48], info[56],
      info[1], info[9],  info[17], info[25], info[33], info[41], info[49], info[57],
      info[2], info[10], info[18], info[26], info[34], info[42], info[50], info[58],
      info[3], info[11], info[19], info[27], info[35], info[43], info[51], info[59],
      info[4], info[12], info[20], info[28], info[36], info[44], info[52], info[60],
      info[5], info[13], info[21], info[29], info[37], info[45], info[53], info[61],
      info[6], info[14], info[22], info[30], info[38], info[46], info[54], info[62],
      info[7], info[15], info[23], info[31], info[39], info[47], info[55], info[63]
    ];
  }

  getWheelsValuesMultiplierXmasAvalanche = ({ isBonus, id }: {isBonus: boolean, id: number }) => {

    const mpMain: Map<number, string> = new Map([ [1, 'x2'], [2, 'x4'], [3, 'x8'], [4, 'x16'], [5, 'x32'], [6, 'x64'], [7, 'x128'], [8, 'x256'] ]);

    const mpBonus: Map<number, string> = new Map([ [1, 'x3'], [2, 'x9'], [3, 'x27'], [4, 'x81'], [5, 'x243'], [6, 'x729'] ]);

    return isBonus && mpBonus.has(id) ? mpBonus.get(id) : !isBonus && mpMain.has(id) ? mpMain.get(id) : '-1';

  }

  getWheelsValues = (row: any) => {
    return (row.wheelsValues || (row.data && row.data.wheelsValues)) || null;
  }



  wheelsView(wheels: number[], row: any, skipExtendedWildView?: boolean, skipRoamingWildView?: boolean) {
    let gameId = row.gameId;
    let gameName = this.getGameServerNameById(gameId);
    let gameConfig = ALL_GAMES.filter(g => parseInt(g.id) === row.gameId)[0];
    let record = row.data ? row.data : row;
    let feature = record.feature;

    if (gameName === 'ninegems') {
      wheels = [
        wheels[1],   wheels[2],   wheels[3],
        wheels[6],   wheels[7],   wheels[8],
        wheels[11],  wheels[12],  wheels[13],
      ];
    }
    if (gameName === 'ninedragonkings') {
      wheels = [
        wheels[1],   wheels[4],   wheels[7]
      ];
    }
    let newWheels: any[] = wheels;

    if (gameName === 'extragems') {
      let wheelsValues = (row.wheelsValues || (row.data && row.data.wheelsValues)) || null;
      const wheelsOrder = [3, 0, 1, 2, 7, 4, 5, 6, 11, 8, 9, 10, 15, 12, 13, 14, 19, 16, 17, 18, 23, 20, 21, 22];
      newWheels = wheelsOrder.map(x => wheelsValues && wheelsValues[x] ? `${wheels[x]}_split` : `${wheels[x]}`);
    }

    if (gameName === 'xmasavalanche') {
      const isBonus: boolean = [3, 4].indexOf(row.id_fs) > -1;
      let wheelsValues = this.getWheelsValues(row) as number[];
      const wheelsOrder = [...Array(49).keys()];
      newWheels = wheelsOrder.map(x => wheelsValues && wheelsValues[x] ?
          `${wheels[x]}_${this.getWheelsValuesMultiplierXmasAvalanche({isBonus, id: wheelsValues[x]})}` : `${wheels[x]}`);
    }

    let reelCount = this.getGameReelCountById(gameId);
    let rowCount = newWheels.length / reelCount;
    let result: string = '';
    let overload = (row.overload || (row.data && row.data.overload)) || null;
    if (overload !== null) {
      newWheels = this.replaceWheelsWithOverload(wheels, overload);
    }
    let extendedWild = (row.extendedWild || (row.data && row.data.extendedWild)) || null;
    if (extendedWild && !skipExtendedWildView) {
      newWheels = this.replaceWheelsWithExtendedWild(wheels, extendedWild, rowCount);
    }
    //for book of egypt and crocoman
    if(skipExtendedWildView ){
      newWheels = this.replaceWheelsWithOverload(wheels, extendedWild);
    }
    let extraWild = (row.extraWild || (row.data && row.data.extraWild)) || null;

    // ingore extraWild for dynasty warriors and fruit boost // dynastywarriors
    const noExtraWildGames = ['dynastywarriors', 'fruitboost', 'xmasavalanche'];
    if (noExtraWildGames.indexOf(gameName) > -1) { extraWild = null; }

    if (extraWild) {
      newWheels = this.replaceWheelsWithExtraWild(wheels, extraWild, gameName);
    }
    let transformedWheels: number[] = [];
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < reelCount; j++) {
        transformedWheels.push(newWheels[i + rowCount * j]);
      }
    }

    let transformedWheelsValues: number[] = [];
    let overloadWithText = (row.wheelsValues || (row.data && row.data.wheelsValues)) || null;
    let bet = (row.bet || (row.data && row.data.bet)) || null;
    if (overloadWithText) {
      transformNetFromLeftToRight(overloadWithText, transformedWheelsValues, rowCount, reelCount);
    }

    if (gameName === 'lordofthesun') {
      const lineBet = record.bet;
      const totalBet = row.totalBet || lineBet * 20;
      const goldenSunBet = lineBet * 100;
      const goldensun = feature && feature.goldensun ? feature.goldensun[goldenSunBet] : feature && feature.goldensun_fs ? feature.goldensun_fs: false;
      const prizePanel: number[] = goldensun ?
        goldensun.map((v: number) => v > 0 ? v*totalBet : v) :
        [-2, -2, -2, -2, -2];

      transformedWheels = [...prizePanel, ...transformedWheels];
    }

    for (let i = 0; i < transformedWheels.length; i++) {
      let symbolId = transformedWheels[i];
      let symbolText: string = '';
      let symbolPath: string = '';
      let isVisible: boolean = true;
      let isBoost: boolean = false;
      let boostSize: number = 0;
      let bgPath: string = '';
      switch (gameName) {
        case 'wealthofwisdom': {
          // 5x3
          // feature.RoamingWilds
          // {from: [{x: 2, y: 2}, {x: 4, y: 1}], to: [{x: 3, y: 2}, {x: 5, y: 1}]}
          // x - reel, y - row/position
          if (!skipRoamingWildView && feature && feature.RoamingWilds && feature.RoamingWilds.to) {
            const curTo = feature.RoamingWilds.to;

            const x1 = curTo[0].x;
            const y1 = curTo[0].y;
            const x2 = curTo[1].x;
            const y2 = curTo[1].y;

            const add = (x: number, y: number) => y === 1 ? 0 : y === 2 ? (5 - x) + x : y === 3 ? (10 - x) + x : 0;

            const add1 = add(x1, y1);
            const add2 = add(x2, y2);

            const curI1 = x1 + add1 - 1;
            const curI2 = x2 + add2 - 1;

            if (i === curI1 || i === curI2) { symbolId = 15; if (curI1 === curI2) { symbolText = 'x10'; } }

          }
          break;
        }
        case 'thebigscore':
        case 'royallotus': {
          if ([15, 19, 20, 21, 23, 24].indexOf(i) > -1) symbolId = 22;
          break;
        }
        case 'rhinomania':
        case 'bisontrail': {
          if (transformedWheelsValues[i] === 2) {
            symbolId = 14;
          } else if (transformedWheelsValues[i] === 3) {
            symbolId = 15;
          }
          break;
        }
        case 'caishensgifts': {
          if (symbolId === 1 && row.id_fs) {
            symbolId = 13 + row.id_fs;
          }
          break;
        }
        case 'piratesmap': {
          if (feature && feature.collected && symbolId == 11) {
            symbolId = 13;
          }
          if (overloadWithText) {
            symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(roundValue(transformedWheelsValues[i] * bet * this.getGameTotalLinesById(this.props.metadata.gameId))) : '';

          }
          break;
        }

        case 'santasbag': {
          if (overloadWithText) {
            symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(roundValue(transformedWheelsValues[i] * bet * this.getGameTotalLinesById(this.props.metadata.gameId))) : '';
          }
          break;
        }
        case 'thousandonespins': {
          if (overloadWithText) {
            const isJackpotFeature = feature && feature.jackpots;
            const minJackpotQuotient = ALL_GAMES.filter(item => (item.serverName === `thousandonespins`))[0].jackpotPrice['MINI'];
            const minJackpotPrice = minJackpotQuotient * bet;
            const jackpotPrice = transformedWheelsValues[i] !== 0 ? roundValue(transformedWheelsValues[i] * bet * this.getGameTotalLinesById(this.props.metadata.gameId)) : 0;
            const isJackpotSymbol = !isJackpotFeature && symbolId === 3 && (jackpotPrice >= minJackpotPrice) && (jackpotPrice !== 2.5 * minJackpotPrice);
            if (isJackpotSymbol) {
              symbolId = 14;
            } else {
              symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(jackpotPrice) : '';
            }

          }
          break;
        }
        case 'leprechauns': {
          if (overloadWithText) {
            const isJackpotFeature = feature && feature.jackpots;
            const minJackpotQuotient = ALL_GAMES.filter(item => (item.serverName === `leprechauns`))[0].jackpotPrice['MINI'];
            const minJackpotPrice = minJackpotQuotient * bet;
            const jackpotPrice = transformedWheelsValues[i] !== 0 ? roundValue(transformedWheelsValues[i] * bet * this.getGameTotalLinesById(this.props.metadata.gameId)) : 0;
            const isJackpotSymbol = !isJackpotFeature && symbolId === 3 && (jackpotPrice >= minJackpotPrice);
            if (isJackpotSymbol) {
              symbolId = 13;
            } else {
              symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(jackpotPrice) : '';
            }

          }
          break;
        }
        case 'mightofzeus': {

        /*   const prizes = {
            2: 0.5,
            3: 1,
            4: 5
          }; */

          if (overloadWithText) {
            const wheelValue = transformedWheelsValues[i];
            const isSymbolWithNumber = [ 13, 14 ].indexOf(symbolId) > -1;

            if (isSymbolWithNumber) {
              symbolId = 1;
            }

            if ([2, 3, 4, 5].indexOf(wheelValue) > -1) {
              let curPrizeValue = wheelValue === 2 ? 0.5 : wheelValue === 3 ? 1 : wheelValue === 4 ? 5 : 0;
              const jackpotPrice = transformedWheelsValues[i] !== 0 ? roundValue(curPrizeValue * bet * this.getGameTotalLinesById(this.props.metadata.gameId)) : 0;
              symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(jackpotPrice) : '';

              if (wheelValue === 5) { symbolText = 'jackpot'; }
            }

          }
          break;
        }
        case 'guisesofdracula': {
          if (feature && (feature.floatingWilds || feature.floatingWilds_fs) && [11, 13].indexOf(+symbolId) > -1) {
            const isFS = feature.floatingWilds_fs;
            const wilds = isFS ? feature.floatingWilds_fs : feature.floatingWilds.filter((i: any) => i.bet === bet*100)[0].wilds
            let wildsTransformed: {[key: number]: {rowId: number; reelId: number; prize: number; type: number;}} = wilds.reduce((acc: any, cur: any) => {
              const curI = cur.rowId * 5 + cur.reelId;
              acc[curI] = cur;
              return acc;
            }, {});

            const curWild = wildsTransformed[i];
            const curWildType = curWild.type;
            const curWildPrize = curWild.prize;

            if (curWildType === 3) {
              symbolText = `x${curWildPrize}`;
            } else if (curWildType === 4) {
              symbolText = `FS ${curWildPrize}`
            } else if (curWildType === 2) {
              if (curWildPrize === 100) { symbolText = 'MINI' }
              else if (curWildPrize === 250) { symbolText = 'MINOR' }
              else if (curWildPrize === 500) { symbolText = 'MAJOR' }
              else if (curWildPrize === 1000) { symbolText = 'GRAND' }
              else {
                symbolText = shortFormatNumber(roundValue(curWildPrize * bet * this.getGameTotalLinesById(this.props.metadata.gameId)));
              }
            } else {
              symbolText = '';
            }

          }
          break;
        }
        case 'leprechauns': {
          if (overloadWithText) {
            const jackpotPrice = transformedWheelsValues[i] !== 0 ? roundValue(transformedWheelsValues[i] * bet * this.getGameTotalLinesById(this.props.metadata.gameId)) : 0;
            const isJackpotSymbol = false;
            if (isJackpotSymbol) {
              symbolId = 14;
            } else {
              symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(jackpotPrice) : '';
            }

          }
          break;
        }
        case 'frozenmirror': {
          if (overloadWithText) {
            if (transformedWheelsValues[i] !== 0) {

              const jackpotPrice = ALL_GAMES.filter(item => (item.serverName === `frozenmirror`))[0].jackpotPrice;
              // const curJackpotPrice = minJackpotQuotient * bet;
              const curPrizeValue = roundValue(transformedWheelsValues[i] * bet * this.getGameTotalLinesById(this.props.metadata.gameId));

              let isNumberPrize = true;
              let textValue = ``;

              for (let key in jackpotPrice) {
                if ((jackpotPrice[key] * bet) === curPrizeValue) { isNumberPrize = false; textValue = key; }
              }

              if (curPrizeValue < 0) {
                // queen symbol
                isNumberPrize = false;
                textValue = ``;
                symbolId = 13;
              }

              if (feature && feature.luckybreak_win) { symbolId = 14; };

              if (feature && feature.rings) {
                const ringIds = feature.rings.map((cur: { reelId: number; rowId: number; }) => cur.rowId * 5 + cur.reelId)
                if (ringIds.indexOf(i) > -1) {
                  const w = record && record.wheelsValues;
                  const wheelsValuesTransformed = [
                    w[0], w[3], w[6], w[9],  w[12],
                    w[1], w[4], w[7], w[10], w[13],
                    w[2], w[5], w[8], w[11], w[14]
                  ];
                  const queenPositions = wheelsValuesTransformed ? wheelsValuesTransformed.map((v: any, i: any) => (v < 0) ? i : -1).filter((v:any) => v != -1) : []

                  if (queenPositions.indexOf(i) > -1) {
                    symbolId = 15;
                  } else {
                    symbolId = 14;
                  }
                }

              }
              symbolText = isNumberPrize ? shortFormatNumber(curPrizeValue, true) : textValue;
            } else {
              symbolText = '';
            }
          }
          break;
        }
        case 'jokerchase': {
          if (overloadWithText) {

            const hasGrandJackpot = record && record.wheelsValues && record.wheelsValues.indexOf(0) === -1;
            const isSpin = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin');
            const isFs = row.cmd && row.cmd === 'bonus' && row.id_fs && row.id_fs === 2;
            // row.data.info
            // record.info
            const info = record.info ? record.info : [];
            const infoTransformed = [
              info[0], info[3], info[6], info[9],  info[12],
              info[1], info[4], info[7], info[10], info[13],
              info[2], info[5], info[8], info[11], info[14]
            ];
            const isBonusSymbol = row.cmd && row.cmd === 'bonus' && infoTransformed[i] === 1;

            if ((isSpin || isFs || isBonusSymbol) && transformedWheelsValues[i] !== 0 && !hasGrandJackpot) {
              symbolId = 12;
            } else {
              const jackpotPrices = ALL_GAMES.filter(item => (item.serverName === `jokerchase`))[0].jackpotPrice;
              const curJackpotPrice = roundValue(transformedWheelsValues[i] * bet);
              symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(curJackpotPrice, true) : '';
              for (let key in jackpotPrices) {
                if ((jackpotPrices[key]) === transformedWheelsValues[i]) { symbolText = `${key}`}
              }
            }
          }
          break;
        }
        case 'coinfest': {
          if (overloadWithText) {
            const lineBet = bet;
            const totalBet = lineBet * gameConfig.lines;
            const jackpotPrices = ALL_GAMES.filter(item => (item.serverName === `coinfest`))[0].jackpotPrice;
            const curJackpotPrice = roundValue(transformedWheelsValues[i] * totalBet);
            symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(curJackpotPrice, true) : '';
            for (let key in jackpotPrices) {
              if ((jackpotPrices[key]) === transformedWheelsValues[i]) { symbolText = `${key}`}
            }
          }
          break;
        }
        case 'pirateslegacy': {
          if (overloadWithText) {
            const lineBet = bet;
            const totalBet = lineBet * gameConfig.lines;
            const jackpotPrices = ALL_GAMES.filter(item => (item.serverName === `pirateslegacy`))[0].jackpotPrice;
            const curJackpotPrice = roundValue(transformedWheelsValues[i] * totalBet);
            const o = overload && overload.length ? overload : [];
            const overloadTransformed = [
              o[0], o[3], o[6], o[9],  o[12],
              o[1], o[4], o[7], o[10], o[13],
              o[2], o[5], o[8], o[11], o[14]
            ];
            symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(curJackpotPrice, true) : '';
            if (symbolId === 12) symbolText = `${transformedWheelsValues[i]}`;
            if (overloadTransformed[i] === 10) symbolText = '';
            for (let key in jackpotPrices) {
              if ((jackpotPrices[key]/gameConfig.lines) === transformedWheelsValues[i]) { symbolText = `${key}`}
            }
          }
          break;
        }
        case 'fruitboost': {

          const info = record.info ? record.info : [];
          let infoTransformed: any = this.getInfoTransformedFruitBoost(info);
          let boostStore: number[] = [];
          let idxsToSkip: number[] = [];
          for (let idx = 0; idx < infoTransformed.length; idx++) {
            const curBoostSize = infoTransformed[idx];
            if ((idxsToSkip.indexOf(idx) > -1) || curBoostSize <= 0) continue;
            const curBoostIndexes = this.getBoostIdxs(idx, curBoostSize);
            if (curBoostIndexes.length) {
              boostStore = [...boostStore, Math.max(...curBoostIndexes)];
              idxsToSkip = [ ...idxsToSkip, ...curBoostIndexes ];
            }
          }
          isVisible = +infoTransformed[i] > 0 ? false : true;
          isBoost = boostStore.findIndex((el: number) => +el === i) > -1;
          boostSize = +infoTransformed[i];
          break;

        }
        case 'extragems': {
          if (overloadWithText) {}
          break;
        }
        case 'xmasavalanche': {
          if (overloadWithText) {}
          break;
        }
        case 'hallowin': {
          if (overloadWithText) {
            const lineBet = bet;
            const totalBet = lineBet * gameConfig.lines;
            const jackpotPrices = ALL_GAMES.filter(item => (item.serverName === gameName))[0].jackpotPrice;
            const curJackpotPrice = roundValue(transformedWheelsValues[i] * totalBet);
            symbolText = [0, -1].indexOf(transformedWheelsValues[i]) === -1 ? shortFormatNumber(curJackpotPrice, true) : '';
            if (transformedWheelsValues[i] === -1) { symbolId = 14}
            for (let key in jackpotPrices) {
              if ((jackpotPrices[key]) === transformedWheelsValues[i]) { symbolText = `${key}`}
            }
          }
          break;
        }
        case 'catchtheleprechaun': {
          if (overloadWithText) {
            const lineBet = bet;
            const totalBet = lineBet * gameConfig.lines;
            const jackpotPrices = ALL_GAMES.filter(item => (item.serverName === gameName))[0].jackpotPrice;
            const curJackpotPrice = roundValue(transformedWheelsValues[i] * totalBet);
            symbolText = [0, -1].indexOf(transformedWheelsValues[i]) === -1 ? shortFormatNumber(curJackpotPrice, true) : '';
            if (symbolId === 14 && [10, 15].indexOf(transformedWheelsValues[i]) > -1) { symbolId = 13 }
            for (let key in jackpotPrices) {
              if ((jackpotPrices[key]) === transformedWheelsValues[i]) { symbolText = `${key}`}
            }
          }
          break;
        }
        default: {
          if (overloadWithText) {
            symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(roundValue(transformedWheelsValues[i] * bet)) : '';
          }
        }
      }

      if (this.hasWheelsValuesMultiplier(gameId)) {
        if (overloadWithText) {
          symbolText = transformedWheelsValues[i] !== 0 ? `x${transformedWheelsValues[i]}` : '';
        }
      }

      if (this.hasWheelsValuesCoin(gameId)) {
        if (overloadWithText) {
          symbolText = transformedWheelsValues[i] !== 0 ? shortFormatNumber(roundValue(transformedWheelsValues[i] * bet * this.getGameTotalLinesById(this.props.metadata.gameId))) : '';
        }
      }

      const isCoinChargeAndRespin = gameName === 'coincharge' && row.id_fs && ([1, 2, 3].indexOf(row.id_fs) > -1);

      if (isCoinChargeAndRespin) {
        const transformedMultiplierFeature: number[] = [];
        transformNetFromLeftToRight(row.data.multiplierFeature, transformedMultiplierFeature, rowCount, reelCount)
        if (transformedMultiplierFeature[i]) {
          if (+symbolText) {
            symbolText = `${(+symbolText as any).toFixed(2) * (transformedMultiplierFeature[i] as any).toFixed(2)}`;
          }

          if (transformedMultiplierFeature[i] === 2) {
            try {
              bgPath = require(`./img/${gameName}/cell.png`);
            } catch (err) {
              bgPath = require(`./img/default.png`);
            }
          }
        }
      }

      try {
        symbolPath = isCoinChargeAndRespin && (symbolId !== 2)
          ? require(`./img/${gameName}/empty.png`)
          : require(`./img/${gameName}/s${symbolId}.png`);
      } catch (err) {
        symbolPath = require(`./img/default.png`);
      }

      result = this.symbolView(result, symbolId, i, symbolPath, reelCount, transformedWheels.length, symbolText, gameId, feature, bgPath, {isVisible, isBoost, boostSize});
    }
    return {__html: result};
  }

  symbolView(
    result: string,
    symbolId: number,
    i: number,
    symbolPath: string,
    reelCount: number,
    length: number,
    symbolText: string,
    gameId: number,
    feature: any,
    bgPath: string,
    boostOptions: {
      isVisible: boolean;
      isBoost:boolean;
      boostSize: number;
    } = { isVisible: true, isBoost: false, boostSize: 0 }
  ) {
    let gameName = this.getGameServerNameById(gameId);

    let newResult = result;
    if (i === 0) {
      newResult += `<div class="img-wrapper">`;
    }

    if ([544].indexOf(gameId) > -1) {
      const prizePanelSymbol = `${+symbolId > 0 ? shortFormatNumber(+symbolId.toFixed(2)) : +symbolId === 0  ? 'FREE SPINS' : +symbolId === -1  ? 'JACKPOT' : '-'}`;
      const emptySymbolPath = require(`./img/empty.png`);
      // lordofthesun
      newResult += `
        <div class="img-container">
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${i < 5 ? emptySymbolPath : symbolPath}>
          ${i < 5 ? `<span style="font-size: ${+symbolId > 0 ? 12 : 8}px; color: #FBD27B;" class="img-text-centered">${prizePanelSymbol}</span>` : `<span class="img-text-centered">${symbolText}</span>`}
        </div>
        `;
    } else if ([541].indexOf(gameId) > -1) {
      // royallotus
      /*
        3-4-5-4-3 slot
        00,01,02,03,04
        05,06,07,08,09
        10,11,12,13,14
        15,16,17,18,19
        20,21,22,23,24
       */
      // background-color:#7E5EA6;
      const treeNumbers = [ 0,5,10,4,9,14 ];
      const fourNumbers = [ 1,6,11,16,3,8,13,18 ];
      const fiveNumbers = [2,7,12,17,22];
      // const treePositionStyle = `position:relative;top:32px;`;
      // const fourPositionStyle = `position:relative;top:16px;`;
      // const fivePositionStyle = ``;
      const curStyle = `${treeNumbers.indexOf(i) > -1 ? "position:relative;top:32px;" : fourNumbers.indexOf(i) > -1 ? "position:relative;top:16px;" : fiveNumbers.indexOf(i) > -1 ?  "" : null}`;
      newResult += [15, 20, 19, 24].indexOf(i) > -1 ? `<div class="img-container"></div>` : `
        <div class="img-container" style=${curStyle}>
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
          <span class="img-text-centered">${symbolText}</span>
        </div>
        `;
    } else if (gameName === 'thebigscore') {
      // royallotus,thebigscore
      /*
        3-4-5-4-3 slot
        00,01,02,03,04
        05,06,07,08,09
        10,11,12,13,14
        15,16,17,18,19
        20,21,22,23,24
       */
      // background-color:#7E5EA6;
      const treeNumbers = [ 0,5,10,4,9,14 ];
      const fourNumbers = [ 1,6,11,16,3,8,13,18 ];
      const fiveNumbers = [ 2,7,12,17,22 ];
      // const treePositionStyle = `position:relative;top:32px;`;
      // const fourPositionStyle = `position:relative;top:16px;`;
      // const fivePositionStyle = ``;
      const curStyle = `${treeNumbers.indexOf(i) > -1 ? "position:relative;top:50px;" : fourNumbers.indexOf(i) > -1 ? "position:relative;top:25px;" : fiveNumbers.indexOf(i) > -1 ?  "" : null}`;
      newResult += [15, 20, 19, 24].indexOf(i) > -1 ? `<div class="img-container"></div>` : `
        <div class="img-container" style=${curStyle}>
          <img style="margin-top: -23%" id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
          <span class="img-text-centered">${symbolText}</span>
        </div>
        `;
    } else if (gameName === 'guisesofdracula') {
      newResult += `
        <div class="img-container">
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
          <span style=${symbolId === 13 ? '"font-size: 12px; color: #f52b17; text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white"' : '"font-size: 12px; color: lightgray; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black"'} class="img-text-centered">${symbolText}</span>
        </div>
        `;
    } else if (gameName === 'frozenmirror' && feature && feature.rings) {
      const ringIds = feature.rings.map((cur: { reelId: number; rowId: number; }) => cur.rowId * 5 + cur.reelId)
      const circlePath = require(`./img/frozenmirror/circle.png`);
      if (ringIds.indexOf(i) > -1) {

        newResult += `
          <div class="img-container">
            <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
            <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} style=${'"overflow: hidden; position: absolute;"'} src=${circlePath}>
            <span class="img-text-centered">${symbolText}</span>
          </div>
          `;
      } else {
        newResult += `
          <div class="img-container">
            <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
            <span class="img-text-centered">${symbolText}</span>
          </div>
          `;
      }
    } else if (gameName === 'fruitboost') {

      const { isVisible, isBoost, boostSize } = boostOptions;

      newResult += `
        <div class="img-container" ${isBoost ? `style="transform: scale(${boostSize}); transform-origin: bottom right;"` : ``}>
          ${ isBoost ?
            `<img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>`
            :
            `<img ${isVisible ? `` : `style="visibility: hidden; width: 100%;"`} id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>`
          }
          <span class="img-text-centered">${symbolText}</span>
        </div>
        `;
    } else if (gameName === 'pirateslegacy') {
      newResult += `
        <div class="img-container">
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
          <span class=${symbolId === 12 ? '"img-text-fs-red"' : '"img-text-centered"'}>${symbolText}</span>
        </div>
        `;
    } else if (gameName === 'thorturbopower') {
      const stackedPath = require(`./img/thorturbopower/s9_s.png`)
      newResult += symbolId === 9 && i >= 0 && i <= 4 ? `
        <div class="img-container">
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} style=${'"overflow: hidden; position: absolute;"'} src=${stackedPath}>
          <span class="img-text-centered">${symbolText}</span>
        </div>
        ` : `
        <div class="img-container">
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
          <span class="img-text-centered">${symbolText}</span>
        </div>
        `;
    } else if (gameName === 'coincharge') {
      newResult += `
        <div class="img-container">
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath} style="z-index: 1;">
          ${bgPath ? `<img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${bgPath} style="position: absolute;">` : ''}
          <span class="img-text-centered" style="z-index: 1;">${symbolText}</span>
        </div>
        `;
    } else {
      // regular slot
      newResult += `
        <div class="img-container">
          <img id=${isDeviceIos() ? 'img-ios' : 'img-other'} src=${symbolPath}>
          <span class="img-text-centered">${symbolText}</span>
        </div>
        `;
    }

    if ((i + 1) % reelCount === 0 && i !== (length - 1)) {
      newResult += `
					</div>
					<br/>
					<div class="img-wrapper">
				`;
    }
    if (i === length) {
      newResult += `
					</div>
				`;
    }
    return newResult
  }

  isBlackJack() {
    return (this.props.metadata.gameId === 93) || (this.props.metadata.gameId === 487);
  }

  isBaccarat() {
    return (this.props.metadata.gameId === 99) || (this.props.metadata.gameId === 489) || (this.props.metadata.gameId === 490);
  }

  isRoulette() {
    return [ 110 ].indexOf(this.props.metadata.gameId) > -1;
  }

  renderBonusDetails(gameId: number, row: any) {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === gameId) {
        switch (item.serverName) {
          //jackpot
          case "excitemomlesson":
          case "edosushi": {
            let currency = this.props.metadata.currency;
            let win = row.win;
            let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            return (row.data && row.data.jackpots) ? BonusDetails.Jackpot(winStr, row.data.items, row.data.finish) : BonusDetails.EgyptianGold(row.data.count);
          }
          case "lusttram":
          case "starfleet": {
            let currency = this.props.metadata.currency;
            let win = row.win;
            let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            return (row.data && row.data.jackpots) ? BonusDetails.Jackpot(winStr, row.data.items, row.data.finish) : BonusDetails.EgyptianGold(row.feature.spins);
          }
          case "oppainoohjya48": {
            let currency = this.props.metadata.currency;
            let win = row.win;
            let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            return (row.data && row.data.jackpots) ? BonusDetails.Jackpot(winStr, row.data.items, row.data.finish) : BonusDetails.GreatOcean(row.data.spins, row.data.spinsMultiplier);
          }
          case "oppainoohjya48h":
          case "mahjongh": {
            let currency = this.props.metadata.currency;
            let win = row.win;
            let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            return BonusDetails.Jackpot(winStr, row.data.items, row.data.finish);
          }

          //anime
          case "tosirwithlove":
          case "maidwithbenefits":
          case "cherryblossomgirls":

          case "youkai":
          case "afterclass":
          case "alice":
          case "ayu1":
          case "femaleteacher":
          case "jibril":
          case "mysteriouscave":
          case "rinazuma3":
          case "ryuuseiangels":
          case "sisterwife":
          case "stniflheim":
          case "strangeclassroom":
          case "tsubomi":
          case "yuiuehara3":
          //platipus
          case "cleosgold":
          case "magicalwolf":
          //platipus-copies
          case "pyramidpower":
          case "wolvesoffortune": {
            return BonusDetails.EgyptianGold(row.data.count);
          }
          //anime
          case"femaleninja":
          case"hatelove":
          case"littleredridinghood":
          case"blades": {
            return BonusDetails.EgyptianGold(row.data.spins);
          }
          //anime
          case "darkness":
          case "ayu2":
          case "bitchteacher":
          case "curioushospital":
          case "foretellingcards":
          case "girlprison":
          case "hudou":
          case "later":
          case "lewdnessinsect":
          case "yubisakiinstructor":

          //platipus
          case "cinderella":
          case "fortuneofthegods":
          case "mistressofamazon":
          //platipus-copies
          case "cindertale":
          case "greenworld": {
            return BonusDetails.EgyptianGold(row.feature.spins);
          }
          case "bookofegypt":
          //platipus-copies
          case "bookofthepharaohs": {
            let url = `./img/${item.serverName}/s${row.data.wild + 9}.png`;
            let extraWild = require(`${url}`);
            return BonusDetails.BookOfEgypt(extraWild);
          }
          case "booksofgiza":
          case "bookoflight": {
            let url = `./img/${item.serverName}/s${row.data.expanding_symbol+'_g'}.png`;
            let extraWild = require(`${url}`);
            return BonusDetails.BookOfEgypt(extraWild);
          }
          case "crocoman":
          //platipus-copies
          case "crocotrail": {
            let url = `./img/${item.serverName}/s${row.data.wild + 9}.png`;
            let extraWild = require(`${url}`);
            return BonusDetails.Crocoman(extraWild);
          }
          case "powerofgods":
          case "monkeysjourney":
          //platipus-copies
          case "divinepower":
          case "monkeypower": {
            let url = `./img/${item.serverName}/s${row.data.wild}.png`;
            let extraWild = require(`${url}`);
            return BonusDetails.MonkeysJourney(extraWild);
          }
          case "luckydolphin":
          //platipus-copies
          case "perfectpearls": {
            let currency = this.props.metadata.currency;
            let win = formatNumberData(row.data.realCurrentWin);
            let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            return BonusDetails.LuckyDolphin(winStr, row.data.coinsMultiplierLevel);
          }
          case "richywitchy":
          //platipus-copies
          case "bewitchtorich": {
            let url = `./img/${item.serverName}/s${row.data.symbolId + 9}.png`;
            let extraWild = require(`${url}`);
            return BonusDetails.RichyWitchy(row.data.fsCount, extraWild);
          }
          case "magicalmirror":
          //platipus-copies
          case "mirrormirror": {
            return BonusDetails.MagicalMirror(row.data.fsCount, row.data.sector2.toString(), item.serverName);
          }
          case "crystalsevens":
          //platipus-copies
          case "shinysevens": {
            let winStr: string = '';
            if (row.data.bonusGame === 1) {
              let currency = this.props.metadata.currency;
              let win = formatNumberData(row.data.realCurrentWin);
              winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            }
            return BonusDetails.CrystalSevens(row.data, winStr);
          }
          case "loveis":
          case "tripledragon":
          case "arabiantales":
          //platipus-copies
          case "cupidstouch":
          case "longdragon":
          case "trueoriental": {
            return BonusDetails.LoveIs(row.data);
          }
          //anime
          case "bibleblack":
          case "chooseawife":
          case "classmatefcker":
          case "dekakute":
          case "girlxgirlxgirl":
          case "hugyou":
          case "kanojyo3":
          case "kunoichisakuya":
          case "lovelykitty":
          case "mahousyoujyoal":
          case "maidlesson":
          case "mamaboin":
          case "megachuu":
          case "mysisters":
          case "resortboin":
          case "rinazuma1":
          case "slavenurses":
          case "specialguidance":
          case "yakinbyouto":
          case "yokujtohbazooka":
          case "youwillbemoreandmorehard":
          case "yuiuehara2":
          //platipus
          case "greatocean":
          case "pharaohsempire":
          //platipus-copies
          case "majesticocean": {
            return BonusDetails.GreatOcean(row.data.spins, row.data.spinsMultiplier);
          }
          //platipus
          case "chinesetigers": {
            return BonusDetails.ChineseTigers(row.data.spins, row.data.player_choice, item.serverName);
          }
          case "caishensgifts": {
            return BonusDetails.CaishensGifts(row.data.spins, row.data.player_choice, item.serverName);
          }
          case "mightofzeus": {
            // let win = formatNumberData(row.data.realCurrentWin);
            // let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            const jackpotData: {jackpot: string; jackpot_bet: number; jackpot_position: number; jackpot_price: number; jackpots: string; } = row.data;
            let currency: string = this.props.metadata.currency;
            let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

            const jackpot = `${jackpotData.jackpot}`;
            const jackpotWin = `${format} ${this.pretifyWinDisplay(jackpotData.jackpot_price * jackpotData.jackpot_bet)}`;

            return BonusDetails.MightOfZeus(jackpot, jackpotWin);
          }
          case "wildjustice": {
            const jackpotData: {jackpot: string; jackpot_bet: number; jackpot_price: number; jackpot_win: number; isFinish: 0|1; } = row.data;
            let currency: string = this.props.metadata.currency;
            let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

            const jackpot = `${jackpotData.jackpot}`;
            const jackpotWin = `${format} ${formatNumberData(jackpotData.jackpot_win)}`; //${this.pretifyWinDisplay(jackpotData.jackpot_win)}`;

            return BonusDetails.MightOfZeus(jackpot, jackpotWin);
          }
          case "hallowin": {
            const jackpotData: {
              feature: {
                jackpot_bet: number;
                jackpot_price: number;
                jackpots: string;
                respin_last: number;
                respin_sum: number;
              };
              jackpot_bet: number;
              jackpot_price: number;
              jackpots: string;
            } = row.data;

            let currency: string = this.props.metadata.currency;
            let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

            const jackpot = `${jackpotData.jackpots}`;
            const jackpotWin = `${format} ${formatNumberData(jackpotData.jackpot_price * jackpotData.jackpot_bet)}`;

            return BonusDetails.MightOfZeus(jackpot, jackpotWin);
          }
          case "coincharge": {
            const jackpotData: {
              feature: {
                jackpot: string;
              };
              win: number;
            } = row.data;
            let currency: string = this.props.metadata.currency;
            let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

            const jackpot = `${jackpotData.feature.jackpot}`.toUpperCase();
            const jackpotWin = `${format} ${formatNumberData(jackpotData.win)}`;

            return BonusDetails.MightOfZeus(jackpot, jackpotWin);
          }
          case "bamboogrove": {
            let bonusData: {isFinish: boolean; position: number; prizes: 0; wheel: number; win: number; bonusWin: string; cashPrize: string;} = row.data;
            let currency: string = this.props.metadata.currency;
            let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;
            const bonusWin = `${format} ${this.pretifyWinDisplay(bonusData.win)}`;
            // const totalBet = this.props.metadata.bet;
            // const betLines = row.betLines || 0;
            // const lineBet = totalBet/betLines;
            // const cashPrize = `${this.pretifyWinDisplay(bonusData.win/lineBet)} bets`;
            bonusData['bonusWin'] = bonusWin;
            // bonusData['cashPrize'] = cashPrize;
            return BonusDetails.BambooGrove(bonusData);
          }
          case "piedradelsol": {
            let bonusData: {isFinish: boolean; bonuswheel_level: number; bonuswheel_position: number; bonuswheel_price: number; jackpot_price: number; bonusWin: string;} = row.data.feature;
            let currency: string = this.props.metadata.currency;
            let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;
            const bet = (row.bet || (row.data && row.data.bet)) || null;
            const price = bonusData.jackpot_price || bonusData.bonuswheel_price;
            const jackpotPrice = this.generaterateWinDisplay(true, price, bet);
            const bonusWin = `${format} ${jackpotPrice}`;
            bonusData['bonusWin'] = bonusWin;
            return BonusDetails.PiedraDelSol(bonusData);
          }
          //anime
          case 'akb48v2':
          case 'pva10v2':
          case 'tgndv2':
          case 'sextalev2': {
            let currency = this.props.metadata.currency;
            let win: any = '';
            if (row.data.bonusGame === 2) {
              win = formatNumberData(row.data.realCurrentWin);
              return BonusDetails.SexTale(FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`);
            } else {
              win = row.win;
              return BonusDetails.SexTaleSecond(FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`, row.data.items, row.data.finished);
            }
          }
          //anime
          case 'gemshunterv2':
          case 'gemshunter2v2': {
            let currency = this.props.metadata.currency;
            let win = formatNumberData(row.data.realCurrentWin);
            let winStr = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`;
            return BonusDetails.SexTale(winStr);
          }
        }
      }
    }
    return <h1>No such bonus in config</h1>
  }

  needToShowRowExtension(record: any) {
    let row = record.data ? record.data : record;
    let winLines: any[] = [];
    if (row.winscatter && row.winpos) {
      winLines = [...row.winscatter, ...row.winpos]; // .filter(l => (!(l.Line && l.win && l.Line === 0 && l.win === 0)));
    }
    if (row.pseudo) {
      winLines = [...winLines, ...row.pseudo]
    }
    if (row.winpos2) {
      winLines = [...winLines, ...row.winpos2]
    }
    winLines = this.removeZeroLineWithNoWin(winLines);
    return winLines.length > 0
  }

  setRowClassName = (record: any): string => {
    let row = record.data ? record.data : record;
    if ((row.winscatter && row.winpos) || (row.winpos2)) {
      return !this.needToShowRowExtension(record) ? 'hide-expanded-icon' : '';
    } else {
      return 'hide-expanded-icon';
    }
  };

  isBonusDetails = (row: any) => {
    let gameName = this.getGameServerNameById(row.gameId);
    let id_fs = row.id_fs;
    return (
      (row.cmd === 'bonus' && gameName === 'booksofgiza' && id_fs && [10].indexOf(id_fs) > -1) ||
      (row.cmd === 'bonus' && gameName === 'bookoflight' && id_fs && [1].indexOf(id_fs) > -1) ||
      (row.cmd === 'bonus' && gameName === 'piedradelsol' && id_fs && [1, 3].indexOf(id_fs) > -1) ||
      (row.cmd === 'bonus' && gameName === 'bamboogrove' && id_fs && [2, 3].indexOf(id_fs) > -1) ||
      (row.cmd === 'bonus' && gameName === 'wildjustice' && id_fs && [2, 3, 4].indexOf(id_fs) > -1) ||
      (row.cmd === 'bonus' && gameName === 'hallowin' && id_fs && [6, 7].indexOf(id_fs) > -1) ||
      (row.cmd === 'bonus' && gameName === 'coincharge' && id_fs && [4].indexOf(id_fs) > -1) ||
      (row.cmd === 'bonus' && gameName === 'mightofzeus') ||
      (row.cmd === 'bonus' && (typeof row.all === 'undefined'))
    );
  };

  isError = (row: any) => {
    return row.cmd === 'error';
  };

  renderErrorDetail(row: any) {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.ERROR_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.ERROR_ID as any)[lang]}</strong> {row.error_id}</p>
        <p><strong>{(localization.ERROR_DESCRIPTION as any)[lang]}</strong> {row.error_description}</p>
      </div>
    )
  }

  hasStaticMp(row: any) {
    let gameName = this.getGameServerNameById(row.gameId);
    return ['pirateslegacy'].indexOf(gameName) > -1 ? true : false;
  }

  renderMultiplier(row: any, value: any) {
    let feature = row.feature;
    const data = row.data;

    if (this.hasStaticMp(row)) return value || 1;

    return (
      (feature && feature.freespin_multiplier) ||
      (data && data.feature && data.feature.multiplier) ||
      (feature && feature.multiplier) ||
      (data && data.feature && data.feature.nudging_wild) ||
      (feature && feature.fullScreenMultiplier && 2) ||
      value ||
      1
    )

  }

  pageToGoBack = () => {
    let userId = (this.props.match.params as any).id;
    let platform = getParameterByName('platform', this.props.location.search);
    let size = getParameterByName('size', this.props.location.search) || 10;
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let page = this.props.prevPage && this.props.prevPage.historyDetails ?
      this.props.prevPage.historyDetails : `${(roles as any)[role].route}${(roles as any)[role].children.HISTORY_LIST}/${userId}?page=1&size=${size}&platform=${platform}`;
    this.props.history.push(page)
  };

  getBonusTypeById(gameId: number, bonusId?: number, id_fs?: number): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === gameId) {
        if (!item.bonus)
          break;
        for (let j = 0; j < item.bonus.length; j++) {
          let bonus = item.bonus[j];
          if (bonusId && (bonus.bonusId === bonusId)) {
            return bonus.type
          } else if ((id_fs || id_fs === 0) && (bonus.id_fs === id_fs)) {
            return bonus.type
          }
        }
      }
    }
    return 'bonus'
  }

  getSpecialFeature(gameId: number, feature: any, actionType: any, row: any): any {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === gameId) {
        switch (item.serverName) {
          case 'dynastywarriors': {

            const hasJackpot = feature && feature.jackpot;
            const hasGoldenSpin = feature && feature.bonus_fs && feature.bonus_fs === 1;
            const hasRetrigger = row.data && row.data.addedSpins && row.data.addedSpins === 8;
            const hasBonus = row.cmd && row.cmd === 'bonus';
            const hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;
            const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;

            // feature: {multiplier_wild: 3, multiplier_scatter: 5, bonus_spin: 1, bonus_collected: 3} - golden spin

            if (hasGoldenSpin && hasJackpot && hasRetrigger) {

              let jackpotName = feature.jackpot.toLowerCase();
              const mpWild = feature.multiplier_wild;
              const mpScatter = feature.multiplier_scatter;

              return <div>
                <span>golden spin</span><br/>
                <span className={'gift-count-badge'}>{`+ retrigger`}</span><br/>
                <span className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x${mpWild}`}</span><br/>
                <span className={'gift-count-badge'}>{`Scatter pays x${mpScatter}`}</span>
              </div>;
            }
            if (hasGoldenSpin && hasJackpot) {

              let jackpotName = feature.jackpot.toLowerCase();
              const mpWild = feature.multiplier_wild;
              const mpScatter = feature.multiplier_scatter;

              return <div>
                <span>golden spin</span><br/>
                <span className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x${mpWild}`}</span><br/>
                <span className={'gift-count-badge'}>{`Scatter pays x${mpScatter}`}</span>
              </div>;
            }
            if (hasGoldenSpin && hasRetrigger) {

              const mpWild = feature.multiplier_wild;
              const mpScatter = feature.multiplier_scatter;

              return <div>
                <span>golden spin</span><br/>
                <span className={'gift-count-badge'}>{`+ retrigger`}</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x${mpWild}`}</span><br/>
                <span className={'gift-count-badge'}>{`Scatter pays x${mpScatter}`}</span>
              </div>;
            }
            if (hasBonus && hasJackpot && hasRetrigger) {
              let jackpotName = feature.jackpot.toLowerCase();
              return <div>
                <span>free spin</span><br/>
                <span className={'gift-count-badge'}>{`+ retrigger`}</span><br/>
                <span className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x2`}</span><br/>
              </div>;
            }
            if (hasBonus && hasJackpot) {
              let jackpotName = feature.jackpot.toLowerCase();
              return <div>
                <span>free spin</span><br/>
                <span className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x2`}</span><br/>
              </div>;
            }
            if (hasFsFeature && hasJackpot) {
              let jackpotName = feature.jackpot.toLowerCase();
              return <div>
                <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
                <span className={'gift-count-badge'}>{`+ free spin feature`}</span><br/>
                <span className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span><br/>
              </div>;
            }
            if (hasFsFeature) {
              return <span>{hasGift ? 'gift spin' : 'spin'}<span
              className={'gift-count-badge'}>{`+ free spin feature`}</span></span>;
            }
            if (hasJackpot){
              let jackpotName = feature.jackpot.toLowerCase();
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span></span>;
            };
            if (hasGoldenSpin) {

              const mpWild = feature.multiplier_wild;
              const mpScatter = feature.multiplier_scatter;

              return <div>
                <span>golden spin</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x${mpWild}`}</span><br/>
                <span className={'gift-count-badge'}>{`Scatter pays x${mpScatter}`}</span>
              </div>;
            };
            if (hasRetrigger) {
              return <div>
                <span>free spin</span><br/>
                <span className={'gift-count-badge'}>{`+ retrigger`}</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x2`}</span><br/>
              </div>;
            };
            if (hasBonus) {
              return <div>
                <span>free spin</span><br/>
                <span className={'gift-count-badge'}>{`Wild pays x2`}</span><br/>
              </div>;
            }

            break;
          };
          case 'dajidali': {
            if (feature && feature.jackpot){
              let jackpotName = feature.jackpot.toLowerCase();
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span></span>;
            }
            break;
          };
          case 'dragonselement':
          case 'chinesetigers': {
            if (feature && feature.jackpot){
              let jackpotName = feature.jackpot == "MINI"?"minor":feature.jackpot.toLowerCase();
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span></span>;
            }
            break;
          }
          case 'rhinomania': {
            if (feature && feature.ultimate_bonus)
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ultimate bonus`}</span></span>;
            break;
          }
          case 'azteccoins': {
            if (feature && feature.jackpot){
              let jackpotName = feature.jackpot.toLowerCase();
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${jackpotName} jackpot`}</span></span>;
            }
            break;
          }
          case 'wildspin': {
            if (feature && feature.bonuswheel_price){
              let currency: string = this.props.metadata.currency;
              let bonusWheelWin = formatNumberData(feature.bonuswheel_price * this.props.metadata.bet);
              let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${bonusWheelWin}` : `${bonusWheelWin} ${currency}`;
              let jackpots: string[] = feature.jackpots ? feature.jackpots : [];
              return <div>
                <span>{actionType}</span><br/>
                <span className={'gift-count-badge'}>{`+ ${format} Jackpot Feature win`}</span><br/>
                {jackpots.map(j => <span key={j} className={'gift-count-badge'}>{`${j}`}<br/></span>)}
              </div>;
            }
            break;
          }
          case 'jackpotlab': {
            if (feature && feature.bonuswheel_price){
              let currency: string = this.props.metadata.currency;
              let bonusWheelWin = formatNumberData(feature.bonuswheel_price * this.props.metadata.bet);
              let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${bonusWheelWin}` : `${bonusWheelWin} ${currency}`;
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${format} wheel win`}</span></span>;
            }
            break;
          }
          case 'piratesmap': {
            if (feature && feature.collected){
              let bet = (row.bet || (row.data && row.data.bet)) || null;
              let currency: string = this.props.metadata.currency;
              let bonusWheelWin = formatNumberData(feature.collected * bet* this.getGameTotalLinesById(gameId));
              let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${bonusWheelWin}` : `${bonusWheelWin} ${currency}`;
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${format} collected`}</span></span>;
            }
            break;
          }
          case 'caishensgifts': {
            if (feature && feature.hongbao){
              let bet = (row.bet || (row.data && row.data.bet)) || null;
              let currency: string = this.props.metadata.currency;
              //for games with ways line count is 50
              let linesNumber = 25/*this.getGameTotalLinesById(gameId)*/;
              let featureWin = formatNumberData(feature.hongbao * bet* linesNumber);
              let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${featureWin}` : `${featureWin} ${currency}`;
              return <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${format} hongbao win`}</span></span>;
            }
            break;
          }
        }
      }
    }
    return actionType;
  }

  generaterateWinDisplay(hasFeature: boolean, jackpotPrice: number, bet: number) {
    let winDisplay = hasFeature ? shortFormatNumber(roundValue(jackpotPrice * bet * this.getGameTotalLinesById(this.props.metadata.gameId))) : 0;
    return +winDisplay < 1000 ?  parseFloat(Number(winDisplay).toFixed(2)) : winDisplay;

  }

  pretifyWinDisplay(win: number) {
    return shortFormatNumber(Math.round(win * 100) / 100);
  }

  getCurrencyFormatWin() {
    const currency: string = this.props.metadata.currency;
    return FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;
  }

  getBet(row: any) {
    return (row.bet || (row.data && row.data.bet)) || null;
  }

  renderJackpots(row: any) {
    let game = ALL_GAMES.filter(g => parseInt(g.id) === row.gameId)[0];
    const lines = game.lines ? game.lines : 0;
    const jackpots = row.feature && row.feature.jackpot;
    const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};
    const format = this.getCurrencyFormatWin();
    const bet = this.getBet(row);
    return <>
      {
        jackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
                return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(jackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
              })) : null
      }
    </>
  }

  handleSpin(actionType: any, row: any, metadata: any) {
    let game = ALL_GAMES.filter(g => parseInt(g.id) === row.gameId)[0];
    const lines = game.lines ? game.lines : 0;

    if (game.isNew) {
      return GameHelper.handleSpin(row, game['bonus'], game['buy'], this.props.metadata);
    }

    switch (game.serverName) {
      case 'thousandonespins':
      case 'lordofthesun':
      case 'hotfruitsmostbet':
      case 'hotfruits':
      case 'wealthofwisdom':
      case 'hawaiiannight':
      case 'santasbag':
      case 'royallotus':
      case 'chillifiesta': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;
        let hasRespinFeature = false;
        if (game.serverName === 'thousandonespins') {
          let hasAdditionalRespinsInFs = row.wheelsValues && row.wheelsValues.filter((v: number) => (v > 0)).length >= 6;
          hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;
          hasRespinFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && (row.bonus.bonusId === 1 || hasAdditionalRespinsInFs);
        }

        const hasJackpot = row.feature && row.feature.jackpot;
        const hasJackpots = row.feature && row.feature.jackpots;
        const goldenSunPrice = row.feature && row.feature.goldensun_price;

        let jackpotName = hasJackpot && row.feature.jackpot.toLowerCase();

        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.feature['jackpot_price'] ? row.feature.jackpot_price : 0;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);
        const goldenSunWinDisplay = this.generaterateWinDisplay(goldenSunPrice, goldenSunPrice, bet);

        //santasbag, lordofthesun
        const jackpots = hasJackpots;

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasRespinFeature ? <span className={'gift-count-badge'}>{`+ Respin feature`}</span> : null}
          { hasRespinFeature ? <br/> : null }
          { goldenSunPrice ? <span className={'gift-count-badge'}>{`+ ${format} ${goldenSunWinDisplay} Golden Sun feature`}</span> : null }
          { goldenSunPrice ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${jackpotWinDisplay} ${jackpotName} jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'mightofzeus': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasBonusFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;
        const spinOfZeusPrice = row.feature && row.feature.supper_win;
        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const spinOfZeusWinDisplay = this.generaterateWinDisplay(spinOfZeusPrice, spinOfZeusPrice, bet);

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBonusFeature ? <span className={'gift-count-badge'}>{`+ bonus feature`}</span> : null}
          { hasBonusFeature ? <br/> : null }
          { spinOfZeusPrice ? <span className={'gift-count-badge'}>{`+ ${format} ${spinOfZeusWinDisplay} Spin of Zeus feature`}</span> : null }
          { spinOfZeusPrice ? <br/> : null }
        </div>
      }
      case 'guisesofdracula': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;

        const hasJackpot = row.feature && row.feature.jackpot;
        const hasJackpots = row.feature && row.feature.jackpots;
        const floatingWildsWin = row.feature && row.feature.floatingWilds_win;

        let jackpotName = hasJackpot && row.feature.jackpot.toLowerCase();

        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.feature['jackpot_price'] ? row.feature.jackpot_price : 0;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);
        const floatingWildsWinDisplay = this.pretifyWinDisplay(floatingWildsWin);

        //santasbag, lordofthesun
        const jackpots = hasJackpots;

        let overload = (row.overload || (row.data && row.data.overload)) || null;
        const floatingWilds = row.feature.floatingWilds;
        const curWilds = floatingWilds.filter((i: any) => i.bet === bet*100);
        const wilds = curWilds[0].wilds
          .map((cur: any) => (cur['hasPrize'] = overload[cur.reelId * 4 + cur.rowId] === 13, cur))
          .filter((i: any) => i.hasPrize === true);

        const wildsMP = wilds.filter((i: any) => i.type === 3);
        const wildsFS = wilds.filter((i: any) => i.type === 4);
        const countMP = wildsMP.reduce((acc: any, cur: any) => (acc = acc + cur.prize, acc), 0);
        const countFS = wildsFS.reduce((acc: any, cur: any) => (acc = acc + cur.prize, acc), 0);

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ ${countFS} free spins`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { floatingWildsWin ? <span className={'gift-count-badge'}>{`+ ${format} ${floatingWildsWinDisplay} Shifting Guises feature`}</span> : null }
          { floatingWildsWin ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${format} ${jackpotWinDisplay} ${jackpotName} Jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
          { countMP ? <span className={'gift-count-badge'}>{`including x${countMP} Multiplier`}</span> : null }
          { countMP ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`including ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} Jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'bamboogrove': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;

        let hasBonusFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;

        const hasJackpot = row.feature && row.feature.jackpot;
        const hasJackpots = row.feature && row.feature.jackpots;

        let jackpotName = hasJackpot && row.feature.jackpot.toLowerCase();

        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.feature['jackpot_price'] ? row.feature.jackpot_price : 0;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);

        //santasbag, lordofthesun
        const jackpots = hasJackpots;

        // let currency: string = this.props.metadata.currency;
        // let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasBonusFeature ? <span className={'gift-count-badge'}>{`+ Bonus Wheel feature`}</span> : null}
          { hasBonusFeature ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${jackpotWinDisplay} ${jackpotName} jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'leprechauns': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasBuyBonusFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;
        let hasFsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;
        let hasAdditionalRespinsInFs = row.wheelsValues && row.wheelsValues.filter((v: number) => (v > 0)).length >= 6;
        let hasRespinFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && (row.bonus.bonusId === 1 || hasAdditionalRespinsInFs);

        const hasJackpot = row.feature && row.feature.jackpot;
        const hasJackpots = row.feature && row.feature.jackpots;

        let jackpotName = hasJackpot && row.feature.jackpot.toLowerCase();

        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.feature['jackpot_price'] ? row.feature.jackpot_price : 0;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);

        //santasbag, lordofthesun
        const jackpots = hasJackpots;

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyBonusFeature ? <span className={'gift-count-badge'}>{`+ Buy Bonus feature`}</span> : null}
          { hasBuyBonusFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasRespinFeature ? <span className={'gift-count-badge'}>{`+ Lucky Respins feature`}</span> : null}
          { hasRespinFeature ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${jackpotWinDisplay} ${jackpotName} jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'wildjustice': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && [1, 4].indexOf(row.bonus.bonusId) > -1;
        let hasBonusFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && [2, 4].indexOf(row.bonus.bonusId) > -1;

        const wildBountyFeatureWin = row.feature && row.feature.repeat_pay;
        const wildBountyFeatureWinDisplay = formatNumberData(wildBountyFeatureWin);

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBonusFeature ? <span className={'gift-count-badge'}>{`+ Jackpot feature`}</span> : null}
          { hasBonusFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { wildBountyFeatureWin ? <span className={'gift-count-badge'}>{`+ ${format} ${wildBountyFeatureWinDisplay} Wild Bounty feature`}</span> : null }
          { wildBountyFeatureWin ? <br/> : null }
        </div>;
      }
      case 'ninegems':
      case 'poshcats':
      case 'undiademuertos': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;

        const hasJackpot = row.feature && row.feature.jackpot;
        let jackpotName = hasJackpot && row.feature.jackpot.toUpperCase();
        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.feature['jackpot_price'] ? row.feature.jackpot_price : 0;
        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${format} ${jackpotWinDisplay} ${jackpotName} Jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
        </div>;
      }
      case 'cosmocrowns':
      case 'betfurycrowns':
      case 'goodmancrowns':
      case 'skycrown':
      case 'pirateslegacy':
      case 'bookoflight':
      case 'wildcrowns':
      case 'diamondhunt':
      case 'littlewitchy': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasBuyBonusFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;
        let hasFsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;
        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyBonusFeature ? <span className={'gift-count-badge'}>{`+ Buy Bonus feature`}</span> : null}
          { hasBuyBonusFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { this.renderJackpots(row) }
        </div>;
      }
      case 'catchtheleprechaun': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasBuyBonusFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;
        let hasFsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyBonusFeature ? <span className={'gift-count-badge'}>{`+ Buy Bonus feature`}</span> : null}
          { hasBuyBonusFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { GameHelper.hasFeatureWin(row) ? <span className={'gift-count-badge'}>{GameHelper.getCatchTheLeprechaunFeatureWinText(row)}</span> : null}
          { GameHelper.hasFeatureWin(row) ? <br/> : null }
          { this.renderJackpots(row) }
        </div>;
      }
      case 'frozenmirror': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasBuyFsFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && [2].indexOf(row.bonus.bonusId) > -1;
        let hasBuyMrFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && [1].indexOf(row.bonus.bonusId) > -1;
        const hasBuyBonusFeature = hasBuyFsFeature || hasBuyMrFeature;
        let hasFsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;
        const hasMrFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.feature && row.feature.luckybreak_win;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyFsFeature ? <span className={'gift-count-badge'}>{`+ Buy Free Spins feature`}</span> : null}
          { hasBuyFsFeature ? <br/> : null }
          { hasBuyMrFeature ? <span className={'gift-count-badge'}>{`+ Buy Mirror Reflection feature`}</span> : null}
          { hasBuyMrFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasMrFeature ? <span className={'gift-count-badge'}>{`+ Mirror Reflection feature`}</span> : null}
          { hasMrFeature ? <br/> : null }
        </div>;
      }
      case 'coinfest':
      case 'waysofthegauls':
      case 'jokerchase': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasBuyFsFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && [2].indexOf(row.bonus.bonusId) > -1;
        let hasBuyRsFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && [1].indexOf(row.bonus.bonusId) > -1;
        const hasBuyBonusFeature = hasBuyFsFeature || hasBuyRsFeature;
        let hasFsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;
        let hasAdditionalRsInFs = row.wheelsValues && row.wheelsValues.filter((v: number) => (v > 0)).length >= 6;
        const hasRsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && (row.bonus.bonusId === 1 || hasAdditionalRsInFs);
        const hasJackpots = row.feature && row.feature.jackpots;
        const jackpots = hasJackpots;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};
        const bet = (row.bet || (row.data && row.data.bet)) || null;
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyFsFeature ? <span className={'gift-count-badge'}>{`+ Buy Free Spins feature`}</span> : null}
          { hasBuyFsFeature ? <br/> : null }
          { hasBuyRsFeature ? <span className={'gift-count-badge'}>{`+ Buy Respins feature`}</span> : null}
          { hasBuyRsFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasRsFeature ? <span className={'gift-count-badge'}>{`+ Respins feature`}</span> : null}
          { hasRsFeature ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'pearlsoftheocean': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        const hasBonusId = row.cmd && (['spin', 'gift spin'].indexOf(row.cmd) > -1) && row.bonus && row.bonus.bonusId;
        const hasBuyId = row['buyId'];
        const hasBonuspos = hasBonusId && row['bonuspos'] && row.bonuspos.length;
        const hasFsId = hasBonusId && [2].indexOf(row.bonus.bonusId) > -1;
        const hasRsId = hasBonusId && [1].indexOf(row.bonus.bonusId) > -1;
        const hasBuyFs = hasBuyId && hasFsId;
        const hasRs = !hasBuyFs && hasRsId;
        const hasFs = !hasBuyFs && (hasFsId || (hasRsId && hasBonuspos));

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyFs ? <span className={'gift-count-badge'}>{`+ Buy Free Spins feature`}</span> : null}
          { hasBuyFs ? <br/> : null }
          { hasFs ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFs ? <br/> : null }
          { hasRs ? <span className={'gift-count-badge'}>{`+ Respins feature`}</span> : null}
          { hasRs ? <br/> : null }
        </div>;
      }
      case 'thebigscore':
      case 'xmasavalanche':
      case 'extragems': {
        // CascadeBonusId = 1;
        // FsBonusId = 2;
        // CascadeInFsBonusId = 3;
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        const hasBonusId = row.cmd && (['spin', 'gift spin'].indexOf(row.cmd) > -1) && row.bonus && row.bonus.bonusId;
        const hasBuyId = row['buyId'];
        const hasFsId = hasBonusId && [2].indexOf(row.bonus.bonusId) > -1;
        const hasRsId = hasBonusId && [1].indexOf(row.bonus.bonusId) > -1;
        const hasBuyFs = hasBuyId;
        const hasRs = !hasBuyFs && hasRsId;
        const hasFs = !hasBuyFs && hasFsId;
        const hasWinLimit = row.feature && row.feature.WinLimit && row.feature.WinLimit === 5000;
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;
        const totalBet = metadata.bet;
        const winLimitValue = shortFormatNumber(5000 * totalBet);

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyFs ? <span className={'gift-count-badge'}>{`+ Buy Bonus feature`}</span> : null}
          { hasBuyFs ? <br/> : null }
          { hasFs ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFs ? <br/> : null }
          { hasRs ? <span className={'gift-count-badge'}>{`+ cascade`}</span> : null}
          { hasRs ? <br/> : null }
          { hasWinLimit ? <span className={'gift-count-badge'}>{`+ ${format} ${winLimitValue} win limit`}</span> : null}
          { hasWinLimit ? <br/> : null }
        </div>;
      }
      case 'piedradelsol': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasFsFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;
        let hasBuyBonusFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;
        let hasBonusFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;

        const hasJackpot = row.feature && row.feature.jackpot;
        const hasJackpots = row.feature && row.feature.jackpots;

        let jackpotName = hasJackpot && row.feature.jackpot.toLowerCase();

        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.feature['jackpot_price'] ? row.feature.jackpot_price : 0;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);

        //santasbag, lordofthesun
        const jackpots = hasJackpots;

        // let currency: string = this.props.metadata.currency;
        // let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyBonusFeature ? <span className={'gift-count-badge'}>{`+ Buy Bonus feature`}</span> : null}
          { hasBuyBonusFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasBonusFeature ? <span className={'gift-count-badge'}>{`+ Bonus Wheel feature`}</span> : null}
          { hasBonusFeature ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${jackpotWinDisplay} ${jackpotName} jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'ninedragonkings': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasRespinFeature = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 1;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasRespinFeature ? <span className={'gift-count-badge'}>{`+ Respin feature`}</span> : null}
          { hasRespinFeature ? <br/> : null }
        </div>;
      }
      case 'hallowin': {
        const hasGift = row.cmd && row.cmd === 'gift spin' && row.bonus_spin;
        let hasBuyFsFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && [2].indexOf(row.bonus.bonusId) > -1;
        let hasBuyRsFeature = row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId && [1].indexOf(row.bonus.bonusId) > -1;
        const hasBuyBonusFeature = hasBuyFsFeature || hasBuyRsFeature;
        let hasFsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && row.bonus.bonusId === 2;
        let hasAdditionalRsInFs = row.wheelsValues && row.wheelsValues.filter((v: number) => (v > 0)).length >= 6;
        const hasRsFeature = !hasBuyBonusFeature && row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId && (row.bonus.bonusId === 1 || hasAdditionalRsInFs);
        const hasJackpots = row.feature && row.feature.jackpots;
        const jackpots = hasJackpots;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};
        const bet = (row.bet || (row.data && row.data.bet)) || null;
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{hasGift ? 'gift spin' : 'spin'}</span><br/>
          { hasBuyFsFeature ? <span className={'gift-count-badge'}>{`+ Buy Free Spins feature`}</span> : null}
          { hasBuyFsFeature ? <br/> : null }
          { hasBuyRsFeature ? <span className={'gift-count-badge'}>{`+ Buy Spooky Spins feature`}</span> : null}
          { hasBuyRsFeature ? <br/> : null }
          { hasFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null}
          { hasFsFeature ? <br/> : null }
          { hasRsFeature ? <span className={'gift-count-badge'}>{`+ Spooky Spins feature`}</span> : null}
          { hasRsFeature ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
    }
    return actionType;
  }

  handleBonus(actionType: any, row: any, metadata: any) {
    let game = ALL_GAMES.filter(g => parseInt(g.id) === row.gameId)[0];
    let bet = (row.bet || (row.data && row.data.bet)) || null;
    const lines = game.lines ? game.lines : 0;

    if (game.isNew) {
      return GameHelper.handleBonus(row, game['bonus'], game['id_fs'], this.props.metadata);
    }

    switch (game.serverName) {
      case 'thousandonespins':
      case 'lordofthesun':
      case 'wealthofwisdom':
      case 'hawaiiannight':
      case 'santasbag':
      case 'royallotus':
      case 'chillifiesta': {
        const addedSpins = row.data && row.data.addedSpins;
        const hasJackpot = row.data && row.data.feature && row.data.feature.jackpot;
        const hasJackpots = row.data && row.data.feature && row.data.feature.jackpots;
        const hasChristmasGift = row.data && row.data.feature && row.data.feature.christmas_gift;
        const goldenSunPrice = row.data && row.data.feature && row.data.feature.goldensun_price;

        const jackpotName = hasJackpot && row.data.feature.jackpot.toLowerCase();
        //santasbag, lordofthesun
        const jackpots = hasJackpots;

        const jackpotPrice = hasJackpot && row.data.feature['jackpot_price'] ? row.data.feature.jackpot_price : 0;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);
        const christmasGiftDisplay = this.generaterateWinDisplay(hasChristmasGift, hasChristmasGift, bet);
        const goldenSunWinDisplay = this.generaterateWinDisplay(goldenSunPrice, goldenSunPrice, bet);

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        let hasFreespins = true;
        let hasRespins = false;
        let isRespin = false;
        let addedFs = addedSpins;
        let addedRs = addedSpins;

        if (game.serverName === 'thousandonespins') {

          // private const int RsBonusId = 1;
          // private const int FsBonusId = 2;
          // private const int RsInFsBonusId = 3;
          // private const int RsAfterFsBonusId = 4;
          // private const int RsInFsAndExtraFsBonusId = 5;

          let hasRsInFs = row.data && row.data.wheelsValues && row.data.wheelsValues.filter((v: number) => (v > 0)).length >= 6;
          let hasFsInFs = row.data && row.data.wheels && row.data.wheels.filter((v: number) => (v === 1)).length >= 3;
          hasFreespins = hasFsInFs;
          hasRespins = row.data && row.data.bonus && row.data.bonus.bonusId && (row.data.bonus.bonusId === 1 || hasRsInFs);
          isRespin = row.id_fs && ([1,3,4,5].indexOf(row.id_fs) > -1);

          if (hasRespins && hasFreespins) {
            addedFs = 8;
            addedRs = 3;
          }

        };

        return <div>
          <span>{isRespin ? 'respin' : 'free spin'}</span><br/>
          { addedSpins && hasFreespins ? <span className={'gift-count-badge'}>{`+ ${addedFs} free spin${addedFs === 1 ? `` : `s`}`}</span> : null }
          { addedSpins && hasFreespins ? <br></br> : null }
          { addedSpins && hasRespins ? <span className={'gift-count-badge'}>{`+ ${addedRs} respin${addedRs === 1 ? `` : `s`}`}</span> : null }
          { addedSpins && hasRespins ? <br></br> : null }
          { hasChristmasGift ? <span className={'gift-count-badge'}>{`+ ${christmasGiftDisplay} Christmas gift bonus`}</span> : null}
          { hasChristmasGift ? <br/> : null }
          { goldenSunPrice ? <span className={'gift-count-badge'}>{`+ ${format} ${goldenSunWinDisplay} Golden Sun feature`}</span> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${jackpotWinDisplay} ${jackpotName} jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'guisesofdracula': {
        const addedSpins = row.data && row.data.addedSpins;
        const hasJackpots = row.data && row.data.feature && row.data.feature.jackpots;
        const floatingWildsWin = row.data && row.data.feature && row.data.feature.floatingWilds_win;
        const floatingWildsWinDisplay = this.pretifyWinDisplay(floatingWildsWin);


        const jackpots = hasJackpots;
        let overload = (row.overload || (row.data && row.data.overload)) || null;
        const floatingWilds = row.data && row.data.feature && row.data.feature.floatingWilds_fs;
        const wilds = floatingWilds
          .map((cur: any) => (cur['hasPrize'] = overload[cur.reelId * 4 + cur.rowId] === 13, cur))
          .filter((i: any) => i.hasPrize === true);

        const wildsMP = wilds.filter((i: any) => i.type === 3);
        //const wildsFS = wilds.filter((i: any) => i.type === 4);
        const countMP = wildsMP.reduce((acc: any, cur: any) => (acc = acc + cur.prize, acc), 0);
        //const countFS = wildsFS.reduce((acc: any, cur: any) => (acc = acc + cur.prize, acc), 0);

        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};


        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        let addedFs = addedSpins;

        return <div>
          <span>{'free spin'}</span><br/>
          { addedSpins ? <span className={'gift-count-badge'}>{`+ ${addedFs} extra Free Spin${addedFs === 1 ? `` : `s`}`}</span> : null }
          { addedSpins ? <br></br> : null }
          { floatingWildsWin ? <span className={'gift-count-badge'}>{`+ ${format} ${floatingWildsWinDisplay} Shifting Guises feature`}</span> : null }
          { floatingWildsWin ? <br/> : null }
          { countMP ? <span className={'gift-count-badge'}>{`including x${countMP} Multiplier`}</span> : null }
          { countMP ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`including ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'bamboogrove': {
        const addedSpins = row.data && row.data.addedSpins;
        let isBonus = row.id_fs && [2, 3].indexOf(row.id_fs) > -1;
        let hasBonusFeature = row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 2;
        let hasFreeSpinsFeature = addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 1;

        return <div>
          <span>{isBonus ? 'bonus' : 'free spin'}</span><br/>
          { hasFreeSpinsFeature ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { hasFreeSpinsFeature ? <br></br> : null }
          { hasBonusFeature ? <span className={'gift-count-badge'}>{`+ Bonus Wheel feature`}</span> : null }
        </div>;
      }
      case 'leprechauns': {
        const addedSpins = row.data && row.data.addedSpins;
        const hasJackpot = row.data && row.data.feature && row.data.feature.jackpot;
        const hasJackpots = row.data && row.data.feature && row.data.feature.jackpots;

        const jackpotName = hasJackpot && row.data.feature.jackpot.toLowerCase();
        //santasbag, lordofthesun
        const jackpots = hasJackpots;

        const jackpotPrice = hasJackpot && row.data.feature['jackpot_price'] ? row.data.feature.jackpot_price : 0;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        let hasFreespins = true;
        let hasRespins = false;
        let isRespin = false;
        let addedFs = addedSpins;
        let addedRs = addedSpins;

        // private const int RsBonusId = 1;
        // private const int FsBonusId = 2;
        // private const int RsInFsBonusId = 3;
        // private const int RsAfterFsBonusId = 4;
        // private const int RsInFsAndExtraFsBonusId = 5;

        let hasRsInFs = row.data && row.data.wheelsValues && row.data.wheelsValues.filter((v: number) => (v > 0)).length >= 6;
        let hasFsInFs = row.data && row.data.wheels && row.data.wheels.filter((v: number) => (v === 1)).length >= 3;
        hasFreespins = hasFsInFs;
        hasRespins = row.data && row.data.bonus && row.data.bonus.bonusId && (row.data.bonus.bonusId === 1 || hasRsInFs);
        isRespin = row.id_fs && ([1,3,4,5].indexOf(row.id_fs) > -1);

        if (hasRespins && hasFreespins) {
          addedFs = 6;
          addedRs = 3;
        }

        return <div>
          <span>{isRespin ? 'respin' : 'free spin'}</span><br/>
          { addedSpins && hasFreespins ? <span className={'gift-count-badge'}>{`+ ${addedFs} free spin${addedFs === 1 ? `` : `s`}`}</span> : null }
          { addedSpins && hasFreespins ? <br></br> : null }
          { addedSpins && hasRespins ? <span className={'gift-count-badge'}>{`+ ${addedRs} respin${addedRs === 1 ? `` : `s`}`}</span> : null }
          { addedSpins && hasRespins ? <br></br> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${jackpotWinDisplay} ${jackpotName} jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'wildjustice': {

        let isBonus = row.id_fs && [2, 3, 4].indexOf(row.id_fs) > -1;
        let hasBonusFeature = row.data && row.data.bonus && row.data.bonus.bonusId && [3].indexOf(row.data.bonus.bonusId) > -1;
        let hasFreeSpinsId = row.data && row.data.bonus && row.data.bonus.bonusId && [1, 3].indexOf(row.data.bonus.bonusId) > -1;
        const wildBountyFeatureWin = row.data && row.data.feature && row.data.feature.repeat_pay;
        const wildBountyFeatureWinDisplay = formatNumberData(wildBountyFeatureWin);

        const addedFreeSpins = hasFreeSpinsId && row.data.bonus.options ? row.data.bonus.options : 0;
        const hasFreeSpinsFeature = hasFreeSpinsId && addedFreeSpins;

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{isBonus ? 'bonus' : 'free spin'}</span><br/>
          { hasBonusFeature ? <span className={'gift-count-badge'}>{`+ Jackpot feature`}</span> : null }
          { hasBonusFeature ? <br/> : null }
          { hasFreeSpinsFeature ? <span className={'gift-count-badge'}>{`+ ${addedFreeSpins} free spin${addedFreeSpins === 1 ? `` : `s`}`}</span> : null }
          { hasFreeSpinsFeature ? <br></br> : null }
          { wildBountyFeatureWin ? <span className={'gift-count-badge'}>{`+ ${format} ${wildBountyFeatureWinDisplay} Wild Bounty feature`}</span> : null }
          { wildBountyFeatureWin ? <br/> : null }
        </div>;
      }
      case 'undiademuertos': {
        const bonusExtraWildFeature = row.data && row.data.feature && row.data.feature.hunt && row.data.feature.hunt === 1;
        const hasJackpot = row.data && row.data.feature && row.data.feature.jackpot;
        let jackpotName = hasJackpot && row.data.feature.jackpot.toUpperCase();
        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.data.feature['jackpot_price'] ? row.data.feature.jackpot_price : 0;
        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{'free spin'}</span><br/>
          { bonusExtraWildFeature ? <span className={'gift-count-badge'}>{`+ Bonus Extra Wild feature`}</span> : null }
          { bonusExtraWildFeature ? <br/> : null }
          { bonusExtraWildFeature ? <span className={'gift-count-badge'}>{`+ 3 extra Free Spins`}</span> : null }
          { bonusExtraWildFeature ? <br></br> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${format} ${jackpotWinDisplay} ${jackpotName} Jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
        </div>;
      }
      case 'cosmocrowns':
      case 'betfurycrowns':
      case 'goodmancrowns':
      case 'skycrown':
      case 'wildcrowns':
      case 'diamondhunt':
      case 'littlewitchy': {
        const addedSpins = row.data && row.data.addedSpins;

        // id_fs
        // FreeSpin = 1,
        // FreeSpinCascade = 2

        const isCascade = row.id_fs && ([2].indexOf(row.id_fs) > -1);
        const hasCascade = row.data && row.data.bonus && row.data.bonus && row.data.bonus.bonusId === 2;

        // wildcrowns
        // const mp = row.data && row.data.feature && row.data.feature.nudging_wild;

        return <div>
          <span>{isCascade ? 'cascade' : 'free spin'}</span><br/>
          { addedSpins ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { addedSpins ? <br></br> : null }
          { hasCascade ? <span className={'gift-count-badge'}>{`+ cascade`}</span> : null }
          { hasCascade ? <br></br> : null }
        </div>;
      }
      case 'frozenmirror': {
        const addedSpins = row.data && row.data.addedSpins;
        const hasJackpots = row.data && row.data.feature && row.data.feature.jackpots;
        const jackpots = hasJackpots;

        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        const isRespin = row.id_fs && ([1,3,4,5].indexOf(row.id_fs) > -1);

        const isMrInFsFeature = row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 3;

        const isFsAdded = !isRespin && addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 2;
        const isMrAdded = isRespin && addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId;

        return <div>
          <span>{isRespin ? 'extra spin' : 'free spin'}</span><br/>
          { isFsAdded ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { isFsAdded ? <br></br> : null }
          { isMrAdded ? <span className={'gift-count-badge'}>{`+ ${addedSpins} extra spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { isMrAdded ? <br></br> : null }
          { isMrInFsFeature ? <span className={'gift-count-badge'}>{`+ Mirror Reflection feature`}</span> : null }
          { isMrInFsFeature ? <br></br> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'waysofthegauls':
      case 'jokerchase': {
        // RsBonusId = 1;
        // FsBonusId = 2;
        // RsInFsBonusId = 3;
        // RsAfterFsBonusId = 4;
        // RsInFsAndExtraFsBonusId = 5;
        const addedSpins = row.data && row.data.addedSpins;
        const hasJackpots = row.data && row.data.feature && row.data.feature.jackpots;
        const jackpots = hasJackpots;
        const hasGrandJackpot = row.data && row.data.wheelsValues && row.data.wheelsValues.indexOf(0) === -1;

        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};

        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        const isRespin = row.id_fs && ([1,3,4,5].indexOf(row.id_fs) > -1);

        const isRsInFsFeature = row.data && row.data.bonus && row.data.bonus.bonusId && ([3,5].indexOf(row.data.bonus.bonusId) > -1) && !isRespin && !hasGrandJackpot;
        const isFsInFsFeature = row.data && row.data.bonus && row.data.bonus.bonusId && ([5].indexOf(row.data.bonus.bonusId) > -1) && !isRespin;

        const isFsAdded = !isRespin && addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 2;
        const isRsAdded = isRespin && addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId;

        return <div>
          <span>{isRespin ? 'respin' : 'free spin'}</span><br/>
          { isFsAdded ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { isFsAdded ? <br></br> : null }
          { isRsAdded ? <span className={'gift-count-badge'}>{`+ ${addedSpins} respin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { isRsAdded ? <br></br> : null }
          { isRsInFsFeature ? <span className={'gift-count-badge'}>{`+ 3 respins`}</span> : null }
          { isRsInFsFeature ? <br></br> : null }
          { isFsInFsFeature ? <span className={'gift-count-badge'}>{`+ 6 free spins`}</span> : null }
          { isFsInFsFeature ? <br></br> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'coinfest': {
        // ReSpinId = 1;
        // FsBonusId = 2;
        // ReSpinInFsBonusId = 3;
        // ReSpinAfterFsBonusId = 4;
        // ReSpinAndFreeSpinInFsId = 5;

        const hasJackpots = row.data && row.data.feature && row.data.feature.jackpots;
        const jackpots = hasJackpots;
        const hasGrandJackpot = row.data && row.data.wheelsValues && row.data.wheelsValues.indexOf(0) === -1;
        const jackpotsPrice = game['jackpotPrice'] ? game.jackpotPrice : {};
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        const isRespin = row.id_fs && ([1,3,4,5].indexOf(row.id_fs) > -1);
        const hasBonusId = row.data && row.data.bonus && row.data.bonus.bonusId;
        const isRsInFsFeature = hasBonusId && ([3,5].indexOf(row.data.bonus.bonusId) > -1) && !isRespin && !hasGrandJackpot;
        const isFsInFsFeature = hasBonusId && ([5].indexOf(row.data.bonus.bonusId) > -1) && !isRespin;
        const isFsAdded = !isRespin && hasBonusId && ([2].indexOf(row.data.bonus.bonusId) > -1);
        const isRsAdded = isRespin && hasBonusId && ([1,3,4,5].indexOf(row.data.bonus.bonusId) > -1);
        const addedFs = isFsAdded ? row.data.bonus.options : 0;
        const addedRs = isRsAdded ? row.data.bonus.options : 0;

        return <div>
          <span>{isRespin ? 'respin' : 'free spin'}</span><br/>
          { isFsAdded ? <span className={'gift-count-badge'}>{`+ ${addedFs} free spin${addedFs === 1 ? `` : `s`}`}</span> : null }
          { isFsAdded ? <br></br> : null }
          { isRsAdded ? <span className={'gift-count-badge'}>{`+ ${addedRs} respin${addedRs === 1 ? `` : `s`}`}</span> : null }
          { isRsAdded ? <br></br> : null }
          { isRsInFsFeature ? <span className={'gift-count-badge'}>{`+ Respins feature`}</span> : null }
          { isRsInFsFeature ? <br></br> : null }
          { isFsInFsFeature ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null }
          { isFsInFsFeature ? <br></br> : null }
          { hasJackpots ? (jackpots.split(',').map((jp: 'MINI'|'MINOR'|'MAJOR'|'MAXI'|'GRAND', i: number) => {
              return <span key={`${jp}_${i}`} className={'gift-count-badge'}>{`+ ${format} ${this.generaterateWinDisplay(hasJackpots, jackpotsPrice[jp] ? jackpotsPrice[jp]/lines : 0, bet)} ${jp} jackpot`}<br/></span>
            })) : null
          }
        </div>;
      }
      case 'pirateslegacy':
      case 'poshcats': {
        const addedSpins = row.data && row.data.addedSpins;
        let hasFreeSpinsFeature = addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 1;
        const hasJackpot = row.data && row.data.feature && row.data.feature.jackpot;
        let jackpotName = hasJackpot && row.data.feature.jackpot.toUpperCase();
        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.data.feature['jackpot_price'] ? row.data.feature.jackpot_price : 0;
        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{'free spin'}</span><br/>
          { hasFreeSpinsFeature ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { hasFreeSpinsFeature ? <br></br> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${format} ${jackpotWinDisplay} ${jackpotName} Jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
        </div>;
      }
      case 'catchtheleprechaun': {
        const addedSpins = row.data && row.data.addedSpins;
        let hasFreeSpinsFeature = addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 1;
        const hasJackpot = row.data && row.data.feature && row.data.feature.jackpot;
        let jackpotName = hasJackpot && row.data.feature.jackpot.toUpperCase();
        const bet = (row.bet || (row.data && row.data.bet)) || null;
        const jackpotPrice = hasJackpot && row.data.feature['jackpot_price'] ? row.data.feature.jackpot_price : 0;
        const jackpotWinDisplay = this.generaterateWinDisplay(hasJackpot, jackpotPrice, bet);
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;

        return <div>
          <span>{'free spin'}</span><br/>
          { hasFreeSpinsFeature ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { hasFreeSpinsFeature ? <br></br> : null }
          { GameHelper.hasFeatureWin(row) ? <span className={'gift-count-badge'}>{GameHelper.getCollectFeatureWinText(row)}</span> : null}
          { GameHelper.hasFeatureWin(row) ? <br/> : null }
          { GameHelper.hasFeatureWinToBank(row) ? <span className={'gift-count-badge'}>{GameHelper.getCatchTheLeprechaunFeatureWinToBankText(row)}</span> : null}
          { GameHelper.hasFeatureWinToBank(row) ? <br/> : null }
          { hasJackpot ? <span className={'gift-count-badge'}>{`+ ${format} ${jackpotWinDisplay} ${jackpotName} Jackpot`}</span> : null }
          { hasJackpot ? <br/> : null }
        </div>;
      }
      case 'bookoflight':
      case 'piedradelsol': {
        const addedSpins = row.data && row.data.addedSpins;
        let isBonus = row.id_fs && [1, 3].indexOf(row.id_fs) > -1;
        let hasBonusFeature = row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 3 && !isBonus;
        let hasFreeSpinsFeature = addedSpins && row.data && row.data.bonus && row.data.bonus.bonusId && row.data.bonus.bonusId === 2;

        return <div>
          <span>{isBonus ? 'bonus' : 'free spin'}</span><br/>
          { hasFreeSpinsFeature ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { hasFreeSpinsFeature ? <br></br> : null }
          { hasBonusFeature ? <span className={'gift-count-badge'}>{`+ Bonus Wheel feature`}</span> : null }
        </div>;
      }
      case 'pearlsoftheocean': {

        /*
          ReSpinId = 1
          FreeSpinId = 2
          FsAfterRsId = 3
          FsAndReSpinId = 4
        */

        const addedSpins = row.data && row.data.addedSpins;
        const isRs = row.id_fs && [1].indexOf(row.id_fs) > -1;

        const hasBonusId = row.data && row.data.bonus && row.data.bonus.bonusId;
        const hasBonuspos = hasBonusId && row.data['bonuspos'] && row.data.bonuspos.length;
        const hasRsId = hasBonusId && [1].indexOf(row.data.bonus.bonusId) > -1
        const hasFsId = hasBonusId && [2].indexOf(row.data.bonus.bonusId) > -1;

        const hasRs = hasRsId;
        const hasFs = (hasFsId && !addedSpins) || (hasRs && hasBonuspos);
        const hasFsAdded = hasFsId && addedSpins;

        return <div>
          <span>{isRs ? 'respin' : 'free spin'}</span><br/>
          { hasFsAdded ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { hasFsAdded ? <br></br> : null }
          { hasFs ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null }
          { hasFs ? <br></br> : null }
          { hasRs ? <span className={'gift-count-badge'}>{`+ ${addedSpins} respin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { hasRs ? <br></br> : null }
        </div>;

      }
      case 'ninedragonkings': {
        return <div>
          <span>{'respin'}</span><br/>
        </div>;
      }
      case 'thebigscore':
      case 'extragems': {
        // CascadeBonusId = 1;
        // FsBonusId = 2;
        // CascadeInFsBonusId = 3;
        const addedSpins = row.data && row.data.addedSpins;
        const isCascade = row.id_fs && ([1, 3].indexOf(row.id_fs) > -1);
        const hasCascade = row.data && row.data.bonus && row.data.bonus.bonusId && [1, 3].indexOf(row.data.bonus.bonusId) > -1;
        const hasFs = row.data && row.data.bonus && row.data.bonus.bonusId && [2].indexOf(row.data.bonus.bonusId) > -1;
        const hasWinLimit = row.data.feature && row.data.feature.WinLimit && row.data.feature.WinLimit === 5000;
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;
        const totalBet = metadata.bet;
        const winLimitValue = shortFormatNumber(5000 * totalBet);

        return <div>
          <span>{isCascade ? 'cascade' : 'free spin'}</span><br/>
          { hasFs ? <span className={'gift-count-badge'}>{`+ ${addedSpins} free spin${addedSpins === 1 ? `` : `s`}`}</span> : null }
          { hasFs ? <br></br> : null }
          { hasCascade ? <span className={'gift-count-badge'}>{`+ cascade`}</span> : null }
          { hasCascade ? <br></br> : null }
          { hasWinLimit ? <span className={'gift-count-badge'}>{`+ ${format} ${winLimitValue} win limit`}</span> : null}
          { hasWinLimit ? <br/> : null }
        </div>;
      }
      case 'xmasavalanche': {
        // CascadeBonusId = 1;
        // FsBonusId = 2;
        // CascadeInFsT1BonusId = 3;
        // CascadeInFsT2BonusId = 4;
        const isCascade = row.id_fs && ([1, 3, 4].indexOf(row.id_fs) > -1);
        const isCascadeMain = row.id_fs && ([1].indexOf(row.id_fs) > -1);
        const hasCascade = row.data && row.data.bonus && row.data.bonus.bonusId && [1, 3, 4].indexOf(row.data.bonus.bonusId) > -1;
        const hasFs = row.data && row.data.bonus && row.data.bonus.bonusId && [2].indexOf(row.data.bonus.bonusId) > -1;
        const hasWinLimit = row.data.feature && row.data.feature.WinLimit && row.data.feature.WinLimit === 5000;
        let currency: string = this.props.metadata.currency;
        let format = FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;
        const totalBet = metadata.bet;
        const winLimitValue = shortFormatNumber(5000 * totalBet);

        return <div>
          <span>{isCascade ? 'cascade' : 'free spin'}</span><br/>
          { hasFs && !isCascadeMain ? <span className={'gift-count-badge'}>{`+ 5 free spins`}</span> : hasFs && isCascadeMain ? <span className={'gift-count-badge'}>{`+ Free Spins feature`}</span> : null }
          { hasFs ? <br></br> : null }
          { hasCascade ? <span className={'gift-count-badge'}>{`+ cascade`}</span> : null }
          { hasCascade ? <br></br> : null }
          { hasWinLimit ? <span className={'gift-count-badge'}>{`+ ${format} ${winLimitValue} win limit`}</span> : null}
          { hasWinLimit ? <br/> : null }
        </div>;
      }
      case 'hallowin': {
        // SpookySpinsBonusId = 1;
        // FsBonusId = 2;
        // SpookySpinsInFsBonusId = 3;
        // SpookySpinsAfterFsBonusId = 4;
        // SpookySpinsInFsAndExtraFsBonusId = 5;
        // JackpotWheelFeatureId = 6;
        // JackpotWheelFeatureInFsId = 7;
        const hasBonusId = row.data && row.data.bonus && row.data.bonus.bonusId;
        const isRespin = row.id_fs && ([1,3,4,5].indexOf(row.id_fs) > -1);
        const isBonus = row.id_fs && ([6,7].indexOf(row.id_fs) > -1);

        const isRsInFsFeature = hasBonusId && ([5,3].indexOf(row.data.bonus.bonusId) > -1) && !isRespin;
        const isFsInFsFeature = hasBonusId && ([5,2].indexOf(row.data.bonus.bonusId) > -1) && !isRespin;
        const isJackpotWheelFeatureId = hasBonusId && ([6,7].indexOf(row.data.bonus.bonusId) > -1);

        return <div>
          <span>{isRespin ? 'spooky spin' : isBonus? 'bonus' : 'free spin'}</span><br/>
          { isJackpotWheelFeatureId ? <span className={'gift-count-badge'}>{`+ Jackpot Wheel feature`}</span> : null }
          { isJackpotWheelFeatureId ? <br /> : null }
          { isRsInFsFeature ? <span className={'gift-count-badge'}>{`+ Spooky Spins feature`}</span> : null }
          { isRsInFsFeature ? <br></br> : null }
          { isFsInFsFeature ? <span className={'gift-count-badge'}>{`+ 5 free spins`}</span> : null }
          { isFsInFsFeature ? <br></br> : null }
        </div>;
      }
    }
    return actionType;
  }

  goToDescriptionInHelp = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    this.props.savePrevPageForHelp(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HELP}#${LINK_HISTORY_DETAILS}`);
  };

  renderWheels(value: string, row: any):any{

    const gameId = row.gameId;
    let gameName = this.getGameServerNameById(gameId);

    if (['waysofthegauls'].indexOf(gameName) > -1) {
      const curRow = row.data ? row.data : row;
      const isRs = [1,3,4,5].indexOf(row.id_fs) > -1;
      const feature = curRow.feature;
      let bet = (row.bet || (row.data && row.data.bet)) || null;
      const wheels = curRow.wheels ? curRow.wheels : [];
      const wheelsValues = curRow.wheelsValues ? curRow.wheelsValues : [];
      const topWheels = curRow.wheels ? [13,20,27] : [];
      const wheelHeight = curRow.wheelHeight ? curRow.wheelHeight : []; // [3, 2, 3, 3, 2];
      const info = curRow.info ? curRow.info : [];
      const symbolOrder = [
        [0,1,2,3,4,5],
        [7,8,9,10,11,12],
        [14,15,16,17,18,19],
        [21,22,23,24,25,26],
        [28,29,30,31,32,33]
      ];
      const wheelsMap = wheelHeight.length ? symbolOrder.map((x,i) => (x=x.slice(0, wheelHeight[i]).map(y=>wheels[y]),x)) : [];
      const wheelsValuesMap = wheelsValues.length ? symbolOrder.map((x,i) => (x=x.slice(0, wheelHeight[i]).map(y=>wheelsValues[y]),x)) : [];
      const infoMap = info.length ? symbolOrder.map((x,i) => (x=x.slice(0, wheelHeight[i]).map(y=>info[y]),x)) : [];

      const symbolTexts = wheelsValuesMap.map((x, i) => {
        return x.map((y,j) => {
          let symbolText = ``;
          const isJackpotFeature = feature && feature.jackpots;
          const isJackpotSymbol = !isJackpotFeature;
          const jackpots = [ 50, 100, 500, 5000];
          const multipliers = [-2, -4, -8, -16];
          const isJpOpened = infoMap.length && infoMap[i][j] > 0;
          const isJP = jackpots.indexOf(y) > -1 && !isJpOpened;
          const isMP = multipliers.indexOf(y) > -1;

          if (isMP) { symbolText = `x${Math.abs(y)}`; }
          if (y > 0) {
            symbolText = shortFormatNumber(roundValue((isJpOpened ? infoMap[i][j] : y) * bet * this.getGameTotalLinesById(this.props.metadata.gameId)));
          }
          if (isJP && isJackpotSymbol) { symbolText = 'j' }
          return symbolText;
        })
      });

      const symbols = wheelsMap.map((x, i) => {
        let a = x.map((y,j) => {
          let symbolPath = ``;
          const isJp = symbolTexts[i][j] === 'j';
          if (isJp) {symbolTexts[i][j] = ``};
          try {
            const symPath = `./img/${gameName}/s${wheelHeight[i]}-${isJp ? 'j' : y}.png`;
            symbolPath = require(`${symPath}`);
          } catch (err) {
            symbolPath = require(`./img/default.png`);
          }
          return symbolPath;
        })
        return a;
      });

      return (
      <div>
        <div className="details_line_div details_wheels" style={{width: '100%'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)'}}>
              <div></div>
              {
                isRs ? <div></div> : topWheels.map((x,i) => <div key={i} className="symbol"><img src={require(`./img/${gameName}/s5-${wheels[x]}.png`)}></img></div>)
              }
              <div></div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)'}}>
              {
                symbols.map((x, i) => {
                  return <div key={`${x}-${i}`} className="column_symbols">
                    {
                      x.map((y,j)=>{
                        const curSymbolText = symbolTexts[i][j] ? symbolTexts[i][j] : ``;
                        const isMp = curSymbolText.indexOf('x') > -1;
                        return <div key={`${i}-${j}`} className="symbol">
                          <img src={y}></img>
                          <span className={ isMp ? "img-text-mp-gold": "img-text-centered-gold"}>{curSymbolText}</span>
                        </div>
                      })
                    }
                  </div>

                })
              }
            </div>
          </div>
        </div>
      </div>);
    } else if (['bookoflight', 'booksofgiza'].indexOf(gameName) > -1) {
      const curRow = row.data ? row.data : row;
      let info = curRow.info ? curRow.info : [];
      const hasExtendedReels = Array.isArray(info) && info.filter((x: number)=> x > 0).length;
      const expandingSymbol = row.data && row.data.feature && row.data.feature.expanding_symbol ? row.data.feature.expanding_symbol : 0;
      let wheels = row.data && row.data.wheels ? row.data.wheels : [];
      wheels = wheels.map((x: number) => x === expandingSymbol ? `${x}_g` : `${x}`);

      return hasExtendedReels ? (
        info = info.map((x: any, i: number) => {
          if (x > 0) {
            return `${x}_g`;
          } else {
            const wheels = row.data && row.data.wheels ? row.data.wheels : [];
            return `${wheels[i]}`;
          }
        }),
        <div>
            <p>Extended Reels</p>
            <div
              style={{display: 'inline-table', lineHeight: '0px'}}
              dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
              this.wheelsView(row.data ? info : value, row)}
            />
            <Divider style={{margin: "10px 0"}}/>
            <p>Base Reels</p>
            <div
              style={{display: 'inline-table', lineHeight: '0px'}}
              dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
              this.wheelsView(row.data ? wheels : value, row)}
            />
          </div>
      ) :
      (<div
            style={{display: 'inline-table', lineHeight: '0px'}}
            dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
            this.wheelsView(row.data ? wheels : value, row)}
          />)
    } else if (['thebigscore'].indexOf(gameName) > -1) {
      return <div
        style={{display: 'inline-table', lineHeight: '0px', marginTop: '13px'}}
        dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
        this.wheelsView(row.data ? row.data.wheels : value, row)}
      />
    } else {

      let pseudo = row.data? row.data.pseudo : row.pseudo;
      let roam = row.data && row.data.feature && row.data.feature.RoamingWilds;

      return(
        roam ?
          <div>
            <p>Reels</p>
            <div
              style={{display: 'inline-table', lineHeight: '0px'}}
              dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
              this.wheelsView(row.data ? row.data.wheels : value, row)}
            />
            <Divider style={{margin: "10px 0"}}/>
            <p>Base Reels</p>
            <div
              style={{display: 'inline-table', lineHeight: '0px'}}
              dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
              this.wheelsView(row.data ? row.data.wheels : value, row, false, true)}
            />
          </div> :
        pseudo ?
          <div>
            <p>Extended Reels</p>
            <div
              style={{display: 'inline-table', lineHeight: '0px'}}
              dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
              this.wheelsView(row.data ? row.data.wheels : value, row)}
            />
            <Divider style={{margin: "10px 0"}}/>
            <p>Base Reels</p>
            <div
              style={{display: 'inline-table', lineHeight: '0px'}}
              dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
              this.wheelsView(row.data ? row.data.wheels : value, row, true)}
            />
          </div>
        :
          <div
            style={{display: 'inline-table', lineHeight: '0px'}}
            dangerouslySetInnerHTML={(value || (row.data && row.data.wheels)) &&
            this.wheelsView(row.data ? row.data.wheels : value, row)}
          />
        )
    }
  }

  slotsColumns(userId: number, currency: string) {
    return (
      [
        {
          title: this.getIdColumnName(),
          dataIndex: 'id',
          sorter: false,
          render: (value: any, row: any, i: number) =>{
            return {
              children: `${value} (${row.tid})`
            }
          }
        },
        {
          title: (localization.TIME_COLUMN as any)[lang],
          dataIndex: 'changeTime',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: value ? isoStringToUTCDate(addZoneOffsetToISOString(value, this.getSelectedTimeZone())) : '',
              props: {
                style: {}
              }
            };
          }
        },
        {
          title: this.ACCOUNT_TITLE,
          dataIndex: 'login',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: `${removeLoginSuffix(this.props.metadata.login)}`,
              props: {}
            };
          }
        },
        {
          title: (localization.TYPE_COLUMN as any)[lang],
          dataIndex: 'cmd',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            let record = row.data ? row.data : row;
            let bonus = record.bonus;
            let feature = record.feature;
            let hasSpin = row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin');
            let hasBonus = row.cmd && row.cmd === 'bonus';
;
            let id_fs = row.id_fs;
            let actionType = (id_fs || id_fs === 0) ? this.getBonusTypeById(row.gameId, undefined, id_fs) : value;
            if (bonus) {
              actionType = <span>{actionType} <span
                className={'gift-count-badge'}>{`+ ${this.getBonusTypeById(row.gameId, bonus.bonusId, undefined)}`}</span></span>
            }
            if (feature) {
              actionType = this.getSpecialFeature(row.gameId, feature, actionType, row);
            }
            if (hasSpin) {
              actionType = this.handleSpin(actionType, row, this.props.metadata);
            }
            if (hasBonus) {
              actionType = this.handleBonus(actionType, row, this.props.metadata);
            }
            return {
              children: actionType,
              props: {}
            };
          }
        },
        {
          title: (localization.MULTIPLIER as any)[lang],
          dataIndex: 'multiplier',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: this.isBonusDetails(row) ?
                this.renderBonusDetails(row.gameId, row)
                :
                this.isError(row) ?
                  this.renderErrorDetail(row)
                  :
                  this.renderMultiplier(row, value),
              props: {
                colSpan: this.isBonusDetails(row) || this.isError(row) ? 7 : 1
              }
            };
          }
        },
        {
          title: (localization.COUNT as any)[lang],
          dataIndex: 'counter',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: value || 0,
              props: {
                colSpan: this.isBonusDetails(row) || this.isError(row) ? 0 : 1
              }
            };
          }
        },
        {
          title: (localization.WIN_COLUMN as any)[lang],
          dataIndex: 'win',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            let win = row.data ? formatNumberData(row.data.win) : value;
            return {
              children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`,
              props: {
                style: {
                  fontStyle: 'italic'
                },
                colSpan: this.isBonusDetails(row) || this.isError(row) ? 0 : 1
              }
            };
          }
        },
        {
          title: (localization.BALANCE_COLUMN as any)[lang],
          dataIndex: 'balance',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${value}` : `${value} ${currency}`,
              props: {
                style: {
                  fontStyle: 'italic'
                },
                colSpan: this.isBonusDetails(row) || this.isError(row) ? 0 : 1
              }
            };
          }
        },
        {
          title: (localization.REELS_COLUMN as any)[lang],
          sorter: false,
          dataIndex: 'wheels',
          render: (value: any, row: any, i: number) => {
            return {
              children: !this.isBonusDetails(row) && this.renderWheels(value, row),
              props: {
                style: {
                  textAlign: 'center'
                },
                colSpan: this.isBonusDetails(row) || this.isError(row) ? 0 : 1
              }
            };
          }
        },
        {
          title: (localization.WINNING_PAYLINES as any)[lang],
          sorter: false,
          dataIndex: 'winLines',
          render: (value: any, row: any, i: number) => {
            return {
              children: !this.isBonusDetails(row) && this.needToShowRowExtension(row) ? (localization.SEE_MORE as any)[lang] : '',
              props: {
                style: {
                  textAlign: 'center'
                },
                colSpan: this.isBonusDetails(row) || this.isError(row) ? 0 : 1
              }
            };
          }
        }]
    )
  }

  blackjackColumns(userId: number, currency: string) {
    return [
      {
        title: this.getIdColumnName(),
        dataIndex: 'id',
        sorter: false,
        render: (value: any, row: any, i: number) =>{
          return {
            children: `${value} (${row.roundId})`
          }
        }
      },
      {
        title: (localization.TIME_COLUMN as any)[lang],
        dataIndex: 'changeTime',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value ? isoStringToUTCDate(addZoneOffsetToISOString(value, this.getSelectedTimeZone())) : '',
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: this.ACCOUNT_TITLE,
        dataIndex: 'login',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: `${removeLoginSuffix(this.props.metadata.login)}`,
            props: {}
          };
        }
      },
      {
        title: (localization.TYPE_COLUMN as any)[lang],
        dataIndex: 'cmd',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let id_fs = row.id_fs;
          return {
            children: (id_fs || id_fs === 0) ? this.getBonusTypeById(row.gameId, undefined, id_fs) : value/*res*/,
            props: {}
          };
        }
      },
      {
        title: (localization.BET_COLUMN as any)[lang],
        dataIndex: 'bet',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let win = row.data ? row.data.win : value;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.WIN_COLUMN as any)[lang],
        dataIndex: 'win',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let win = row.data ? row.data.win : value;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.BALANCE_COLUMN as any)[lang],
        dataIndex: 'balance',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${value}` : `${value} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.CARDS_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'cards',
        render: (value: any, row: any, i: number) => {
          let dealerCards = row.dealer && row.dealer.card;
          let dealerPoints = row.dealer && row.dealer.point;

          let playerFirstHandCards = row.hands && row.hands[0].state[0] && row.hands[0].state[0].card;
          let playerFirstHandPoints = row.hands && row.hands[0].state[0] && row.hands[0].state[0].point;
          let playerFirstHandPointsStr = '';
          if (playerFirstHandPoints) {
            if (playerFirstHandPoints.length > 1) {
              playerFirstHandPointsStr = playerFirstHandPoints[0] + ' / ' + playerFirstHandPoints[1];
            } else {
              playerFirstHandPointsStr = playerFirstHandPoints[0];
            }
          }

          let playerSecondHandCards = row.hands && row.hands[0].state[1] && row.hands[0].state[1].card;
          let playerSecondHandPoints = row.hands && row.hands[0].state[1] && row.hands[0].state[1].point;
          let playerSecondHandPointsStr = '';
          if (playerSecondHandPoints) {
            if (playerSecondHandPoints.length > 1) {
              playerSecondHandPointsStr = playerSecondHandPoints[0] + ' / ' + playerSecondHandPoints[1];
            } else {
              playerSecondHandPointsStr = playerSecondHandPoints[0];
            }
          }
          return {
            children:
              <div className={'details_line'} style={{verticalAlign: 'middle'}}>
                <div style={{
                  borderRight: '1px solid #e8e8e8',
                  paddingRight: '10px',
                  minWidth: '170px'
                }}>{dealerCards && createCardsContent(dealerCards, `${(localization.DEALER as any)[lang]} (${dealerPoints}):`)}</div>
                <div style={{
                  borderRight: playerSecondHandCards ? '1px solid #e8e8e8' : '',
                  marginLeft: '10px',
                  paddingRight: playerSecondHandCards ? '10px' : '',
                  minWidth: '170px'
                }}>{playerFirstHandCards && createCardsContent(playerFirstHandCards, `${(localization.FIRST_PLAYER_HAND as any)[lang]} (${playerFirstHandPointsStr}):`)}</div>
                {playerSecondHandCards && <div style={{
                  marginLeft: '10px',
                  minWidth: '170px'
                }}>{createCardsContent(playerSecondHandCards, `${(localization.SECOND_PLAYER_HAND as any)[lang]} (${playerSecondHandPointsStr}):`)}</div>}
              </div>,
            props: {
              style: {
                textAlign: 'center'
              }
            }
          };
        }
      }]
  }

  baccaratColumns(userId: number, currency: string) {
    return [
      {
        title: this.getIdColumnName(),
        dataIndex: 'id',
        sorter: false,
        render: (value: any, row: any, i: number) =>{
          return {
            children: `${value} (${row.tid})`
          }
        }
      },
      {
        title: (localization.TIME_COLUMN as any)[lang],
        dataIndex: 'changeTime',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value ? isoStringToUTCDate(addZoneOffsetToISOString(value, this.getSelectedTimeZone())) : '',
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: this.ACCOUNT_TITLE,
        dataIndex: 'login',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: `${removeLoginSuffix(this.props.metadata.login)}`,
            props: {}
          };
        }
      },
      {
        title: (localization.BET_TYPE_COLUMN as any)[lang],
        dataIndex: 'betType',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value.substring(1),
            props: {}
          };
        }
      },
      {
        title: (localization.BET_COLUMN as any)[lang],
        dataIndex: 'curBet',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let win = value;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.WIN_COLUMN as any)[lang],
        dataIndex: 'curWin',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let win = value;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.BALANCE_COLUMN as any)[lang],
        dataIndex: 'balance',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${value}` : `${value} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.CARDS_COLUMN as any)[lang],
        sorter: false,
        dataIndex: 'cards',
        render: (value: any, row: any, i: number) => {
          let playerCards = row.player.cards;
          let bankerCards = row.banker.cards;

          let playerPoints = row.player.point;
          let bankerPoints = row.banker.point;
          return {
            children:
              <div className={'details_line'} style={{verticalAlign: 'middle'}}>
                <div style={{
                  borderRight: '1px solid #e8e8e8',
                  paddingRight: '10px',
                  minWidth: '170px'
                }}>{createCardsContent(playerCards, `${localization.PLAYER[lang]} (${playerPoints}):`)}</div>
                <div style={{
                  marginLeft: '10px',
                  minWidth: '170px'
                }}>{createCardsContent(bankerCards, `${localization.BANKER[lang]} (${bankerPoints}):`)}</div>
              </div>,
            props: {
              style: {
                textAlign: 'center'
              }
            }
          };
        }
      }]
  }

  rouletteColumns(userId: number, currency: string) {
    return [
      {
        title: this.getIdColumnName(),
        dataIndex: 'id',
        sorter: false,
        render: (value: any, row: any, i: number) =>{
          return {
            children: `${value} (${row.tid})`,
            props: {
              rowSpan: i === 0 ? 200 : 0
            }
          }
        }
      },
      {
        title: (localization.TIME_COLUMN as any)[lang],
        dataIndex: 'changeTime',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value ? isoStringToUTCDate(addZoneOffsetToISOString(value, this.getSelectedTimeZone())) : '',
            props: {
              rowSpan: i === 0 ? 200 : 0
            }
          };
        }
      },
      {
        title: this.ACCOUNT_TITLE,
        dataIndex: 'login',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: `${removeLoginSuffix(this.props.metadata.login)}`,
            props: {
              rowSpan: i === 0 ? 200 : 0
            }
          };
        }
      },

      {
        title: (localization.BET_TYPE_COLUMN as any)[lang],
        dataIndex: 'betType',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: value,
            props: {

            }
          };
        }
      },
      {
        title: 'Coverage',
        dataIndex: 'covers',
        sorter: false,
        render: (value: any, row: any, i: number) => {

          const covers: number[] = value;
          const cellColors: { [ key: number ]: 'black'|'red'|'green' } = {
            0: 'green',
            1: 'red',
            2: 'black',
            3: 'red',
            4: 'black',
            5: 'red',
            6: 'black',
            7: 'red',
            8: 'black',
            9: 'red',
            10: 'black',
            11: 'black',
            12: 'red',
            13: 'black',
            14: 'red',
            15: 'black',
            16: 'red',
            17: 'black',
            18: 'red',
            19: 'red',
            20: 'black',
            21: 'red',
            22: 'black',
            23: 'red',
            24: 'black',
            25: 'red',
            26: 'black',
            27: 'red',
            28: 'black',
            29: 'black',
            30: 'red',
            31: 'black',
            32: 'red',
            33: 'black',
            34: 'red',
            35: 'black',
            36: 'red'
          };

          return {
            children:
            <div style={{
              marginLeft: '1px',
              marginRight: '1px',
              marginTop: '2px',
              paddingLeft: '0.63rem'
            }}>
              {
                covers.map((v, i) => <div key={i} style={{
                    float: 'left',
                    border: '1px solid #777777',
                    width: '1.56rem',
                    height: '1.56rem',
                    textAlign: 'center',
                    backgroundColor: `${cellColors[v]}`,
                    color: 'white',
                    fontSize: '14.3px'
                  }}>
                    {v}
                  </div>
                  )
              }
            </div>,
            props: {

            }
          };
        }
      },
      {
        title: 'Winning Number',
        dataIndex: 'winNumber',
        sorter: false,
        render: (value: any, row: any, i: number) => {

          let imgUrl: string = require("./img/rouletteeuropean/s"+ value +".png");

          let obj: {children: any; props: any; } = {
            children: <div><img src={imgUrl} style={{
              maxHeight: '100px'
            }} /></div>,
            props: {
              rowSpan: i === 0 ? 200 : 0,
              style: {
                textAlign: 'center'
              }
            }
          };

          return obj;
        }
      },
      {
        title: (localization.BET_COLUMN as any)[lang],
        dataIndex: 'curBet',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let win = value;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: (localization.WIN_COLUMN as any)[lang],
        dataIndex: 'curWin',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let win = value;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${win}` : `${win} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      }
    ];
  }

  isAnimeOldCascades(): boolean {
    for (let i = 0; i < ALL_GAMES.length; i++) {
      let item = ALL_GAMES[i];
      if (parseInt(item.id) === this.props.metadata.gameId) {
        switch (item.serverName) {
          case "mahjongh":
          case "byakuyalinneh":
          case "dekakuteh":
          case "hemekishioliviah":
          case "koakumakanojyoh":
          case "kunoichisakuyah":
          case "kuroinuh":
          case "nozokianah":
          case "oceanbeautyh":
          case "oppainoohjya48h":
          case "peonycolorsalvatoreh":
          case "seishohjyoh":
          case "sluttyprincesh":
          case "tuttifruitsh":
          case "yakinbyoutoh":
          case "mahjonghfhd":
          case "hauntedcavernh":
            return true;
        }
      }
    }
    return false;
  }

  transformAnimeOldCascades(tableData: any) {
    let transformedData: any = [];
    for (let i = 0; i < tableData.length; i++) {
      let recursion = tableData[i].data ? tableData[i].data.recursion : tableData[i].recursion;
      if (recursion) {
        recursion.reverse();
        for (let j = 0; j < recursion.length; j++) {
          let el: any = JSON.parse(JSON.stringify(tableData[i]));
          if (el.data) {
            el.data['wheels'] = recursion[j].wheels;
            el.data['win'] = recursion[j].win;
            el.data['winpos'] = recursion[j].winpos;
            el.data['winscatter'] = recursion[j].winscatter;
            el.data['cmd'] = 'cascading';
            el['id_fs'] = 99;
          } else {
            el['wheels'] = recursion[j].wheels;
            el['win'] = recursion[j].win;
            el['winpos'] = recursion[j].winpos;
            el['winscatter'] = recursion[j].winscatter;
            el['cmd'] = 'cascading';
          }

          el['multiplier'] = recursion[j].multiplier || 1;
          el['key'] = el.id + `-${j + 1}`;
          transformedData.push(el);
        }
        {
          let el: any = JSON.parse(JSON.stringify(tableData[i]));
          if (el.data) {
            el.data['win'] = el.data.firstwin;
          } else {
            el['win'] = el.firstwin;
          }
          el['key'] = el.id + '-0';
          transformedData.push(el);
        }
      } else {
        transformedData.push({...tableData[i], key: tableData[i].id});
      }
    }
    return transformedData
  }

  getBetStateById(id: number): string {
    switch (id) {
      case 1:
      case 3:
      case 4: {
        return localization.COMPLETE[lang]
      }
      case 2: {
        return localization.IN_PROGRESS[lang]
      }
    }
    return '';
  }

  goToPlayersHistory = () => {
    let roleId = localStorage.getItem('roleId') as string;
    let role: string = (getRoleById(parseInt(roleId)) as string).toUpperCase();
    let platform = getParameterByName('platform', this.props.location.search);
    let size = getParameterByName('size', this.props.location.search) || 10;
    this.props.savePrevPage(this.props.path + this.props.history.location.search);
    this.props.history.push(`${(roles as any)[role].route}${(roles as any)[role].children.HISTORY_LIST}/${this.props.metadata.userId}?page=1&size=${size}&platform=${platform}`)
  };

  onPrintPage = () => {
    window.onafterprint = null;

    let page = parseInt(getParameterByName('page', this.props.location.search));
    let size = parseInt(getParameterByName('size', this.props.location.search));
    let total = this.props.pagination.total;
    let pageSize = size && !isNaN(size) ? size : this.props.pagination.pageSize;

    let beforePrint = () => {
      let params = {
        pagination: {
          current: 1,
          pageSize: this.props.report.length,
          total: this.props.report.length
        },
        sort: {...this.props.sort},
        filter: this.props.appliedColumnFilter
      };
      this.props.tableChange(params, this);
    };

    window.onafterprint = () => {
      let params = {
        pagination: {
          current: page,
          pageSize: pageSize,
          total: total
        },
        sort: {...this.props.sort},
        filter: this.props.appliedColumnFilter
      };
      this.props.tableChange(params, this);
      this.setState({
        isPrint: false
      });
      setTimeout(()=>{
        window.onafterprint = null;
        this.triggerExpandAllRowsForPrint(false);
      }, 50);
    };
    beforePrint();
    setTimeout(()=>{
      onAllimagesLoaded(() => {
        //remove blur
        let spinner = document.querySelector(".ant-spin-blur");
        if(spinner){
          spinner.classList.remove("ant-spin-blur");
        }
        this.triggerExpandAllRowsForPrint(true);
        this.setState({
          isPrint: true
        });
      });
    }, 500);
  };

  triggerExpandAllRowsForPrint = (expand: boolean) => {
    let expandedRows: any[] = document.querySelectorAll(".ant-table-row-expand-icon") as any;
    for(let i  = 0; i < expandedRows.length; i++){
      let el = expandedRows[i];
      let flag = expand !== el.classList.contains("ant-table-row-expanded");
        if(!isHidden(el) && flag){
          el.click();
        }
    }
  };

  renderTable() {
    //table
    let currency: string = this.props.metadata.currency;
    let userId = (this.props.match.params as any).id || this.props.metadata.userId;
    let gameId = this.props.metadata.gameId ? +this.props.metadata.gameId : 0;
    let columns: any = [];
    if (isHoldem(gameId)) {
      columns = getHoldemColumns(this, userId, currency, gameId);
    } else if (isVideoPoker(gameId)) {
      columns = getVideoPokerColumns(this, userId, currency, this.props.metadata.lineCount)
    } else if (this.isBlackJack()) {
      columns = this.blackjackColumns(userId, currency)
    } else if (this.isBaccarat()) {
      columns = this.baccaratColumns(userId, currency)
    } else if (this.isRoulette()) {
      columns = this.rouletteColumns(userId, currency)
    } else {
      columns = this.slotsColumns(userId, currency)
    }

    let tableData = this.props.report;

    //for blackjack
    let cardData = tableData[0];

    /* if (isHoldem(gameId)) {
      let propertiesToConvert = ['bet', 'win', 'balance'];
      tableData = formatTableData(tableData.map((val: any, i: number) => Object.assign({}, val)), propertiesToConvert);
      console.log({tableData});
    } else */ if (isVideoPoker(gameId)) {
      const deal = tableData.filter((x: any) => x['BaseLine'] !== undefined);
      const draw = tableData.filter((x: any) => x['Lines'] !== undefined);
      const gamble = tableData.filter((x: any) => x['GambleBet'] !== undefined);
      const collect = tableData.filter((x: any) => x['GameBet'] !== undefined);

      const balance = collect && collect.length ? collect[0].balance : 0

      // const totalWin: number = collect && collect.length ? collect[0].Win : 0;
      // const countLine: number = deal && deal.length ? deal[0].CountLine : 0; // "CountLine": 50
      const baseLine: string[] = deal && deal.length ? deal[0].BaseLine : []; // [ "c:6", "h:9", "s:j", "h:7", "c:7" ]
      const hold: string = draw && draw.length ? draw[0].Hold : ""; // "Hold": "4|5"
      const bet: number = draw && draw.length ? draw[0].Bet : 0
      const changeTime: string = draw && draw.length ? draw[0].changeTime : '';
      const id: number = deal && deal.length ? deal[0].id : draw && draw.length ? draw[0].id : '';
      const tid: number = draw && draw.length ? draw[0].tid : '';
      const lines: {
        Cards: string[];
        WinPos: string;
        Win: number;
        Name: string;
      }[] = draw && draw.length ? draw[0].Lines : []; // { Cards: ['s:2', 'd:6', 'c:2', 'h:7', 'c:7'], Name: "twopair", Win: 0.02, WinPos: "1|3|4|5" }
      const transformedGamble = gamble.map((x: any) => {
        const cardHistory = x.CardHistory;
        const curGambleRoundDetails: {Card: string; Select: string; Win: number; } = cardHistory[cardHistory.length - 1];
        const roundNumber = cardHistory.length;

        return {
          roundNumber,
          baseLine: [],
          select: curGambleRoundDetails.Select,
          cards: [x.Card],
          name: 'gamble',
          winPos: '',
          win: x.Win,
          bet: x.GambleBet,
          changeTime,
          id,
          tid,
          hold,
          balance
        }
      });

      tableData = lines.map(x => ({
        roundNumber: null,
        baseLine: baseLine,
        select: null,
        cards: x.Cards,
        name: x.Name,
        winPos: x.WinPos,
        win: x.Win,
        bet,
        changeTime,
        id,
        tid,
        hold,
        balance
      }));

      tableData = [...transformedGamble, ...tableData];
    } else if (this.isRoulette()) {
      const originalData = Object.assign(cardData, {});

      const bets = originalData['bets'];
      const pays = originalData['pays'];
      const number = originalData['number'];

      let betValues: {[key: string]: { name: string; covers: number[]}} = {

        // column
        37: { name: '1st column (2:1)', covers: [ 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34 ] },
        38: { name: '2nd column (2:1)', covers: [ 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35 ] },
        39: { name: '3rd column (2:1)', covers: [ 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 ] },
        148: { name: '1st twelve (2:1)', covers: Array(12).fill(1).map((x, y) => x + y) },
        149: { name: '2nd twelve (2:1)', covers: Array(12).fill(13).map((x, y) => x + y) },
        150: { name: '3rd twelve (2:1)', covers: Array(12).fill(25).map((x, y) => x + y) },


        151: { name: '1-18 / Low (1:1)', covers: Array(18).fill(1).map((x, y) => x + y) },
        152: { name: 'Even (1:1)', covers: [ 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36] },
        153: { name: 'Black (1:1)', covers: [ 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35 ] },
        154: { name: 'Red (1:1)', covers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36 ] },
        155: { name: 'Odd (1:1)', covers: [ 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35 ] },
        156: { name: '19-36 / High (1:1)', covers: Array(18).fill(19).map((x, y) => x + y) },

        // split
        40:  { name: `Split (17:1)`, covers: [ 0, 1 ] },
        41:  { name: `Split (17:1)`, covers: [ 0, 2 ] },
        42:  { name: `Split (17:1)`, covers: [ 0, 3 ] },
        43:  { name: `Split (17:1)`, covers: [ 1, 4 ] },
        44:  { name: `Split (17:1)`, covers: [ 2, 5 ] },
        45:  { name: `Split (17:1)`, covers: [ 3, 6 ] },
        46:  { name: `Split (17:1)`, covers: [ 4, 7] },
        47:  { name: `Split (17:1)`, covers: [ 5, 8 ] },
        48:  { name: `Split (17:1)`, covers: [ 6, 9 ] },
        49:  { name: `Split (17:1)`, covers: [ 7, 10 ] },
        50:  { name: `Split (17:1)`, covers: [ 8, 11 ] },
        51:  { name: `Split (17:1)`, covers: [ 9, 12 ] },
        52:  { name: `Split (17:1)`, covers: [ 10, 13 ] },
        53:  { name: `Split (17:1)`, covers: [ 11, 14 ] },
        54:  { name: `Split (17:1)`, covers: [ 12, 15 ] },
        55:  { name: `Split (17:1)`, covers: [ 13, 16 ] },
        56:  { name: `Split (17:1)`, covers: [ 14, 17 ] },
        57:  { name: `Split (17:1)`, covers: [ 15, 18 ] },
        58:  { name: `Split (17:1)`, covers: [ 16, 19 ] },
        59:  { name: `Split (17:1)`, covers: [ 17, 20 ] },
        60:  { name: `Split (17:1)`, covers: [ 18, 21 ] },
        61:  { name: `Split (17:1)`, covers: [ 19, 22 ] },
        62:  { name: `Split (17:1)`, covers: [ 20, 23 ] },
        63:  { name: `Split (17:1)`, covers: [ 21, 24 ] },
        64:  { name: `Split (17:1)`, covers: [ 22, 25 ] },
        65:  { name: `Split (17:1)`, covers: [ 23, 26 ] },
        66:  { name: `Split (17:1)`, covers: [ 24, 27 ] },
        67:  { name: `Split (17:1)`, covers: [ 25, 28 ] },
        68:  { name: `Split (17:1)`, covers: [ 26, 29 ] },
        69:  { name: `Split (17:1)`, covers: [ 27, 30 ] },
        70:  { name: `Split (17:1)`, covers: [ 28, 31 ] },
        71:  { name: `Split (17:1)`, covers: [ 29, 32 ] },
        72:  { name: `Split (17:1)`, covers: [ 30, 33 ] },
        73:  { name: `Split (17:1)`, covers: [ 31, 34 ] },
        74:  { name: `Split (17:1)`, covers: [ 32, 35 ] },
        75:  { name: `Split (17:1)`, covers: [ 33, 36 ] },
        77:  { name: `Split (17:1)`, covers: [ 1, 2 ] },
        78:  { name: `Split (17:1)`, covers: [ 2, 3 ] },
        80:  { name: `Split (17:1)`, covers: [ 4, 5 ] },
        81:  { name: `Split (17:1)`, covers: [ 5, 6 ] },
        83:  { name: `Split (17:1)`, covers: [ 7, 8 ] },
        84:  { name: `Split (17:1)`, covers: [ 8, 9 ] },
        86:  { name: `Split (17:1)`, covers: [ 10, 11 ] },
        87:  { name: `Split (17:1)`, covers: [ 11, 12 ] },
        89:  { name: `Split (17:1)`, covers: [ 13, 14 ] },
        90:  { name: `Split (17:1)`, covers: [ 14, 15 ] },
        92:  { name: `Split (17:1)`, covers: [ 16, 17 ] },
        93:  { name: `Split (17:1)`, covers: [ 17, 18 ] },
        95:  { name: `Split (17:1)`, covers: [ 19, 20 ] },
        96:  { name: `Split (17:1)`, covers: [ 20, 21 ] },
        98:  { name: `Split (17:1)`, covers: [ 22, 23 ] },
        99:  { name: `Split (17:1)`, covers: [ 23, 24 ] },
        101: { name: `Split (17:1)`, covers: [ 25, 26 ] },
        102: { name: `Split (17:1)`, covers: [ 26, 27 ] },
        104: { name: `Split (17:1)`, covers: [ 28, 29 ] },
        105: { name: `Split (17:1)`, covers: [ 29, 30 ] },
        107: { name: `Split (17:1)`, covers: [ 31, 32 ] },
        108: { name: `Split (17:1)`, covers: [ 32, 33 ] },
        110: { name: `Split (17:1)`, covers: [ 34, 35 ] },
        111: { name: `Split (17:1)`, covers: [ 35, 36 ] },

        // corner (8:1)
        112: { name: `Four (8:1)`, covers: [ 0, 1, 2, 3 ] },
        116: { name: `Corner (8:1)`, covers: [ 1, 2, 4, 5 ] },
        117: { name: `Corner (8:1)`, covers: [ 2, 3, 5, 6 ] },
        119: { name: `Corner (8:1)`, covers: [ 4, 5, 7, 8 ] },
        120: { name: `Corner (8:1)`, covers: [ 5, 6, 8, 9 ] },
        122: { name: `Corner (8:1)`, covers: [ 7, 8, 10, 11 ] },
        123: { name: `Corner (8:1)`, covers: [ 8, 9, 11, 12 ] },
        125: { name: `Corner (8:1)`, covers: [ 10, 11, 13, 14 ] },
        126: { name: `Corner (8:1)`, covers: [ 11, 12, 14, 15 ] },
        128: { name: `Corner (8:1)`, covers: [ 13, 14, 16, 17 ] },
        129: { name: `Corner (8:1)`, covers: [ 14, 15, 17, 18 ] },
        131: { name: `Corner (8:1)`, covers: [ 16, 17, 19, 20 ] },
        132: { name: `Corner (8:1)`, covers: [ 17, 18, 20, 21 ] },
        134: { name: `Corner (8:1)`, covers: [ 19, 20, 22, 23 ] },
        135: { name: `Corner (8:1)`, covers: [ 20, 21, 23, 24 ] },
        137: { name: `Corner (8:1)`, covers: [ 22, 23, 25, 26 ] },
        138: { name: `Corner (8:1)`, covers: [ 23, 24, 26, 27 ] },
        140: { name: `Corner (8:1)`, covers: [ 25, 26, 28, 29 ] },
        141: { name: `Corner (8:1)`, covers: [ 26, 27, 29, 30 ] },
        143: { name: `Corner (8:1)`, covers: [ 28, 29, 31, 32 ] },
        144: { name: `Corner (8:1)`, covers: [ 29, 30, 32, 33 ] },
        146: { name: `Corner (8:1)`, covers: [ 31, 32, 34, 35 ] },
        147: { name: `Corner (8:1)`, covers: [ 32, 33, 35, 36 ] },

        // street
        76: { name: `Street (11:1)`, covers: Array(3).fill(1).map((x, y) => x + y) },
        79: { name: `Street (11:1)`, covers: Array(3).fill(4).map((x, y) => x + y) },
        82: { name: `Street (11:1)`, covers: Array(3).fill(7).map((x, y) => x + y) },
        85: { name: `Street (11:1)`, covers: Array(3).fill(10).map((x, y) => x + y) },
        88: { name: `Street (11:1)`, covers: Array(3).fill(13).map((x, y) => x + y) },
        91: { name: `Street (11:1)`, covers: Array(3).fill(16).map((x, y) => x + y) },
        94: { name: `Street (11:1)`, covers: Array(3).fill(19).map((x, y) => x + y) },
        97: { name: `Street (11:1)`, covers: Array(3).fill(22).map((x, y) => x + y) },
        100: { name: `Street (11:1)`, covers: Array(3).fill(25).map((x, y) => x + y) },
        103: { name: `Street (11:1)`, covers: Array(3).fill(28).map((x, y) => x + y) },
        106: { name: `Street (11:1)`, covers: Array(3).fill(31).map((x, y) => x + y) },
        109: { name: `Street (11:1)`, covers: Array(3).fill(34).map((x, y) => x + y) },
        113: { name: `Street (11:1)`, covers: [ 0, 1, 2 ] },
        114: { name: `Street (11:1)`, covers: [ 0, 2, 3 ] },

        // line
        115: { name: `Line (5:1)`, covers: Array(6).fill(1).map((x, y) => x + y) },
        118: { name: `Line (5:1)`, covers: Array(6).fill(4).map((x, y) => x + y) },
        121: { name: `Line (5:1)`, covers: Array(6).fill(7).map((x, y) => x + y) },
        124: { name: `Line (5:1)`, covers: Array(6).fill(10).map((x, y) => x + y) },
        127: { name: `Line (5:1)`, covers: Array(6).fill(13).map((x, y) => x + y) },
        130: { name: `Line (5:1)`, covers: Array(6).fill(16).map((x, y) => x + y) },
        133: { name: `Line (5:1)`, covers: Array(6).fill(19).map((x, y) => x + y) },
        136: { name: `Line (5:1)`, covers: Array(6).fill(22).map((x, y) => x + y) },
        139: { name: `Line (5:1)`, covers: Array(6).fill(25).map((x, y) => x + y) },
        142: { name: `Line (5:1)`, covers: Array(6).fill(28).map((x, y) => x + y) },
        145: { name: `Line (5:1)`, covers: Array(6).fill(31).map((x, y) => x + y) }
      };

      // straight
      Array(37).fill(0).map((x, y) => x + y).forEach(key => (betValues[key] = { name: `Straight up (35:1)`, covers: [ key ] }));

      let result = Object.keys(bets).map((key) => ({
        betType: betValues[key] ? betValues[key].name : `Unknown (${key})`,
        covers: betValues[key] ? betValues[key].covers : [],
        winNumber: number,
        curBet: bets[key],
        curWin: pays[key] ? pays[key] : 0
      }));

      tableData = result.map(v => ({...v, ...originalData}));

    } else if (this.isBlackJack()) {

      if (cardData.history) {
        let newTableData: any = [];
        for (let i = 0; i < cardData.history.length; i++) {
          let el: any = {...cardData};
          let currentItem = cardData.history[i];
          for (let prop in currentItem) {
            if (currentItem.hasOwnProperty(prop)) {
              el[prop] = currentItem[prop];
            }
          }
          el['key'] = currentItem['id'];
          newTableData.push(el);
        }
        tableData = [...tableData, ...newTableData.reverse()];
      }

      let propertiesToConvert = ['bet', 'win', 'balance'];
      tableData = formatTableData(tableData.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
    } else if (this.isBaccarat()) {
      let newTableData: any = [];
      let bets = cardData.bets;
      for (let prop in bets) {
        if (bets.hasOwnProperty(prop) && bets[prop] !== 0) {
          let el: any = {...cardData};
          el['betType'] = prop;
          el['curBet'] = bets[prop];
          el['curWin'] = cardData.wins[prop];
          el['key'] = prop;
          newTableData.push(el);
        }
      }
      tableData = newTableData;

      let propertiesToConvert = ['curBet', 'curWin', 'balance'];
      tableData = formatTableData(tableData.map((val: any, i: number) => Object.assign({}, val)), propertiesToConvert);
    } else if (this.isAnimeOldCascades()) {
      let propertiesToConvert = ['win', 'balance'];
      tableData = this.transformAnimeOldCascades(tableData);
      tableData = formatTableData(tableData.map((val: any, i: number) => Object.assign({}, val)), propertiesToConvert);
      tableData = tableData.map((val: any) => {
        return {...val, count: formatNumberData(val.count, true)}
      });
    }
    else {
      let propertiesToConvert = ['win', 'balance'];
      tableData = tableData.map((val: any) => {
        const counter = val.data && val.data.spins && (val.data.spins.left || val.data.spins.left === 0) && !isSlotWithCounter(gameId) ? val.data.spins.left : val.counter;
        return {...val, counter}
      });
      tableData = formatTableData(tableData.map((val: any, i: number) => Object.assign({}, val, {key: val.id})), propertiesToConvert);
      tableData = tableData.map((val: any) => {
        return {...val, count: formatNumberData(val.count, true)}
      });
    }

    return (<DataTable
      expandIconColumnIndex={9}
      rowClassName={this.setRowClassName}
      columns={columns}
      onTableChange={this.onTableChange}
      totalData={this.props.reportTotal}
      loading={this.props.loadingReport}
      pagination={isPageRoundDetails() ? null : this.props.pagination}
      expandedRowRender={!this.isBaccarat() && !this.isBlackJack() && this.expandedRowRender}
      data={tableData}/>)
  }

  getAccountIdHeaderText = () => (
    {
      icon: 'idcard',
      text: `${this.ACCOUNT_TITLE}: ${typeof this.props.metadata.login !== 'undefined' ? removeLoginSuffix(`${this.props.metadata.login}`) : ''}`,
      title: (localization.OPEN_USERS_HISTORY as any)[lang]
    }
  )

  render() {
    let curr = this.props.metadata.currency;
    let gameId = this.props.metadata.gameId ? +this.props.metadata.gameId : 0;
    let gameName = this.getGameServerNameById(gameId);
    let totalLines = ['guisesofdracula', 'thousandonespins'].indexOf(gameName) > -1 ? 50 : gameName === 'lordofthesun' ? 30 : gameName === 'wealthofwisdom' ? 25 : this.getGameTotalLinesById(this.props.metadata.gameId);

    let infoText = !this.isBlackJack() && !this.isBaccarat() && !this.isRoulette() && !isVideoPoker(gameId) && !isHoldem(gameId) ? [
        {
          icon: 'idcard',
          text: `${(localization.PLAYER as any)[lang]}: ${typeof this.props.metadata.login !== 'undefined' ? `${this.props.metadata.login}(#${this.props.metadata.userId})` : ''}`,
          link: isPageGameHistory()||isPageRoundDetails()?undefined:this.goToPlayersHistory,
          title: (localization.OPEN_USERS_HISTORY as any)[lang]
        },
        this.getAccountIdHeaderText(),
        {
          icon: 'home',
          text: `${(localization.ROOM_COLUMN as any)[lang]}: ${typeof this.props.metadata.roomName !== 'undefined' ? `${this.props.metadata.roomName}(#${this.props.metadata.roomId})` : ''}`
        },
        {
          icon: 'wallet',
          text: `${(localization.CURRENCY as any)[lang]}: ${typeof this.props.metadata.currency !== 'undefined' ? this.props.metadata.currency : ''}`
        },
        {
          icon: 'pause-circle-o',
          text: `${(localization.TOTAL_LINES as any)[lang]}: ${typeof this.props.metadata.gameId !== 'undefined' ? totalLines : ''}`
        },
        {
          icon: 'plus-circle-o',
          text: `${(localization.BET as any)[lang]}: ${typeof this.props.metadata.bet !== 'undefined' ? FORMATS[curr] ? `${FORMATS[curr]['symbol']} ${formatNumberData(this.props.metadata.bet)}` : `${formatNumberData(this.props.metadata.bet)} ${curr}` : ''}`
        },
        {
          icon: 'dashboard',
          text: `${(localization.WIN_COLUMN as any)[lang]}: ${typeof this.props.metadata.win !== 'undefined' ? FORMATS[curr] ? `${FORMATS[curr]['symbol']} ${formatNumberData(this.props.metadata.win)}` : `${formatNumberData(this.props.metadata.win)} ${curr}` : ''}`
        },
        {
          icon: 'to-top',
          text: `${(localization.BET_LEVEL as any)[lang]}: ${typeof this.props.metadata.betlevel !== 'undefined' ? this.props.metadata.betlevel : ''}`
        },
        {
          icon: 'html5',
          text: `${(localization.GAME as any)[lang]}: ${typeof this.props.metadata.name !== 'undefined' ? this.props.metadata.name + ` (#${this.props.metadata.gameId})` : ''}`
        },
        {
          icon: 'hourglass',
          text: `${(localization.BET_STATE as any)[lang]}: ${typeof this.props.metadata.betlevel !== 'undefined' ? this.getBetStateById(this.props.metadata.state) : ''}`
        },
        {
          icon: 'clock-circle-o',
          text: `${(localization.START_TIME as any)[lang]}: ${typeof this.props.metadata.startTime !== 'undefined' ? isoStringToUTCDate(addZoneOffsetToISOString(this.props.metadata.startTime, this.getSelectedTimeZone())) : ''}`
        },
        {
          icon: 'clock-circle',
          text: `${(localization.END_TIME as any)[lang]}: ${typeof this.props.metadata.endTime !== 'undefined' ? isoStringToUTCDate(addZoneOffsetToISOString(this.props.metadata.endTime, this.getSelectedTimeZone())) : ''}`
        }]

      :

      [
        {
          icon: 'idcard',
          text: `${(localization.PLAYER as any)[lang]}: ${typeof this.props.metadata.login !== 'undefined' ? `${this.props.metadata.login}(#${this.props.metadata.userId})` : ''}`,
          link: isPageGameHistory()||isPageRoundDetails() ? undefined : this.goToPlayersHistory,
          title: (localization.OPEN_USERS_HISTORY as any)[lang]
        },
        this.getAccountIdHeaderText(),
        {
          icon: 'home',
          text: `${(localization.ROOM_COLUMN as any)[lang]}: ${typeof this.props.metadata.roomName !== 'undefined' ? `${this.props.metadata.roomName}(#${this.props.metadata.roomId})` : ''}`
        },
        {
          icon: 'wallet',
          text: `${(localization.CURRENCY as any)[lang]}: ${typeof this.props.metadata.currency !== 'undefined' ? this.props.metadata.currency : ''}`
        },
        {
          icon: 'plus-circle-o',
          text: `${(localization.TOTAL_BET as any)[lang]}: ${typeof this.props.metadata.bet !== 'undefined' ? FORMATS[curr] ? `${FORMATS[curr]['symbol']} ${formatNumberData(this.props.metadata.bet)}` : `${formatNumberData(this.props.metadata.bet)} ${curr}` : ''}`
        },
        {
          icon: 'dashboard',
          text: `${(localization.WIN_COLUMN as any)[lang]}: ${typeof this.props.metadata.win !== 'undefined' ? FORMATS[curr] ? `${FORMATS[curr]['symbol']} ${formatNumberData(this.props.metadata.win)}` : `${formatNumberData(this.props.metadata.win)} ${curr}` : ''}`
        },
        {
          icon: 'html5',
          text: `${(localization.GAME as any)[lang]}: ${typeof this.props.metadata.name !== 'undefined' ? this.props.metadata.name + ` (#${this.props.metadata.gameId})` : ''}`
        },
        {
          icon: 'hourglass',
          text: `${(localization.BET_STATE as any)[lang]}: ${typeof this.props.metadata.state !== 'undefined' ? this.getBetStateById(this.props.metadata.state) : ''}`
        },
        {
          icon: 'clock-circle-o',
          text: `${(localization.START_TIME as any)[lang]}: ${typeof this.props.metadata.startTime !== 'undefined' ? isoStringToUTCDate(addZoneOffsetToISOString(this.props.metadata.startTime, this.getSelectedTimeZone())) : ''}`
        },
        {
          icon: 'clock-circle',
          text: `${(localization.END_TIME as any)[lang]}: ${typeof this.props.metadata.endTime !== 'undefined' ? isoStringToUTCDate(addZoneOffsetToISOString(this.props.metadata.endTime, this.getSelectedTimeZone())) : ''}`
        }];

     if (this.hasSearchTimeZone()) {
      infoText.push(
        {
          icon: 'clock-circle',
          text: `Time Zone: UTC${this.getSelectedTimeZone()}`
        }
      )
    }
    let hasRoundDetails = this.props.metadata && this.props.metadata.userId && this.props.metadata.userId > 0;
    let hasError = this.props.error && this.props.error.code;

    return (
      isPageRoundDetails() ?
      <div className={'gutter-box-padding'} id={isPageGameHistory()?"print-area-for-round-history":""}>
          {hasError && !hasRoundDetails ? NoFound(this.props.error.code, this.props.error.message) : null}
          {hasRoundDetails ? <InfoPanel
            onPrintPage={null}
            goToDescriptionInHelp={null}
            goBack={null}
            refresh={() => {
              this.props.getReport(this)
            }}
            loading={this.props.loadingReport}
            infoText={infoText}
            title={"Round Details"}
          /> : null}
          {hasRoundDetails ? <Row type="flex" justify="space-around" align="middle">
            {this.props.report ? this.renderTable() : <SpinComponent/>}
          </Row>: null}
      </div>
      :
      <div className={'gutter-box-padding'} id={isPageGameHistory()?"print-area-for-round-history":""}>
        <InfoPanel
          onPrintPage={this.onPrintPage}
          goToDescriptionInHelp={isPageGameHistory()?null:this.goToDescriptionInHelp}
          goBack={isPageGameHistory()?null:this.pageToGoBack}
          refresh={() => {
            this.props.getReport(this)
          }}
          loading={this.props.loadingReport}
          infoText={infoText}
          title={"Round Details"}
        />
        <Row type="flex" justify="space-around" align="middle">
          {this.props.report ? this.renderTable() : <SpinComponent/>}
        </Row>
      </div>);
  }
}

export const HistoryDetails = withRouter(HistoryDetailsVO);
