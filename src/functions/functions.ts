/* global clearInterval, console, CustomFunctions, setInterval */

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
export async function Weather(location: any, date: any, args: any | null = null, colsRows: any | null = null, invocation: CustomFunctions.Invocation): Promise<string | number | Date> {
  try {
    if (!location) {
      return "#Invalid Location!";
    }

    if (!date) {
      return "#Invalid Date!";
    }

    const unit = await getUnitFromSettingsAsync();
    return await getOrRequestData(unit, location, date, ()=> { return [args, colsRows, invocation] } )
  }
  catch {
    return "#Error!";
  }
}
