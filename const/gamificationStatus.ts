export enum statusTournament {
  Not_started = 1,
  In_progress,
  Finished
}

export const gamificationStatus = [
  {id: statusTournament.Not_started,  name: 'Not started'},
  {id: statusTournament.In_progress,  name: 'In progress'},
  {id: statusTournament.Finished,     name: 'Finished'}
].map(gc => ({...gc, value: gc.name}));