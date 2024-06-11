import { PrintDirections, WeatherArgs } from "../helpers/helpers.args";
import { getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import semaphore from "semaphore";
import { getCell, getSheet } from "../helpers/helpers.excel";
import { DistinctQueue } from "../types/distinct-queue";
import { getArrayDataCols, getArrayDataRows } from "../helpers/helpers.formulas";
import { generateArrayData } from "../helpers/helpers.array-data";
import { printArrayDataWithFormula, printArrayDataWithoutFormula } from "../helpers/helpers.printer";

var subscribersGroupedByCacheId: Map<string, DistinctQueue<WeatherArgs>> | null;

const sem: semaphore.Semaphore = semaphore(1);
const REQUESTING: string = "Requesting...";

function subscribe(weatherArgs: WeatherArgs): void {
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

    const subscribersForCacheId: DistinctQueue<WeatherArgs> = subscribersGroupedByCacheId.get(weatherArgs.CacheId)!;

    // if (!setForCacheId.has(weatherArgs)) {
    //     setForCacheId.add(weatherArgs);
    // }

    subscribersForCacheId.enqueue(weatherArgs);
}

async function processSubscribersQueue(weatherArgs: WeatherArgs) {
    if (!weatherArgs) {
        throw new Error();
    }
    
    if (!subscribersGroupedByCacheId || !subscribersGroupedByCacheId.has(weatherArgs.CacheId)) {
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
                                    const arrayData: any[] | null = generateArrayData(subscriberWeatherArgs, cacheItemObject.values);
                                    printArrayDataWithFormula(arrayData, subscriberWeatherArgs.Invocation, subscriberWeatherArgs.PrintDirection);
                                }
                            }
                        }
                    }
                }
                
                subscribersForCacheId.dequeue();
            }

            if (subscribersGroupedByCacheId && subscribersGroupedByCacheId.has(weatherArgs.CacheId)) {
                subscribersGroupedByCacheId.delete(weatherArgs.CacheId);

                if (subscribersGroupedByCacheId.size === 0) {
                    subscribersGroupedByCacheId = null;
                }
            }
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
        return await getDataFromCache(weatherArgs, cacheItemJsonString);
    }
    else {
        const apiKey: string | null | undefined = await getApiKeyFromSettingsAsync();
        return await fetchTimelineData(apiKey, weatherArgs);
    }
}

async function getDataFromCache(weatherArgs: WeatherArgs, cacheItemJsonString: string): Promise<string | number | Date> {
    const cacheItemObject = JSON.parse(cacheItemJsonString);

    if (!cacheItemObject) {
        throw new Error("Unable to deserialize cache.");
    }

    if (cacheItemObject.status === "Requesting") {
        subscribe(weatherArgs);
        return REQUESTING;
    }
    
    if (cacheItemObject.status === "Complete") {
        const arrayDataCols = getArrayDataCols(cacheItemObject.values, weatherArgs.PrintDirection);
        const arrayDataRows = getArrayDataRows(cacheItemObject.values, weatherArgs.PrintDirection);

        if (weatherArgs && weatherArgs.isFormulaUpdateRequired(arrayDataCols, arrayDataRows)) {
            await clearArrayData(weatherArgs.Columns, weatherArgs.Rows, weatherArgs.Invocation);
            subscribe(weatherArgs);
            await processSubscribersQueue(weatherArgs);

            return "Updating...";
        }
        const arrayData: any[] | null = generateArrayData(weatherArgs, cacheItemObject.values);
        printArrayDataWithoutFormula(arrayData, weatherArgs.Invocation, weatherArgs.PrintDirection);

        return cacheItemObject.values[0].value;
    }

    throw new Error();
}

async function fetchTimelineData(apiKey: string | null | undefined, weatherArgs: WeatherArgs): Promise<string> {
    if (apiKey) {
        subscribe(weatherArgs);

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

        processSubscribersQueue(weatherArgs);
    }
    else {
    // return NA_DATA;
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