import { WeatherArgs } from "../helpers/helpers.args";
import { getCacheItem, setCacheItem } from "../cache/cache";
import { getApiKeyFromSettingsAsync } from "../settings/settings";
import { DistinctQueue } from "../types/distinct-queue";
import { NA_DATA } from "../common/constants";
import { CleanUpJob, FormulaJob, IJob, PrintJob } from "../types/job";
import { Queue } from "queue-typescript";
import { ArrayDataVerticalPrinter } from "../types/printer";
import { generateArrayData } from "../helpers/helpers.array-data";

var subscribersGroupedByCacheId: Map<string, DistinctQueue<string, WeatherArgs>> | null;

var jobs: Queue<IJob> | null = null;
var isJobsProcessingInProgress: boolean = false;

const REQUESTING: string = "Requesting...";

async function processJobs(): Promise<void> {
    if (jobs && jobs.length > 0 && !isJobsProcessingInProgress) {
        isJobsProcessingInProgress = true;

        const timeout: NodeJS.Timeout = setTimeout(async () => {
            try {
                clearTimeout(timeout);

                if (jobs && jobs.length > 0) {
                    return await Excel.run(async (context: Excel.RequestContext) => {
                        try {
                            while (jobs && jobs.length > 0) {
                                const job: IJob = jobs.front;
                                
                                if (await job.run(context)) {
                                    jobs.dequeue();
                                }
                                else {
                                    const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await processJobs(); }, 250);
                                    return;
                                }
                            }

                            jobs = null;
                        }
                        catch {
                            const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await processJobs(); }, 250);
                        }
                        finally {
                            isJobsProcessingInProgress = false;
                        }
                    });
                }
            }
            catch {
                const timeout: NodeJS.Timeout = setTimeout(async () => { clearTimeout(timeout); await processJobs(); }, 250);
            }
            finally {
                isJobsProcessingInProgress = false;
            }
        }, 250);
    }
}

function addJob(job: IJob) : void {
    if (!jobs) {
        jobs = new Queue<IJob>();
    }

    jobs.enqueue(job);
}

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

    while (subscribersForCacheId && subscribersForCacheId.getLength() > 0) {
        const subscriberWeatherArgs = subscribersForCacheId.getFront();

        if (subscriberWeatherArgs && subscriberWeatherArgs.Invocation && subscriberWeatherArgs.Invocation.address) {
            // if (subscriberWeatherArgs.OriginalFormula === caller.formulas[0][0]) {
                const cacheItem = getCacheItem(subscriberWeatherArgs.CacheId);
        
                if (cacheItem) {
                    const cacheItemString = cacheItem as string;

                    if (cacheItemString) {
                        const cacheItemObject = JSON.parse(cacheItemString);

                        if (cacheItemObject && cacheItemObject.status && cacheItemObject.status === "Complete" && cacheItemObject.values && cacheItemObject.values.length > 0) {
                            const arrayData: any[] | null = generateArrayData(subscriberWeatherArgs, cacheItemObject.values);

                            if (arrayData && arrayData.length > 0){
                                addJob(new PrintJob(subscriberWeatherArgs.OriginalFormula, arrayData, new ArrayDataVerticalPrinter(), subscriberWeatherArgs.Invocation));
                            }
                        }
                    }
                }
            // }
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

export async function getOrRequestData(weatherArgs: WeatherArgs): Promise<string | number | Date> {
    const cacheItemJsonString: string | null | undefined = getCacheItem(weatherArgs.CacheId);

    if (!cacheItemJsonString) {
        setCacheItem(weatherArgs.CacheId, JSON.stringify({ 
            "status": "Requesting",
        }));
    }

    addJob(new FormulaJob(async (formula: any) => { 
        if (formula) {
            weatherArgs.OriginalFormula = formula;

            addJob(new CleanUpJob(weatherArgs.OriginalFormula, weatherArgs.Columns, weatherArgs.Rows, weatherArgs.Invocation));

            await processJobs();

            if (cacheItemJsonString) {
                const cacheItemObject = JSON.parse(cacheItemJsonString);

                if (!cacheItemObject) {
                    return;
                }
                
                if (cacheItemObject.status === "Requesting") {
                    subscribe(weatherArgs);
                }
                else {
                    await processSubscribersQueue(weatherArgs);
                    await processJobs();
                }
            }
            else {
                const apiKey: string | null | undefined = await getApiKeyFromSettingsAsync();
                await fetchTimelineData(apiKey, weatherArgs);
            }
        }
     }, weatherArgs.Invocation));

    await processJobs();

    if (cacheItemJsonString) {
        return getReturnValue(cacheItemJsonString);
    }
    else {
        return REQUESTING;
    }
}

function getReturnValue(cacheItemJsonString: string): string | number | Date {
    const cacheItemObject = JSON.parse(cacheItemJsonString);

    if (!cacheItemObject) {
        throw new Error("Unable to deserialize cache item.");
    }
    
    if (cacheItemObject.status === "Complete") {
        return cacheItemObject.values[0].value;
    }

    return "Retrieving...";
}

async function fetchTimelineData(apiKey: string | null | undefined, weatherArgs: WeatherArgs): Promise<string> {
    if (apiKey) {
        subscribe(weatherArgs);

        const TIMELINE_API_URL:string = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${weatherArgs.Location}/${weatherArgs.Date}?key=${apiKey}&unitGroup=${weatherArgs.Unit}`
        
        return await new Promise(async (resolve, reject) => {
            try {
                const response: Response = await fetch(TIMELINE_API_URL);
                return resolve (await onTimelineApiSuccessResponse(response, weatherArgs));
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

async function onTimelineApiSuccessResponse(response: Response, weatherArgs: WeatherArgs): Promise<string> {
    return await new Promise(async (resolve, reject) => {
        try {
            if (!response) {
                return resolve(NA_DATA);
            }

            const jsonResponse: any = await response.json();
            return resolve(await onTimelineApiSuccessJsonResponse(jsonResponse, weatherArgs));
        }
        catch (error: any) {
            return reject(error);
        }
    });
}

async function onTimelineApiSuccessJsonResponse(jsonResponse: any, weatherArgs: WeatherArgs): Promise<string> {
    return await new Promise(async (resolve, reject) => {
        try {
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

                await processSubscribersQueue(weatherArgs);
                await processJobs();

                return resolve(REQUESTING);
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