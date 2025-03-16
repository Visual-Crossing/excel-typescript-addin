import Container from "typedi";
import { ObservableService } from "./observable.service";
import { WeatherObserver } from "../../types/weather.observer.type";
import { ICacheService } from "../../types/services/cache.service.type";
import { IJobsProcessorService } from "../../types/services/jobs/jobs-processor.service.type";
import { IMacroJobService } from "../../types/services/jobs/macro.job.service.type";
import { ICleanUpJobService } from "../../types/services/jobs/cleanup.job.service.type";
import { IWeatherResultService } from "../../types/services/weather.result.service.type";
import { IPrintJobService } from "../../types/services/jobs/print.job.service.type";
import { IRequestService } from "../../types/services/request.service.type";
import { CacheItem } from "../../types/cache-item.type";
import { IJobService } from "../../types/services/jobs/job.service.type";
import { PROCESSING } from "../../shared/constants";
import { IMetadataService } from "../..//types/services/jobs/metadata.service.type";
import { IWeatherResultsStoreService } from "../../types/services/weather.result.store.service.type";
import { ArrayDataVerticalPrinterService } from "../printers/vertical.printer.service";
import { IMacroCounterService } from "../../types/services/macro.counter.service.type";

export class WeatherObservableService extends ObservableService<WeatherObserver> {
    public constructor() {
        super();

        this.onValidate = ((observer: WeatherObserver) => this.onValidateHandler(observer));
        this.onUpdate = ((observer: WeatherObserver) => this.onUpdateHandler(observer));
    }

    private initJob(job: IJobService<CustomFunctions.Invocation>): void {
        if (!job) {
            return;
        }

        const jobsProcessorService = Container.get<IJobsProcessorService<CustomFunctions.Invocation>>('service.jobs.processor');

        if (!jobsProcessorService) {
            throw new Error();
        }

        jobsProcessorService.add(job);
        jobsProcessorService.process();
    }

    private initMacroJob(observer: WeatherObserver): void {
        if (!observer) {
            return;
        }

        const macroJob = Container.get<IMacroJobService<WeatherObserver, CustomFunctions.Invocation>>('service.job.macro').create();

        if (!macroJob) {
            throw new Error();
        }

        macroJob.Observer = observer;
        macroJob.Invocation = observer.Invocation;

        macroJob.onCallback = async (macroJobService: IMacroJobService<WeatherObserver, CustomFunctions.Invocation>, context: Excel.RequestContext) => this.onMacroCallbackHandler(macroJobService, context);

        this.initJob(macroJob);
    }

    private initCleanupJob(observer: WeatherObserver): void {
        if (!observer) {
            return;
        }

        const cleanupJob = Container.get<ICleanUpJobService<CustomFunctions.Invocation>>('service.job.cleanup').create();

        if (!cleanupJob) {
            throw new Error();
        }

        cleanupJob.InitialFormula = observer.InitialFormula;
        cleanupJob.ColumnsToClear = observer.ArrayDataColumnsIn;
        cleanupJob.RowsToClear = observer.ArrayDataRowsIn;
        cleanupJob.Invocation = observer.Invocation;

        this.initJob(cleanupJob);
    }

    public observe(observer: WeatherObserver): string | number | Date {
        if (!observer) {
            throw new Error();
        }

        const cacheService = Container.get<ICacheService>('service.cache');
        let cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

        if (!cacheItemString) {
            if (observer.error) {
                cacheItemString = JSON.stringify({ 
                    id: observer.CacheId,
                    status: 'Complete',
                    type: 'Permanent',
                    error: observer.error
                });
            } else {
                cacheItemString = JSON.stringify({ id: observer.CacheId, status: 'Pending' });
            }

            cacheService.set(observer.CacheId, cacheItemString);
        }

        const weatherResultsStore = Container.get<IWeatherResultsStoreService>('service.results.store.weather');
        const weatherResult = weatherResultsStore.get(observer.CacheId, observer.Invocation.address!);

        if (!weatherResult) {
            const macroCounterService = Container.get<IMacroCounterService>('service.counter.macro');
            macroCounterService.add();

            this.initMacroJob(observer);
            return PROCESSING;
        } else {
            try {
                if (!weatherResult.weatherResultService) {
                    throw new Error();
                }

                return weatherResult.weatherResultService.getFormulaCellValue();
            } finally {
                const macroCounterService = Container.get<IMacroCounterService>('service.counter.macro');
                macroCounterService.remove();
            }
        }
    }

    private async saveMetadata(macroJobService: IMacroJobService<WeatherObserver, CustomFunctions.Invocation>, context: Excel.RequestContext) {
        const metadataService = Container.get<IMetadataService>('service.metadata');

        if (!metadataService.MaxSheetRows || metadataService.MaxSheetRows === 0) {
            metadataService.MaxSheetRows = await macroJobService.getMaxSheetRows(context);
        }

        if (!metadataService.MaxSheetCols || metadataService.MaxSheetCols === 0) {
            metadataService.MaxSheetCols = await macroJobService.getMaxSheetCols(context);
        }
    }

    private async onMacroCallbackHandler (macroJobService: IMacroJobService<WeatherObserver, CustomFunctions.Invocation>, context: Excel.RequestContext): Promise<void>  { 
        const macroCounterService = Container.get<IMacroCounterService>('service.counter.macro');

        try {
            if (!macroJobService || !context) {
                throw new Error();
            }
            
            const observer = macroJobService.Observer;
            
            if (observer && observer.Invocation && observer.Invocation.address) {
                const callerCellFormula = await macroJobService.getCallerCellFormula(context);

                if (callerCellFormula) {
                    await this.saveMetadata(macroJobService, context);

                    observer.InitialFormula = callerCellFormula;

                    this.initCleanupJob(observer);
                    this.subscribe(observer.CacheId, observer.Invocation, observer);

                    const cacheService = Container.get<ICacheService>('service.cache');
                    const cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

                    const cacheItemObject = cacheItemString ? JSON.parse(cacheItemString) : null;

                    if (cacheItemObject && cacheItemObject.status !== 'Pending') {
                        if (cacheItemObject.status === 'Complete') {
                            this.update(observer.CacheId, (observer) => observer.Invocation);
                        }
                    }
                    else {
                        const weatherRequest = Container.get<IRequestService<WeatherObserver>>('service.requests.weather');
                        weatherRequest.fetchData(observer);

                        cacheService.set(observer.CacheId, JSON.stringify({ id: observer.CacheId, status: 'Requesting' }));
                    }
                } else {
                    macroCounterService.remove();
                }
            } else  {
                macroCounterService.remove();
            }
        } catch (error: any){
            macroCounterService.remove();
            throw error;
        }
    }

    private onValidateHandler(observer: WeatherObserver) {
        if (observer && observer.Invocation && observer.Invocation.address) { 
            return true; 
        } else { 
            return false;
        } 
    }

    private async onUpdateHandler(observer: WeatherObserver) {
        if (!observer) {
            return;
        }

        const cacheService = Container.get<ICacheService>('service.cache');
        const cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

        if (cacheItemString) {
            const cacheItemObject = JSON.parse(cacheItemString);

            if (!cacheItemObject) {
                return;
            }
        
            const weatherResult = Container.get<IWeatherResultService>('service.results.weather').create();

            if (observer && observer.Invocation && observer.Invocation.address) {
                weatherResult.DestinationAddress = observer.Invocation.address;
            }

            if (!observer.Printer) {
                observer.Printer = new ArrayDataVerticalPrinterService(); 
            }

            weatherResult.CurrentFormula = observer.InitialFormula;
            weatherResult.Fields = observer.Fields;
            weatherResult.IncludeTitle = observer.IncludeTitle;
            weatherResult.PrintDirection = observer.Printer.getPrintDirection();
            weatherResult.CacheItem = cacheItemObject as CacheItem;
            weatherResult.Error = observer.error;

            if (observer.ArrayDataColumnsIn && observer.ArrayDataRowsIn) {
                weatherResult.CurrentCols = observer.ArrayDataColumnsIn;
                weatherResult.CurrentRows = observer.ArrayDataRowsIn;
            }

            const printJob = Container.get<IPrintJobService<CustomFunctions.Invocation>>('service.job.print').create();

            printJob.InitialFormula = observer.InitialFormula;
            printJob.WeatherResult = weatherResult;
            printJob.ArrayDataPrinter = observer.Printer;
            printJob.Invocation = observer.Invocation;

            this.initJob(printJob);
        }
    }
}