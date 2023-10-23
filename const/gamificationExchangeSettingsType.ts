export enum ExchangeSettings {
  exchangeToEUR = 1,
  withoutExchange,
  exchangeToYourCurrency 
}

export const ExchangeSettingsType = [
  {id: ExchangeSettings.exchangeToEUR,          name: 'Exchange to EUR'},
  {id: ExchangeSettings.withoutExchange,        name: 'Without exchange'},
  {id: ExchangeSettings.exchangeToYourCurrency, name: 'Exchange to your currency'}
].map(gc => ({...gc, value: gc.name}));

