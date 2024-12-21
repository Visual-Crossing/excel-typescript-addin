/* global clearInterval, console, CustomFunctions, setInterval */

import { WeatherObserver, extractWeatherArgs } from "../helpers/helpers.args";
import { getOrRequestData } from "./functions.weather";

/**
 * Offers complete, global weather data coverage both geographically and chronologically.
 * @customfunction
 * @param location Location
 * @param date Date
 * @param optionalArg1 Optional Parameter1
 * @param optionalArg2 Optional Parameter2
 * @param optionalArg3 Optional Parameter3
 * @param optionalArg4 Optional Parameter4 
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
  invocation: CustomFunctions.Invocation
): Promise<string | number | Date> {
  
  try {
    if (!location) {
      return "#Invalid Location!";
    }

    if (!date) {
      return "#Invalid Date!";
    }

    const weatherObserver: WeatherObserver = await extractWeatherArgs(location, date, optionalArg1, optionalArg2, optionalArg3, optionalArg4, invocation);

    return await getOrRequestData(weatherObserver)
  }
  catch (error: any) {
    if (error && error.message) {
      return `#Error! - (${error.message})`;
    }

    return "#Error!";
  }
}