export enum GamificationType {
    Tournament = 1,
    Jackpot,
    Challenge 
}

export const gamificationType = [
    {id: GamificationType.Tournament,   name: 'Tournament'},
    {id: GamificationType.Jackpot,      name: 'Jackpot'},
    {id: GamificationType.Challenge,    name: 'Challenge'}
].map(gc => ({...gc, value: gc.name}));

