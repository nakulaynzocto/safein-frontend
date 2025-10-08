declare module 'country-state-city' {
  export interface ICountry {
    id: number;
    name: string;
    isoCode: string;
    phonecode: string;
    flag: string;
    currency: string;
    latitude: string;
    longitude: string;
    timezones: Array<{
      zoneName: string;
      gmtOffset: number;
      gmtOffsetName: string;
      abbreviation: string;
      tzName: string;
    }>;
  }

  export interface IState {
    id: number;
    name: string;
    isoCode: string;
    countryCode: string;
    latitude: string;
    longitude: string;
  }

  export interface ICity {
    id: number;
    name: string;
    stateCode: string;
    latitude: string;
    longitude: string;
    countryCode: string;
  }

  export class Country {
    static getAllCountries(): ICountry[];
    static getCountryByCode(code: string): ICountry | undefined;
    static getCountryByName(name: string): ICountry | undefined;
  }

  export class State {
    static getAllStates(): IState[];
    static getStatesOfCountry(countryCode: string): IState[];
    static getStateByCodeAndCountry(stateCode: string, countryCode: string): IState | undefined;
  }

  export class City {
    static getAllCities(): ICity[];
    static getCitiesOfState(countryCode: string, stateCode: string): ICity[];
    static getCitiesOfCountry(countryCode: string): ICity[];
  }
}
