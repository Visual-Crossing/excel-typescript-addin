import { IWeatherResultService } from './weather.result.service.type';

export interface IWeatherResultsStoreService {
    addOrUpdate(weatherResult: IWeatherResultService): void;
    get(cacheId: string, destinationAddress: string): { key: string, count: number, weatherResult: IWeatherResultService } | null;
    remove(cacheId: string, destinationAddress: string): void;
    clear(): void;
}