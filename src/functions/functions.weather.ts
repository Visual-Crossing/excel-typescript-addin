import { PrintDirections, WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import { extractFormulaArgsSection, getDataCols, getDataRows, replaceOrInsertArgs } from "../helpers/helpers.formulas";
import semaphore from "semaphore";
import { Queue } from 'queue-typescript';
import { getCell, getSheet } from "../helpers/helpers.excel";

var requestSubscribersByCacheId: Map<string, Set<WeatherArgs>> | null;

const sem: semaphore.Semaphore = semaphore(1);
const REQUESTING: string = "Requesting...";

function addToPrintSet(weatherArgs: WeatherArgs) {
    if (!weatherArgs) {
        throw new Error("Invalid args.");
    }

    if (!weatherArgs.CacheId) {
        throw new Error("Invalid cache id.");
    }

    if (!weatherArgs.Invocation ||
        !weatherArgs.Invocation.address) {
            throw new Error("Invalid invocation.");
    }

    if (!requestSubscribersByCacheId) {
        requestSubscribersByCacheId = new Map<string, Set<WeatherArgs>>();
    }
    
    if (!requestSubscribersByCacheId.has(weatherArgs.CacheId)) {
        requestSubscribersByCacheId.set(weatherArgs.CacheId, new Set<WeatherArgs>());
    }

    const setForCacheId: Set<WeatherArgs> = requestSubscribersByCacheId.get(weatherArgs.CacheId)!;

    if (!setForCacheId.has(weatherArgs)) {
        setForCacheId.add(weatherArgs);
    }
}

function ToQueue(set: Set<WeatherArgs>): Queue<WeatherArgs> | null {
    if (set && set.size > 0) {
        const queue = new Queue<WeatherArgs>();

        set.forEach((x) => queue.enqueue(x));

        return queue;
    }

    return null;
}

export async function getOrRequestData(weatherArgs: WeatherArgs): Promise<string | number | Date> {
    let cacheItemJsonString: string | null | undefined = null;

    /**
     * Use of semaphore ensures that only 1 request to the server is made for each unique cacheId (i.e. each unique combination of location, date & unit).
     * Subsequent requests for the same data are retrieved from the cache i.e. a second request is NOT made to the server.
     */
    sem.take(function() {
        cacheItemJsonString = getCacheItem(weatherArgs.CacheId);
    
        if (!cacheItemJsonString) {
            setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
                "status": "Requesting",
            }));
        }

        sem.leave();
    });

    if (cacheItemJsonString) {
        return getDataFromCache(weatherArgs, cacheItemJsonString);
    }
    else {
        const apiKey: string | null | undefined = await getApiKeyFromSettingsAsync();
        return await fetchTimelineData(apiKey, weatherArgs);
    }
}

function getDataFromCache(weatherArgs: WeatherArgs, cacheItemJsonString: string): string | number | Date {
    const cacheItemObject = JSON.parse(cacheItemJsonString);

    if (!cacheItemObject) {
        throw new Error("Unable to deserialize cache.");
    }

    if (cacheItemObject.status === "Requesting") {
        addToPrintSet(weatherArgs);
        return REQUESTING;
    }
    
    if (cacheItemObject.status === "Complete") {
        const dataArrayCols = getDataCols(cacheItemObject, weatherArgs.PrintDirection);
        const dataArrayRows = getDataRows(cacheItemObject, weatherArgs.PrintDirection);

        if (weatherArgs && weatherArgs.isFormulaUpdateRequired(dataArrayCols, dataArrayRows)) {
            updateFormula(weatherArgs, dataArrayCols, dataArrayRows, );
            return "Updating...";
        }

        if (weatherArgs.Invocation && weatherArgs.Invocation.address) {
            let printDirection: PrintDirections;
 
            if (weatherArgs) {
                printDirection = weatherArgs.PrintDirection;
            }
            else {
                printDirection = PrintDirections.Vertical;
            }

            printArrayData(cacheItemObject, printDirection, weatherArgs.Invocation);
        }
        
        return cacheItemObject.values[0].value;
    }

    throw new Error();
}

async function fetchTimelineData(apiKey: string | null | undefined, weatherArgs: WeatherArgs): Promise<string> {
    if (apiKey) {
        addToPrintSet(weatherArgs);

        const TIMELINE_API_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${weatherArgs.Location}/${weatherArgs.Date}?key=${apiKey}&unitGroup=${weatherArgs.Unit}`
        
        await fetch(TIMELINE_API_URL)
            .then(async (response: Response) => {
                await onTimelineApiSuccessResponse(response, weatherArgs);
            })
            .catch(() => {
                //ToDo
            });
        
        return REQUESTING;
    }
    else {
        return "#Invalid API Key!";
    }
}

async function onTimelineApiSuccessResponse(response: Response, weatherArgs: WeatherArgs) {
    const NA_DATA: string = "#N/A Data";
  
    if (!response) {
    //   return NA_DATA;
    }

    await response.json()
        .then((jsonResponse: any) => {
            onTimelineApiSuccessJsonResponse(jsonResponse, weatherArgs);
        })
        .catch(() => {
            //ToDo
        });
}

function onTimelineApiSuccessJsonResponse(jsonResponse: any, weatherArgs: WeatherArgs) {
    if (jsonResponse && jsonResponse.days && jsonResponse.days.length > 0 && jsonResponse.days[0]) {

        setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
          "status": "Complete",
          "values":
            [
                {"name": "tempmax", "value": jsonResponse.days[0].tempmax},
                {"name": "tempmin", "value": jsonResponse.days[0].tempmin},
                {"name": "precip", "value": jsonResponse.days[0].precip},
                {"name": "precipprob", "value": jsonResponse.days[0].precipprob},
                {"name": "windspeed", "value": jsonResponse.days[0].windspeed}
            ]
        }));

        if (!requestSubscribersByCacheId) {
            return;
        }

        const printSet = requestSubscribersByCacheId.get(weatherArgs.CacheId);

        if (!printSet || printSet.size === 0) {
            requestSubscribersByCacheId.delete(weatherArgs.CacheId);

            if (requestSubscribersByCacheId.size === 0) {
                requestSubscribersByCacheId = null;
            }

            return;
        }

        const printQueue = ToQueue(printSet);
  
        while (printQueue && printQueue.length > 0) {
            const weatherArgs = printQueue.front;

            if (weatherArgs && weatherArgs.Invocation && weatherArgs.Invocation.address) {
                const cacheItem = getCacheItem(weatherArgs.CacheId);
        
                if (!cacheItem) {
                  //ToDo
                }
        
                const cacheItemString = cacheItem as string;
                const cacheItemObject = JSON.parse(cacheItemString);
                const dataArrayCols = getDataCols(cacheItemObject, weatherArgs.PrintDirection);
                const dataArrayRows = getDataRows(cacheItemObject, weatherArgs.PrintDirection);

                updateFormula(weatherArgs, dataArrayCols, dataArrayRows);
            }
            else
            {
            // return "#Error!";
            }

            printQueue.dequeue();
            printSet.delete(weatherArgs);
        }

        requestSubscribersByCacheId = null;
      }
      else {
        // return NA_DATA;
      }
}

export async function updateFormula(weatherArgs: WeatherArgs, cols: number, rows: number): Promise<void> {
    if (weatherArgs && weatherArgs.Invocation && weatherArgs.Invocation.address && weatherArgs.isFormulaUpdateRequired(cols, rows)) {
        const timer = setInterval(async () => {
        try {
            clearInterval(timer);
        }
        catch {
            //ToDo
        }

        try {
            if (weatherArgs && weatherArgs.Invocation && weatherArgs.Invocation.address && weatherArgs.isFormulaUpdateRequired(cols, rows)) {
                await Excel.run(async (context: Excel.RequestContext) => {
                    try {
                    if (weatherArgs && weatherArgs.Invocation && weatherArgs.Invocation.address && weatherArgs.isFormulaUpdateRequired(cols, rows)) {
                        const caller = getCell(weatherArgs.Invocation.address, context);

                        caller.load();
                        await context.sync();
    
                        const sheet = getSheet(weatherArgs.Invocation.address, context);

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

                                let updatedArgs = replaceOrInsertArgs(formulaArgsSection, "cols", `cols=${cols};`);
                                updatedArgs = replaceOrInsertArgs(updatedArgs, "rows", `rows=${rows};`);

                                const updatedFormula = originalFormula.replace(formulaArgsSection, updatedArgs);
                                caller.values= [[updatedFormula]];
                            }
                            else {
                                const originalFormulaTrimmed = originalFormula.trim();
                                caller.values= [[`${originalFormulaTrimmed.substring(0, originalFormulaTrimmed.length - 1)}, "cols=${cols};rows=${rows};")`]];
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
                const caller = getCell(invocation.address, context);

                caller.load();
                await context.sync();

                const sheet = getSheet(invocation.address, context);
                
                caller.load();
                await context.sync();

                if (printDirection === PrintDirections.Horizontal) {
                    sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex + 1, 1, 4).values = [[cacheItemJson.values[1].value, cacheItemJson.values[2].value, cacheItemJson.values[3].value, cacheItemJson.values[4].value]];
                }
                else {
                    sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, 4, 1).values = [[cacheItemJson.values[1].value], [cacheItemJson.values[2].value], [cacheItemJson.values[3].value], [cacheItemJson.values[4].value]];
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

export async function clearArrayData(invocation: CustomFunctions.Invocation, cols: number, rows: number): Promise<void> {
    if (invocation && invocation.address && (cols > 1 || rows > 1)) {
        await Excel.run(async (context: Excel.RequestContext) => {
            try {
                if (invocation && invocation.address && (cols > 1 || rows > 1)) {
                    const caller = getCell(invocation.address, context);

                    caller.load();
                    await context.sync();

                    const sheet = getSheet(invocation.address, context);

                    if (rows > 1) {
                        sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, rows - 1, cols).clear(Excel.ClearApplyTo.contents);
                    }

                    if (cols > 1) {
                        sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex + 1, rows, cols - 1).clear(Excel.ClearApplyTo.contents);
                    }

                    await context.sync();
                }
            }
            catch {
                //Nothing too important - it can be ignored (unless if it happens all the time). It just means that there was an error when trying to clear data.
            }
        });
    }
}