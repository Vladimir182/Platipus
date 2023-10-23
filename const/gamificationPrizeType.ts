export enum GamificationPrizeType {
  Cashe = 1,
  FreeSpin,
  RaffleTicket,
  Gift
}

export const gamificationPrizeType = [
  {id: GamificationPrizeType.Cashe,         name: 'Cashe'},
  {id: GamificationPrizeType.FreeSpin,      name: 'FreeSpin'},
  {id: GamificationPrizeType.RaffleTicket,  name: 'RaffleTicket'},
  {id: GamificationPrizeType.Gift,          name: 'Gift'}
].map(gc => ({...gc, value: gc.name}));

