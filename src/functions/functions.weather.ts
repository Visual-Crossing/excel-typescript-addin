import { WeatherArgs } from "../helpers/helpers.args";
import { getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import semaphore from "semaphore";
import { getCell } from "../helpers/helpers.excel";
import { DistinctQueue } from "../types/distinct-queue";
import { getArrayDataCols, getArrayDataRows, getUpdatedFormula } from "../helpers/helpers.formulas";
import { clearArrayData, generateArrayData } from "../helpers/helpers.array-data";
import {  printArrayData } from "../helpers/helpers.printer";

var subscribersGroupedByCacheId: Map<string, DistinctQueue<string, WeatherArgs>> | null;

const sem: semaphore.Semaphore = semaphore(1);
const REQUESTING: string = "Requesting...";
const NA_DATA: string = "#N/A Data";

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
        subscribersGroupedByCacheId = new Map<string, DistinctQueue<string, WeatherArgs>>();
        subscribersGroupedByCacheId.set(weatherArgs.CacheId, new DistinctQueue<string, WeatherArgs>());
    }
    else if (!subscribersGroupedByCacheId.has(weatherArgs.CacheId)) {
        subscribersGroupedByCacheId.set(weatherArgs.CacheId, new DistinctQueue<string, WeatherArgs>());
    }

    const subscribersForCacheId: DistinctQueue<string, WeatherArgs> = subscribersGroupedByCacheId.get(weatherArgs.CacheId)!;

    if (!subscribersForCacheId) {
        throw new Error("Invalid internal state.");
    }

    subscribersForCacheId.enqueue(weatherArgs.Invocation.address, weatherArgs);
}

async function processSubscribersQueue(weatherArgs: WeatherArgs): Promise<void> {
    if (!weatherArgs || !weatherArgs.CacheId) {
        throw new Error("Invalid args.");
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

    try {
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

                                    if (cacheItemObject && cacheItemObject.status && cacheItemObject.status === "Complete" && cacheItemObject.values && cacheItemObject.values.length > 0) {
                                        const arrayDataCols = getArrayDataCols(cacheItemObject.values, weatherArgs.PrintDirection);
                                        const arrayDataRows = getArrayDataRows(cacheItemObject.values, weatherArgs.PrintDirection);

                                        caller.values = getUpdatedFormula(weatherArgs, arrayDataCols, arrayDataRows) as any;
                                        await context.sync();
                                    }
                                }
                            }
                        }
                    }
                    
                    if (subscriberWeatherArgs && subscriberWeatherArgs.Invocation && subscriberWeatherArgs.Invocation.address) {
                        subscribersForCacheId.dequeue(subscriberWeatherArgs.Invocation.address);
                    }
                }

                if (subscribersGroupedByCacheId && subscribersGroupedByCacheId.has(weatherArgs.CacheId)) {
                    subscribersGroupedByCacheId.delete(weatherArgs.CacheId);

                    if (subscribersGroupedByCacheId.size === 0) {
                        subscribersGroupedByCacheId = null;
                    }
                }
            }
            catch {
                // Retry
                const timeout: NodeJS.Timeout = setTimeout(() => {
                    try {
                        clearTimeout(timeout);
                        processSubscribersQueue(weatherArgs);
                    }
                    catch {

                    }
                }, 250);
            }
        });
    }
    catch {
        // Retry
        const timeout: NodeJS.Timeout = setTimeout(() => {
            try {
                clearTimeout(timeout);
                processSubscribersQueue(weatherArgs);
            }
            catch {

            }
        }, 250);
    }
}

async function saveCallerFormula(weatherArgs: WeatherArgs): Promise<void> {
    try {
        await Excel.run(async (context: Excel.RequestContext) => {
            try {
                if (weatherArgs && weatherArgs.Invocation && weatherArgs.Invocation.address) {
                    const cell = getCell(weatherArgs.Invocation.address, context);
                    
                    cell.load();
                    await context.sync();
    
                    weatherArgs.OriginalFormula = cell.formulas[0][0];
                    await clearArrayData(weatherArgs.Columns, weatherArgs.Rows, weatherArgs.OriginalFormula, weatherArgs.Invocation);
                }
            }
            catch {
                // Retry
                const timeout: NodeJS.Timeout = setTimeout(() => {
                    try {
                        clearTimeout(timeout);
                        saveCallerFormula(weatherArgs);
                    }
                    catch {
                        
                    }
                }, 250);
            }
        });
    }
    catch {
        // Retry
        const timeout: NodeJS.Timeout = setTimeout(() => {
            try {
                clearTimeout(timeout);
                saveCallerFormula(weatherArgs);
            }
            catch {
                
            }
        }, 250);
    }
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

    await saveCallerFormula(weatherArgs);

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
        const arrayData: any[] | null = generateArrayData(weatherArgs, cacheItemObject.values);
        printArrayData(arrayData, weatherArgs.OriginalFormula, weatherArgs.PrintDirection, weatherArgs.Invocation);

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
            .catch(async (error: any) => {
                setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
                    "status": "Complete",
                    "values":
                      [
                          {"name": "Error", "value": error}
                      ]
                }));

                await processSubscribersQueue(weatherArgs);
            });
        
        return REQUESTING;
    }
    else {
        return "#Invalid API Key!";
    }
}

async function onTimelineApiSuccessResponse(response: Response, weatherArgs: WeatherArgs): Promise<void> {
    if (!response) {
        setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
            "status": "Complete",
            "values":
              [
                  {"name": NA_DATA, "value": NA_DATA}
              ]
        }));

        await processSubscribersQueue(weatherArgs);

        return;
    }

    await response.json()
        .then((jsonResponse: any) => {
            onTimelineApiSuccessJsonResponse(jsonResponse, weatherArgs);
        })
        .catch(async (error: any) => {
            setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
                "status": "Complete",
                "values":
                  [
                      {"name": "Error", "value": error}
                  ]
            }));

            await processSubscribersQueue(weatherArgs);
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
    }
    else {
        setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
            "status": "Complete",
            "values":
              [
                  {"name": NA_DATA, "value": NA_DATA}
              ]
        }));
    }

    await processSubscribersQueue(weatherArgs);
}