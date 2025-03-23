import Container from 'typedi';
import { IRequestService } from '../../types/services/request.service.type';
import { WeatherObserver } from '../../types/weather.observer.type';
import { ICacheService } from '../../types/services/cache.service.type';
import { IObservableService } from '../../types/services/observable.service.type';
import { ISettingsService } from '../../types/services/settings.service.type';
import { getWeatherObservableService } from '../../helpers/helpers.services';

export class WeatherRequest implements IRequestService<WeatherObserver> {
    async onSuccessJsonResponse(jsonResponse: any, observer: WeatherObserver): Promise<void> {
        return await new Promise(async (resolve, reject) => {
            try {
                const cacheService = Container.get<ICacheService>('service.cache');
                let cacheValue: any = null;

                if (jsonResponse && jsonResponse.days && jsonResponse.days.length > 0 && jsonResponse.days[0]) {
                    cacheValue = jsonResponse.days[0];
                }

                cacheService.set(observer.CacheId, JSON.stringify({ 
                    id: observer.CacheId,
                    status: 'Complete',
                    type: 'Permanent',
                    values: cacheValue
                }));

                const weatherObservableService = Container.get<IObservableService<WeatherObserver>>('service.observable.weather');
                weatherObservableService.update(observer.CacheId, (observer) => observer.Invocation);

                return resolve();
            }
            catch (error: any) {
                return reject(error);
            }
        });
    }

    async onSuccessResponse(observer: WeatherObserver, response: Response): Promise<string | void | CustomFunctions.Error> {
        return await new Promise(async (resolve, reject) => {
            try {
                if (!response) {
                    return resolve(new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable));
                }

                const jsonResponse: any = await response.json();
                return resolve(await this.onSuccessJsonResponse(jsonResponse, observer));
            }
            catch (error: any) {
                return reject(error);
            }
        });
    }

    public async fetchData(observer: WeatherObserver): Promise<string | void | CustomFunctions.Error> {
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
                        const responseText: string = await response.text();
                        observer.Error = `#N/A API Error! - ${responseText}`;
                        
                        const cacheService = Container.get<ICacheService>('service.cache');

                        cacheService.set(observer.CacheId, JSON.stringify({ 
                            id: observer.CacheId,
                            status: 'Complete',
                            type: 'Permanent',
                            error: observer.Error
                        }));

                        const weatherObservableService: IObservableService<WeatherObserver> = getWeatherObservableService();
                        weatherObservableService.update(observer.CacheId, (observer) => observer.Invocation);

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