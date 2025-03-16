import Container from "typedi";
import { ISettingsService } from "../types/services/settings.service.type";
import { ICacheService } from "../types/services/cache.service.type";
import { IDateParserService } from "../types/services/parsers/date.parser.service.type";
import { IWeatherObserverService } from "../types/services/weather.observer.service.type";
import { IObservableService } from "../types/services/observable.service.type";
import { WeatherObserver } from "../types/weather.observer.type";
import { IErrorParserService } from "../types/services/parsers/error.parser.service.type";

export function getRequiredService<T>(id: string): T {
    const errorMsg: string = 'Unable to get service.';

    if (!id) {
        throw new Error(errorMsg);
    }
    
    const service = Container.get<T>(id);

    if (!service) {
        throw new Error(errorMsg);
    }

    return service;
}

export function getService<T>(id: string): T | null {
    try {
        const service = Container.get<T>(id);
        return service;
    }
    catch {
        return null;
    }
}

export function getErrorParserService(): IErrorParserService | null {
    return getService<IErrorParserService | null>('service.parser.error');
}

export function getSettingsService(): ISettingsService {
    return getRequiredService<ISettingsService>('service.settings');
}

export function getCacheService(): ICacheService {
    return getRequiredService<ICacheService>('service.cache');
}

export function getDateParserService(): IDateParserService {
    return getRequiredService<IDateParserService>('service.parser.date');
}

export function getWeatherObserverService(): IWeatherObserverService {
    return getRequiredService<IWeatherObserverService>('service.observer.weather');
}

export function getWeatherObservableService(): IObservableService<WeatherObserver> {
    return getRequiredService<IObservableService<WeatherObserver>>('service.observable.weather');
}