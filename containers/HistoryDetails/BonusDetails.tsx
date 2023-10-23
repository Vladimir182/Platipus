import * as React from 'react';
import localization from "app/localization";
import {Icon} from 'antd';

let lang = localStorage.getItem('lang') || 'en';
export default class BonusDetails {
  // static Default (data:any):any{
  //   return (
  //     <div style={{textAlign:'center'}}>
  //       <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
  //       <p><strong>{(localization.BONUS_WIN as any)[lang]}</strong> {wild}</p>
  //       <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {wild}</p>
  //       <p><strong>{(localization.MULTIPLIER_DETAILS as any)[lang]}</strong> {wild}</p>
  //     </div>
  //   )
  // }

  static PiedraDelSol(
    data: { isFinish: boolean; bonuswheel_level: number; bonuswheel_position: number; bonuswheel_price: number; jackpot_price: number; bonusWin: string; }
  ): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{'State: '}</strong> {data.isFinish ? 'Complete' : 'In Progress'}</p>
        {!data.isFinish ? <p><strong>{'Win: '}</strong><Icon type="arrow-up" /></p> : null}
        {data.isFinish && (data.bonuswheel_price || data.jackpot_price) ? <p><strong>{'Win: '}</strong> {data.bonusWin}</p> : null}
      </div>
    )
  }

  static BambooGrove(
    data: { isFinish: boolean; position: number; prizes: 0; wheel: number; win: number; bonusWin: string; cashPrize: string;}
  ): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{'State: '}</strong> {data.isFinish ? 'Complete' : 'In Progress'}</p>
        <p><strong>{'Win: '}</strong> {data.isFinish ? `${data.bonusWin}` : <Icon type="arrow-up" />}</p>
      </div>
    )
  }

  static MightOfZeus(
    jackpot: string,
    jackpotWin: string
  ): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{'Jackpot: '}</strong> {jackpot}</p>
        <p><strong>{(localization.JACKPOT_WIN as any)[lang]}</strong> <i>{jackpotWin}</i></p>
        {/* <p><strong>{'Balance: '}</strong> {balance}</p> */}
      </div>
    )
  }

  static EgyptianGold(count: number): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {count}</p>
      </div>
    )
  }

  static BookOfEgypt(wild: string): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.SPECIAL_EXPANDING_SYMBOL as any)[lang]}</strong> <img src={wild}/></p>
      </div>
    )
  }

  static Crocoman(wild: string): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.GOLD_SYMBOL as any)[lang]}</strong> <img src={wild}/></p>
      </div>
    )
  }

  static MonkeysJourney(wild: string): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.SPECIAL_SYMBOL as any)[lang]}</strong> <img src={wild}/></p>
      </div>
    )
  }

  static LuckyDolphin(winStr: string, multiplier: number): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.BONUS_WIN as any)[lang]}</strong> {winStr}</p>
        <p><strong>{(localization.MULTIPLIER_DETAILS as any)[lang]}</strong> {multiplier}</p>
      </div>
    )
  }

  static GreatOcean(count: number, multiplier: number): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {count}</p>
        <p><strong>{(localization.MULTIPLIER_DETAILS as any)[lang]}</strong> {multiplier}</p>
      </div>
    )
  }

  static ChineseTigers(count: number, itemId: number, gameName: string): any {
    let extraWilds: number[] = [];
    switch (itemId) {
      case 1: {
        extraWilds = [5];
        break;
      }
      case 2: {
        extraWilds = [5, 4];
        break;
      }
      case 3: {
        extraWilds = [5, 4, 3];
        break;
      }
    }
    let imgs = extraWilds.map((id: number, index: number) => {
      let url = require(`./img/${gameName}/s${id + 11}.png`);
      return (
        <span key={index}><img src={`${url}`}/> </span>
      )
    });
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {count}</p>
        <p><strong>{(localization.WILD as any)[lang]}</strong> {imgs}</p>
      </div>
    )
  }

  static CaishensGifts(count: number, itemId: number, gameName: string): any {
    let multiplier: string = "";
    switch (itemId) {
      case 1: {
        multiplier = "x2, x3, x5";
        break;
      }
      case 2: {
        multiplier = "x3, x5, x8";
        break;
      }
      case 3: {
        multiplier = "x5, x8, x10";
        break;
      }
      case 4: {
        multiplier = "x8, x10, x15";
        break;
      }
      case 5: {
        multiplier = "x10, x15, x30";
        break;
      }
    }
    let url = require(`./img/${gameName}/s${itemId + 13}.png`);
    let img = <span><img src={`${url}`}/></span>;
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {count}</p>
        <p><strong>{(localization.WILD as any)[lang]}</strong> {img}</p>
        <p><strong>{(localization.MULTIPLIER_DETAILS as any)[lang]}</strong> {multiplier}</p>
      </div>
    )
  }

  static RichyWitchy(count: number, wild: string): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {count}</p>
        <p><strong>{(localization.WILD as any)[lang]}</strong> <img src={wild}/></p>
      </div>
    )
  }

  static CrystalSevens(data: any, winStr: string): any {
    let bonusId: number = data.bonusGame;
    switch (bonusId) {
      case 1:
        return (
          <div style={{textAlign: 'center'}}>
            <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
            <p><strong>{(localization.BONUS_WIN as any)[lang]}</strong> {winStr}</p>
            <p><strong>{(localization.MULTIPLIER_DETAILS as any)[lang]}</strong> {data.coinsMultiplierLevel}</p>
          </div>);
      case 2:
        return (
          <div style={{textAlign: 'center'}}>
            <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
            <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {data.count}</p>
          </div>
        );
      case 3:
        return (
          <div style={{textAlign: 'center'}}>
            <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
            <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {data.spins}</p>
            <p><strong>{(localization.MULTIPLIER_DETAILS as any)[lang]}</strong> {data.spinsMultiplier}</p>
          </div>);
      default:
        return (
          <div style={{textAlign: 'center'}}>
            <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
            <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {data.count}</p>
          </div>
        );
    }
  }

  static MagicalMirror(count: number, sector: string, gameName: string): any {
    let extraWilds: number[] = [];
    switch (sector) {
      case '1': {
        extraWilds = [4];
        break;
      }
      case '2': {
        extraWilds = [4, 5, 6];
        break;
      }
      case '3': {
        extraWilds = [6];
        break;
      }
      case '4': {
        extraWilds = [5, 6];
        break;
      }
      case '5': {
        extraWilds = [5];
        break;
      }
      case '6': {
        extraWilds = [4, 5];
        break;
      }
      case '7': {
        extraWilds = [4];
        break;
      }
      case '8': {
        extraWilds = [4, 6];
        break;
      }
    }
    let imgs = extraWilds.map((id: number, index: number) => {
      let url = require(`./img/${gameName}/s${id + 11}.png`);
      return (
        <span key={index}><img src={`${url}`}/> </span>
      )
    });
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {count}</p>
        <p><strong>{(localization.WILD as any)[lang]}</strong> {imgs}</p>
      </div>
    )
  }

  static LoveIs(data: any): any {
    if (data.countStep === 1) {
      let wild = data.items.filter((val: any) => val.selected === 1)[0].value;
      let text: string = '';
      switch (wild) {
        case 1: {
          text = (localization.LEFT_EXPANDING_WILD as any)[lang];
          break;
        }
        case 2: {
          text = (localization.RIGHT_EXPANDING_WILD as any)[lang];
          break;
        }
        case 3: {
          text = (localization.EXPANDING_WILD as any)[lang];
          break;
        }
      }
      return (
        <div style={{textAlign: 'center'}}>
          <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
          <p><strong>{(localization.WILD as any)[lang]}</strong> {text}</p>
        </div>
      )
    }
    else {
      return (
        <div style={{textAlign: 'center'}}>
          <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
          <p><strong>{(localization.FREESPINS_RESPINS_PLAYED as any)[lang]}</strong> {data.spins}</p>
        </div>
      )
    }
  }

  //anime
  static SexTale(winStr: string): any {
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        <p><strong>{(localization.BONUS_WIN as any)[lang]}</strong> {winStr}</p>
      </div>
    )
  }

  static SexTaleSecond(winStr: string, selected: any[], finish: boolean): any {
    let getItemNameByTypeId = (typeId: number) => {
      let result = '';
      switch (typeId) {
        case 0: {
          result = 'x10';
          break;
        }
        case 1: {
          result = 'x15';
          break;
        }
        case 2: {
          result = 'x20';
          break;
        }
        case 3: {
          result = 'x30';
          break;
        }
      }
      return result;
    };
    let getWonItemName = (selected: any[]) => {
      let item_0 = 0;
      let item_1 = 0;
      let item_2 = 0;

      for(let key in selected){
        let typeId = selected[key];
        switch (typeId) {
          case 0: {
            item_0++;
            if(item_0 === 3){
              return 'x10';
            }
            break;
          }
          case 1: {
            item_1++;
            if(item_1 === 3){
              return 'x15';
            }
            break;
          }
          case 2: {
            item_2++;
            if(item_2 === 3){
              return 'x20';
            }
            break;
          }
          case 3: {
            return 'x30';
          }
        }
      }
      return 'Unknown Item Type';
    };
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{localization.BONUS_DETAILS[lang]}</h3>
        <p><strong>{'Selected Items: '}</strong>{selected && Object.keys(selected).map((key:any,i:number)=>(getItemNameByTypeId(selected[key]) + "; "))}</p>
        {finish?<p><strong>{'Multiplier: '}</strong>{selected && getWonItemName(selected)}</p>:''}
        {finish?<p><strong>{(localization.BONUS_WIN as any)[lang]}</strong> {winStr}</p>:''}
      </div>
    )
  }

  static Jackpot(winStr: string, selected: any[], finish: number): any {

    let getJackpotNameByTypeId = (typeId: number) => {
      let result = '';
      switch (typeId) {
        case 1: {
          result = localization.EXTRA_JACKPOT[lang];
          break;
        }
        case 2: {
          result = localization.MEGA_JACKPOT[lang];
          break;
        }
        case 3: {
          result = localization.GRAND_JACKPOT[lang];
          break;
        }
        case 4: {
          result = localization.GIGA_JACKPOT[lang];
          break;
        }
      }
      return result;
    };

    let getWonJackpotName = (selected: any[]) => {
      let extra = 0;
      let mega = 0;
      let grand = 0;
      let giga = 0;

      for(let i = 0; i < selected.length;i++){
        let typeId = selected[i].type;
        switch (typeId) {
          case 1: {
            extra++;
            if(extra === 3){
              return localization.EXTRA_JACKPOT[lang];
            }
            break;
          }
          case 2: {
            mega++;
            if(mega === 3){
              return localization.MEGA_JACKPOT[lang];
            }
            break;
          }
          case 3: {
            grand++;
            if(grand === 3){
              return localization.GRAND_JACKPOT[lang];
            }
            break;
          }
          case 4: {
            giga++;
            if(giga === 3){
              return localization.GIGA_JACKPOT[lang];
            }
            break;
          }
        }
      }
      return 'Unknown Jackpot Type';
    };
    return (
      <div style={{textAlign: 'center'}}>
        <h3>{(localization.BONUS_DETAILS as any)[lang]}</h3>
        {selected?<p><strong>{localization.SELECTED_JACKPOTS[lang]}</strong>{selected && selected.map((val: any, i: number) => (getJackpotNameByTypeId(val.type) + "; "))}</p>
          :
          <p><strong>{localization.JACKPOT_STARTED[lang]}</strong></p>}
        {finish?<p><strong>{(localization.JACKPOT_WIN as any)[lang]}</strong> {getWonJackpotName(selected)}</p>:''}
        {finish?<p><strong>{(localization.BONUS_WIN as any)[lang]}</strong> {winStr}</p>:''}
      </div>
    )
  }
}
