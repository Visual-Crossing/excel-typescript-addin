import { WeatherObserver } from "./weather.observer.type";

export interface IWeatherObserverService {
    process(
        location: any, 
        date: any,
        invocation: CustomFunctions.Invocation, 
        optionalArg1?: any | null | undefined, 
        optionalArg2?: any | null | undefined,
        optionalArg3?: any | null | undefined,
        optionalArg4?: any | null | undefined,
        optionalArg5?: any | null | undefined
    ): Promise<WeatherObserver>;
}