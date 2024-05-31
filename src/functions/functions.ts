/* global clearInterval, console, CustomFunctions, setInterval */

import { ToCacheId, getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyAsync, getUnitAsync } from "../settings/settings";

/**
 * Offers complete, global weather data coverage both geographically and chronologically..
 * @customfunction
 * @param location Location
 * @param date Date
 * @returns Weather data.
 * @requiresAddress
 */
export async function Weather(location: string, date: string, invocation: CustomFunctions.Invocation): Promise<string | number | undefined | any[][]> {
  try
  {
    let unit: string | null = await getUnitAsync();

    if (!unit) {
      unit = "us";
    }

    const cacheId: string = ToCacheId(location, date, unit);
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
        if (invocation.address) {
          await Excel.run(async (context) => {
            if (invocation.address) {
              const sheetName = invocation.address.split("!")[0];
              const sheet = context.workbook.worksheets.getItem(sheetName);
              const cell = sheet.getRange(invocation.address);

              cell.load();
              await context.sync();

              sheet.getRangeByIndexes(cell.rowIndex + 1, cell.columnIndex, 4, 1).values = [[cacheItemJson.tempmin], [cacheItemJson.precip], [cacheItemJson.precipprob], [cacheItemJson.windspeed]];
              await context.sync();
            }
          });
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
        // invocation.setResult(NA_DATA);
      }

      const jsonResponse: any = await response.json();
      
      if (jsonResponse && jsonResponse.days && jsonResponse.days[0]) {
        setCacheItem(cacheId, JSON.stringify({ 
          "status": "Complete",
          "tempmax": jsonResponse.days[0].tempmax,
          "tempmin": jsonResponse.days[0].tempmin,
          "precip": jsonResponse.days[0].precip,
          "precipprob": jsonResponse.days[0].precipprob,
          "windspeed": jsonResponse.days[0].windspeed
        }));

        // Vertical
        // return [[jsonResponse.days[0].tempmax], [jsonResponse.days[0].tempmin], [jsonResponse.days[0].precip], [jsonResponse.days[0].precipprob], [jsonResponse.days[0].windspeed]];

        // Horizontal
        // return [[jsonResponse.days[0].tempmax, jsonResponse.days[0].tempmin, jsonResponse.days[0].precip, jsonResponse.days[0].precipprob, jsonResponse.days[0].windspeed]];

        if (invocation.address) {
          if (invocation.address) {
            await Excel.run(async (context) => {
              if (invocation.address) {
                const sheetName = invocation.address.split("!")[0];
                const sheet = context.workbook.worksheets.getItem(sheetName);
                const cell = sheet.getRange(invocation.address);

                cell.load();
                await context.sync();

                sheet.getRangeByIndexes(cell.rowIndex + 1, cell.columnIndex, 4, 1).values = [[jsonResponse.days[0].tempmin], [jsonResponse.days[0].precip], [jsonResponse.days[0].precipprob], [jsonResponse.days[0].windspeed]];
                await context.sync();
              }
            });
          }
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
