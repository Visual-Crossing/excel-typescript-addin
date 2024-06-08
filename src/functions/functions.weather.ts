import { PrintDirections, WeatherArgs, extractWeatherArgs } from "../helpers/helpers.args";
import { generateCacheId, getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import { extractFormulaArgsSection, getDataCols, getDataRows, replaceOrInsertArgs } from "../helpers/helpers.formulas";
import semaphore from "semaphore";
import { Queue } from 'queue-typescript';
import { getCell, getSheet } from "../helpers/helpers.excel";

var invocationsSetsByCacheId: Map<string, Set<CustomFunctions.Invocation>> | null;

const sem: semaphore.Semaphore = semaphore(1);

function addToPrintSet(cacheId: string, invocation: CustomFunctions.Invocation) {
    if (!cacheId) {
        throw new Error("Invalid cache id.");
    }

    if (!invocation ||
        !invocation.address) {
            throw new Error("Invalid invocation.");
    }

    if (!invocationsSetsByCacheId) {
        invocationsSetsByCacheId = new Map<string, Set<CustomFunctions.Invocation>>();
    }
    
    if (!invocationsSetsByCacheId.has(cacheId)) {
        invocationsSetsByCacheId.set(cacheId, new Set<CustomFunctions.Invocation>());
    }

    const setForCacheId: Set<CustomFunctions.Invocation> = invocationsSetsByCacheId.get(cacheId)!;

    if (!setForCacheId.has(invocation)) {
        setForCacheId.add(invocation);
    }
}

function ToQueue(set: Set<CustomFunctions.Invocation>): Queue<CustomFunctions.Invocation> | null {
    if (set && set.size > 0) {
        const queue = new Queue<CustomFunctions.Invocation>();

        set.forEach((x) => queue.enqueue(x));

        return queue;
    }

    return null;
}

export function getOrRequestData(weatherArgs: WeatherArgs): string | number | Date {
    let cacheItem: string | null = null;

    /**
     * Use of semaphore ensures that only 1 request to the server is made for each unique cacheId (i.e. each unique combination of location, date & unit).
     * Subsequent requests for the same data are retrieved from the cache i.e. a second request is NOT made to the server.
     */
    sem.take(function() {
        cacheItem = getCacheItem(weatherArgs.CacheId);
    
        if (!cacheItem) {
            setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
                "status": "Requesting",
            }));
        }

        sem.leave();
    });

    clearArrayData(weatherArgs.Invocation, weatherArgs.Columns, weatherArgs.Rows);

    if (cacheItem) {
        const cacheItemJson: any = JSON.parse(cacheItem);
        return getDataFromCache(weatherArgs, cacheItemJson);
    }
    else {
        requestWeatherData(weatherArgs);
    }

    return "Requesting...";
}

function getDataFromCache(weatherArgs: WeatherArgs, cacheItemJson: any): string | number | Date {
    if (!cacheItemJson) {
        //ToDo
    }

    if (cacheItemJson.status === "Requesting") {
        addToPrintSet(weatherArgs.CacheId, weatherArgs.Invocation);
        return "Requesting...";
    }
    
    if (cacheItemJson.status === "Complete") {
        const newCols = getDataCols(cacheItemJson, weatherArgs.PrintDirection);
        const newRows = getDataRows(cacheItemJson, weatherArgs.PrintDirection);

        if (weatherArgs && weatherArgs.isFormulaUpdateRequired(newCols, newRows)) {
            updateFormula(cacheItemJson, weatherArgs, weatherArgs.Invocation);
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

            printArrayData(cacheItemJson, printDirection, weatherArgs.Invocation);
        }
        
        return cacheItemJson.values[0].value;
    }

    throw new Error();
}

async function requestWeatherData(weatherArgs: WeatherArgs): Promise<void> {
    const apiKey: string | null | undefined = await getApiKeyFromSettingsAsync();
    requestTimelineData(apiKey, weatherArgs)
}

function requestTimelineData(apiKey: string | null | undefined, weatherArgs: WeatherArgs): void {
    if (apiKey) {
        addToPrintSet(weatherArgs.CacheId, weatherArgs.Invocation);

        const TIMELINE_API_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${weatherArgs.Location}/${weatherArgs.Date}?key=${apiKey}&unitGroup=${weatherArgs.Unit}`
        
        fetch(TIMELINE_API_URL)
            .then(async (response: Response) => {
                onTimelineApiSuccessResponse(response, weatherArgs);
            })
            .catch(() => {
                //ToDo
            });
    }
    else {
        // return "#Invalid API Key!";
    }
}

function onTimelineApiSuccessResponse(response: Response, weatherArgs: WeatherArgs) {
    const NA_DATA: string = "#N/A Data";
  
    if (!response) {
    //   return NA_DATA;
    }

    response.json()
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

        if (!invocationsSetsByCacheId) {
            return;
        }

        const printSet = invocationsSetsByCacheId.get(weatherArgs.CacheId);

        if (!printSet || printSet.size === 0) {
            invocationsSetsByCacheId.delete(weatherArgs.CacheId);

            if (invocationsSetsByCacheId.size === 0) {
                invocationsSetsByCacheId = null;
            }

            return;
        }

        const printQueue = ToQueue(printSet);
  
        while (printQueue && printQueue.length > 0) {
            const printItem = printQueue.front;

            if (printItem && printItem.address) {
                const cacheItem = getCacheItem(weatherArgs.CacheId);
        
                if (!cacheItem) {
                  //ToDo
                }
        
                const cacheItemString = cacheItem as string;
                const cacheItemJson = JSON.parse(cacheItemString);
        
                updateFormula(cacheItemJson, weatherArgs, printItem);
            }
            else
            {
            // return "#Error!";
            }

            printQueue.dequeue();
            printSet.delete(printItem);
        }

        invocationsSetsByCacheId = null;
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
                        const caller = getCell(invocation.address, context);

                        caller.load();
                        await context.sync();
    
                        const sheet = getSheet(invocation.address, context);

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

function clearArrayData(invocation: CustomFunctions.Invocation, cols: number, rows: number): void {
    if (invocation && invocation.address && (cols > 1 || rows > 1)) {
        Excel.run(async (context: Excel.RequestContext) => {
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