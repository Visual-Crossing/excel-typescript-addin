/* global clearInterval, console, CustomFunctions, setInterval */

import Container from 'typedi';
import { DI } from '../services/container';
import { WeatherObserver } from '../types/observers/weather.observer.type';
import { getOrRequestData } from './functions.weather';
import { IWeatherObserverService } from 'src/types/observers/weather.observer.service.type';

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
      DI.registerServices();
    }

    const weatherObserverService = Container.get<IWeatherObserverService>('service.observer.weather');
    const weatherObserver: WeatherObserver = await weatherObserverService.process(location, date, invocation, optionalArg1, optionalArg2, optionalArg3, optionalArg4, optionalArg5);

    return await getOrRequestData(weatherObserver)
  }
  catch (error: any) {
    if (error && error.message) {
      return `#Error! - (${error.message})`;
    } else if (error && error.name) {
      return `#Error! - (${error.name})`;
    }

    return '#Error!';
  }
}