export enum GamificationScoreType {
    TotalBet = 1,
    CountBet,
    TotalWin,
    TotalWinCoef
}

export const gamificationScoreType = [
    {id: GamificationScoreType.TotalBet,        name: 'Total Bet'},
    {id: GamificationScoreType.CountBet,        name: 'Count Bet'},
    {id: GamificationScoreType.TotalWin,        name: 'Total Win'},
    {id: GamificationScoreType.TotalWinCoef,    name: 'Total coef'}
].map(gc => ({...gc, value: gc.name}));
