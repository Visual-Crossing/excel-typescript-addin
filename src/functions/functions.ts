/* global clearInterval, console, CustomFunctions, setInterval */

import { ToCacheId, getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyAsync, getUnitAsync } from "../settings/settings";

async function updateFormula(invocation: CustomFunctions.Invocation) {
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

                const originalFormula = caller.formulas[0][0] as string;
                const newFormula = `${originalFormula.substring(0, originalFormula.length - 1)}, "cols=1;rows=5")`;

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

async function insertData(cacheItemJson: any, invocation: CustomFunctions.Invocation) {
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

        sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, 4, 1).values = [[cacheItemJson.tempmin], [cacheItemJson.precip], [cacheItemJson.precipprob], [cacheItemJson.windspeed]];
        await context.sync();
      }
      else {
        //ToDo
      }
    });
  }
  else {
    //TOdO
  }
}

/**
 * Offers complete, global weather data coverage both geographically and chronologically.
 * @customfunction
 * @param location Location
 * @param date Date
 * @requiresAddress
 * @returns Weather data.
 */
export async function Weather(location: string, date: string, colsRows: string | null = null, args: string | null = null, invocation: CustomFunctions.Invocation): Promise<string | number | undefined | any> {
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
        if (invocation && !colsRows) {
          updateFormula(invocation);
          return "Updating...";
        }

        if (invocation && invocation.address) {
          insertData(cacheItemJson, invocation);
        }
        
        return cacheItemJson.tempmax;
      }
    }

    const apiKey: string | null = await getApiKeyAsync();
    
    if (apiKey) {
      const TIMELINE_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}?key=${apiKey}&unitGroup=${unit}`
      const response: Response = await fetch(TIMELINE_URL);

      setCacheItem(cacheId, JSON.stringify({ 
        "status": "Requesting",
      }));

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
          updateFormula(invocation);
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
