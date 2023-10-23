import {isDeviceMobile} from "app/utils";
import {Row} from 'antd';
import * as React from 'react';

export const CARDS_LAYOUT: any = {
  "c2": {"x": 0, "y": 0, "w": 38, "h": 44},
  "c3": {"x": 38, "y": 0, "w": 38, "h": 44},
  "c4": {"x": 76, "y": 0, "w": 38, "h": 44},
  "c5": {"x": 114, "y": 0, "w": 38, "h": 44},
  "c6": {"x": 152, "y": 0, "w": 38, "h": 44},
  "c7": {"x": 190, "y": 0, "w": 38, "h": 44},
  "c8": {"x": 0, "y": 45, "w": 38, "h": 44},
  "c9": {"x": 38, "y": 45, "w": 38, "h": 44},
  "ca": {"x": 76, "y": 45, "w": 38, "h": 44},
  "cj": {"x": 114, "y": 45, "w": 38, "h": 44},
  "ck": {"x": 152, "y": 45, "w": 38, "h": 44},
  "cq": {"x": 190, "y": 45, "w": 38, "h": 44},
  "ct": {"x": 0, "y": 89, "w": 38, "h": 44},
  "d2": {"x": 38, "y": 89, "w": 38, "h": 44},
  "d3": {"x": 76, "y": 89, "w": 38, "h": 44},
  "d4": {"x": 114, "y": 89, "w": 38, "h": 44},
  "d5": {"x": 152, "y": 89, "w": 38, "h": 44},
  "d6": {"x": 190, "y": 89, "w": 38, "h": 44},
  "d7": {"x": 0, "y": 134, "w": 38, "h": 44},
  "d8": {"x": 38, "y": 134, "w": 38, "h": 44},
  "d9": {"x": 76, "y": 134, "w": 38, "h": 44},
  "da": {"x": 114, "y": 134, "w": 38, "h": 44},
  "dj": {"x": 152, "y": 134, "w": 38, "h": 44},
  "dk": {"x": 190, "y": 134, "w": 38, "h": 44},
  "dq": {"x": 0, "y": 178, "w": 38, "h": 44},
  "dt": {"x": 38, "y": 178, "w": 38, "h": 44},
  "h2": {"x": 76, "y": 178, "w": 38, "h": 44},
  "h3": {"x": 114, "y": 178, "w": 38, "h": 44},
  "h4": {"x": 152, "y": 178, "w": 38, "h": 44},
  "h5": {"x": 190, "y": 178, "w": 38, "h": 44},
  "h6": {"x": 0, "y": 223, "w": 38, "h": 44},
  "h7": {"x": 38, "y": 223, "w": 38, "h": 44},
  "h8": {"x": 76, "y": 223, "w": 38, "h": 44},
  "h9": {"x": 114, "y": 223, "w": 38, "h": 44},
  "ha": {"x": 152, "y": 223, "w": 38, "h": 44},
  "hj": {"x": 190, "y": 223, "w": 38, "h": 44},
  "hk": {"x": 0, "y": 267, "w": 38, "h": 44},
  "hq": {"x": 38, "y": 267, "w": 38, "h": 44},
  "ht": {"x": 76, "y": 267, "w": 38, "h": 44},
  "s2": {"x": 114, "y": 267, "w": 38, "h": 44},
  "s3": {"x": 152, "y": 267, "w": 38, "h": 44},
  "s4": {"x": 190, "y": 267, "w": 38, "h": 44},
  "s5": {"x": 0, "y": 312, "w": 38, "h": 44},
  "s6": {"x": 38, "y": 312, "w": 38, "h": 44},
  "s7": {"x": 76, "y": 312, "w": 38, "h": 44},
  "s8": {"x": 114, "y": 312, "w": 38, "h": 44},
  "s9": {"x": 152, "y": 312, "w": 38, "h": 44},
  "sa": {"x": 190, "y": 312, "w": 38, "h": 44},
  "sj": {"x": 0, "y": 356, "w": 38, "h": 44},
  "sk": {"x": 38, "y": 356, "w": 38, "h": 44},
  "sq": {"x": 76, "y": 356, "w": 38, "h": 44},
  "st": {"x": 114, "y": 356, "w": 38, "h": 44},
};

export function createCardsContent(cardsStr: string, text: string): any {
  let cards: string[] = transformCardsValue(cardsStr);
  let imgUrl: string = isDeviceMobile() ? require("./img/cards/cards@2.png") : require("./img/cards/cards.png");
  return (<Row>
    <p><strong>{text}</strong></p>
    <div className={"details_line"}>
      {
        cards.map((cardId: any, i: number) => {
          let imagePos = CARDS_LAYOUT[cardId];
          let style = {
            background: "url(" + imgUrl + ") " + toObjectPos(imagePos.x) + " " + toObjectPos(imagePos.y),
            backgroundSize: "256px 512px",
            maxWidth: imagePos.w + "px",
            width: i != cards.length - 1 ? "calc(" + 100 / (cards.length - 1) + "% - " + imagePos.w / (cards.length - 1) + "px)" : imagePos.w + "px",
            height: imagePos.h + "px"
          };

          return (
            <div key={i} style={style}/>
          )
        })
      }
      <br/>
    </div>
  </Row>);
}

function toObjectPos(value: number): string {
  return value == 0 ? "0" : -value + "px";
}

function transformCardsValue(cardsStr: string): Array<string> {
  let result = [];
  let cardsData: Array<string> = cardsStr.split(",");
  for (let i = 0; i < cardsData.length; i++) {
    let value = cardsData[i];
    let cardValue: string = value.substring(2);
    let cardSuite: string = value.substring(0, 1);
    result.push(cardSuite + (cardValue != "10" ? cardValue : "t"))
  }
  return result;
}
