import { WeatherObserver } from "../observers/weather.observer.type";

export interface IOptionalArgParser {
    tryParse(value: string, weatherObserver: WeatherObserver): boolean;
}