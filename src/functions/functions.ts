import { Setup } from '../services/setup';
import { Hooks } from '../services/hooks';
import { IWeatherObserverService } from '../types/services/weather.observer.service.type';
import { WeatherObserver } from '../types/weather.observer.type';
import { IErrorParserService } from '../types/services/parsers/error.parser.service.type';
import { IObservableService } from '../types/services/observable.service.type';
import { getErrorParserService, getWeatherObservableService, getWeatherObserverService } from '../helpers/helpers.services';

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
): Promise<string | number | Date | CustomFunctions.Error> {
  
  try {
    //debugger;
    Setup.init();
    await Hooks.init();

    const weatherObserverService: IWeatherObserverService = getWeatherObserverService();
    const weatherObserver: WeatherObserver = await weatherObserverService.process(location, date, invocation, optionalArg1, optionalArg2, optionalArg3, optionalArg4, optionalArg5);
    const weatherObservableService: IObservableService<WeatherObserver> = getWeatherObservableService();

    return weatherObservableService.observe(weatherObserver);
  } catch (error: any) {
    const errorParserService: IErrorParserService | null = getErrorParserService();
    
    if (errorParserService) {
      return errorParserService.getErrorInfo(error);
    } else {
      return new CustomFunctions.Error(CustomFunctions.ErrorCode.invalidValue);
    }
  }
}