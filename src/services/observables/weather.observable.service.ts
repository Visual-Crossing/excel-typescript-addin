import { ObservableService } from "./observable.service";
import { getCacheItem } from "../../cache/cache";
import { generateArrayData } from "../../helpers/helpers.array-data";
import { addJob } from "../../helpers/helpers.jobs";
import { PrintJobService } from "../../services/jobs/print.job.service";
import { WeatherObserver } from "../../types/observers/weather.observer.type";
import { ICacheService } from "../../types/cache/cache.service.type";
import Container from "typedi";
import { IJobsProcessorService } from "../../types/jobs/jobs-processor.service.type";
import { IFormulaCaptureJobService } from "../../types/jobs/formula-capture.job.service.type";
import { ICleanUpJobService } from "../../types/jobs/clean-up.job.service.type";

export class WeatherObservableService extends ObservableService<WeatherObserver> {
    private constructor() {
        super();

        this.onValidate = ((observer: WeatherObserver) => this.onValidateHandler(observer));
        this.onUpdate = ((observer: WeatherObserver) => this.onUpdateHandler(observer));
    }

    public async observe(observer: WeatherObserver): Promise<void> {
        if (!observer) {
            throw new Error();
        }

        const cacheService = Container.get<ICacheService>('service.cache');
        const cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

        if (!cacheItemString) {
            cacheService.set(observer.CacheId, JSON.stringify({ 
                status: 'Requesting',
            }));
        }

        const jobsProcessorService = Container.get<IJobsProcessorService>('service.jobs.processor');
        const formulaCaptureJob = Container.get<IFormulaCaptureJobService<WeatherObserver>>('service.job.formula.capture');

        formulaCaptureJob.Observer = observer;
        formulaCaptureJob.Invocation = observer.Invocation;

        formulaCaptureJob.OnFormulaCaptured = async (observer: WeatherObserver, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => await this.onFormulaCapturedHandler(observer, callerCellFormula, sheetColsCount, sheetRowsCount);

        jobsProcessorService.add(formulaCaptureJob);
        await jobsProcessorService.process();
    }

    private async onFormulaCapturedHandler (observer: WeatherObserver, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number): Promise<void>  { 
        const cacheService = Container.get<ICacheService>('service.cache');
        const cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

        const jobsProcessorService = Container.get<IJobsProcessorService>('service.jobs.processor');

        if (observer && observer.Invocation && observer.Invocation.address && callerCellFormula && sheetColsCount && sheetRowsCount) {
            observer.OriginalFormula = callerCellFormula;
            observer.SheetColsCount = sheetColsCount;
            observer.SheetRowsCount = sheetRowsCount;

            if (cacheItemString) {
                const cacheItemObject = JSON.parse(cacheItemString);

                if (!cacheItemObject) {
                    return;
                }
                
                if (cacheItemObject.status === 'Requesting') {
                    this.subscribe(observer.CacheId, observer.Invocation.address, observer);

                    const cleanupJob = Container.get<ICleanUpJobService>('service.job.cleanup');

                    cleanupJob.CallerCellOriginalFormula = observer.OriginalFormula;
                    cleanupJob.ArrayDataColsCount = observer.Columns;
                    cleanupJob.ArrayDataRowsCount = observer.Rows;
                    cleanupJob.Invocation = observer.Invocation;

                    jobsProcessorService.add(cleanupJob);
                }
                else {
                    if (processor && processor.has(observer.Invocation.address!)) {
                        processor.delete(observer.Invocation.address!);

                        if (processor.size === 0) {
                            processor = null;
                        }
                    }
                    else {
                        const arrayData: any[] | null = generateArrayData(observer, cacheItemObject.values, false);
                
                        if (arrayData && arrayData.length > 0) {
                            addJob(new PrintJobService(observer.OriginalFormula, arrayData, observer.Printer.getPrinterExcludingCaller(), observer.SheetColsCount!, observer.SheetRowsCount!,observer.Invocation));
                        }
                    }

                    await this.update(observer.CacheId);
                }

                await jobsProcessorService.process();
            }
            else {
                const cleanupJob = Container.get<ICleanUpJobService>('service.job.cleanup');

                cleanupJob.CallerCellOriginalFormula = observer.OriginalFormula;
                cleanupJob.ArrayDataColsCount = observer.Columns;
                cleanupJob.ArrayDataRowsCount = observer.Rows;
                cleanupJob.Invocation = observer.Invocation;

                jobsProcessorService.add(cleanupJob);

                await jobsProcessorService.process();

                const apiKey: string | null | undefined = await getApiKeyFromSettingsAsync();
                await fetchTimelineData(apiKey, observer);
            }
        }

        await jobsProcessorService.process();

        if (cacheItemString) {
            return await getReturnValue(cacheItemString, observer);
        }
        else {
            return PROCESSING;
        }
    }

    private onValidateHandler(observer: WeatherObserver) {
        if (observer && observer.Invocation && observer.Invocation.address) { 
            return true; 
        } else { 
            return false;
        } 
    }

    private onUpdateHandler(observer: WeatherObserver) {
        if (!observer) {
            return;
        }
        
        const cacheItem = getCacheItem(observer.CacheId);

        if (cacheItem) {
            const cacheItemString = cacheItem as string;

            if (cacheItemString) {
                const cacheItemObject = JSON.parse(cacheItemString);

                if (cacheItemObject && cacheItemObject.status && cacheItemObject.status === "Complete" && cacheItemObject.values && cacheItemObject.values.length > 0) {
                    const arrayData: any[] | null = generateArrayData(observer, cacheItemObject.values);

                    if (arrayData && arrayData.length > 0){
                        addJob(new PrintJobService(observer.OriginalFormula, arrayData, observer.Printer, observer.SheetColsCount!, observer.SheetRowsCount!, observer.Invocation));
                    }
                }
            }
        }
    }
}