import * as React from 'react';
import {Divider} from 'antd';
import localization from "app/localization";
import {FORMATS} from "app/const/moneyFormatter"; 
import {
  addZoneOffsetToISOString,
  isoStringToUTCDate,
  roundValue
} from 'app/utils';
import {createPokerCardsLine} from "app/containers/HistoryDetails/VideoPokerCardsLine";

let lang = localStorage.getItem('lang') || 'en';

enum Holdem {
  TexasHoldem = 584,
  CasinoHoldem = 591
}

enum HandData {
  Dealer = 1,
  Player
}

enum ParameterName {
  Hand = 'Hand',
  Cards = 'Cards',
}

const combinationMap: Map<string, string> = new Map([
  ['royalflush',    'Royal Flush'],
  ['straightflush', 'Straight Flush'],
  ['fourofakind',   '4 of a Kind'],
  ['fullhouse',     'Full House'],
  ['flush',         'Flush'],
  ['straight',      'Straight'],
  ['threeofakind',  '3 of a Kind'],
  ['twopair',       'Two Pairs'],
  ['pair',          'One Pair'],
  ['highcard',      'High Card']
]);

interface ICardExtended { 
  orderId: number; 
  holdId: number; 
  value: string;
  suit: string;
  line: string;
}

const CardValueOrder: string[] = [ 'a', 'k', 'q', 'j', 't', '9', '8', '7', '6', '5', '4', '3', '2' ];

const getCardsExtended = (line: string[], handWinPos: string) => {
  const curLine = line && line.length ? line : []
  const holdPositions = handWinPos.split('|').map(x=>+x);
  const cardValues: string[] = CardValueOrder;
  const curLineExtended: ICardExtended[] = curLine
      .map((line, i) => {
          const suit = line.split(':')[0];
          const value = line.split(':')[1] === '10' ? 't' : line.split(':')[1];
          const holdId = i + 1;
          const orderId = holdPositions.includes(holdId) ? -1 : cardValues.indexOf(value);
          
          return { orderId, value, suit, holdId, line }
      })
      .sort(function(a, b){ return a.orderId - b.orderId});

  return curLineExtended;
  
}

let getCurrentCombinationMap = (gameId: number) => {
  switch (+gameId) {
    case Holdem.TexasHoldem:          return combinationMap;
    case Holdem.CasinoHoldem:         return combinationMap;
    default:                          return combinationMap;
  }
};

const getCurrencyWrap = (value: number|string, currency: string) => FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${value}` : `${value} ${currency}`

const getHandWinPos = (value: any) => {
  return value && value.WinPos ? value.WinPos.split('|').filter((x:any) => +x <= 2).join('|') : '';
}

const getHandWinPoses = (value: any, position: number) => {
  let winPoses = value && value.WinPoses ? value.WinPoses : [];
  let curWinPos = winPoses[position-1];
  return (typeof curWinPos === 'string' ? curWinPos : '').split('|').join('|');
}

const getNameInNames = (value: any, position: number): string => {
  const gameId = Holdem.CasinoHoldem;
  const curCombinationMap = getCurrentCombinationMap(gameId);
  let names = value && value.Names ? value.Names : [];
  let curName = names[position-1];
  const result: any =  curCombinationMap.has(curName) ? curCombinationMap.get(curName) : '';
  return result as string;
}

const getTableWinPos = (value: any) => {
  return value && value.WinPos ? value.WinPos.split('|').filter((x:any) => +x >= 3).map((x:any) => (+x-2)).join('|') : '';
}

const hasFold = (row: any) => row && row.GameBet;

const getWinDetails = (row: any, value: any, handValue: HandData) => {
  const gameId = +row.gameId;
  const curCombinationMap = getCurrentCombinationMap(gameId);
  const combitationText = value && value['Name'] && curCombinationMap.has(value.Name) ? curCombinationMap.get(value.Name) : '';

  const handWinPos = getHandWinPos(value);
  const tableWinPos = getTableWinPos(value);

  return (handValue === HandData.Player) || (!hasFold(row) && (handValue === HandData.Dealer)) ? 
  <div>   
    { 
      hasFold(row) ? 
      <p>Fold</p> : 
      <>
        <p>Table Cards</p>
        <div
          style={{display: 'inline-table', lineHeight: '0px'}}
          dangerouslySetInnerHTML={createPokerCardsLine(row && row.Table ? row.Table : [], tableWinPos, '-1', false)}
        />
      </>
    }
    <Divider style={{margin: "10px 0"}}/>
    <p>Hand</p>
    <div
      style={{display: 'inline-table', lineHeight: '0px'}}
      dangerouslySetInnerHTML={createPokerCardsLine(value && value.Hand ? value.Hand : [], handWinPos, '-1', false)}
    />  
    <Divider style={{margin: "10px 0"}}/> 
    <p>Hand Combination</p>
    <div><span className={'gift-count-badge'}>{combitationText}</span></div>
  </div> : null
}

const getCasinoHoldemHandCombination = (value: any, position: number, titleText: string, row: any, handData?: HandData) => {
  const notQualifiedText = 'Not qualified';
  let combitationText = getNameInNames(value, position);

  if (handData === HandData.Dealer && combitationText === combinationMap.get('highcard')) {
    combitationText = notQualifiedText;
  }
  
  if (handData === HandData.Dealer && combinationMap.get('pair')) {
    let handWinPos = getHandWinPoses(value, 1);
    const cardsExtended = getCardsExtended(value[ParameterName.Cards], handWinPos);
    const values = cardsExtended.map(x => x.value).slice(0,2).join('-');
    if (['2-2','3-3'].includes(values)) { combitationText = notQualifiedText; }
  }

  return combitationText.length ? <>
    <Divider style={{margin: "10px 0"}}/>
    <div>   
      <p>{`${titleText}`}</p>
      <div><span className={'gift-count-badge'}>{hasFold(row) ? 'Fold' : combitationText}</span></div>
    </div>
  </> : null;
}

const getCasinoHoldemTableCards = (row: any, value: any) => {
  
  const tableWinPos = '1|2|3|4|5';

  let table = row && row.Table ? row.Table : []

  if (!table.length) {
    let hand = row && row.Player && row.Player.Hand && row.Player.Hand ? row.Player.Hand : [];
    table = row && row.Player && row.Player.Cards && row.Player.Cards ? row.Player.Cards : [];
    if (Array.isArray(table)) {
      table = table.filter(x => !hand.includes(x))
    }
  }

  return <div>
    { 
      <>
        <p>Table Cards</p>
        <div
          style={{display: 'inline-table', lineHeight: '0px'}}
          dangerouslySetInnerHTML={createPokerCardsLine(table, tableWinPos, '-1', false)}
        />
      </>
    }
  </div>
}

const getCasinoHoldemHand = (value: any, parameterName: ParameterName, winPosId: 1|2, handText: string, row: any, sort?: boolean) => {
  
  let valueParameterName = value[parameterName];
  let handWinPos = getHandWinPoses(value, winPosId);

  if (value && valueParameterName && valueParameterName.length === 2) {
    handWinPos = '1|2';
  }

  if (sort) {
    const cardsExtended = getCardsExtended(valueParameterName, handWinPos);
    handWinPos = cardsExtended.filter(x => x.orderId === -1).map((x,i) => i+1).join('|');
    valueParameterName = cardsExtended.map(x => x.line).slice(0,5);
  }
  

  return handWinPos.length ? <>
    <Divider style={{margin: "10px 0"}}/>
    <div>   
      <p>{`${handText}`}</p>
      <div
        style={{display: 'inline-table', lineHeight: '0px'}}
        dangerouslySetInnerHTML={
          createPokerCardsLine(
            value && valueParameterName ? valueParameterName : [], 
            hasFold(row) && parameterName !== ParameterName.Hand ? '' : handWinPos, 
            '-1', 
            false
          )
        }
      /> 
    </div>
  </> : null;
}

const getCasinoHoldemDetails = (row: any, value: any) => {

  const dealerHand = row.Dealer ? row.Dealer : {};
  const playerHand = row.Player ? row.Player : {};

  return <div>
    {getCasinoHoldemTableCards(row, value)}
    {getCasinoHoldemHand(dealerHand, ParameterName.Hand, 1, 'Dealer Hand', row)}
    {getCasinoHoldemHand(playerHand, ParameterName.Hand, 1, 'Player Hand', row)}
    {getCasinoHoldemHand(playerHand, ParameterName.Cards, 1, 'Ante Cards', row, true)}
    {getCasinoHoldemHandCombination(playerHand, 1, 'Ante Hand Value', row)}
    {getCasinoHoldemHand(playerHand, ParameterName.Cards, 2, 'AA Cards', row, true)}
    {getCasinoHoldemHandCombination(playerHand, 2, 'AA Hand Value', row)}
    {getCasinoHoldemHand(dealerHand, ParameterName.Cards, 1, 'Dealer Cards', row, true)}
    {getCasinoHoldemHandCombination(dealerHand, 1, 'Dealer Hand values', row, HandData.Dealer)}
  </div>

}



const renderBets = (row: any, value: any) => {
  const gameId = +row.gameId;

  if (gameId === Holdem.TexasHoldem) {
    
    const isFold = hasFold(row);
  
    const ante = row.AnteBet ? row.AnteBet : isFold ? row.Bet : 0;
    const raise = row.FlopBet ? row.FlopBet : 0;
    const turn = row.TurnBet ? row.TurnBet : 0;
    const river = row.RiverBet ? row.RiverBet : 0;
    const anteBet = getCurrencyWrap(ante, row.currency);
    const raiseBet = getCurrencyWrap(raise, row.currency);
    const turnBet = getCurrencyWrap(turn, row.currency);
    const riverBet = getCurrencyWrap(river, row.currency);
    
    return <div>
      <span>Ante: {anteBet}</span><br/>
      {
        isFold ? 
        null : 
        <>
          <span>Raise: {raiseBet}</span><br/>
          <span>Turn: {turnBet}</span><br/>
          <span>River: {riverBet}</span><br/>
        </>
      }
    </div>

  }

  if (gameId === Holdem.CasinoHoldem) {
    const anteBet = roundValue(row.AnteBet ? row.AnteBet : hasFold(row) && row.GameBet ? row.GameBet : 0);
    const anteWin = roundValue(row.AnteWin ? row.AnteWin : 0);
    const callBet = roundValue(row.CallBet ? row.CallBet : 0);
    const callWin = roundValue(row.CallWin ? row.CallWin : 0);
    const aaBet = roundValue(row.AaBet ? row.AaBet : 0);
    const aaWin = roundValue(row.AaWin ? row.AaWin : 0);
    return <div>
      <p>Ante</p>
      <span>Bet: {getCurrencyWrap(anteBet, row.currency)}</span><br/>
      <span>Win: {getCurrencyWrap(anteWin, row.currency)}</span><br/>
      <Divider style={{margin: "10px 0"}}/>
      <p>Call</p>
      <span>Bet: {getCurrencyWrap(callBet, row.currency)}</span><br/>
      <span>Win: {getCurrencyWrap(callWin, row.currency)}</span><br/>
      <Divider style={{margin: "10px 0"}}/>
      <p>AA</p>
      <span>Bet: {getCurrencyWrap(aaBet, row.currency)}</span><br/>
      <span>Win: {getCurrencyWrap(aaWin, row.currency)}</span><br/>
    </div>
  }

  return <div></div>

}

export function getHoldemColumns(context: any, userId: number, currency: string, gameId: number) {
    
    let columns: any = [
      {
        title: (localization.ID_COLUMN as any)[lang],
        dataIndex: 'id',
        sorter: false,
        render: (value: any, row: any, i: number) =>{
          return {
            rowKey: value,
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
            children: value ? isoStringToUTCDate(addZoneOffsetToISOString(value, context.props.timeZone)) : '',
            props: {
              style: {}
            }
          };
        }
      },
      {
        title: (localization.LOGIN as any)[lang],
        dataIndex: 'login',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          return {
            children: `${context.props.metadata.login}(#${userId})`,
            props: {}
          };
        }
      },
      {
        title: (localization.BET_COLUMN as any)[lang],
        dataIndex: 'bet',
        sorter: false,
        render: (value: any, row: any, i: number) => {
          let bet = row.Bet ? row.Bet : 0;
          return {
            children: getCurrencyWrap(bet, currency),
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
          let win = row.Win ? row.Win : 0;
          return {
            children: getCurrencyWrap(win, currency),
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
            children: getCurrencyWrap(value, currency),
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      }
    ]

    if (+gameId === Holdem.TexasHoldem) {
      const additionalColumns = [
        {
          title: (localization.BET_COLUMN as any)[lang] + 's',
          dataIndex: 'AnteBet',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: renderBets(row, value),
              props: {
                style: {
                  // fontStyle: 'italic'
                }
              }
            };
          }
        },
        {
          title: 'Dealer',
          dataIndex: 'Dealer',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: getWinDetails(row, value, HandData.Dealer),
              props: {
                style: {
                  textAlign: 'center'
                }
              }
            };
          }
        },
        {
          title: 'Player',
          dataIndex: 'Player',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            
            return {
              children: getWinDetails(row, value, HandData.Player),
              props: {
                style: {
                  textAlign: 'center'
                }
              }
            };
          }
        }
      ];
      columns = [...columns, ...additionalColumns];
    }

    if (+gameId === Holdem.CasinoHoldem) {
      
      const curRow = context && 
        context.props && 
        context.props.report && 
        Array.isArray(context.props.report) &&
        context.props.report.length ? context.props.report[0] : {};
      
      const betsRow = [];

      if (!hasFold(curRow)) {
        betsRow.push({
          title: (localization.BET_COLUMN as any)[lang] + 's',
          dataIndex: 'AnteBet',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: renderBets(row, value),
              props: {
                style: {
                  // fontStyle: 'italic'
                }
              }
            };
          }
        })
      };

      const additionalColumns = [
        {
          title: 'Details',
          dataIndex: 'Dealer',
          sorter: false,
          render: (value: any, row: any, i: number) => {
            return {
              children: getCasinoHoldemDetails(row, value),
              props: {
                style: {
                  textAlign: 'center'
                }
              }
            };
          }
        }]
      columns = [...columns, ...betsRow,  ...additionalColumns];
    }

    return columns;

  }
