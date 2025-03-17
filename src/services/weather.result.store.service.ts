import { Service } from 'typedi';
import { IWeatherResultsStoreService } from '../types/services/weather.result.store.service.type';
import { IWeatherResultService } from '../types/services/weather.result.service.type';

@Service()
export class WeatherResultsStore implements IWeatherResultsStoreService {
    private WeatherResults: Map<string, { key: string, count: number, weatherResult: IWeatherResultService }> = new Map<string, { key: string, count: number, weatherResult: IWeatherResultService }>();

    private generateKey(cacheId: string, destinationAddress: string): string {
        return `${cacheId}_${destinationAddress}`;
    }

    public addOrUpdate(weatherResult: IWeatherResultService): void {
        if (!weatherResult || !weatherResult.Observer || !weatherResult.Observer.Invocation || !weatherResult.Observer.Invocation.address) {
            throw new Error();
        }

        let storeItem = this.get(weatherResult.Observer.CacheId, weatherResult.Observer.Invocation.address); 

        if (storeItem) {
            storeItem.count++;
            storeItem.weatherResult = weatherResult;
        } else {
            const key: string = this.generateKey(weatherResult.Observer.CacheId, weatherResult.Observer.Invocation.address);
            storeItem = { key: key, count: 1, weatherResult: weatherResult };
        }

        this.WeatherResults.set(storeItem.key, storeItem);
    }

    private getStoreItemByKey(key: string): { key: string, count: number, weatherResult: IWeatherResultService } | null {
        if (!key) {
            throw new Error();
        }

        if (this.WeatherResults.has(key)) {
            return this.WeatherResults.get(key)!;
        }

        return null;
    }

    public get(cacheId: string, destinationAddress: string): { key: string, count: number, weatherResult: IWeatherResultService } | null {
        if (!cacheId || !destinationAddress) {
            throw new Error();
        }

        const key: string = this.generateKey(cacheId, destinationAddress);

        return this.getStoreItemByKey(key);
    }

    public remove(cacheId: string, destinationAddress: string): void {
        // const storeItem = this.get(cacheId, destinationAddress);

        // if (storeItem) {
        //     storeItem.count--;

        //     if (storeItem.count < 1) {
        //         this.WeatherResults.delete(storeItem.key);
        //     } else {
        //         this.WeatherResults.set(storeItem.key, storeItem);
        //     }
        // }
    }

    public clear(): void {
        this.WeatherResults.clear();
    }
}