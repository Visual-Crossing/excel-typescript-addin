/* global clearInterval, console, CustomFunctions, setInterval */

import { WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { getUnitFromSettingsAsync } from "../settings/settings";
import { getOrRequestData } from "./functions.weather";

/**
 * Offers complete, global weather data coverage both geographically and chronologically.
 * @customfunction
 * @param location Location
 * @param date Date
 * @param args Optional Parameters
 * @param colsRows Number of columns and rows
 * @requiresAddress
 * @returns Weather data.
 */
export async function Weather(location: any, date: any, args: any | null = null, invocation: CustomFunctions.Invocation): Promise<string | number | Date> {
  try {
    const weatherArgs: WeatherArgs | null = extractWeatherArgs(args);

    if (!location) {
      return "#Invalid Location!";
    }

    if (!date) {
      return "#Invalid Date!";
    }

    const unit = await getUnitFromSettingsAsync();
    return getOrRequestData({ functionOptionalArgs: args, unit, location, date, invocation } )
  }
  catch (error: any) {
    if (error && error.message) {
      return `#Error! - (${error.message})`;
    }

    return "#Error!";
  }
}
