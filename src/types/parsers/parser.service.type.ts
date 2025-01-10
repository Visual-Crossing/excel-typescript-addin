import { WeatherObserver } from "../observers/weather.observer.type";

export interface IOptionalArgParserService {
    tryParse(value: string, weatherObserver: WeatherObserver): boolean;
}