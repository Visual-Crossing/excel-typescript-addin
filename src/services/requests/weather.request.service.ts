import { IRequestService } from "../../types/requests/request.service.type";
import { WeatherObserver } from "../../types/observers/weather.observer.type";
import { ICacheService } from "../../types/cache/cache.service.type";
import Container from "typedi";
import { IObservableService } from "../../types/observables/observable.service.type";
import { NA_DATA, PROCESSING } from "../../shared/constants";
import { ISettingsService } from "../../types/settings/settings.service.type";

export class WeatherRequest implements IRequestService<WeatherObserver> {
    async onSuccessJsonResponse(jsonResponse: any, observer: WeatherObserver): Promise<string> {
        return await new Promise(async (resolve, reject) => {
            try {
                if (jsonResponse && jsonResponse.days && jsonResponse.days.length > 0 && jsonResponse.days[0]) {
                    const cacheService = Container.get<ICacheService>('service.cache');

                    cacheService.set(observer.CacheId, JSON.stringify({ 
                        status: 'Complete',
                        type: 'Permanent',
                        values: jsonResponse.days[0]
                    }));

                    const weatherObservableService = Container.get<IObservableService<WeatherObserver>>('service.observable.weather');
                    weatherObservableService.onUpdate(observer);

                    return resolve(PROCESSING);
                }
                else {
                    return resolve(NA_DATA);
                }
            }
            catch (error: any) {
                return reject(error);
            }
        });
    }

    async onSuccessResponse(observer: WeatherObserver, response: Response): Promise<string> {
        return await new Promise(async (resolve, reject) => {
            try {
                if (!response) {
                    return resolve(NA_DATA);
                }

                const jsonResponse: any = await response.json();
                return resolve(await this.onSuccessJsonResponse(jsonResponse, observer));
            }
            catch (error: any) {
                return reject(error);
            }
        });
    }

    public async fetchData(observer: WeatherObserver): Promise<string> {
        const settings = Container.get<ISettingsService>('service.settings');
        const apiKey: string | null | undefined = await settings.getApiKeyAsync();

        if (!apiKey) {
            throw new Error('Invalid API Key!');
        }

        if (observer && observer.Invocation && observer.Invocation.address) {
            const weatherObservableService = Container.get<IObservableService<WeatherObserver>>('service.observable.weather');
            weatherObservableService.subscribe(observer.CacheId, observer.Invocation, observer);

            const TIMELINE_API_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${observer.Location}/${observer.Date.toISOString()}?key=${apiKey}&unitGroup=${observer.Unit}`
            
            return await new Promise(async (resolve, reject) => {
                try {
                    const response: Response = await fetch(TIMELINE_API_URL);

                    if (response.status === 200) {
                        return resolve (await this.onSuccessResponse(observer, response));
                    }
                    else {
                        const cacheService = Container.get<ICacheService>('service.cache');

                        cacheService.set(observer.CacheId, JSON.stringify({ 
                            status: 'Complete',
                            type: 'Temporary',
                            values: 
                            [
                                { name: 'Error', value: 'API Error' },
                            ]
                        }));
        
                        const weatherObservableService = Container.get<IObservableService<WeatherObserver>>('service.observable.weather');
                        weatherObservableService.onUpdate(observer);

                        return reject();
                    }
                }
                catch (error: any) {
                    return reject(error);
                }
            });
        }

        throw new Error('Unexpected Error!');
    }
}