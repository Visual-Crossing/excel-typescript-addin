import { WeatherObserver } from "../observers/weather.observer.type";

export interface IParameterProcessor {
    process(value: any, weatherObserver: WeatherObserver): void;
}