import { ObservableService } from "./observable.service";
import { WeatherObserver } from "../../types/weather.observer.type";
import { ICacheService } from "../../types/services/cache.service.type";
import Container from "typedi";
import { IJobsProcessorService } from "../../types/services/jobs/jobs-processor.service.type";
import { IFormulaCaptureJobService } from "../../types/services/jobs/formula-capture.job.service.type";
import { ICleanUpJobService } from "../../types/services/jobs/clean-up.job.service.type";
import { IMatrixService } from "../../types/services/matrix.service.type";
import { IPrintJobService } from "../../types/services/jobs/print.job.service.type";
import { IRequestService } from "../../types/services/request.service.type";
import { CacheItem } from "../../types/cache-item.type";

export class WeatherObservableService extends ObservableService<WeatherObserver> {
    public constructor() {
        super();

        this.onValidate = ((observer: WeatherObserver) => this.onValidateHandler(observer));
        this.onUpdate = ((observer: WeatherObserver) => this.onUpdateHandler(observer));
    }

    private initFormulaCaptureJob(jobsProcessorService: IJobsProcessorService<CustomFunctions.Invocation>, observer: WeatherObserver): void {
        const formulaCaptureJob = Container.get<IFormulaCaptureJobService<WeatherObserver, CustomFunctions.Invocation>>('service.job.formula.capture').create();

        formulaCaptureJob.Observer = observer;
        formulaCaptureJob.Invocation = observer.Invocation;

        formulaCaptureJob.onFormulaCaptured = async (observer: WeatherObserver, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => this.onFormulaCapturedHandler(observer, callerCellFormula, sheetColsCount, sheetRowsCount);

        jobsProcessorService.add(formulaCaptureJob);
        jobsProcessorService.process();
    }

    private initCleanupJob(observer: WeatherObserver): void {
        const cleanupJob = Container.get<ICleanUpJobService<CustomFunctions.Invocation>>('service.job.cleanup').create();

        cleanupJob.InitialFormula = observer.InitialFormula;
        cleanupJob.ColumnsToClear = observer.ArrayDataColumnsIn;
        cleanupJob.RowsToClear = observer.ArrayDataRowsIn;
        cleanupJob.Invocation = observer.Invocation;

        const jobsProcessorService = Container.get<IJobsProcessorService<CustomFunctions.Invocation>>('service.jobs.processor');

        jobsProcessorService.add(cleanupJob);
        jobsProcessorService.process();
    }

    public observe(observer: WeatherObserver): string | number | Date {
        if (!observer) {
            throw new Error();
        }

        const cacheService = Container.get<ICacheService>('service.cache');
        let cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

        const jobsProcessorService = Container.get<IJobsProcessorService<CustomFunctions.Invocation>>('service.jobs.processor');
        const matrixService = Container.get<IMatrixService>('service.matrix').create();

        if (!cacheItemString) {
            cacheItemString = JSON.stringify({ status: 'Pending' });
            cacheService.set(observer.CacheId, cacheItemString);

            this.initFormulaCaptureJob(jobsProcessorService, observer);

            return 'Requesting...';
        } else {
            matrixService.CacheItem = JSON.parse(cacheItemString) as CacheItem;

            const matrix = matrixService.toMatrix();

            if (jobsProcessorService.exists(observer.Invocation)) {
                return matrix.FormulaCellDisplayValue;
            } else {
                this.initFormulaCaptureJob(jobsProcessorService, observer);

                return matrix.FormulaCellDisplayValue;
            }
        }
    }

    private async onFormulaCapturedHandler (observer: WeatherObserver, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number): Promise<void>  { 
        if (observer && observer.Invocation && observer.Invocation.address && callerCellFormula && sheetColsCount && sheetRowsCount) {
            observer.InitialFormula = callerCellFormula;
            observer.SheetColumnsMax = sheetColsCount;
            observer.SheetRowsMax = sheetRowsCount;

            this.initCleanupJob(observer);

            const cacheService = Container.get<ICacheService>('service.cache');
            const cacheItemString: string | null | undefined = cacheService.get(observer.CacheId);

            const cacheItemObject = cacheItemString ? JSON.parse(cacheItemString) : null;

            if (cacheItemObject && cacheItemObject.status !== 'Pending') {
                if (cacheItemObject.status === 'Requesting') {
                    this.subscribe(observer.CacheId, observer.Invocation, observer);
                } else if (cacheItemObject.status === 'Complete') {
                    if (!this.isObserved(observer.CacheId, observer.Invocation)) {
                        this.subscribe(observer.CacheId, observer.Invocation, observer);
                    }
                }
            }
            else {
                const weatherRequest = Container.get<IRequestService<WeatherObserver>>('service.requests.weather');
                weatherRequest.fetchData(observer);

                cacheService.set(observer.CacheId, JSON.stringify({ status: 'Requesting' }));
            }
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
        
            const matrixService = Container.get<IMatrixService>('service.matrix').create();

            matrixService.CurrentFormula = observer.InitialFormula;
            matrixService.PrintDirection = observer.Printer.getPrintDirection();
            matrixService.CacheItem = cacheItemObject as CacheItem;

            if (observer.ArrayDataColumnsIn && observer.ArrayDataRowsIn) {
                matrixService.CurrentColsRows = `cols=${observer.ArrayDataColumnsIn};rows=${observer.ArrayDataRowsIn};`;
            }

            const matrix = matrixService.toMatrix();

            if (matrix.OutputArrayData?.length) {
                const printJob = Container.get<IPrintJobService<CustomFunctions.Invocation>>('service.job.print').create();

                printJob.InitialFormula = observer.InitialFormula;
                printJob.OutputArrayData = matrix.OutputArrayData;
                printJob.ArrayDataPrinter = observer.Printer.getPrinterExcludingCaller();
                printJob.Invocation = observer.Invocation;

                const jobsProcessorService = Container.get<IJobsProcessorService<CustomFunctions.Invocation>>('service.jobs.processor');

                jobsProcessorService.add(printJob);
                jobsProcessorService.process();
            }
        }
    }
}