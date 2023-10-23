import {getCorrectHelp} from "app/const/api";
const json = require('./ADMIN PANEL.json');

export interface ItemLocalization {
  en: string;
  KEY: string;

  [key: string]: string;
}

interface Localization {
  [key: string]: ItemLocalization
}

const localization: Localization = json.Localization;
export default localization;
export const help: Localization = getCorrectHelp(json);
