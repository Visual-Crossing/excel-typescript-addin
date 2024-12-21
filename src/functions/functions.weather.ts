import { WeatherObserver } from "../helpers/helpers.args";
import { getCacheItem, removeCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import { DistinctQueue } from "../types/queues/distinct.queue.type";
import { generateArrayData } from "../helpers/helpers.array-data";
import { addJob, processJobs } from "src/helpers/helpers.jobs";
import { NA_DATA } from "src/shared/constants";
import { PrintJobService } from "src/services/jobs/print.job.service";
import { FormulaJobService } from "src/services/jobs/formula.job.service";
import { CleanUpJobService } from "src/services/jobs/cleanup.job.service";

var subscribersGroupedByCacheId: Map<string, DistinctQueue<string, WeatherObserver>> | null;

var processor: Map<string, string> | null = null;

const PROCESSING: string = "Processing...";

function subscribe(weatherObserver: WeatherObserver): void {
    if (!weatherObserver) {
        throw new Error("Invalid args.");
    }

    if (!weatherObserver.CacheId) {
        throw new Error("Invalid cache id.");
    }

    if (!weatherObserver.Invocation ||
        !weatherObserver.Invocation.address) {
            throw new Error("Invalid invocation.");
    }

    if (!subscribersGroupedByCacheId) {
        subscribersGroupedByCacheId = new Map<string, DistinctQueue<string, WeatherObserver>>();
        subscribersGroupedByCacheId.set(weatherObserver.CacheId, new DistinctQueue<string, WeatherObserver>());
    }
    else if (!subscribersGroupedByCacheId.has(weatherObserver.CacheId)) {
        subscribersGroupedByCacheId.set(weatherObserver.CacheId, new DistinctQueue<string, WeatherObserver>());
    }

    const subscribersForCacheId: DistinctQueue<string, WeatherObserver> = subscribersGroupedByCacheId.get(weatherObserver.CacheId)!;

    if (!subscribersForCacheId) {
        throw new Error("Invalid internal state.");
    }

    subscribersForCacheId.enqueue(weatherObserver.Invocation.address, weatherObserver);
}

async function processSubscribersQueue(weatherObserver: WeatherObserver): Promise<void> {
    if (!weatherObserver || !weatherObserver.CacheId) {
        throw new Error("Invalid args.");
    }
    
    if (!subscribersGroupedByCacheId || !subscribersGroupedByCacheId.has(weatherObserver.CacheId)) {
        return;
    }

    const subscribersForCacheId = subscribersGroupedByCacheId.get(weatherObserver.CacheId);

    if (!subscribersForCacheId || subscribersForCacheId.getLength() === 0) {
        subscribersGroupedByCacheId.delete(weatherObserver.CacheId);

        if (subscribersGroupedByCacheId.size === 0) {
            subscribersGroupedByCacheId = null;
        }

        return;
    }

    while (subscribersForCacheId && subscribersForCacheId.getLength() > 0) {
        const subscriberWeatherArgs = subscribersForCacheId.getFront();

        if (subscriberWeatherArgs && subscriberWeatherArgs.Invocation && subscriberWeatherArgs.Invocation.address) {
            const cacheItem = getCacheItem(subscriberWeatherArgs.CacheId);
    
            if (cacheItem) {
                const cacheItemString = cacheItem as string;

                if (cacheItemString) {
                    const cacheItemObject = JSON.parse(cacheItemString);

                    if (cacheItemObject && cacheItemObject.status && cacheItemObject.status === "Complete" && cacheItemObject.values && cacheItemObject.values.length > 0) {
                        const arrayData: any[] | null = generateArrayData(subscriberWeatherArgs, cacheItemObject.values);

                        if (arrayData && arrayData.length > 0){
                            addJob(new PrintJobService(subscriberWeatherArgs.OriginalFormula, arrayData, subscriberWeatherArgs.Printer, subscriberWeatherArgs.SheetColumnCount!, subscriberWeatherArgs.SheetRowCount!, subscriberWeatherArgs.Invocation));
                        }
                    }
                }
            }
        }
        
        if (subscriberWeatherArgs && subscriberWeatherArgs.Invocation && subscriberWeatherArgs.Invocation.address) {
            subscribersForCacheId.dequeue(subscriberWeatherArgs.Invocation.address);
        }
    }

    if (subscribersGroupedByCacheId && subscribersGroupedByCacheId.has(weatherObserver.CacheId)) {
        subscribersGroupedByCacheId.delete(weatherObserver.CacheId);

        if (subscribersGroupedByCacheId.size === 0) {
            subscribersGroupedByCacheId = null;
        }
    }
}

export async function getOrRequestData(weatherObserver: WeatherObserver): Promise<string | number | Date> {
    const cacheItemJsonString: string | null | undefined = getCacheItem(weatherObserver.CacheId);

    if (!cacheItemJsonString) {
        setCacheItem(weatherObserver.CacheId, JSON.stringify({ 
            status: "Requesting",
        }));
    }

    addJob(new FormulaJobService(async (formula: any, sheetColumnCount: number, sheetRowCount: number) => { 
        if (formula && sheetColumnCount && sheetRowCount) {
            weatherObserver.OriginalFormula = formula;
            weatherObserver.SheetColumnCount = sheetColumnCount;
            weatherObserver.SheetRowCount = sheetRowCount;

            if (cacheItemJsonString) {
                const cacheItemObject = JSON.parse(cacheItemJsonString);

                if (!cacheItemObject) {
                    return;
                }
                
                if (cacheItemObject.status === "Requesting") {
                    subscribe(weatherObserver);
                    addJob(new CleanUpJobService(weatherObserver.OriginalFormula, weatherObserver.Columns, weatherObserver.Rows, weatherObserver.Invocation));
                }
                else {
                    if (processor && processor.has(weatherObserver.Invocation.address!)) {
                        processor.delete(weatherObserver.Invocation.address!);

                        if (processor.size === 0) {
                            processor = null;
                        }
                    }
                    else {
                        const arrayData: any[] | null = generateArrayData(weatherObserver, cacheItemObject.values, false);
                
                        if (arrayData && arrayData.length > 0) {
                            addJob(new PrintJobService(weatherObserver.OriginalFormula, arrayData, weatherObserver.Printer.getPrinterExcludingCaller(), weatherObserver.SheetColumnCount!, weatherObserver.SheetRowCount!,weatherObserver.Invocation));
                        }
                    }

                    await processSubscribersQueue(weatherObserver);
                }

                await processJobs();
            }
            else {
                addJob(new CleanUpJobService(weatherObserver.OriginalFormula, weatherObserver.Columns, weatherObserver.Rows, weatherObserver.Invocation));
                await processJobs();

                const apiKey: string | null | undefined = await getApiKeyFromSettingsAsync();
                await fetchTimelineData(apiKey, weatherObserver);
            }
        }
     }, weatherObserver.Invocation));

    await processJobs();

    if (cacheItemJsonString) {
        return await getReturnValue(cacheItemJsonString, weatherObserver);
    }
    else {
        return PROCESSING;
    }
}

async function getReturnValue(cacheItemJsonString: string, weatherObserver: WeatherObserver): Promise<string | number | Date> {
    const cacheItemObject = JSON.parse(cacheItemJsonString);

    if (!cacheItemObject) {
        throw new Error("Unable to deserialize cache item.");
    }
    
    if (cacheItemObject.status === "Complete") {
        if (cacheItemObject.type === "Temporary") {
            removeCacheItem(weatherObserver.CacheId);
        }

        return cacheItemObject.values[0].value;
    }

    return PROCESSING;
}

async function fetchTimelineData(apiKey: string | null | undefined, weatherObserver: WeatherObserver): Promise<string> {
    if (apiKey) {
        subscribe(weatherObserver);

        const TIMELINE_API_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${weatherObserver.Location}/${weatherObserver.Date.toISOString()}?key=${apiKey}&unitGroup=${weatherObserver.Unit}`
        
        return await new Promise(async (resolve, reject) => {
            try {
                const response: Response = await fetch(TIMELINE_API_URL);

                if (response.status === 200) {
                    return resolve (await onTimelineApiSuccessResponse(response, weatherObserver));
                }
                else {
                    setCacheItem(weatherObserver.CacheId, JSON.stringify({ 
                        status: "Complete",
                        type: "Temporary",
                        values:
                          [
                              { name: "Error", value: "API Error" },
                          ]
                    }));
    
                    await processSubscribersQueue(weatherObserver);
                    await processJobs();

                    return reject();
                }
            }
            catch (error: any) {
                return reject(error);
            }
        });
    }
    else {
        return "#Invalid API Key!";
    }
}

async function onTimelineApiSuccessResponse(response: Response, weatherObserver: WeatherObserver): Promise<string> {
    return await new Promise(async (resolve, reject) => {
        try {
            if (!response) {
                return resolve(NA_DATA);
            }

            const jsonResponse: any = await response.json();
            return resolve(await onTimelineApiSuccessJsonResponse(jsonResponse, weatherObserver));
        }
        catch (error: any) {
            return reject(error);
        }
    });
}

async function onTimelineApiSuccessJsonResponse(jsonResponse: any, weatherObserver: WeatherObserver): Promise<string> {
    return await new Promise(async (resolve, reject) => {
        try {
            if (jsonResponse && jsonResponse.days && jsonResponse.days.length > 0 && jsonResponse.days[0]) {
                setCacheItem(weatherObserver.CacheId, JSON.stringify({ 
                    status: "Complete",
                    type: "Permanent",
                    values:
                      [
                          { name: "tempmax", value: jsonResponse.days[0].tempmax },
                          { name: "tempmin", value: jsonResponse.days[0].tempmin },
                          { name: "precip", value: jsonResponse.days[0].precip },
                          { name: "precipprob", value: jsonResponse.days[0].precipprob },
                          { name: "windspeed", value: jsonResponse.days[0].windspeed }
                      ]
                }));

                await processSubscribersQueue(weatherObserver);
                await processJobs();

                return resolve(PROCESSING);
            }
            else {
                return resolve(NA_DATA);
            }
        }
        catch (error: any) {
            return reject(error);
        }
    });
}