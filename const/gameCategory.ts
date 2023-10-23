export enum CasinoGameCategory {
    None = 0,
    Slot = 1,
    BlackJack = 2,
    Roulette = 3,
    Baccarat = 4,
    VideoPoker = 5,
    Holdem = 6,
    HoldemCasino = 7
}

export const gameCategory = [
    {id: CasinoGameCategory.Slot,           name: 'Slot'},
    {id: CasinoGameCategory.BlackJack,      name: 'Blackjack'},
    {id: CasinoGameCategory.Roulette,       name: 'Roulette'},
    {id: CasinoGameCategory.Baccarat,       name: 'Baccarat'},
    {id: CasinoGameCategory.VideoPoker,     name: 'Video Poker'},
    {id: CasinoGameCategory.Holdem,         name: "Texas Hold'em"},
    {id: CasinoGameCategory.HoldemCasino,   name: "Casino Hold'em"}
].map(gc => ({...gc, value: gc.name}));
