import { WeatherObserver } from "../weather.observer.type";

export interface IWeatherResultService {
    Observer: WeatherObserver;

    create(): IWeatherResultService;
    getFormulaCellValue(): string | number | Date;
    toArray(validate: (arrayData: any[]) => boolean) : any[];
}