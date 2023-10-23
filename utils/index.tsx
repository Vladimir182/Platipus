import * as moment from 'moment'
import {IRoom} from "app/reducers/filter";
import {FORMATS} from "app/const/moneyFormatter";

enum PrizesType  {
  Cache = 1,
  FreeSpin,
  RaffleTicket,
  Gift
}
interface convertInputMinutes {
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
}

let TRILLION: number = 1000000000000;
let BILLION: number = 1000000000;
let MILLION: number = 1000000;
let THOUSAND: number = 1000;

let SHORT_TRILLION: string = "T";
let SHORT_BILLION: string = "B";
let SHORT_MILLION: string = "M";
let SHORT_THOUSAND: string = "K";

export function concatParamsToURL(url: string, obj: any) {
  let query = '?';
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      query += prop + '=' + (typeof obj[prop] !== 'string' ? JSON.stringify(obj[prop]) : obj[prop]) + '&'
    }
  }
  query = query.substring(0, query.length - 1);
  return url + query
}

export function isoStringToUTCDate(isoTime: string) {
  return moment(isoTime).utc().format('YYYY/MM/DD HH:mm:ss');
}

export const openAccount = (that: any, roles: any, activeRole: string) => () => {
  let account_url = `${roles[activeRole].route}${roles[activeRole].children.ACCOUNT}`;
  if (account_url === that.props.currentTab) {
    return;
  }
  that.props.savePrevPageForHelp(that.props.currentTab + that.props.history.location.search);
  that.props.history.push(account_url);
};

export function sortTableOrder(order: string): string {
  let result: string = "";
  switch (order) {
    case "descend": {
      result = "desc";
      break;
    }
    case "ascend": {
      result = "asc";
      break;
    }
  }
  return result;
}

export function reversedSortTableOrder(order: string): string {
  let result: string = "";
  switch (order) {
    case "desc": {
      result = "descend";
      break;
    }
    case "asc": {
      result = "ascend";
      break;
    }
  }
  return result;
}

export function getParameterByName(name: string, url?: string): any {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export function clearSelection() {
  if ((window as any).getSelection) {
    (window as any).getSelection().removeAllRanges();
  }
  else if ((document as any).selection) {
    (document as any).selection.empty();
  }
}

export function getMomentFormattedRange(selectedDateRange: string[]): any[] {
  let arr = [];
  arr[0] = moment(selectedDateRange[0]).utc();
  arr[1] = moment(selectedDateRange[1]).utc();
  return arr;
}

export function getMomentDatePicker(selectedDatePicker: string): any {
  return moment(selectedDatePicker).utc();
}

export function addZoneOffsetToISOString(time: string, zone: string): string {
  let z = '';
  if (zone.indexOf('-') === -1) {
    z = zone.replace('+', '-');
  } else {
    z = zone.replace('-', '+');
  }
  return moment(time).utc().utcOffset(z, true).toISOString();
}

export function addZoneOffsetToISOStringForRequest(time: string, zone: string): string {
  return moment(time).utc().utcOffset(zone, true).toISOString();
}

export function getTodayRange(): string[] {
  let date = new Date();
  let zone = date.getTimezoneOffset() / (-60);
  return [moment(moment().utc().format('YYYY-MM-DD 00:00:00')).add(zone, 'hour').toISOString(),
    moment(moment().utc().add(1, 'days').format('YYYY-MM-DD 00:00:00')).add(zone, 'hour').toISOString()];
}

export function getTodayRulesTime(): any {
  let date = new Date();
  let zone = date.getTimezoneOffset() / (-60);
  return moment(moment().utc().format('YYYY/MM/DD HH:mm:ss')).add(zone, 'hour').toISOString()
}

export function getTodayRangeWithoutSecond() {
  let m = moment().utcOffset(0);
  m.set({hour: 0, minute: 0, second: 0, millisecond: 0});
  m.toISOString();
  m.format();
  let start = m.toISOString();
  let end = moment(m).add(1, 'days').add(-1, 'second').toISOString();
  return [start, end];
}

export function getMoment(val: string) {
  return moment(val).utc();
}

export function getLocalMoment(val: string) {
  return moment(val);
}

export function getOneDayRangeByDate(val: string): string[] {
  let date = new Date();
  let zone = date.getTimezoneOffset() / (-60);
  return [moment(moment(val).format('YYYY-MM-DD 00:00:00')).add(zone, 'hour').toISOString(),
    moment(moment(val).add(1, 'days').format('YYYY-MM-DD 00:00:00')).add(zone, 'hour').toISOString()]
}

export function getTodayEndTimestamp(): number {
  return moment(moment().utc().add(1, 'days').format('YYYY-MM-DD 00:00:00')).valueOf();
}

export function getDateString(dateValue: any): string {
  return moment(new Date(dateValue)).utc().format('YYYY-MM-DD')
}

export function formatNumberData(num: number | undefined, needInteger?: boolean): string | undefined {
  if (num !== undefined && typeof num === 'number') {
    if (needInteger) {
      return num.toString().replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
    } else {
      return num.toFixed(2).replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
    }
  } else {
    return
  }
}

export function shortFormatNumber(value: number, isRound?: boolean): string {
  if (isNaN(value)) {
    value = 0;
  }
  if (value == 0) {
    return "0";
  }
  let isMinus = value < 0;
  if(isMinus){
    value = -value;
  }
  let shortPostfix: string = '';
  if (value >= TRILLION) {
    let result = convertShortFormatNumber(value, TRILLION, isRound);
    if (result != -1) {
      value = result;
      shortPostfix = SHORT_TRILLION;
    }
  }
  if (value >= BILLION) {
    let result = convertShortFormatNumber(value, BILLION, isRound);
    if (result != -1) {
      value = result;
      shortPostfix = SHORT_BILLION;
    }
  }
  if (value >= MILLION) {
    let result = convertShortFormatNumber(value, MILLION, isRound);
    if (result != -1) {
      value = result;
      shortPostfix = SHORT_MILLION;
    }
  }
  if (value >= THOUSAND) {
    let result = convertShortFormatNumber(value, THOUSAND, isRound);
    if (result != -1) {
      value = result;
      shortPostfix = SHORT_THOUSAND;
    }
  }

  return (isMinus? - value: value) + shortPostfix;
}

function convertShortFormatNumber(value: number, coeff: number, isRound: boolean | undefined): number {
  let result = value / coeff;
  if (isRound) {
    return parseFloat(result.toFixed(3));
  }
  let penny = (result % 1).toString();
  if (penny.length <= 5) {
    return result;
  }
  return -1;
}

export function getConvertIntoMinutes({months, days, hours, minutes}: convertInputMinutes){
  if(months){ months = (months * 24) * 60} else months = 0;
  if(days){ days = (days * 24) * 60 } else days = 0;
  if(hours){ hours = hours * 60 } else hours = 0;
  if(minutes){ minutes = minutes } else minutes = 0;

  return  months + days + hours + minutes;
}

export function flatternPrizeFund(prizes: any) {
  const result: any = [];
  let arr = Array.from(prizes)
  arr.forEach((prize: any): any => {
    switch(prize.PrizeType){
      case 1: { return result.push({Cache: prize.Count})}
      case 2: { return result.push({FreeSpin: prize.Count})}
      case 3: { return result.push({RaffleTicket: prize.Count})}
      case 4: { return result.push({Gift: prize.Count})}
    }
  })

  const newResult = Object.assign({}, ...result);
  return newResult;
}

export function flatternEditPrizes(prizes: any) {
  const result: any = [];
  prizes.forEach((prize: any) => {
    if (Array.isArray(prize.Prizes)) {
      prize.Prizes.forEach(({ PrizeType, Count }: any) => {
        result.push({
          prizePosition: String(prize.Position),
          prizeTypeId: PrizeType,
          prizeCount: String(Count)
        });
      });
    }
  });
  return result;
}

export function getConvertPrizeFund(item: any) {
  let result: any =[]
  for(let key in item) {
    switch(key){
      case 'Cache': {
        if(item['Cache'] !== null && item['Cache'] !== undefined){
          result.push({
            Count: item['Cache'],
            PrizeType: PrizesType.Cache
          })
        }
      }
      case "FreeSpin": {
        if(item['FreeSpin'] !== null && item['FreeSpin'] !== undefined) {
          result.push({
            Count: item['FreeSpin'],
            PrizeType: PrizesType.FreeSpin
          })
        }
      }
      case "RaffleTicket": {
        if(item['RaffleTicket'] !== null && item['RaffleTicket'] !== undefined) {
          result.push({
            Count: item['RaffleTicket'],
            PrizeType: PrizesType.RaffleTicket
          })
        }
      }
      case "Gift": {
        if(item['Gift'] !== null && item['Gift'] !== undefined) {
          result.push({
            Count: item['Gift'],
            PrizeType: PrizesType.Gift
          })
        }
      }
      return result;
    }
  }
}

export function groupPrizePosition(prizes: any) {
  const result: any = [];
  prizes.forEach((listItem: any) => {
    if (result[listItem.prizePosition]) {
      result[listItem.prizePosition].Prizes.push({
        PrizeType: listItem.prizeTypeId,
        Count: Number(listItem.prizeCount)
      });
    } else {
      result[listItem.prizePosition] = {
        Position: Number(listItem.prizePosition),
        Prizes: [
          {
            PrizeType: listItem.prizeTypeId,
            Count: Number(listItem.prizeCount)
          }
        ],
      };
    }
  });
  const newResult = result.filter((el: any) => el !== '')
 return newResult
}

export function convertExchangeSettings(type: number, currencyId: number){
  if(type === 1){
   return  {'Type': type, CurrencyId: null}
  } else if(type === 2){
   return  {'Type': type, CurrencyId: null}
  } else {
   return {'Type': type, CurrencyId: currencyId}
  }
 };

export function formatTableData(arr: any[], propertiesToConvert: string[]): any[] {
  const newArray = arr.map((obj) => {
    const bet = obj['bet'] ? obj['bet'] : 0;
    const buyBet = obj['buyBet'] ? obj['buyBet'] : 0;
    const betCount = obj['betCount'] ? obj['betCount'] : 0;
    const buyCount = obj['buyCount'] ? obj['buyCount'] : 0;
    const betNoBuy = bet - buyBet;
    const betCountNoBuy = betCount - buyCount + 0.001;
    const avgBetNoBuy = betNoBuy / betCountNoBuy;
    obj['avgBetNoBuy'] = formatNumberData(avgBetNoBuy);
    return Object.assign({}, ...Object.keys(obj).map(k => ({[k]: propertiesToConvert.indexOf(k) !== -1 ? formatNumberData(obj[k]) : obj[k]})))
  });
  return newArray;
}

export function convertSelectedTreeValuesToNumbers(val: string[], list: any[]) {
  let arr: any = val.map((v) => {
    let categoryId = v.split(":")[1];
    let id = categoryId.split('-')[1];
    if (id) {
      return [id]
    } else {
      let categoryIdNum = categoryId;
      return list.filter((el) => el.categoryId == categoryIdNum).map((el) => el.id.toString())
    }
  });
  let newArr: number[] | string[] = [];
  for (let i = 0; i < arr.length; i++) {
    newArr = [...newArr, ...arr[i]]
  }
  return newArr;
}

export function convertSelectedCountryValuesToString(val: string[], list: any[]) {
  let arr: any = val.map((v) => {
    let continentId = v.split(":")[1];
    let id = continentId.split('-')[1];
    if (id) {
      return [id]
    } else {
      let categoryIdNum = continentId;
      return list.filter((el) => el.continentId == categoryIdNum).map((el) => el.id.toString())
    }
  });
  let newArr: number[] | string[] = [];
  let result: string;
  for (let i = 0; i < arr.length; i++) {
    newArr = [...newArr, ...arr[i]];
  }
  result = newArr.join();
  return result;
}

export const convertGamesListToLinesCategory = (gamesList: any[]) => {
  return gamesList
    .filter(g => +g['categoryId'] === 1)
    .sort((a,b) => b['lineCount'] - a['lineCount'])
    .map(g => ({
      ...g,
      categoryId: `${g['lineCount']}`,
      categoryName: `${g['lineCount']} ${[1].indexOf(g['lineCount']) > -1 ? 'line' : 'lines'}`})
    );
}

export function formatTreeData(list: any[], withPlatform?: boolean): any[] {
  let flags = [], categoryId: any[] = [], l = list.length;
  for (let i = 0; i < l; i++) {
    if (flags[list[i].categoryId]) continue;
    flags[list[i].categoryId] = true;
    categoryId.push(list[i].categoryId);
  }
  let treeData: any[] = [];
  for (let i = 0; i < categoryId.length; i++) {
    let office = list.find((x: any) => x.categoryId === categoryId[i]);
    let children = list.filter((val: IRoom) => categoryId[i] === val.categoryId);
    let childFormatted = children.map((val: IRoom) => {
      let platform = withPlatform ? ` (${val.platform})` : '';
      return ({
        title: val.name + platform,
        value: `${val.name}:${val.categoryId}-${val.id}`,
        key: categoryId[i] + '-' + val.id
      })
    });
    if (office) {
      let platform = withPlatform ? ` (${office.platform})` : '';
      treeData.push({
        title: office.categoryName + platform,
        value: `${office.categoryName}:${office.categoryId}`,
        key: office.categoryId.toString(),
        children: childFormatted
      });
    }
  }
  return treeData;
}

export function formatCountryData (list: any[], withPlatform?: boolean) {
  let flags = [], continentId: any[] = [], l = list.length;
  for (let i = 0; i < l; i++) {
    if(flags[list[i].continentId]) continue;
    flags[list[i].continentId] = true;
    continentId.push(list[i].continentId);
  }
  let treeData: any[] = [];
   for(let i = 0; i < continentId.length; i++){
    let office = list.find((x: any) => x.continentId === continentId[i]);
    let children = list.filter((val: IRoom) => continentId[i] === val.continentId);
    let childFormatted = children.map((val: IRoom) => {
      let platform = withPlatform ? ` (${val.platform})` : '';
      return ({
        title: val.name + platform,
        value: `${val.name}:${val.continentId}-${val.id}`,
        key: continentId[i] + '-' + val.id
      })
    });
    if (office) {
      let platform = withPlatform ? ` (${office.platform})` : '';
      treeData.push({
        title: office.continentName + platform,
        value: `${office.continentName}:${office.continentId}`,
        key: office.continentId.toString(),
        children: childFormatted
      });
    }
  }
  return treeData;
}

export function isDeviceMobile() {
  let check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || (window as any).opera);
  return check;
}

export function isDeviceMobileAndTablet() {
  let check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
  })(navigator.userAgent || navigator.vendor || (window as any).opera);
  return check;
}

export function isDeviceIos() {
  let check = false;
  //browser
  // const IE: string = "IE";
  const SAFARI: string = "Safari";
  const MAC_INTEL: string = "MacIntel";
  const CHROME: string = "Chrome";

  //device
  // const ANDROID: string = "Android";
  const IPAD: string = "iPad";
  const IPOD: string = "iPod";
  const IPHONE: string = "iPhone";

  const ipad = navigator.platform == IPAD || (navigator.platform == MAC_INTEL && navigator.userAgent.indexOf(SAFARI) != -1 && navigator.userAgent.indexOf(CHROME) == -1 && navigator as any["standalone"] !== undefined);
  const ios = ipad || navigator.platform == IPHONE || navigator.userAgent.indexOf(IPHONE) != -1 || navigator.platform == IPOD;

  check = ios;

  return check;
}

export function isLocalStorageNameSupported() {
  let testKey = 'test', storage = localStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

export function getCorrectSortKey(sort: string, arr: string[], defaultVal: string) {
  if (arr.indexOf(sort) === -1) {
    return defaultVal;
  } else {
    return sort;
  }
}

export function isDescendant(parent: any, child: any) {
  let node = child.parentNode;
  while (node != null) {
    if (node == parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

interface insertParamI {
  key: string;
  value: any;
}

export function insertParam(params: insertParamI[], props: any) {
  let kvp = props.location.search.substr(1).split('&');
  props.history.push({
    search: helperQueryFunc(params, kvp)
  });
}

export function substituteQueryParam(searchString: string, params: insertParamI[]): string {
  let kvp = searchString.substr(1).split('&');
  return helperQueryFunc(params, kvp);
}

export function helperQueryFunc(params: insertParamI[], kvp: string[]) {
  for (let k = 0; k < params.length; k++) {
    let el = params[k];
    let key = encodeURI(el.key);
    let value = encodeURI(el.value);

    let i = kvp.length;
    let x;
    while (i--) {
      x = kvp[i].split('=');

      if (x[0] == key) {
        x[1] = value;
        kvp[i] = x.join('=');
        break;
      }
    }

    if (i < 0) {
      kvp[kvp.length] = [key, value].join('=');
    }
  }
  return `?${kvp.join('&')}`;
}

export function removeParams(params: string[], props: any) {
  let kvp = props.location.search.substr(1).split('&');
  let kvpClone = [...kvp];
  for (let i = 0; i < params.length; i++) {
    let key = params[i];
    let j = kvp.length;
    while (j--) {
      let keyValue = kvpClone[j].split('=');
      if (keyValue[0] == key) {
        kvpClone.splice(j, 1);
        break;
      }
    }
  }
  props.history.push({
    search: `?${kvpClone.join('&')}`
  });
}

export function downloadObjectAsJson(exportObj: any, exportName: string) {
  let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, "\t"));
  let downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function isPageGameHistory() {
  return window.location.pathname.indexOf("round-history") != -1;
}

export function isPageRoundDetails() {
  return window.location.pathname.indexOf("round-details") != -1;
}

export function isPageError() {
  return window.location.pathname.indexOf("error") != -1;
}

export function isPageGameHistoryAuth() {
  return window.location.pathname.indexOf("get-hash") != -1;
}

export function uniqueObjectsArrayByProperty(rooms: any[], property: string): any[] {
  let res: any[] = [];
  let resIds: any[] = [];
  for (let i = 0; i < rooms.length; i++) {
    let room = rooms[i] as any;
    if (resIds.indexOf(room[property]) == -1) {
      resIds.push(room[property]);
      res.push(room);
    }
  }
  return res;
}

export function onAllimagesLoaded(callback: () => void) {
  let imgs = document.images,
    len = imgs.length,
    counter = 0;

  [].forEach.call( imgs, function( img: HTMLImageElement ) {
    if(img.complete)
      incrementCounter();
    else
      img.addEventListener( 'load', incrementCounter, false );
  } );

  function incrementCounter() {
    counter++;
    if ( counter === len ) {
      console.log( 'All images loaded!' );
      callback();
    }
  }
}

export function isHidden(el: HTMLElement) {
  return (el.offsetParent === null)
}

export function isChrome(){
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}

export function checkIfHasBuyCount(row: any) {

  const hasRowBuyCount = row && row.buyCount;
  const buyCountFormatted = hasRowBuyCount && typeof row.buyCount === 'string' ?
    row.buyCount.split('').filter((x: string)=>x!==' ').join('') :
    row.buyCount;
  const hasBuyCount = hasRowBuyCount && +buyCountFormatted > 0;

  return hasBuyCount;

}

export function generateValueWithCurrency(value: any, row: any, currency: any, buyProperty: string, hideBuy?: boolean): any {

  const hasBuyCount = checkIfHasBuyCount(row);

  let valueBuy = FORMATS[currency] ? `[${FORMATS[currency]['symbol']} ${row[buyProperty]}]` : `[${row[buyProperty]} ${currency}]`;
  if (buyProperty === 'buyAvgBet') {
    valueBuy = FORMATS[currency] ? `[${FORMATS[currency]['symbol']} ${row[buyProperty]} / ${FORMATS[currency]['symbol']} ${row['avgBetNoBuy']}]` : `[${row[buyProperty]} ${currency} / ${row['avgBetNoBuy']} ${currency}]`;
  }
  const valueSimple = FORMATS[currency] ? `${FORMATS[currency]['symbol']} ${value}` : `${value} ${currency}`;
  const valueExtended = `${valueBuy} ${valueSimple}`;

  return !hideBuy && hasBuyCount ? valueExtended : valueSimple;

};

export function generateValueWithoutCurrency(value: any, row: any, buyProperty: string, hideBuy?: boolean) {

  const hasBuyCount = checkIfHasBuyCount(row);

  const valueBuy = `[${row[buyProperty]}]`;
  const valueSimple = value;
  const valueExtended = `${valueBuy} ${value}`;

  return !hideBuy && hasBuyCount ? valueExtended : valueSimple;

};

export function generateValueWithPercent(value: any, row: any, buyProperty: string, hideBuy?: boolean) {

  const hasBuyCount = checkIfHasBuyCount(row);

  const valueBuy = `[${row[buyProperty]} %] `;
  const valueSimple = `${value} %`;
  const valueExtended = `${valueBuy} ${valueSimple}`;

  return !hideBuy && hasBuyCount ? valueExtended : valueSimple;

};

export function isTest() {
  return (window.location.host.indexOf('local') !== -1 || window.location.host.indexOf('192.168.') !== -1 || window.location.host.indexOf('bo2test') !== -1 || window.location.host.indexOf('bo2stage') !== -1);
}

export const isInOrderAsc = (bets: string) => {
  return typeof bets === 'string' ?
    (bets.slice(-1) === ';' ? bets.slice(0, -1) : bets)
      .split(';')
      .map(x => +x.replace(',','.'))
      .reduce((acc: number[][], cur, i, arr) => {
          const LOW_LEVEL = -1;
          const next = arr[i+1];
          const hasNext = next || next === 0;
          const nextValue = hasNext && next === 0 ? LOW_LEVEL : next;
          const curValue = cur === 0 ? LOW_LEVEL : cur;
          if (hasNext) acc.push([curValue, nextValue]);
          return acc;
      }, [])
      .map(x => (x[0] !== -1 && x[1] !== -1 ? (x[0] - x[1]) < 0 : false))
      .filter(x => x === false).length === 0 :
    false;
}

export const isVideoPoker = (gameId: number) => {
  return [ 562, 577, 566, 580 ].indexOf(gameId) > -1;
}

export const isHoldem = (gameId: number) => {
  return [ 584, 591 ].indexOf(gameId) > -1;
}

export const isSlotWithCounter = (gameId: number) => {
  return [ 570 ].indexOf(gameId) > -1;
}

export const checkUppercase = (str: string) => {
  for (var i=0; i<str.length; i++){
    if (str.charAt(i) == str.charAt(i).toUpperCase() && str.charAt(i).match(/[a-z]/i)){
      return true;
    }
  }
  return false;
};

export const checkLowercase = (str: string) => {
  for (var i=0; i<str.length; i++){
    if (str.charAt(i) == str.charAt(i).toLowerCase() && str.charAt(i).match(/[a-z]/i)) {
      return true;
    }
  }
  return false;
};

export const validatePassword = (password: string, login: string): { valid: boolean; message: string} => {

  const statePassword = typeof password === 'string' ? password.trim() : '';
  const stateLogin = typeof login === 'string' ? login.trim() : '';
  const lengthMin = 8;
  const lengthMax = 16;
  const hasMinLength = statePassword.length >= lengthMin;
  const hasMaxLength = statePassword.length <= lengthMax;
  const hasIdenticalLogin = stateLogin === statePassword;
  const hasAlphanumeric = /^[a-zA-Z0-9]*$/.test(statePassword);
  const hasUppercase = checkUppercase(statePassword);
  const hasLowercase = checkLowercase(statePassword);

  if (!hasMinLength)      return { valid: false, message: `Password must consist of a minimum of ${lengthMin} characters!` };
  if (!hasMaxLength)      return { valid: false, message: `Password must consist of a maximum of ${lengthMax} characters!` };
  if (hasIdenticalLogin)  return { valid: false, message: 'Password must not be identical to the respective login!' };
  if (!hasAlphanumeric)   return { valid: false, message: 'Password must consist of alphanumeric characters only!'}
  if (!hasUppercase)      return { valid: false, message: 'Password must contain at least 1 uppercase character'}
  if (!hasLowercase)      return { valid: false, message: 'Password must contain at least 1 lowercase character'}

  return { valid: true, message: 'Password is valid' };

}

export const validateLogin = (login: string): { valid: boolean; message: string} => {

  const stateLogin = typeof login === 'string' ? login.trim() : '';
  const lengthMin = 3;
  const lengthMax = 32;
  const hasMinLength = stateLogin.length >= lengthMin;
  const hasMaxLength = stateLogin.length <= lengthMax;
  const hasAlphanumeric = /^[a-z0-9_]*$/.test(stateLogin);
  const hasLowercase = checkLowercase(stateLogin);

  if (!hasMinLength)    return { valid: false, message: `Login must consist of a minimum of ${lengthMin} characters!` };
  if (!hasMaxLength)    return { valid: false, message: `Login must consist of a maximum of ${lengthMax} characters!` };
  if (!hasAlphanumeric) return { valid: false, message: 'Login must consist of lowercase alphanumeric characters or/and underscore only!'}
  if (!hasLowercase)    return { valid: false, message: 'Login must contain at least 1 lowercase character'}

  return { valid: true, message: 'Login is valid' };

}

export const roundValue = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;


export const hasPrizeDuplicates = (prizes: any[]) => {

  const prizeKeys = prizes.map(x=> `${x.prizePosition}_${x.prizeTypeId}`);
  const prizeKeysUnique = [...new Set(prizeKeys)];

  return prizeKeys.length !== prizeKeysUnique.length;

}

export const removeLoginSuffix = (text: string) => {
  const parts = `${text}`.split('_');

  const isSuffixInteger = Number.isInteger(+parts[parts.length - 1]);

  return (parts.length > 1) && isSuffixInteger ? parts.slice(0,-1).join('_') : `${text}`;
}

type DebouncedFunction<F extends (...args: any[]) => any> = {
  (this: any, ...args: any[]): ReturnType<F> | undefined;
};

export type DebouncedFunctionWithMethods<F extends (...args: any[]) => any> = {
  debounced: DebouncedFunction<F>;
  clear: () => void;
  flush: () => ReturnType<F> | undefined;
};

export function debounce<F extends (...args: any[]) => any>(
    func: F,
    wait: number = 100,
    immediate: boolean = false
): DebouncedFunctionWithMethods<F> {
  let timeout: any = null;
  let args: any[] | null = null;
  let context: any;
  let timestamp: number;
  let result: ReturnType<F> | undefined;

  function later() {
    const last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args || []); // Use an empty array if args is null
        context = args = null;
      }
    }
  }

  const debounced: DebouncedFunction<F> = function (
      this: any,
      ...args_: any[]
  ) {
    context = this;
    args = args_;
    timestamp = Date.now();
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args || []); // Use an empty array if args is null
      context = args = null;
    }

    return result;
  };

  const clear = function () {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  const flush = function () {
    if (timeout !== null) {
      result = func.apply(context, args || []); // Use an empty array if args is null
      context = args = null;

      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
    }

    return result;
  };

  return {
    debounced,
    clear,
    flush,
  };
}

export function transformNetFromLeftToRight(arr: number[], newArr: number[], rowCount: number, reelCount: number): number[] {
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < reelCount; col++) {
      const idx = col * rowCount + row;
      newArr.push(arr[idx]);
    }
  }

  return newArr;
}
