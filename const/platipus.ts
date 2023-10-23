import { SlotBonusType } from "./slotBonusType";

export interface ISlotBonus {
  id: number,
  type: SlotBonusType,
  id_fs: number[]
}

export interface ISlotBuy {
  id: number;
  price: number;
}

export interface IConfigGame {
  id: string;
  serverName: string;
  lines?: string;
  isWays?: boolean;
  isLineBlock?: boolean;
  group?: string;
  reelCount?: number,
  rowCount?: number,
  jackpotPrice?: { [key: string]: number },
  buy?: { price: number; id: number; }
  bonus?: ISlotBonus[]
  isNew?: boolean;
}

const PlatipusGames: IConfigGame|any = [
  {
    id: '592',
    serverName: 'coincharge',
    lines: '5',
    isWays: false,
    group: 'Platipus',
    hasWheelsValuesCoin: true,
    multiplierFeature: true,
    reelCount: 3,
    rowCount: 3,
    buy: [{price: 35, id: 1}],
    id_fs: [
      { id: 1,  type: SlotBonusType.Respin },
      { id: 2,  type: SlotBonusType.Respin },
      { id: 3,  type: SlotBonusType.Respin },
      { id: 4,  type: SlotBonusType.Bonus },
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.Respin },
      { id: 4,  type: SlotBonusType.BonusWheel },
    ],
    isNew: true
  },
  {
    id: '586',
    serverName: 'wizardofthewild',
    lines: '20',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    buy: [{price: 50, id: 1}],
    id_fs: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    isNew: true
  },
  {
    id: '588',
    serverName: 'minerz',
    lines: '1',
    isWays: false,
    isCombination: false,
    hasWheelsValuesMultiplier: true,
    isBlocks: true,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 6,
    buy: [{price: 30, id: 1 }],
    id_fs: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    isNew: true
  },
  {
    id: '583',
    serverName: 'thorturbopower',
    lines: '10',
    isWays: false,
    isCombination: false,
    hasWheelsValuesMultiplier: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    buy: [{price: 70, id: 1}],
    id_fs: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    isNew: true
  },
  {
    id: '591',
    serverName: 'casinoholdem',
    group: 'Platipus'
  },
  {
    id: '584',
    serverName: 'texasholdem',
    group: 'Platipus'
  },
  {
    id: '582',
    serverName: 'missgypsy',
    lines: '20',
    isWays: false,
    isCombination: true,
    hasWheelsValuesMultiplier: true,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 5,
    buy: [{price: 60, id: 1}],
    id_fs: [
      { id: 1,  type: SlotBonusType.Cascade },
      { id: 2,  type: SlotBonusType.FreeSpin },
      { id: 3,  type: SlotBonusType.Cascade }
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.Cascade },
      { id: 2,  type: SlotBonusType.FreeSpin },
      { id: 3,  type: SlotBonusType.Cascade }
    ],
    isNew: true
  },
  {
    id: '579',
    serverName: 'bitstarzelement',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    buy: [{price: 52, id: 1}],
    id_fs: [
      { id: 0,  type: SlotBonusType.FreeSpin }
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    isNew: true
  },
  {
    id: '585',
    serverName: 'dragonselementdeluxe',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    buy: [{price: 52, id: 1}],
    id_fs: [
      { id: 0,  type: SlotBonusType.FreeSpin }
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    isNew: true
  },
  {
    id: '589',
    serverName: 'betfurycrowns',
    lines: '20',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '578',
    serverName: 'wildspindeluxe',
    lines: '25',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    buy: [{price: 15, id: 2}, {price: 35, id: 1}],
    id_fs: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    bonus: [
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    isNew: true
  },
  {
    id: '536',
    serverName: 'wildspin',
    lines: '25',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },

  // {
  //   id: '536',
  //   serverName: 'wildspin',
  //   lines: '25',
  //   isWays: false,
  //   group: 'Platipus',
  //   reelCount: 5,
  //   rowCount: 3,
  //   buy: [],
  //   id_fs: [
  //     { id: 1, type: SlotBonusType.FreeSpin }
  //   ],
  //   bonus: [
  //     { id: 1, type: SlotBonusType.FreeSpin }
  //   ],
  //   isNew: true
  // },

  {
    id: '587',
    serverName: 'goodmancrowns',
    lines: '20',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '573',
    serverName: 'booksofgiza',
    lines: '10',
    isWays: false,
    isLineBlock: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    jackpotPrice: {},
    buy: [
      { price: 100, id: 1 }
    ],
    id_fs: [
      { id: 10, type: SlotBonusType.Bonus },
      { id: 9,  type: SlotBonusType.FreeSpin },
      { id: 8,  type: SlotBonusType.FreeSpin },
      { id: 7,  type: SlotBonusType.FreeSpin },
      { id: 6,  type: SlotBonusType.FreeSpin },
      { id: 5,  type: SlotBonusType.FreeSpin },
      { id: 4,  type: SlotBonusType.FreeSpin },
      { id: 3,  type: SlotBonusType.FreeSpin },
      { id: 2,  type: SlotBonusType.FreeSpin },
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    bonus: [
      { id: 10, type: SlotBonusType.FreeSpin },
      { id: 9,  type: SlotBonusType.FreeSpin },
      { id: 8,  type: SlotBonusType.FreeSpin },
      { id: 7,  type: SlotBonusType.FreeSpin },
      { id: 6,  type: SlotBonusType.FreeSpin },
      { id: 5,  type: SlotBonusType.FreeSpin },
      { id: 4,  type: SlotBonusType.FreeSpin },
      { id: 3,  type: SlotBonusType.FreeSpin },
      { id: 2,  type: SlotBonusType.FreeSpin },
      { id: 1,  type: SlotBonusType.FreeSpin }
    ],
    isNew: true
  },
  {
    id: '581',
    serverName: 'skycrown',
    lines: '20',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '575',
    serverName: 'catchtheleprechaun',
    lines: '10',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {
      MINOR: 200,
      MAJOR: 1000,
      GRAND: 5000
    }
  },
  {
    id: '576',
    serverName: 'pirateslegacy',
    lines: '30',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {
      MINI: 750,
      MINOR: 1500,
      MAJOR: 7500,
      GRAND: 15000
    }
  },
  {
    id: '574',
    serverName: 'thebigscore',
    lines: '20',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 5,
    bonus: []
  },
  {
    id: '571',
    serverName: 'xmasavalanche',
    lines: '20',
    isWays: false,
    isBlocks: true,
    group: 'Platipus',
    reelCount: 7,
    rowCount: 7,
    bonus_info: [],
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '572',
    serverName: 'fruitboost',
    lines: '20',
    isWays: false,
    isBlocks: true,
    group: 'Platipus',
    reelCount: 8,
    rowCount: 8,
    bonus_info: [],
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '570',
    serverName: 'hallowin',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus_info: [],
    bonus: [],
    jackpotPrice: {
      MINI: 2500,
      MINOR: 5000,
      MAJOR: 12500,
      GRAND: 50000
    }
  },
  {
    id: '568',
    serverName: 'extragems',
    lines: '20',
    isWays: true,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [],
    jackpotPrice: {
    }
  },
  {
    id: '569',
    serverName: 'coinfest',
    lines: '25',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {
      GRAND: 125000
    }
  },
  {
    id: '567',
    serverName: 'bookoflight',
    lines: '20',
    isWays: false,
    isBlocks: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 5,
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '565',
    serverName: 'pearlsoftheocean',
    lines: '40',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus_info: [
      { id: 1, name: 'respin' },
      { id: 2, name: 'free spin' },
      { id: 3, name: 'free spin' },
      { id: 4, name: 'free spin' }
    ],
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '595',
    serverName: 'cosmocrowns',
    lines: '20',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus_info: [],
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '564',
    serverName: 'wildcrowns',
    lines: '20',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus_info: [
      { id: 1, name: 'free spin' }
    ],
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '563',
    serverName: 'waysofthegauls',
    lines: '10',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 7,
    bonus_info: [
        // RsBonusId = 1;
        // FsBonusId = 2;
        // RsInFsBonusId = 3;
        // RsAfterFsBonusId = 4;
        // RsInFsAndExtraFsBonusId = 5;
      { id: 1, name: 'respin' },
      { id: 2, name: 'free spin' },
      { id: 3, name: 'respin' },
      { id: 4, name: 'respin' },
      { id: 5, name: 'respin' }
    ],
    bonus: [],
    jackpotPrice: {
      MINI: 500,
      MINOR: 1000,
      MAJOR: 5000,
      GRAND: 50000
    }
  },
  {
    id: '560',
    serverName: 'ninedragonkings',
    lines: '1',
    isWays: false,
    group: 'Platipus',
    reelCount: 3,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '559',
    serverName: 'piedradelsol',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {
      MINI: 1000, // divide by lines
      MINOR: 5000,
      MAJOR: 10000,
      GRAND: 100000
    }
  },
  {
    id: '561',
    serverName: 'ninegems',
    lines: '5',
    isWays: false,
    group: 'Platipus',
    reelCount: 3,
    rowCount: 5,
    bonus: [],
    jackpotPrice: {
      MINI: 10, // divide by lines
      MINOR: 25,
      MAJOR: 50,
      MAXI: 125,
      MEGA: 250,
      GRAND: 5000
    }
  },
  {
    id: '557',
    serverName: 'poshcats',
    lines: '1' || '27 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 3,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {
      MINI: 15, // divide by lines
      MINOR: 50,
      MAJOR: 150,
      MAXI: 500,
      GRAND: 1500
    }
  },
  {
    id: '556',
    serverName: 'jokerchase',
    lines: '40' || '243 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {
      MINI: 400,  // divide by lines
      MINOR: 800,
      MAJOR: 4000,
      GRAND: 40000
    }
  },
  {
    id: '554',
    serverName: 'frozenmirror',
    lines: '30',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [],
    jackpotPrice: {
      MINI: 1500, // divide by lines
      MINOR: 4500,
      MAJOR: 15000,
      GRAND: 45000
    }
  },
  {
    id: '555',
    serverName: 'diamondhunt',
    lines: '50' || '4096 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [],
    jackpotPrice: {}
  },
  {
    id: '552',
    serverName: 'littlewitchy',
    lines: '10',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [ ],
    jackpotPrice: {}
  },
  {
    id: '553',
    serverName: 'undiademuertos',
    lines: '50' || '243 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [ ],
    jackpotPrice: {
      MINOR: 500,   // divide by lines
      MAJOR: 1000,
      MAXI: 5000,
      GRAND: 100000
    }
  },
  {
    id: '551',
    serverName: 'wildjustice',
    lines: '25',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [ ],
    jackpotPrice: {
      MINI: 100,  // divide by lines
      MINOR: 250,
      MAJOR: 1000,
      MAXI: 2500,
      GRAND: 100000
    }
  },
  {
    id: '550',
    serverName: 'leprechauns',
    lines: '25' || '243 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [ ],
    jackpotPrice: {
      MINI: 1250,  // divide by lines
      MINOR: 2500,
      MAJOR: 12500,
      GRAND: 50000
    }
  },
  {
    id: '549',
    serverName: 'bamboogrove',
    lines: '30' || '243 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [ ],
    jackpotPrice: {
      MINOR: 3000,  // divide by lines
      MAJOR: 9000,
      GRAND: 30000
    }
  },
  {
    id: '547',
    serverName: 'guisesofdracula',
    lines: '40' || '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [ ],
    jackpotPrice: {
      MINI: 4000, // divide by lines
      MINOR: 10000,
      MAJOR: 20000,
      GRAND: 40000
    }
  },
  {
    id: '548',
    serverName: 'mightofzeus',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [ ],
    jackpotPrice: {
      MINI: 1000, // divide by lines
      MINOR: 2000,
      MAJOR: 10000,
      GRAND: 200000
    }
  },
  {
    id: '546',
    serverName: 'thousandonespins',
    lines: '25' || '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [ ],
    jackpotPrice: {
      MINI: 500, // divide by lines
      MINOR: 2500,
      MAJOR: 12500,
      GRAND: 50000
    }
  },
  {
    id: '544',
    serverName: 'lordofthesun',
    lines: '20' || '30',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [ ],
    jackpotPrice: {
      MINI: 500, // divide by lines
      MINOR: 1000,
      MAJOR: 5000,
      GRAND: 100000
    }
  },
  {
    id: '593',
    serverName: 'hotfruitsmostbet',
    lines: '5',
    isWays: false,
    group: 'Platipus',
    reelCount: 3,
    rowCount: 3,
    bonus: [ ]
  },
  {
    id: '545',
    serverName: 'hotfruits',
    lines: '5',
    isWays: false,
    group: 'Platipus',
    reelCount: 3,
    rowCount: 3,
    bonus: [ ]
  },
  {
    id: '540',
    serverName: 'wealthofwisdom',
    lines: '30' || '25',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'free spin'
      }
    ]
  },
  {
    id: '543',
    serverName: 'hawaiiannight',
    lines: '20',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'free spin'
      }
    ]
  },
  {
    id: '542',
    serverName: 'santasbag',
    lines: '5',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'free spin'
      }
    ],
    jackpotPrice: {
      MINI: 50, // divide by lines
      MINOR: 100,
      MAJOR: 500,
      MAXI: 1000,
      GRAND: 5000
    }
  },
  {
    id: '541',
    serverName: 'royallotus',
    lines: '50' || '720 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 5,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'free spin'
      }
    ]
  },
  {
    id: '539',
    serverName: 'chillifiesta',
    lines: '40',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'free spin'
      }
    ]
  },
  {
    id: '538',
    serverName: 'dynastywarriors',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '386',
    serverName: 'cleosgold',
    lines: '20',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      }
    ]
  },
  {
    id: '392',
    serverName: 'fieryplanet',
    lines: '25',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 4,
        id_fs: 4,
        type: 'respin on freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'respin'
      },
      {
        bonusId: 3,
        id_fs: 3,
        type: 'freespins'
      }
    ]
  },
  {
    id: '395',
    serverName: 'jewelbang',
    lines: '10',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'respin'
      }
    ]
  },
  {
    id: '401',
    serverName: 'princessofbirds',
    lines: '20',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'respin'
      },
      {
        bonusId: 3,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 4,
        id_fs: 3,
        type: 'respin on freespins'
      }
    ]
  },
  {
    id: '400',
    serverName: 'fairyforest',
    lines: '50',
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'respin'
      },
      {
        bonusId: 3,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 4,
        id_fs: 3,
        type: 'respin on freespins'
      }
    ]
  },
  {
    id: '426',
    serverName: 'safariadventures',
    lines: '50',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '409',
    serverName: 'crocoman',
    lines: '10',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 4,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 5,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 6,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 7,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 8,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 9,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 10,
        type: 'freespins'
      }
    ]
  },
  {
    id: '428',
    serverName: 'juicyspins',
    lines: '25',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '424',
    serverName: 'fruitysevens',
    lines: '25',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 2,
        type: 'respin'
      },
      {
        bonusId: 3,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 4,
        id_fs: 4,
        type: 'respin on freespins'
      }
    ]
  },
  {
    id: '423',
    serverName: 'junglespin',
    lines: '50',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '417',
    serverName: 'arabiantales',
    lines: '50',
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      }
    ]
  },
  {
    id: '393',
    serverName: 'mistressofamazon',
    lines: '40',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [
      {
        bonusId: 3,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 4,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 5,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 6,
        id_fs: 4,
        type: 'freespins'
      },
      {
        bonusId: 7,
        id_fs: 5,
        type: 'freespins'
      },
      {
        bonusId: 8,
        id_fs: 6,
        type: 'freespins'
      }
    ]
  },
  {
    id: '394',
    serverName: 'magicalwolf',
    lines: '20',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      }
    ]
  },
  {
    id: '429',
    serverName: 'richywitchy',
    lines: '40',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '427',
    serverName: 'luckydolphin',
    lines: '15',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        type: 'bonus'
      }
    ]
  },
  {
    id: '443',
    serverName: 'crazyjelly',
    lines: '10',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'respin'
      }
    ]
  },
  {
    id: '476',
    serverName: 'loveis',
    lines: '50',
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      }
    ]
  },
  {
    id: '477',
    serverName: 'cinderella',
    lines: '40',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [
      {
        bonusId: 3,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 4,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 5,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 6,
        id_fs: 4,
        type: 'freespins'
      },
      {
        bonusId: 7,
        id_fs: 5,
        type: 'freespins'
      },
      {
        bonusId: 8,
        id_fs: 6,
        type: 'freespins'
      }
    ]
  },
  {
    id: '475',
    serverName: 'luckymoney',
    lines: '25',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 4,
        id_fs: 4,
        type: 'respin on freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'respin'
      },
      {
        bonusId: 3,
        id_fs: 3,
        type: 'freespins'
      }
    ]
  },
  {
    id: '469',
    serverName: 'sakurawind',
    lines: '20',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'respin'
      },
      {
        bonusId: 3,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 4,
        id_fs: 3,
        type: 'respin on freespins'
      }
    ]
  },
  {
    id: '444',
    serverName: 'tripledragon',
    lines: '50',
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      }
    ]
  },
  {
    id: '442',
    serverName: 'legendofatlantis',
    lines: '20',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'respin'
      },
      {
        bonusId: 3,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 4,
        id_fs: 3,
        type: 'respin on freespins'
      }
    ]
  },
  {
    id: '420',
    serverName: 'fortuneofthegods',
    lines: '40',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4
  },
  {
    id: '446',
    serverName: 'magicalmirror',
    lines: '15',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 4,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 5,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 6,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 7,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 8,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 9,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 10,
        type: 'freespins'
      }
    ]
  },
  {
    id: '480',
    serverName: 'monkeysjourney',
    lines: '40',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 14,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 15,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 16,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 17,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 18,
        type: 'freespins'
      }
    ]
  },
  {
    id: '483',
    serverName: 'powerofgods',
    lines: '40',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 14,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 15,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 16,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 17,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 18,
        type: 'freespins'
      }
    ]
  },
  {
    id: '448',
    serverName: 'aztectemple',
    lines: '20',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'cascading'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 3,
        id_fs: 3,
        type: 'cascading on freespins'
      },
      {
        bonusId: 4,
        id_fs: 4,
        type: 'repositioned spin'
      }
    ]
  },
  {
    id: '425',
    serverName: 'crystalsevens',
    lines: '50',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [
      {
        bonusId: 2,
        type: 'bonus'
      },
      {
        bonusId: 3,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 3,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 3,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 7,
        id_fs: 4,
        type: 'freespins'
      }
    ]
  },
  {
    id: '465',
    serverName: 'bookofegypt',
    lines: '10',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 4,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 5,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 6,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 7,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 8,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 9,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 10,
        type: 'freespins'
      }
    ]
  },
  {
    id: '450',
    serverName: 'megadrago',
    lines: '30',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '452',
    serverName: 'powerofposeidon',
    lines: '243 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'cascading'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 3,
        id_fs: 3,
        type: 'cascading on freespins'
      }
    ]
  },
  {
    id: '486',
    serverName: 'greatocean',
    lines: '25',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '488',
    serverName: 'neonclassic',
    lines: '243 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: []
  },
  {
    id: '485',
    serverName: 'jadevalley',
    lines: '50',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'respins'
      }
    ]
  },
  {
    id: '491',
    serverName: 'bisontrail',
    lines: '1024 ways',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: [
      {
        bonusId: 1,
        id_fs: 0,
        type: 'freespins'
      }
    ]
  },
  {
    id: '492',
    serverName: 'pharaohsempire',
    lines: '25',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 4,
        type: 'freespins'
      }
    ]
  },
  {
    id: '527',
    serverName: 'luckycat',
    lines: '25',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'respins'
      }
    ]
  },
  {
    id: '526',
    serverName: 'webbyheroes',
    lines: '30',
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '528',
    serverName: 'rhinomania',
    lines: '4096',
    isWays: true,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [
      {
        bonusId: 1,
        id_fs: 0,
        type: 'freespins'
      }
    ]
  },
  {
    id: '530',
    serverName: 'chinesetigers',
    lines: '30',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 1,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 1,
        id_fs: 3,
        type: 'freespins'
      }
    ]
  },
  {
    id: '529',
    serverName: 'azteccoins',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'respins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      }
    ]
  },
  {
    id: '531',
    serverName: 'jackpotlab',
    lines: '40',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '532',
    serverName: 'piratesmap',
    lines: '25',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 1,
        type: 'freespins'
      }
    ]
  },
  {
    id: '534',
    serverName: 'caishensgifts',
    lines: '243',
    isWays: true,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: [
      {
        bonusId: 1,
        id_fs: 0,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 1,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 2,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 3,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 4,
        type: 'freespins'
      },
      {
        bonusId: 2,
        id_fs: 5,
        type: 'freespins'
      }
    ]
  },
  {
    id: '533',
    serverName: 'dragonselement',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 6,
    rowCount: 4,
    bonus: [
      {
        bonusId: 1,
        id_fs: 0,
        type: 'freespins'
      }
    ]
  },
  {
    id: '535',
    serverName: 'theancientfour',
    lines: '50',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 4,
    bonus: Array(100).fill(1).map((x, y) => x + y).map(id_fs => ({
      bonusId: 2,
      id_fs,
      type: 'freespins'
    }))
  },
  {
    id: '537',
    serverName: 'dajidali',
    lines: '10',
    isWays: false,
    group: 'Platipus',
    reelCount: 5,
    rowCount: 3,
    bonus: []
  },
  {
    id: '580',
    serverName: 'twowaysroyal',
    group: 'Platipus'
  },
  {
    id: '566',
    serverName: 'bonusdeuceswild',
    group: 'Platipus'
  },
  {
    id: '577',
    serverName: 'acesandfaces',
    group: 'Platipus'
  },
  {
    id: '562',
    serverName: 'jacksorbetter',
    group: 'Platipus'
  },
  {
    id: '93',
    serverName: 'blackjack',
    group: 'Platipus'
  },
  {
    id: '487',
    serverName: 'blackjackvip',
    group: 'Platipus'
  },
  {
    id: '99',
    serverName: 'baccarat',
    group: 'Platipus'
  },
  {
    id: '489',
    serverName: 'baccaratmini',
    group: 'Platipus'
  },
  {
    id: '490',
    serverName: 'baccaratvip',
    group: 'Platipus'
  },
  {
    id: '110',
    serverName: 'rouletteeuropean',
    group: 'Platipus'
  }
];

export default PlatipusGames;
