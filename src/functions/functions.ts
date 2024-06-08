/* global clearInterval, console, CustomFunctions, setInterval */

import { generateCacheId } from "../cache/cache";
import { WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { getUnitFromSettingsAsync } from "../settings/settings";
import { getOrRequestData } from "./functions.weather";

/**
 * Offers complete, global weather data coverage both geographically and chronologically.
 * @customfunction
 * @param location Location
 * @param date Date
 * @param args Optional Parameters
 * @param invocation
 * @requiresAddress
 * @returns Weather data.
 */
export async function Weather(location: any, date: any, args: any | null | undefined = null, invocation: CustomFunctions.Invocation): Promise<string | number | Date> {
  try {
    const weatherArgs: WeatherArgs = await extractWeatherArgs(location, date, args, invocation);

    if (!location) {
      

      return "#Invalid Location!";
    }

    if (!date) {
      return "#Invalid Date!";
    }

    return getOrRequestData(weatherArgs)
  }
  catch (error: any) {
    if (error && error.message) {
      return `#Error! - (${error.message})`;
    }

    return "#Error!";
  }
}
