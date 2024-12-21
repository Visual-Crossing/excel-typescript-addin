/* global clearInterval, console, CustomFunctions, setInterval */

import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { getOrRequestData } from "./functions.weather";
import Container from "typedi";
import { WeatherObserverService } from "src/services/observers/weather.observer";

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
    // if (!location) {
    //   return "#Invalid Location!";
    // }

    // if (!date) {
    //   return "#Invalid Date!";
    // }

    const weatherObserverService = Container.get(WeatherObserverService);
    const weatherObserver: WeatherObserver = await weatherObserverService.process(location, date, invocation, optionalArg1, optionalArg2, optionalArg3, optionalArg4, optionalArg5);

    return await getOrRequestData(weatherObserver)
  }
  catch (error: any) {
    if (error && error.message) {
      return `#Error! - (${error.message})`;
    }

    return "#Error!";
  }
}