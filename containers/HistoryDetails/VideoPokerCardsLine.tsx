import {isDeviceIos} from "app/utils";
// import {Row} from 'antd';
// import * as React from 'react';

interface ICreatePokerCardsLineFunc {
  __html: string
}

// line: ["c:6","h:9","s:j","h:7","c:7"]
export function createPokerCardsLine(line: string[], winPos: string|null, hold: string|null, isDeucesWild: boolean): ICreatePokerCardsLineFunc {
  
  let shadowedPos = winPos ? winPos.split('|') : [];
  let holdPos = hold ? hold.split('|') : [];

  let result = `<div class="img-wrapper">
      ${
        line.map((x, i) => {
          let cardUrl: string = '';
          if (isDeucesWild && `${x}`.indexOf(':2') > -1) { x = `${x}-wild` }
          try {
            cardUrl = require(`./img/poker/${x.replace(':', '-')}.png`);
          } catch(e) {
            cardUrl = require(`./img/poker/card-down.png`);
          } 
          return `<div class="img-container">
            <img 
              id=${isDeviceIos() ? 'img-ios' : 'img-other'} 
              ${winPos !== '-1' ? ((shadowedPos.indexOf(`${i+1}`) > -1) ? '' : 'style="opacity: 0.25; filter: alpha(Opacity=25);"') : ''} 
              ${hold !== '-1'   ? ((holdPos.indexOf(`${i+1}`) > -1)     ? '' : 'style="opacity: 0.25; filter: alpha(Opacity=25);"') : ''} 
              src=${cardUrl}>
          </div>`
        }).join('')
      }
    </div>`;
    
    return {__html: result};
}
