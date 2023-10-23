import localization from "app/localization";

let lang = localStorage.getItem('lang') || 'en';
export default {
  BET_TYPE: {
    id: 101,
    name: (localization.BET_TYPE as any)[lang]
  },
  BONUS_BET_TYPE: {
    id: 102,
    name: (localization.BONUS_BET_TYPE as any)[lang]
  },
  DEPOSIT_TYPE: {
    id: 103,
    name: (localization.DEPOSIT_TYPE as any)[lang]
  },
  WITHDRAW_TYPE: {
    id: 104,
    name: (localization.WITHDRAW_TYPE as any)[lang]
  },
  GIFT_TYPE: {
    id: 105,
    name: (localization.GIFT_TYPE as any)[lang]
  }
}
