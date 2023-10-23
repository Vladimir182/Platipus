interface IRoles {
  PLAYER: {
    [key:string]: any;
  },
  CASHIER: {
    [key:string]: any;
  },
  AGENT: {
    [key:string]: any;
  },
  ADMIN: {
    [key:string]: any;
  },
  DISTRIBUTOR: {
    [key:string]: any;
  },
  UNAUTHORIZED: {
    [key:string]: any;
  }
  [key:string]: any;
}
const roles: IRoles = {
  PLAYER: {
    name: 'player',
    id: 0
  },
  CASHIER: {
    name: 'cashier',
    id: 1,
    route: '/cashier',
    children: {
      CURRENCIES_REPORT_V3: '/v3/currencies_report',
      CURRENCIES_REPORT_V2: '/v2/currencies_report',
      CURRENCIES_REPORT_V0: '/v0/currencies_report',
      CURRENCIES_REPORT_V1: '/v1/currencies_report',
      GAMES_REPORT_V3: '/v3/games_report',
      GAMES_REPORT_V2: '/v2/games_report',
      GAMES_REPORT_V0: '/v0/games_report',
      GAMES_REPORT_V1: '/v1/games_report',
      OFFICE_REPORT_V3: '/v3/platform_report',
      OFFICE_REPORT_V2: '/v2/platform_report',
      OFFICE_REPORT_V0: '/v0/platform_report',
      OFFICE_REPORT_V1: '/v1/platform_report',
      DAY_REPORT: '/days_report',
      COUNTRY_REPORT: '/country_report',
      DEVICE_REPORT: '/device_report',
      USERS_BACKOFFICE: '/all_users',
      USERS_CASINO: '/online_users',
      BETS_HISTORY: '/bets_history',
      TRANSFERS_HISTORY: '/transfers_history',
      HISTORY_LIST: '/history',
      HISTORY_DETAILS: '/details',
      HELP: '/help/',
      ACCOUNT: '/account/',
      CURRENCY_SETTINGS: '/currency_setting',
      STRUCTURE: '/structure',
      STRUCTURE_V2: '/structure_v2',
    }
  },
  AGENT: {
    name: 'agent',
    id: 3,
    route: '/agent',
    children: {
      CURRENCIES_REPORT_V3: '/v3/currencies_report',
      CURRENCIES_REPORT_V2: '/v2/currencies_report',
      CURRENCIES_REPORT_V0: '/v0/currencies_report',
      CURRENCIES_REPORT_V1: '/v1/currencies_report',
      GAMES_REPORT_V3: '/v3/games_report',
      GAMES_REPORT_V2: '/v2/games_report',
      GAMES_REPORT_V0: '/v0/games_report',
      GAMES_REPORT_V1: '/v1/games_report',
      OFFICE_REPORT_V3: '/v3/platform_report',
      OFFICE_REPORT_V2: '/v2/platform_report',
      OFFICE_REPORT_V0: '/v0/platform_report',
      OFFICE_REPORT_V1: '/v1/platform_report',
      DAY_REPORT: '/days_report',
      USERS_BACKOFFICE: '/all_users',
      USERS_CASINO: '/online_users',
      BETS_HISTORY: '/bets_history',
      TRANSFERS_HISTORY: '/transfers_history',
      HISTORY_LIST: '/history',
      HISTORY_DETAILS: '/details',
      HELP: '/help/',
      ACCOUNT: '/account/',
      CURRENCY_SETTINGS: '/currency_setting',
      STRUCTURE: '/structure',
      STRUCTURE_V2: '/structure_v2',
    }
  },
  ADMIN: {
    name: 'admin',
    id: 4,
    route: '/admin',

    children: {
      CURRENCIES_REPORT_V3: '/v3/currencies_report',
      CURRENCIES_REPORT_V2: '/v2/currencies_report',
      CURRENCIES_REPORT_V0: '/v0/currencies_report',
      CURRENCIES_REPORT_V1: '/v1/currencies_report',
      GAMES_REPORT_V3: '/v3/games_report',
      GAMES_REPORT_V2: '/v2/games_report',
      GAMES_REPORT_V0: '/v0/games_report',
      GAMES_REPORT_V1: '/v1/games_report',
      OFFICE_REPORT_V3: '/v3/platform_report',
      OFFICE_REPORT_V2: '/v2/platform_report',
      OFFICE_REPORT_V0: '/v0/platform_report',
      OFFICE_REPORT_V1: '/v1/platform_report',
      DAY_REPORT: '/days_report',
      COUNTRY_REPORT: '/country_report',
      DEVICE_REPORT: '/device_report',
      USERS_BACKOFFICE: '/all_users',
      USERS_CASINO: '/online_users',
      BETS_HISTORY: '/bets_history',
      TRANSFERS_HISTORY: '/transfers_history',
      HISTORY_LIST: '/history',
      HISTORY_DETAILS: '/details',
      HELP: '/help/',
      ACCOUNT: '/account/',
      CURRENCY_SETTINGS: '/currency_setting',
      BET_GROUP: '/bet_group',
      BET_GROUP_SETTING: '/bet_group_setting',
      GAME_VERSION_SETTINGS: '/game_version_settings',
      WALLET_OPTIONS_SETTINGS: '/wallet_options_settings',
      GAME_OPTIONS_SETTINGS: '/game_options_settings',
      API_KEYS_SETTINGS: '/api_keys_settings',
      GAMES_SETTINGS: '/games_settings',
      STRUCTURE: '/structure',
      STRUCTURE_V2: '/structure_v2',
      GAMIFICATION: '/gamification',
      GAMIFICATION_GROUP: '/gamification/group',
      GAMIFICATION_RATING: '/gamification/rating'
    }
  },
  DISTRIBUTOR: {
    name: 'distributor',
    id: 6,
    route: '/distributor',
    children: {
      CURRENCIES_REPORT_V3: '/v3/currencies_report',
      CURRENCIES_REPORT_V2: '/v2/currencies_report',
      CURRENCIES_REPORT_V0: '/v0/currencies_report',
      CURRENCIES_REPORT_V1: '/v1/currencies_report',
      GAMES_REPORT_V3: '/v3/games_report',
      GAMES_REPORT_V2: '/v2/games_report',
      GAMES_REPORT_V0: '/v0/games_report',
      GAMES_REPORT_V1: '/v1/games_report',
      OFFICE_REPORT_V3: '/v3/platform_report',
      OFFICE_REPORT_V2: '/v2/platform_report',
      OFFICE_REPORT_V0: '/v0/platform_report',
      OFFICE_REPORT_V1: '/v1/platform_report',
      DAY_REPORT: '/days_report',
      USERS_BACKOFFICE: '/all_users',
      USERS_CASINO: '/online_users',
      BETS_HISTORY: '/bets_history',
      TRANSFERS_HISTORY: '/transfers_history',
      HISTORY_LIST: '/history',
      HISTORY_DETAILS: '/details',
      HELP: '/help/',
      ACCOUNT: '/account/',
      GAME_VERSION_SETTINGS: '/game_version_settings',
      CURRENCY_SETTINGS: '/currency_setting',
      STRUCTURE: '/structure',
      STRUCTURE_V2: '/structure_v2',
    }
  },
  UNAUTHORIZED: {
    route: '/'
  },
};
export default roles;

export function getRoleById(id: number): string | undefined {
  switch (id) {
    case roles.CASHIER.id:
      return roles.CASHIER.name;
    case roles.AGENT.id:
      return roles.AGENT.name;
    case roles.ADMIN.id:
      return roles.ADMIN.name;
    case roles.DISTRIBUTOR.id:
      return roles.DISTRIBUTOR.name;
    case roles.PLAYER.id:
      return roles.PLAYER.name;
    default: {
      return;
    }
  }
}
