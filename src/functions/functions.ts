/* global clearInterval, console, CustomFunctions, setInterval */

import { WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { getOrRequestData } from "./functions.weather";

/**
 * Offers complete, global weather data coverage both geographically and chronologically.
 * @customfunction
 * @param location Location
 * @param date Date
 * @param optionalArgs Optional Parameters
 * @param invocation
 * @requiresAddress
 * @returns Weather data.
 */
export async function Weather(location: any, date: any, optionalArgs: any | null | undefined = null, invocation: CustomFunctions.Invocation): Promise<string | number | Date> {
  try {
    if (!location) {
      return "#Invalid Location!";
    }

    if (!date) {
      return "#Invalid Date!";
    }

    const weatherArgs: WeatherArgs = await extractWeatherArgs(location, date, optionalArgs, invocation);

    return await getOrRequestData(weatherArgs)
  }
  catch (error: any) {
    if (error && error.message) {
      return `#Error! - (${error.message})`;
    }

    return "#Error!";
  }
}