import Container from "typedi";
import { ObservableService } from "./observable.service";
import { WeatherObserver } from "../../types/weather.observer.type";
import { ICacheService } from "../../types/services/cache.service.type";
import { IJobsProcessorService } from "../../types/services/jobs/jobs-processor.service.type";
import { IFormulaCaptureJobService } from "../../types/services/jobs/formula-capture.job.service.type";
import { ICleanUpJobService } from "../../types/services/jobs/clean-up.job.service.type";
import { IMatrixService } from "../../types/services/matrix.service.type";
import { IPrintJobService } from "../../types/services/jobs/print.job.service.type";
import { IRequestService } from "../../types/services/request.service.type";
import { CacheItem } from "../../types/cache-item.type";
import { IJobService } from "../../types/services/jobs/job.service.type";
import { PrintJobService } from "../jobs/print.job.service";
import { PROCESSING } from "../../shared/constants";

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

    private initFormulaCaptureJob(observer: WeatherObserver): void {
        if (!observer) {
            return;
        }

        const formulaCaptureJob = Container.get<IFormulaCaptureJobService<WeatherObserver, CustomFunctions.Invocation>>('service.job.formula.capture').create();

        if (!formulaCaptureJob) {
            throw new Error();
        }

        formulaCaptureJob.Observer = observer;
        formulaCaptureJob.Invocation = observer.Invocation;

        formulaCaptureJob.onFormulaCaptured = async (observer: WeatherObserver, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => this.onFormulaCapturedHandler(observer, callerCellFormula, sheetColsCount, sheetRowsCount);

        this.initJob(formulaCaptureJob);
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

        const jobsProcessorService = Container.get<IJobsProcessorService<CustomFunctions.Invocation>>('service.jobs.processor');
        
        if (!cacheItemString) {
            cacheItemString = JSON.stringify({ status: 'Pending' });
            cacheService.set(observer.CacheId, cacheItemString);
        }

        if (!jobsProcessorService.printJobExists(observer.Invocation.address!)) {
            this.initFormulaCaptureJob(observer);
            return PROCESSING;
        } else {
            try {
                const matrixService = Container.get<IMatrixService>('service.matrix').create();
                matrixService.CacheItem = JSON.parse(cacheItemString) as CacheItem;

                const matrix = matrixService.toMatrix();

                return matrix.FormulaCellDisplayValue;
            }
            finally {
                jobsProcessorService.removePrintJob(observer.Invocation.address!);
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
                if (!this.isSubscribed(observer.CacheId, observer.Invocation)) {
                    this.subscribe(observer.CacheId, observer.Invocation, observer);
                }

                if (cacheItemObject.status === 'Complete') {
                    this.onUpdate(observer);
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
                printJob.ArrayDataPrinter = observer.Printer;
                printJob.Invocation = observer.Invocation;

                if (observer.SheetColumnsMax) {
                    (printJob as PrintJobService).SheetColumnCount = observer.SheetColumnsMax;
                }

                if (observer.SheetRowsMax) {
                    (printJob as PrintJobService).SheetRowCount = observer.SheetRowsMax;
                }

                this.initJob(printJob);
            }
        }
    }
}