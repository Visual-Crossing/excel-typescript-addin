/* global clearInterval, console, CustomFunctions, setInterval */

import { getUnitAsync as getUnitFromSettingsAsync } from "../settings/settings";
import { onUnitSuccessResponse } from "./functions.weather";

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
export function Weather(location: any, date: any, args: any | null = null, colsRows: any | null = null, invocation: CustomFunctions.Invocation): undefined | string | number | any {
  try {
    if (!location) {
      return "#Invalid Location!";
    }

    if (!date) {
      return "#Invalid Date!";
    }

    getUnitFromSettingsAsync()
      .then((unit: string | null) => {
        onUnitSuccessResponse(unit, location, date, ()=> { return [args, colsRows, invocation] } );
      })
      .catch((error: any) => {
        //ToDo
      });
    
    return "Retrieving...";
  }
  catch {
    return "#Error!";
  }
}
