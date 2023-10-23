import localization from "app/localization";
const j = require('Config');
const API_CONFIG = j.routes;

let lang = localStorage.getItem('lang') || 'en';
let host = window.location.hostname;
const URL = isTest() ?
  //innerIP or test url
  switchApiUrlProd()//'https://api2aggregate.platipusgaming.com' ||  'http://127.0.0.1:3030' 
  :
  //externalIP (prod)
  switchApiUrlProd()
;

export function switchFavicon(): string {
  for (let i = 0; i < API_CONFIG.length; i++) {
    let item = API_CONFIG[i];
    if (host.indexOf(item.host) !== -1) {
      return item.icon;
    }
  }
  return 'default'
}

function switchApiUrlProd() {
  console.warn('TRY FIND API...');
  for (let i = 0; i < API_CONFIG.length; i++) {
    let item = API_CONFIG[i];
    if (host.indexOf(item.host) !== -1) {
      console.warn('SUCCESS!!!');
      return item.api;
    }
  }
  console.error('NO API FOUND FOR THE HOST: ', host);
  return ''
}

export function switchAdminPanelName(): string {
  let name: string = localization.BO2TEST[lang];
  // let name: string = localization.BO2TEST[lang] + ` v${BUILD_VERSION}`;
  for (let i = 0; i < API_CONFIG.length; i++) {
    let item = API_CONFIG[i];
    if (host.indexOf(item.host) !== -1) {
      let n = localization[item.name];
      if (n) {
        name = n[lang];
      } else {
        name = n;
      }
    }
  }
  document.title = name;
  return name;
}

export function filterMenuItems(menuItems:any[]):any[]{
  let filteredMenuItems: any[] = menuItems;
  if(isPanelAggregate() && !isPreStage()){
    filteredMenuItems = filteredMenuItems.filter((v:any)=>{
      return v.isRelease && !v.removeForAggregate;
    });
  }
  filteredMenuItems = filteredMenuItems.filter((v:any)=>{
    return ((isTest() || isPreStage()) || v.isRelease);
  });
  return filteredMenuItems;
}

export function filterMenuItemsByRelease(menuItems:any[]):any[]{
 return menuItems.filter((v:any)=>{
    return v.isRelease;
  })
}

export function getCorrectHelp(json:any){
  for(let i = 0; i < API_CONFIG.length; i++){
    let item = API_CONFIG[i];
    if(host.indexOf(item.host) !== -1){
      switch (item.name){
        case "BO2PLAYREELS":{
          return json.HelpPlayReels;
        }
      }
      break;
    }
  }
  return json.Help;
}

export function isPanelAggregate(){
  for(let i = 0; i < API_CONFIG.length; i++){
    let item = API_CONFIG[i];
    if(host.indexOf(item.host) !== -1){
      switch (item.name){
        case "BO2":
        case "BO2TESTAGGREGATE":
        case "BO2PRESTAGE":{
          return true;
        }
      }
      break;
    }
  }
  return false;
}

export function getAdminPanelVersion(){
  for(let i = 0; i < API_CONFIG.length; i++){
    let item = API_CONFIG[i];
    if(host.indexOf(item.host) !== -1){
      return item.version;
    }
  }
  console.error("MISS ADMIN PANEL VERSION IN CONFIG!");
  return "V3"
}

export default {
  LOG_IN: `${URL}/api/auth/login`,
  LOG_OUT: `${URL}/api/auth/logout`,
  GET_ROOM_LIST: `${URL}/api/v3/rooms`,
  GET_GAME_LIST: `${URL}/api/v3/games`,
  GET_COUNTRY_LIST: `${URL}/api/country/list`,
  BET_GROUP_LIST: `${URL}/api/betgroup/list`,
  BET_GROUP_SETTING: `${URL}/api/betgroup/setting`,
  GET_WALLET_LIST: `${URL}/api/structure/wallet/list`,
  GET_CURRENCY_LIST: `${URL}/api/currencies/rateupdates`,
  GET_CURRENCY_SETTING: `${URL}/api/currencies/rates`,
  GET_CURRENCY_REPORT_V3: `${URL}/api/v3/reports/profit/json`,
  GET_CURRENCY_REPORT_V2: `${URL}/api/v2/reports/profit/json`,
  GET_CURRENCY_REPORT_V1: `${URL}/api/reports/profit/json`,
  GET_CURRENCY_REPORT_V0: `${URL}/api/v0/reports/profit/json`,
  GET_CURRENCY_REPORT_FILE_V3: `${URL}/api/v3/reports/profit/excel`,
  GET_CURRENCY_REPORT_FILE_V2: `${URL}/api/v2/reports/profit/excel`,
  GET_CURRENCY_REPORT_FILE_V1: `${URL}/api/reports/profit/excel`,
  GET_CURRENCY_REPORT_FILE_V0: `${URL}/api/v0/reports/profit/excel`,
  GET_GAMES_REPORT_V3: `${URL}/api/v3/reports/games/json`,
  GET_GAMES_REPORT_V2: `${URL}/api/v2/reports/games/json`,
  GET_GAMES_REPORT_V1: `${URL}/api/reports/games/json`,
  GET_GAMES_REPORT_V0: `${URL}/api/v0/reports/games/json`,
  GET_GAMES_REPORT_FILE_V3: `${URL}/api/v3/reports/games/excel`,
  GET_GAMES_REPORT_FILE_V2: `${URL}/api/v2/reports/games/excel`,
  GET_GAMES_REPORT_FILE_V1: `${URL}/api/reports/games/excel`,
  GET_GAMES_REPORT_FILE_V0: `${URL}/api/v0/reports/games/excel`,
  GET_OFFICE_REPORT_V3: `${URL}/api/v3/reports/offices/json`,
  GET_OFFICE_REPORT_V2: `${URL}/api/v2/reports/offices/json`,
  GET_OFFICE_REPORT_V1: `${URL}/api/reports/offices/json`,
  GET_OFFICE_REPORT_V0: `${URL}/api/v0/reports/offices/json`,
  GET_OFFICE_REPORT_FILE_V3: `${URL}/api/v3/reports/offices/excel`,
  GET_OFFICE_REPORT_FILE_V2: `${URL}/api/v2/reports/offices/excel`,
  GET_OFFICE_REPORT_FILE_V1: `${URL}/api/reports/offices/excel`,
  GET_OFFICE_REPORT_FILE_V0: `${URL}/api/v0/reports/offices/excel`,
  GET_DAYS_REPORT: `${URL}/api/v3/reports/days/json`,
  GET_DAYS_REPORT_FILE: `${URL}/api/v3/reports/days/excel`,
  GET_COUNTRY_REPORT: `${URL}/api/v3/reports/countries/json`,
  GET_COUNTRY_REPORT_FILE: `${URL}/api/v3/reports/countries/excel`,
  GET_DEVICE_REPORT: `${URL}/api/v3/reports/devices/json`,
  GET_DEVICE_REPORT_FILE: `${URL}/api/v3/reports/devices/excel`,
  GET_ALL_USERS: `${URL}/api/v2/users/all`,
  GET_ONLINE_USERS: `${URL}/api/v2/users/online`,
  GET_HELP: `${URL}/api/help/download`,
  GET_HISTORY_LIST: `${URL}/api/v2/users/history`,
  GET_HISTORY_DETAILS: `${URL}/api/v2/users/history/detail`,
  GET_HISTORY_BETS: `${URL}/api/v2/users/history/bets`,
  GET_HISTORY_TRANSFERS: `${URL}/api/v2/users/history/transfers`,
  HISTORY_PLAYER_BONUS: `${URL}/api/users/history/bonus`,
  USER_BALANCE: `${URL}/api/v2/users/balance`,
  GET_GAME_VERSIONS_SETTING: `${URL}/api/games/version`,
  GET_GAME_MISSED_VERSIONS: `${URL}/api/games/missingversion`,
  POST_GAME_VERSIONS_CONFIG: `${URL}/api/games/version/json`,
  GET_WALLET_OPTIONS: `${URL}/api/settings/walletoptions`,
  GET_API_KEYS: `${URL}/api/settings/bbapikeys`,
  GET_GAMES_LIST_SETTING: `${URL}/api/settings/games/list`,
  GET_GAME_TYPES: `${URL}/api/settings/games/types`,
  GET_WITHOUT_KEY_ROOM_LIST: `${URL}/api/settings/roomsnokey`,
  PUT_DISABLE_GAME: `${URL}/api/games/state`,
  GET_PLATFORM_LIST: `${URL}/api/platform`,
  GET_STRUCTURE: `${URL}/api/structure`,
  POST_STRUCTURE_DISTRIBUTOR: `${URL}/api/structure/distributor`,
  POST_STRUCTURE_OFFICE: `${URL}/api/structure/office`,
  POST_STRUCTURE_AGENT: `${URL}/api/structure/agent`,
  STRUCTURE_PLAYER: `${URL}/api/structure/player`,
  STRUCTURE_ADMIN: `${URL}/api/structure/admin`,
  POST_STRUCTURE_ROOM: `${URL}/api/structure/room`,
  POST_STRUCTURE_CASHIER: `${URL}/api/structure/cashier`,
  PUT_CHANGE_PASSWORD: `${URL}/api/structure/distributor`,
  USER_IP: `${URL}/api/user/ip`,
  USER_LOCKOUT: `${URL}/api/user/lockout`,

  GET_ROUND_DETAIL: `${URL}/rounddetail`,
  GET_ROUND_DETAILS: `${URL}/round-details`,

  GET_PLATFORM_V2: `${URL}/v2/structure/platform`,
  GET_OFFICE_V2: `${URL}/v2/structure/office`,
  GET_ROOM_V2: `${URL}/v2/structure/room`,

  PLATFORM_V2: `${URL}/v2/structure/platform`,

  GET_GAMIFICATION_LIST: `${URL}/api/gamification/info`,
  GET_GAMIFICATION_RESOURCE: `${URL}/api/gamification/resource`,
  GAMIFICATION_INFO: `${URL}/api/gamification/info`,
  GAMIFICATION_GROUP: `${URL}/api/gamification/group`,
  GAMIFICATION_RATING: `${URL}/api/gamification/rating`,

  SETTINGS_GAME_OPTIONS: `${URL}/game/option`,

  ACCOUNT_PASSWORD: `${URL}/api/account/password`,
}

function isTest() {
  return (window.location.host.indexOf('local') !== -1 || window.location.host.indexOf('192.168.') !== -1 || window.location.host.indexOf('bo2test') !== -1 || window.location.host.indexOf('bo2stage') !== -1);
}

function isPreStage() {
  return window.location.host.indexOf('prestage') !== -1;
}

function containsWordFromList(loginName: string, wordArray: string[]) {
  for (const word of wordArray) {
    if (loginName.includes(word)) {
      return true;
    }
  }
  return false;
}

export const hasSettingsToRender = () => {
  
  const login = `${localStorage.getItem('login')}`;
 
  for (let i = 0; i < API_CONFIG.length; i++) {
    let item = API_CONFIG[i];
    const hideSettings = item['hideSettings']
    
    if (
      hideSettings && 
      hideSettings.length && 
      Array.isArray(hideSettings) && 
      containsWordFromList(login, hideSettings)
    ) {
      console.log({
        item,
        login, 
        hideSettings});
      return false;
    }
  }

  return true;
  
}
