import * as React from 'react';
import localization from "app/localization";
import {FORMATS} from "app/const/moneyFormatter"; 
import {
  addZoneOffsetToISOString,
  isoStringToUTCDate
} from 'app/utils';
import {createPokerCardsLine} from "app/containers/HistoryDetails/VideoPokerCardsLine";

let lang = localStorage.getItem('lang') || 'en';

enum VideoPoker {
  JacksOrBetter = 562,
  AcesAndFaces = 577,
  BonusDeucesWild = 566,
  TwoWaysRoyal = 580
}

const combinationMap: Map<string, string> = new Map([
  ['royalflush',    'Royal Flush (800:1)'],
  ['straightflush', 'Straight Flush (50:1)'],
  ['fourofakind',   '4 of a Kind (25:1)'],
  ['fullhouse',     'Full House (9:1)'],
  ['flush',         'Flush (6:1)'],
  ['straight',      'Straight (4:1)'],
  ['threeofakind',  '3 of a Kind (3:1)'],
  ['twopair',       'Two Pair (2:1)'],
  ['jacksorbetter', 'Jack or Better (1:1)']
]);

const combinationMap2: Map<string, string> = new Map([
  ['royalflush',      'Royal Flush (800:1)'],
  ['straightflush',   'Straight Flush (50:1)'],
  ['fourofakindace',  'Four of a Kind of As (80:1)'],
  ['fourofakindjk',   'Four of a Kind of J-Ks (40:1)'],
  ['fourofakind2ten', 'Four of a Kind of 2-10s (25:1)'],
  ['fullhouse',       'Full House (8:1)'],
  ['flush',           'Flush (5:1)'],
  ['straight',        'Straight (4:1)'],
  ['threeofakind',    'Three of a Kind (3:1)'],
  ['twopair',         'Two Pairs (2:1)'],
  ['jacksorbetter',   'Pair of Jacks or Better (1:1)']
]);

const combinationMap3: Map<string, string> = new Map([
  ['naturalroyalflush', 'Natural Royal Flush (800:1)'],
  ['fourdeucesandace',  'Four Deuces with an Ace (400:1)'],
  ['fourdeuces',        'Four Deuces (200:1)'],
  ['wildroyalflush',    'Wild Royal Flush (25:1)'],
  ['fiveaces',          'Five Aces (80:1)'],
  [`five3's,4's,5's`,   `Five 3's, 4's, 5's (40:1)`],
  [`five6'sthroughK's`, `Five 6's through K's (18:1)`],
  ['straightflush',     'Straight Flush (8:1)'],
  ['fourofakind',       '4 of a Kind (4:1)'],
  ['fullhouse',         'Full House (4:1)'],
  ['flush',             'Flush (3:1)'],
  ['straight',          'Straight (1:1)'],
  ['threeofakind',      '3 of a Kind (1:1)']
]);

const combinationMap4: Map<string, string> = new Map([
  ['royalflush-high', 'Royal Flush - High (800:1)'],
  ['royalflush-low',  'Royal Flush - Low (800:1)'],
  ['straightflush',   'Straight Flush (50:1)'],
  ['fourofakind',     '4 of a Kind (25:1)'],
  ['fullhouse',       'Full House (7:1)'],
  ['flush',           'Flush (5:1)'],
  ['straight',        'Straight (4:1)'],
  ['threeofakind',    '3 of a Kind (3:1)'],
  ['twopair',         'Two Pair (2:1)'],
  ['jacksorbetter',   'Jack or Better (1:1)']
]);

const choiceMap: Map<string, string> = new Map([
  ['red',       'Red (x2)'],
  ['black',     'Black (x2)'],
  ['spades',    'Spades (x4)'],
  ['hearts',    'Hearts (x4)'],
  ['diamonds',  'Diamonds (x4)'],
  ['clubs',     'Clubs (x4)'],
]);

let isGambleRound = (row: any) => {
  return row && row['name'] && row['name'] === 'gamble';
}

let getCurrentCombinationMap = (gameId: number) => {
  switch (+gameId) {
    case VideoPoker.JacksOrBetter:    return combinationMap;
    case VideoPoker.AcesAndFaces:     return combinationMap2;
    case VideoPoker.BonusDeucesWild:  return combinationMap3;
    case VideoPoker.TwoWaysRoyal:     return combinationMap4;
    default:                          return combinationMap;
  }
};

function renderGamble(result: string, choice: string, roundNumber: number) {
  let cardUrl: string = '';
  try {
    cardUrl = require(`./img/poker/${result.replace(':', '-')}.png`);
  } catch(e) {
    cardUrl = require(`./img/poker/card-down.png`);
  } 
  let img = <span><img style={{width: '45px'}} src={`${cardUrl}`}/></span>;
  return (
    <div style={{textAlign: 'center'}}>
      <h3>{`Gamble Game`}</h3>
      <p><strong>{`Round ${roundNumber}`}</strong></p>
      <p><strong>{'Choice: '}</strong> {choiceMap.has(choice) ? choiceMap.get(choice) : choice}</p>
      <p><strong>{'Result: '}</strong> {img}</p>
    </div>
  )
}

export function getVideoPokerColumns(context: any, userId: number, currency: string, lineCount: number) {
    const gameId = +context.props.metadata.gameId;
    const isDeucesWild: boolean = +gameId === VideoPoker.BonusDeucesWild;
    return [
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
          let bet = value ? value : 0;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${bet}` : `${bet} ${currency}`,
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
          let win = value ? value : 0;
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
          const balance = value ? +value.toFixed(2)  : value;
          return {
            children: FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${balance}` : `${balance} ${currency}`,
            props: {
              style: {
                fontStyle: 'italic'
              }
            }
          };
        }
      },
      {
        title: 'Base Hand',
        sorter: false,
        dataIndex: 'baseLine',
        render: (value: any, row: any, i: number) => {
          return {
            children: 
              isGambleRound(row) ? renderGamble(row.cards[0], row.select, row.roundNumber) : <div className={'winline-wrapper'}
                dangerouslySetInnerHTML={createPokerCardsLine(value, '-1', row.hold, isDeucesWild)
              }/>,
            props: {
              colSpan: isGambleRound(row) ? 3 : 1
            }
          }
        }
      },
      {
        title: 'Winning Hands',
        sorter: false,
        dataIndex: 'name',
        render: (value: any, row: any, i: number) => {
          const gameId = +context.props.metadata.gameId;
          const curCombinationMap = getCurrentCombinationMap(gameId);
          const textResult = curCombinationMap.has(value) ? curCombinationMap.get(value) : value;

          return {
            children: value ? <div><span className={'gift-count-badge'}>{textResult}</span></div> : <div></div>,
            props: {
              colSpan: isGambleRound(row) ? 0 : 1
            }
          }
        }
      },
      {
        title: `Hands (${lineCount})`,
        sorter: false,
        dataIndex: 'cards',
        render: (value: any, row: any, i: number) => {
          return {
            children: 
              <div className={'winline-wrapper'}
                dangerouslySetInnerHTML={createPokerCardsLine(value, row.winPos, '-1', isDeucesWild)
              }/>,
            props: {
              colSpan: isGambleRound(row) ? 0 : 1
            } 
          }
        }
      }
    ]
  }