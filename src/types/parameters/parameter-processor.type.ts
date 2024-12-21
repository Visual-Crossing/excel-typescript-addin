import { WeatherObserver } from "src/helpers/helpers.args";

export interface IParameterProcessor {
    process(value: any, weatherObserver: WeatherObserver): void;
}