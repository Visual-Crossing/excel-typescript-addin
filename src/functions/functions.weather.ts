import { PrintDirections, WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { generateCacheId, getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettings } from "../settings/settings";
import { getDataCols, getDataRows, getFormulaWithoutColsRows } from "../helpers/helpers.formulas";

export function getOrRequestData(unit: string | null, location: string, date: string, getRemainingWeatherArgs: () => [any | null, any | null, CustomFunctions.Invocation]): string | number | Date {
    if (!unit) {
        //Default unit = us
        unit = "us";
    }
    
    const cacheId: string = generateCacheId(location, date, unit);
    const cacheItem: string | null = getCacheItem(cacheId);

    if (cacheItem) {
        const cacheItemJson: any = JSON.parse(cacheItem);
        return getDataFromCache(cacheItemJson, getRemainingWeatherArgs);
    }

    makeRequest(() => { return [cacheId, location, date, unit] }, () => { return [cacheId, ...getRemainingWeatherArgs()] });

    return "Retrieving...";
}

function getDataFromCache(cacheItemJson: any, getRemainingWeatherArgs: () => [any | null, any | null, CustomFunctions.Invocation]): string | number | Date {
    if (!cacheItemJson) {
        //ToDo
    }

    if (cacheItemJson.status === "Retrieving") {
        return "Retrieving...";
    }
    else if (cacheItemJson.status === "Complete") {
        const [args, colsRows, invocation] = getRemainingWeatherArgs();
        const weatherArgs: WeatherArgs | null = extractWeatherArgs(args, colsRows);

        if (invocation && weatherArgs && (!weatherArgs.Columns || !weatherArgs.Rows)) {
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

            printArrayData(cacheItemJson, printDirection, invocation);
        }
        
        return cacheItemJson.tempmax;
    }

    throw new Error();
}

function makeRequest(getApiKeySuccessResponseArgs: () => [string, string, string, string | null], getTimelineApiSuccessJsonResponseArgs: () => [string, any | null, any | null, CustomFunctions.Invocation]): void {
    getApiKeyFromSettings((apiKey: string | null) => onApiKeySuccessResponse(apiKey, getApiKeySuccessResponseArgs, getTimelineApiSuccessJsonResponseArgs));
}

function onApiKeySuccessResponse(apiKey: string | null, getApiKeySuccessResponseArgs: () => [string, string, string, string | null], getTimelineApiSuccessJsonResponseArgs: () => [string, any | null, any | null, CustomFunctions.Invocation]) {
    if (apiKey) {
        const [cacheId, location, date, unit] = getApiKeySuccessResponseArgs();

        setCacheItem(cacheId, JSON.stringify({ 
          "status": "Retrieving",
        }));
  
        const TIMELINE_API_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}?key=${apiKey}&unitGroup=${unit}`
        
        fetch(TIMELINE_API_URL)
            .then(async (response: Response) => {
                onTimelineApiSuccessResponse(response, getTimelineApiSuccessJsonResponseArgs);
            })
            .catch(() => {
                //ToDo
            });
  
        // return "Requesting...";
    }
    else {
        // return "#Invalid API Key!";
    }
}

function onTimelineApiSuccessResponse(response: Response, getTimelineApiSuccessJsonResponseArgs: () => [string, any | null, any | null, CustomFunctions.Invocation]) {
    const NA_DATA: string = "#N/A Data";
  
    if (!response) {
    //   return NA_DATA;
    }

    response.json()
        .then((jsonResponse: any) => {
            onTimelineApiSuccessJsonResponse(jsonResponse, getTimelineApiSuccessJsonResponseArgs);
        })
        .catch(() => {
            //ToDo
        });
        
    

}

function onTimelineApiSuccessJsonResponse(jsonResponse: any, getTimelineApiSuccessJsonResponseArgs: () => [string, any | null, any | null, CustomFunctions.Invocation]) {
    if (jsonResponse && jsonResponse.days && jsonResponse.days.length > 0 && jsonResponse.days[0]) {
        const [cacheId, args, colsRows, invocation] = getTimelineApiSuccessJsonResponseArgs();

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
        }
        else
        {
          // return "#Error!";
        }
      }
      else {
        // return NA_DATA;
      }
}

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

async function printArrayData(cacheItemJson: any, printDirection: PrintDirections, invocation: CustomFunctions.Invocation): Promise<void> {
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