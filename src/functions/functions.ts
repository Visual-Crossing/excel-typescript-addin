/* global clearInterval, console, CustomFunctions, setInterval */

import { PrintDirections, WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { ToCacheId, getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyAsync, getUnitAsync } from "../settings/settings";
import { getDataCols, getDataRows, getFormulaWithoutColsRows } from "../helpers/helpers.formulas";

async function updateFormula(cacheItemJson: any, weatherArgs: WeatherArgs, invocation: CustomFunctions.Invocation): Promise<void> {
  if (invocation && invocation.address) {
    const timer = setInterval(async () => {
      try {
        clearInterval(timer);
      }
      catch {
        //ToDo
      }

      try {
        if (invocation && invocation.address) {
          await Excel.run(async (context: Excel.RequestContext) => {
            try {
              if (invocation && invocation.address) {
                const sheetName = invocation.address.split("!")[0];

                if (!sheetName) {
                  
                }

                const sheet = context.workbook.worksheets.getItem(sheetName);

                if (!sheet) {
                  
                }

                const caller = sheet.getRange(invocation.address);

                if (!caller) {
                  
                }

                caller.load();
                await context.sync();

                const originalFormula: string = caller.formulas[0][0] as string;
                const originalFormulaWithoutColsRows: string = getFormulaWithoutColsRows(originalFormula, weatherArgs);
                const newFormula = `${originalFormulaWithoutColsRows.substring(0, originalFormulaWithoutColsRows.length - 1)}, "cols=${getDataCols(cacheItemJson, weatherArgs.PrintDirection)};rows=${getDataRows(cacheItemJson, weatherArgs.PrintDirection)}")`;

                caller.values= [[newFormula]];
                await context.sync();
              }
              else {
                //ToDo
              }
            }
            catch {
              //ToDo
            }
          });
        }
        else {
          //ToDo
        }
      }
      catch {
        //ToDo
      }
    }, 250);
  }
  else {
    //ToDo
  }
}

async function insertData(cacheItemJson: any, printDirection: PrintDirections, invocation: CustomFunctions.Invocation): Promise<void> {
  if (cacheItemJson && invocation && invocation.address) {
    await Excel.run(async (context) => {
      if (invocation && invocation.address) {
        const sheetName = invocation.address.split("!")[0];

        if (!sheetName) {
          
        }

        const sheet = context.workbook.worksheets.getItem(sheetName);

        if (!sheet) {
          
        }

        const caller = sheet.getRange(invocation.address);

        if (!caller) {
          
        }
        
        caller.load();
        await context.sync();

        if (printDirection === PrintDirections.Horizontal) {
          sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex + 1, 1, 4).values = [[cacheItemJson.tempmin, cacheItemJson.precip, cacheItemJson.precipprob, cacheItemJson.windspeed]];
        }
        else {
          sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, 4, 1).values = [[cacheItemJson.tempmin], [cacheItemJson.precip], [cacheItemJson.precipprob], [cacheItemJson.windspeed]];
        }

        await context.sync();
      }
      else {
        //ToDo
      }
    });
  }
  else {
    //ToDo
  }
}

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
export async function Weather(location: string, date: string, args: string | null = null, colsRows: string | null = null, invocation: CustomFunctions.Invocation): Promise<string | number | undefined | any> {
  try
  {
    if (!location) {
      return "#Invalid Location!";
    }

    if (!date) {
      return "#Invalid Date!";
    }

    let unit: string | null = await getUnitAsync();

    if (!unit) {
      unit = "us";
    }
    
    const cacheId: string = ToCacheId(location, date, unit);

    if (!cacheId) {
      throw new Error("Unable to generate the cache id.");
    }

    const cacheItem: string | null = getCacheItem(cacheId);

    if (cacheItem) {
      const cacheItemJson: any = JSON.parse(cacheItem);

      if (!cacheItemJson) {
        //ToDo
      }

      if (cacheItemJson.status === "Requesting") {
        return "#N/A Requesting...";
      }
      else if (cacheItemJson.status === "Complete") {
        const weatherArgs: WeatherArgs | null = extractWeatherArgs(args, colsRows);

        if (invocation && !colsRows) {
          updateFormula(cacheItemJson, weatherArgs ?? new WeatherArgs(), invocation);
          return "Updating...";
        }

        if (invocation && invocation.address) {
          let printDirection: PrintDirections;

          if (weatherArgs) {
            printDirection = weatherArgs.PrintDirection;
          }
          else {
            printDirection = PrintDirections.Vertical;
          }

          insertData(cacheItemJson, printDirection, invocation);
        }
        
        return cacheItemJson.tempmax;
      }
    }

    const apiKey: string | null = await getApiKeyAsync();
    
    if (apiKey) {
      setCacheItem(cacheId, JSON.stringify({ 
        "status": "Requesting",
      }));

      const TIMELINE_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}?key=${apiKey}&unitGroup=${unit}`
      const response: Response = await fetch(TIMELINE_URL);

      const NA_DATA: string = "#N/A Data";

      if (!response) {
        return NA_DATA;
      }

      const jsonResponse: any = await response.json();
      
      if (jsonResponse && jsonResponse.days && jsonResponse.days.length > 0 && jsonResponse.days[0]) {
        setCacheItem(cacheId, JSON.stringify({ 
          "status": "Complete",
          "tempmax": jsonResponse.days[0].tempmax,
          "tempmin": jsonResponse.days[0].tempmin,
          "precip": jsonResponse.days[0].precip,
          "precipprob": jsonResponse.days[0].precipprob,
          "windspeed": jsonResponse.days[0].windspeed
        }));

        if (invocation && invocation.address) {
          const cacheItem = getCacheItem(cacheId);

          if (!cacheItem) {
            //ToDo
          }

          const cacheItemString = cacheItem as string;
          const cacheItemJson = JSON.parse(cacheItemString);
          const weatherArgs: WeatherArgs | null = extractWeatherArgs(args, colsRows);

          updateFormula(cacheItemJson, weatherArgs ?? new WeatherArgs(), invocation);

          return "Updating...";
        }
        else
        {
          return "#Error!";
        }
      }
      else {
        return NA_DATA;
      }
    }
    else {
      return "#Invalid API Key!";
    }
  }
  catch
  {
    return "#Error!";
  }
}
