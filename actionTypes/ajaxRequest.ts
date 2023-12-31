export default {
  METHODS: {
    POST: 'POST',
    GET: 'GET',
    PUT: 'PUT',
    DELETE: 'DELETE'
  },

  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  OFFICES_LIST: 'OFFICES_LIST',
  ROOM_LIST: 'ROOM_LIST',
  ROOM_LIST_V2: 'ROOM_LIST_V2',
  GAMIFICATION_LIST: 'GAMIFICATION_LIST',
  GAMIFICATION_PLATFORM_LIST: 'GAMIFICATION_PLATFORM_LIST',
  GAMIFICATION_OFFICE_LIST: 'GAMIFICATION_OFFICE_LIST',
  GAMIFICATION_ROOM_LIST: 'GAMIFICATION_ROOM_LIST',
  GAMIFICATION_RESOURCE_LIST: 'GAMIFICATION_RESOURCE_LIST',
  GAME_TYPES_LIST: 'GAME_TYPES_LIST',
  WITHOUT_KEY_ROOM_LIST: 'WITHOUT_KEY_ROOM_LIST',
  CURRENCY_LIST: 'CURRENCY_LIST',
  CURRENCY_SETTINGS_LIST: 'CURRENCY_SETTINGS_LIST',
  GAME_LIST: 'GAME_LIST',
  COUNTRY_LIST: 'COUNTRY_LIST',
  MISSED_VERSION_LIST: 'MISSED_VERSION_LIST',
  GROUP_LIST: 'GROUP_LIST',
  WALLET_LIST: 'WALLET_LIST',
  REPORT: 'REPORT',
  CHANGE_REPORT: 'CHANGE_REPORT',
  ADD_REPORT: 'ADD_REPORT',
  DELETE_REPORT: 'DELETE_REPORT',
  USERS: 'USERS',
  PLATFORM_LIST: 'PLATFORM_LIST',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  CREATE_PLAYER: 'CREATE_PLAYER',
  CHANGE_USER_IP: 'CHANGE_USER_IP',

  standartAsyncTypes(type: string) {
    return {
      normal: type.toLowerCase(),
      async: type
    }
  }
}
