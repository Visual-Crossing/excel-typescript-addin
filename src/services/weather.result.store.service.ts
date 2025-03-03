import { Service } from "typedi";
import { IWeatherResultsStoreService } from "../types/services/weather.result.store.service.type";
import { IWeatherResultService } from "../types/services/weather.result.service.type";

@Service()
export class WeatherResultsStore implements IWeatherResultsStoreService {
    private WeatherResults: Map<string, IWeatherResultService> = new Map<string, IWeatherResultService>();

    private generateKey(cacheId: string, destinationAddress: string): string {
        return `${cacheId}_${destinationAddress}`;
    }

    public addOrUpdate(weatherResult: IWeatherResultService): void {
        if (!weatherResult || !weatherResult.CacheItem || !weatherResult.CacheItem.id || !weatherResult.DestinationAddress) {
            throw new Error();
        }

        const key = this.generateKey(weatherResult.CacheItem.id, weatherResult.DestinationAddress);
        this.WeatherResults.set(key, weatherResult);
    }

    public get(cacheId: string, destinationAddress: string): IWeatherResultService | null {
        if (!cacheId || !destinationAddress) {
            throw new Error();
        }

        const key = this.generateKey(cacheId, destinationAddress);

        if (this.WeatherResults.has(key)) {
            return this.WeatherResults.get(key)!;
        }

        return null;
    }

    public remove(cacheId: string, destinationAddress: string): void {
        if (!cacheId || !destinationAddress) {
            throw new Error();
        }

        const key = this.generateKey(cacheId, destinationAddress);

        if (this.WeatherResults.has(key)) {
            this.WeatherResults.delete(key)!;
        }
    }

    public clear(): void {
        this.WeatherResults.clear();
    }
    
}