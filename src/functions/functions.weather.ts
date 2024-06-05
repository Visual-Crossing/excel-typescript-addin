import { PrintDirections, WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { generateCacheId, getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import { extractFormulaArgsSection, getDataCols, getDataRows, replaceOrInsertArgs } from "../helpers/helpers.formulas";
import semaphore from "semaphore";
import { Queue } from 'queue-typescript';

var requests: Record<string, Queue<CustomFunctions.Invocation>> | null;

const sem: semaphore.Semaphore = semaphore(1);

export function getOrRequestData(args: { functionOptionalArgs: any | null, unit: string | null, location: string, date: string, invocation: CustomFunctions.Invocation }): string | number | Date {
    if (!args.unit) {
        //Default unit = us
        args.unit = "us";
    }
    
    const cacheId: string = generateCacheId(args.location, args.date, args.unit!);

    let cacheItem: string | null = null;

    /**
     * Use of semaphore ensures that only 1 request to the server is made for each unique combination of location, date & unit.
     * Subsequent requests for the same data are retrieved from the cache i.e. a second request is NOT made to the server.
     */
    sem.take(function() {
        cacheItem = getCacheItem(cacheId);
    
        if (!cacheItem) {
            setCacheItem(cacheId, JSON.stringify({ 
                "status": "Requesting",
            }));
        }

        sem.leave();
    });

    clearArrayData(args);

    if (cacheItem) {
        const cacheItemJson: any = JSON.parse(cacheItem);
        return getDataFromCache(cacheItemJson, { cacheId: cacheId, ...args });
    }
    else {
        requestWeatherData({ cacheId: cacheId, ...args });
    }

    return "Requesting...";
}

function getDataFromCache(cacheItemJson: any, args: { functionOptionalArgs: any | null, invocation: CustomFunctions.Invocation, cacheId: string }): string | number | Date {
    if (!cacheItemJson) {
        //ToDo
    }

    if (cacheItemJson.status === "Requesting") {
        if (!requests) {
            requests = {};
            requests[args.cacheId] = new Queue<CustomFunctions.Invocation>();
        }
        else if (!requests[args.cacheId]) {
            requests[args.cacheId] = new Queue<CustomFunctions.Invocation>();
        }

        requests[args.cacheId].enqueue(args.invocation);

        return "Requesting...";
    }
    
    if (cacheItemJson.status === "Complete") {
        const weatherArgs: WeatherArgs | null = extractWeatherArgs(args.functionOptionalArgs);

        const newCols = getDataCols(cacheItemJson, weatherArgs.PrintDirection);
        const newRows = getDataRows(cacheItemJson, weatherArgs.PrintDirection);

        if (args.invocation && weatherArgs && 
            (!weatherArgs.Columns || !weatherArgs.Rows || weatherArgs.Columns !== newCols || weatherArgs.Rows !== newRows)) {
            updateFormula(cacheItemJson, weatherArgs ?? new WeatherArgs(), args.invocation);
            return "Updating...";
        }

        if (args.invocation && args.invocation.address) {
            let printDirection: PrintDirections;
 
            if (weatherArgs) {
                printDirection = weatherArgs.PrintDirection;
            }
            else {
                printDirection = PrintDirections.Vertical;
            }

            printArrayData(cacheItemJson, printDirection, args.invocation);
        }
        
        return cacheItemJson.tempmax;
    }

    throw new Error();
}

async function requestWeatherData(args: { functionOptionalArgs: any | null, unit: string | null, location: string, date: string, invocation: CustomFunctions.Invocation, cacheId: string }): Promise<void> {
    const apiKey: string | null = await getApiKeyFromSettingsAsync();
    requestTimelineData(apiKey, args)
}

function requestTimelineData(apiKey: string | null, args: { functionOptionalArgs: any | null, unit: string | null, location: string, date: string, invocation: CustomFunctions.Invocation, cacheId: string }): void {
    if (apiKey) {
        if (!requests) {
            requests = {};
            requests[args.cacheId] = new Queue<CustomFunctions.Invocation>();
        }
        else if (!requests[args.cacheId]) {
            requests[args.cacheId] = new Queue<CustomFunctions.Invocation>();
        }

        requests[args.cacheId].enqueue(args.invocation);

        const TIMELINE_API_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${args.location}/${args.date}?key=${apiKey}&unitGroup=${args.unit}`
        
        fetch(TIMELINE_API_URL)
            .then(async (response: Response) => {
                onTimelineApiSuccessResponse(response, args);
            })
            .catch(() => {
                //ToDo
            });
    }
    else {
        // return "#Invalid API Key!";
    }
}

function onTimelineApiSuccessResponse(response: Response, args: { functionOptionalArgs: any | null, invocation: CustomFunctions.Invocation, cacheId: string }) {
    const NA_DATA: string = "#N/A Data";
  
    if (!response) {
    //   return NA_DATA;
    }

    response.json()
        .then((jsonResponse: any) => {
            onTimelineApiSuccessJsonResponse(jsonResponse, args);
        })
        .catch(() => {
            //ToDo
        });
}

function onTimelineApiSuccessJsonResponse(jsonResponse: any, args: { functionOptionalArgs: any | null, invocation: CustomFunctions.Invocation, cacheId: string }) {
    if (jsonResponse && jsonResponse.days && jsonResponse.days.length > 0 && jsonResponse.days[0]) {

        setCacheItem(args.cacheId, JSON.stringify({ 
          "status": "Complete",
          "tempmax": jsonResponse.days[0].tempmax,
          "tempmin": jsonResponse.days[0].tempmin,
          "precip": jsonResponse.days[0].precip,
          "precipprob": jsonResponse.days[0].precipprob,
          "windspeed": jsonResponse.days[0].windspeed
        }));

        if (requests === null) {
            return;
        }

        const printQueue = requests[args.cacheId];
  
        while (printQueue !== null && printQueue.length > 0) {
            const printItem = printQueue.front;

            if (printItem && printItem.address) {
                const cacheItem = getCacheItem(args.cacheId);
        
                if (!cacheItem) {
                  //ToDo
                }
        
                const cacheItemString = cacheItem as string;
                const cacheItemJson = JSON.parse(cacheItemString);
                const weatherArgs: WeatherArgs | null = extractWeatherArgs(args.functionOptionalArgs);
        
                updateFormula(cacheItemJson, weatherArgs ?? new WeatherArgs(), printItem);
            }
            else
            {
            // return "#Error!";
            }

            printQueue.dequeue();
        }

        requests = null;
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

                        if (originalFormula) {
                            if (weatherArgs.Args) {
                                const formulaArgsSection: string | null = extractFormulaArgsSection(originalFormula);

                                if (!formulaArgsSection) {
                                    //ToDo
                                    return;
                                }

                                let updatedArgs = replaceOrInsertArgs(formulaArgsSection, "cols", `cols=${getDataCols(cacheItemJson, weatherArgs.PrintDirection)};`);
                                updatedArgs = replaceOrInsertArgs(updatedArgs, "rows", `rows=${getDataRows(cacheItemJson, weatherArgs.PrintDirection)};`);

                                const updatedFormula = originalFormula.replace(formulaArgsSection, updatedArgs);
                                caller.values= [[updatedFormula]];
                            }
                            else {
                                const originalFormulaTrimmed = originalFormula.trim();
                                caller.values= [[`${originalFormulaTrimmed.substring(0, originalFormulaTrimmed.length - 1)}, "cols=${getDataCols(cacheItemJson, weatherArgs.PrintDirection)};rows=${getDataRows(cacheItemJson, weatherArgs.PrintDirection)};")`]];
                            }
                            
                            await context.sync();
                        }
                        else {
                            //ToDo
                        }
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

function clearArrayData(args: { functionOptionalArgs: any | null, invocation: CustomFunctions.Invocation }) {
    const weatherArgs: WeatherArgs | null = extractWeatherArgs(args.functionOptionalArgs);

    if (weatherArgs && weatherArgs.Columns && weatherArgs.Rows) {
        Excel.run(async (context: Excel.RequestContext) => {
            try {
                if (args.invocation && args.invocation.address && weatherArgs && weatherArgs.Columns && weatherArgs.Rows) {
                    const sheetName = args.invocation.address.split("!")[0];

                    if (!sheetName) {
                    
                    }

                    const sheet = context.workbook.worksheets.getItem(sheetName);
                    
                    if (!sheet) {
                    
                    }

                    const caller = sheet.getRange(args.invocation.address);

                    if (!caller) {
                    
                    }

                    caller.load();
                    await context.sync();

                    if (weatherArgs.Rows > 1) {
                        sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, weatherArgs.Rows - 1, weatherArgs.Columns).clear(Excel.ClearApplyTo.contents);
                    }

                    if (weatherArgs.Columns > 1) {
                        sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex + 1, weatherArgs.Rows, weatherArgs.Columns - 1).clear(Excel.ClearApplyTo.contents);
                    }

                    await context.sync();
                }
                else {
                    //ToDo
                }
            }
            catch {
                //Nothing too important. It just means that there was an error when trying to clear cell data.
            }
        });
    }
}