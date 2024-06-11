import { PrintDirections, WeatherArgs } from "../helpers/helpers.args";
import { getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import { extractFormulaArgsSection, getDataCols, getDataRows, replaceOrInsertArgs } from "../helpers/helpers.formulas";
import semaphore from "semaphore";
import { getCell, getSheet } from "../helpers/helpers.excel";
import { DistinctQueue } from "../types/distinct-queue";

var subscribersGroupedByCacheId: Map<string, DistinctQueue<WeatherArgs>> | null;

const sem: semaphore.Semaphore = semaphore(1);
const REQUESTING: string = "Requesting...";

function addToPrintCache(weatherArgs: WeatherArgs) {
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

    if (!subscribersGroupedByCacheId) {
        subscribersGroupedByCacheId = new Map<string, DistinctQueue<WeatherArgs>>();
    }
    
    if (!subscribersGroupedByCacheId.has(weatherArgs.CacheId)) {
        subscribersGroupedByCacheId.set(weatherArgs.CacheId, new DistinctQueue<WeatherArgs>());
    }

    const setForCacheId: DistinctQueue<WeatherArgs> = subscribersGroupedByCacheId.get(weatherArgs.CacheId)!;

    // if (!setForCacheId.has(weatherArgs)) {
    //     setForCacheId.add(weatherArgs);
    // }

    setForCacheId.enqueue(weatherArgs);
}

// function ToQueue(set: Set<WeatherArgs>): Queue<WeatherArgs> | null {
//     if (set && set.size > 0) {
//         const queue = new Queue<WeatherArgs>();

//         set.forEach((x) => queue.enqueue(x));
        
//         return queue;
//     }

//     return null;
// }

function getUpdatedFormula(weatherArgs: WeatherArgs, newCols: number, newRows: number) {
    if (weatherArgs.Args) {
        const formulaArgsSection: string | null = extractFormulaArgsSection(weatherArgs.OriginalFormula);

        if (!formulaArgsSection) {
            //ToDo
            return;
        }

        let updatedArgs = replaceOrInsertArgs(formulaArgsSection, "cols", `cols=${newCols};`);
        updatedArgs = replaceOrInsertArgs(updatedArgs, "rows", `rows=${newRows};`);

        const updatedFormula = weatherArgs.OriginalFormula.replace(formulaArgsSection, updatedArgs);
        return updatedFormula;
    }
    else {
        const originalFormulaTrimmed = weatherArgs.OriginalFormula.trim();
        return `${originalFormulaTrimmed.substring(0, originalFormulaTrimmed.length - 1)}, "cols=${newCols};rows=${newRows};")`;
    }
}

function generateArrayData(weatherArgs: WeatherArgs, values: any[], skipCallerCell: boolean = false): any[] | null {
    if (!values || values.length === 0 || (skipCallerCell && values.length < 2)) {
        return null;
    }

    const arrayData: any[] = [];

    if (skipCallerCell) {
        for (let i: number = 1; i < values.length; i++) {
            arrayData.push(values[i].value)
        }
    }
    else {
        values.forEach((item) => arrayData.push(item.value));

        const dataArrayCols = getDataCols(values, weatherArgs.PrintDirection);
        const dataArrayRows = getDataRows(values, weatherArgs.PrintDirection);

        arrayData[0] = getUpdatedFormula(weatherArgs, dataArrayCols, dataArrayRows);
    }

    return arrayData
}

async function processApiResponseSubscribersQueue(weatherArgs: WeatherArgs) {
    if (!subscribersGroupedByCacheId) {
        return;
    }

    const subscribersForCacheId = subscribersGroupedByCacheId.get(weatherArgs.CacheId);

    if (!subscribersForCacheId || subscribersForCacheId.getLength() === 0) {
        subscribersGroupedByCacheId.delete(weatherArgs.CacheId);

        if (subscribersGroupedByCacheId.size === 0) {
            subscribersGroupedByCacheId = null;
        }

        return;
    }

    await Excel.run(async (context) => {
        try {
            while (subscribersForCacheId && subscribersForCacheId.getLength() > 0) {
                const subscriberWeatherArgs = subscribersForCacheId.getFront();

                if (subscriberWeatherArgs && subscriberWeatherArgs.Invocation && subscriberWeatherArgs.Invocation.address) {
                    const caller = getCell(subscriberWeatherArgs.Invocation.address, context);

                    caller.load();
                    await context.sync();

                    if (subscriberWeatherArgs.OriginalFormula === caller.formulas[0][0]) {
                        const cacheItem = getCacheItem(subscriberWeatherArgs.CacheId);
                
                        if (cacheItem) {
                            const cacheItemString = cacheItem as string;

                            if (cacheItemString) {
                                const cacheItemObject = JSON.parse(cacheItemString);

                                if (cacheItemObject && cacheItemObject.values) {
                                    const dataArrayCols = getDataCols(cacheItemObject.values, subscriberWeatherArgs.PrintDirection);
                                    const dataArrayRows = getDataRows(cacheItemObject.values, subscriberWeatherArgs.PrintDirection);

                                    caller.values = getUpdatedFormula(subscriberWeatherArgs, dataArrayCols, dataArrayRows);
                                }
                            }
                        }
                    }
                }
                
                subscribersForCacheId.dequeue();
            }

            subscribersGroupedByCacheId = null;
        }
        catch {
            //ToDo: Retry
        }
    });
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

    await Excel.run(async (context: Excel.RequestContext) => {
        try {
            if (weatherArgs && weatherArgs.Invocation && weatherArgs.Invocation.address) {
                const cell = getCell(weatherArgs.Invocation.address, context);
                
                cell.load();
                await context.sync();

                weatherArgs.OriginalFormula = cell.formulas[0][0];
            }
        }
        catch (error: any) {
            throw new Error(error);
        }
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
        addToPrintCache(weatherArgs);

        return REQUESTING;
    }
    
    if (cacheItemObject.status === "Complete") {
        if (weatherArgs.Invocation && weatherArgs.Invocation.address) {
            let printDirection: PrintDirections;
 
            if (weatherArgs) {
                printDirection = weatherArgs.PrintDirection;
            }
            else {
                printDirection = PrintDirections.Vertical;
            }

            let arrayData = generateArrayData(weatherArgs, cacheItemObject.values, true);

            if (arrayData) {
                printArrayData(arrayData, printDirection, weatherArgs.Invocation, 1);
            }
        }
        
        return cacheItemObject.values[0].value;
    }

    throw new Error();
}

async function fetchTimelineData(apiKey: string | null | undefined, weatherArgs: WeatherArgs): Promise<string> {
    if (apiKey) {
        addToPrintCache(weatherArgs);

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

async function onTimelineApiSuccessJsonResponse(jsonResponse: any, weatherArgs: WeatherArgs) {
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

        processApiResponseSubscribersQueue(weatherArgs);
      }
      else {
        // return NA_DATA;
      }
}

async function printArrayData(values: any[] | null , printDirection: PrintDirections, invocation: CustomFunctions.Invocation, rowOffset: number = 0): Promise<void> {
    if (values && values.length > 0 && invocation && invocation.address) {
        await Excel.run(async (context) => {
            if (values && values.length > 0 && invocation && invocation.address) {
                const caller = getCell(invocation.address, context);

                caller.load();
                await context.sync();

                const sheet = getSheet(invocation.address, context);
                let array: any[] = [];

                if (printDirection === PrintDirections.Horizontal) {
                    values.forEach((value) => {
                        array.push(value);
                    });

                    sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex + 1, 1, array.length - 1).values = [array];
                }
                else {
                    values.forEach((value) => {
                        array.push([value]);
                    });

                    sheet.getRangeByIndexes(caller.rowIndex + rowOffset, caller.columnIndex, array.length, 1).values = array;
                    // sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, 4, 1).values = [[values[1]], [values[2]], [values[3]], [values[4]]];
                }

                await context.sync();
            }
        });
    }
}

export async function clearArrayData(cols: number, rows: number, invocation: CustomFunctions.Invocation): Promise<void> {
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