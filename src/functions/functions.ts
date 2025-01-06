/* global clearInterval, console, CustomFunctions, setInterval */

import Container from 'typedi';
import { Setup } from '../services/setup';
import { WeatherObserver } from '../types/observers/weather.observer.type';
import { IWeatherObserverService } from '../types/observers/weather.observer.service.type';
import { IRequestService } from '../types/requests/request.service.type';

/**
 * Offers complete, global weather data coverage both geographically and chronologically.
 * @customfunction
 * @param location Location
 * @param date Date
 * @param optionalArg1 Optional Parameter1
 * @param optionalArg2 Optional Parameter2
 * @param optionalArg3 Optional Parameter3
 * @param optionalArg4 Optional Parameter4 
 * @param optionalArg5 Optional Parameter5  
 * @param invocation
 * @requiresAddress
 * @returns Weather data.
 */
export async function Weather(
  location: any, 
  date: any, 
  optionalArg1: any | null | undefined = null, 
  optionalArg2: any | null | undefined = null,
  optionalArg3: any | null | undefined = null,
  optionalArg4: any | null | undefined = null, 
  optionalArg5: any | null | undefined = null, 
  invocation: CustomFunctions.Invocation
): Promise<string | number | Date> {
  
  try {
    if (!Container.has('service.settings')) {
      if (!Setup.registerServicesOverride) {
        Setup.registerServicesOverride = Setup.registerServices;
      }

      Setup.registerServicesOverride();
    }

    const weatherObserverService = Container.get<IWeatherObserverService>('service.observer.weather');
    const weatherObserver: WeatherObserver = await weatherObserverService.process(location, date, invocation, optionalArg1, optionalArg2, optionalArg3, optionalArg4, optionalArg5);

    const weatherRequestService = Container.get<IRequestService<WeatherObserver>>('service.requests.weather');
    return await weatherRequestService.fetchData(weatherObserver);
  }
  catch (error: any) {
    if (error) {
      if (error.message) {
        return `#N/A Error! - (${error.message})`;
      } else if (error.name) {
        return `#N/A Error! - (${error.name})`;
      }
    }

    return '#N/A Error!';
  }
}