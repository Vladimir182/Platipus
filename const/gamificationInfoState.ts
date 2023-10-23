export enum GamificationInfoState {
    Active = 1,
    Inactive,
    Closed,
    InvalidSettings
}

export const gamificationInfoState = [
    {id: GamificationInfoState.Active,          name: 'Active'},
    {id: GamificationInfoState.Inactive,        name: 'Inactive'},
    {id: GamificationInfoState.Closed,          name: 'Closed'},
    {id: GamificationInfoState.InvalidSettings, name: 'Invalid Settings'}
].map(gc => ({...gc, value: gc.name}));
