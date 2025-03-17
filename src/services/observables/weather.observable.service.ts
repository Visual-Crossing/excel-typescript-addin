import Container from 'typedi';
import { ObservableService } from './observable.service';
import { WeatherObserver } from '../../types/weather.observer.type';
import { ICacheService } from '../../types/services/cache.service.type';
import { IJobsProcessorService } from '../../types/services/jobs/jobs-processor.service.type';
import { IMacroJobService } from '../../types/services/jobs/macro.job.service.type';
import { ICleanUpJobService } from '../../types/services/jobs/cleanup.job.service.type';
import { IWeatherResultService } from '../../types/services/weather.result.service.type';
import { IPrintJobService } from '../../types/services/jobs/print.job.service.type';
import { IRequestService } from '../../types/services/request.service.type';
import { IJobService } from '../../types/services/jobs/job.service.type';
import { PROCESSING } from '../../shared/constants';
import { IMetadataService } from '../..//types/services/jobs/metadata.service.type';
import { IWeatherResultsStoreService } from '../../types/services/weather.result.store.service.type';
import { ArrayDataVerticalPrinterService } from '../printers/vertical.printer.service';
import { IMacroCounterService } from '../../types/services/macro.counter.service.type';
import { getCacheService, getMacroCounterService, getPrintJobService, getWeatherResultService } from '../../helpers/helpers.services';
import { WeatherResult } from '../weather/weather.result.service';

export class WeatherObservableService extends ObservableService<WeatherObserver> {
    public constructor() {
        super();

        this.onValidate = ((observer: WeatherObserver) => this.onValidateHandler(observer));
        this.onUpdate = ((observer: WeatherObserver) => this.onUpdateHandler(observer));
    }

    private initJob<T>(job: IJobService<T>): void {
        if (!job) {
            return;
        }

        const jobsProcessorService = Container.get<IJobsProcessorService<T>>('service.jobs.processor');

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

        const cleanupJob = Container.get<ICleanUpJobService<WeatherObserver, CustomFunctions.Invocation>>('service.job.cleanup').create();

        if (!cleanupJob) {
            throw new Error();
        }

        cleanupJob.Observer = observer;

        this.initJob(cleanupJob);
    }

    public observe(observer: WeatherObserver): string | number | Date {
        if (!observer) {
            throw new Error();
        }

        const cacheService: ICacheService = getCacheService();
        let cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

        if (!cacheItemString && !observer.Error) {
            cacheItemString = JSON.stringify({ id: observer.CacheId, status: 'Pending' });
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
                if (!weatherResult.weatherResult) {
                    throw new Error();
                }

                return weatherResult.weatherResult.getFormulaCellValue();
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
        const macroCounterService: IMacroCounterService = getMacroCounterService();

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

                    if (observer.Error) {
                        this.update(observer.CacheId, (observer) => observer.Invocation);
                    }
                    else {
                        const cacheService: ICacheService = getCacheService();
                        const cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);
    
                        const cacheItemObject = cacheItemString ? JSON.parse(cacheItemString) : null;

                        if (cacheItemObject && cacheItemObject.status === 'Complete') {
                            this.update(observer.CacheId, (observer) => observer.Invocation);
                        }
                        else if (cacheItemObject && cacheItemObject.status === 'Pending') {
                            const weatherRequest = Container.get<IRequestService<WeatherObserver>>('service.requests.weather');
                            weatherRequest.fetchData(observer);

                            cacheService.set(observer.CacheId, JSON.stringify({ id: observer.CacheId, status: 'Requesting' }));
                        }
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

        if (!observer.ArrayDataPrinter) {
            observer.ArrayDataPrinter = new ArrayDataVerticalPrinterService(); 
        }

        const weatherResult: IWeatherResultService = getWeatherResultService().create();
        weatherResult.Observer = observer;

        const printJob: IPrintJobService<IWeatherResultService, CustomFunctions.Invocation> = getPrintJobService().create();
        printJob.Result = weatherResult;

        this.initJob(printJob);
    }
}