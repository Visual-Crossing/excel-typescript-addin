import { ObservableService } from "./observable.service";
import { PrintJobService } from "../../services/jobs/print.job.service";
import { WeatherObserver } from "../../types/observers/weather.observer.type";
import { ICacheService } from "../../types/cache/cache.service.type";
import Container from "typedi";
import { IJobsProcessorService } from "../../types/jobs/jobs-processor.service.type";
import { IFormulaCaptureJobService } from "../../types/jobs/formula-capture.job.service.type";
import { ICleanUpJobService } from "../../types/jobs/clean-up.job.service.type";
import { IMatrixService } from "../../types/matrix/matrix.service.type";
import { IPrintJobService } from "../../types/jobs/print.job.service.type";
import { PROCESSING } from "../../shared/constants";

export class WeatherObservableService extends ObservableService<WeatherObserver> {
    public constructor() {
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

        if (observer && observer.Invocation && observer.Invocation.address && callerCellFormula && sheetColsCount && sheetRowsCount) {
            observer.FormulaIn = callerCellFormula;
            observer.SheetColsCount = sheetColsCount;
            observer.SheetRowsCount = sheetRowsCount;

            const cleanupJob = Container.get<ICleanUpJobService>('service.job.cleanup');

            cleanupJob.CallerCellOriginalFormula = observer.FormulaIn;
            cleanupJob.ArrayDataColsCount = observer.ColumnsIn;
            cleanupJob.ArrayDataRowsCount = observer.RowsIn;
            cleanupJob.Invocation = observer.Invocation;

            const jobsProcessorService = Container.get<IJobsProcessorService>('service.jobs.processor');

            jobsProcessorService.add(cleanupJob);
            await jobsProcessorService.process();

            if (cacheItemString) {
                const cacheItemObject = JSON.parse(cacheItemString);

                if (!cacheItemObject) {
                    return;
                }
                
                if (cacheItemObject.status === 'Requesting') {
                    this.subscribe(observer.CacheId, observer.Invocation.address, observer);
                }
                else {
                    const matrixService = Container.get<IMatrixService>('service.matrix');

                    matrixService.CurrentFormula = observer.FormulaIn;
                    matrixService.PrintDirection = observer.Printer.getPrintDirection();
                    matrixService.JsonData = cacheItemObject.values;

                    if (observer.ColumnsIn && observer.RowsIn) {
                        matrixService.CurrentColsRows = `cols=${observer.ColumnsIn};rows=${observer.RowsIn};`;
                    }

                    const matrix = matrixService.toMatrix();

                    if (matrix.OutputArrayData?.length) {
                        const printJob = Container.get<IPrintJobService>('service.job.print');

                        printJob.CallerCellOriginalFormula = observer.FormulaIn;
                        printJob.ArrayData = matrix.OutputArrayData;
                        printJob.ArrayDataPrinter = observer.Printer.getPrinterExcludingCaller();
                        printJob.Invocation = observer.Invocation;

                        await this.update(observer.CacheId);

                        jobsProcessorService.add(cleanupJob);
                        await jobsProcessorService.process();
                    }
                }
            }
            else {
                const apiKey: string | null | undefined = await getApiKeyFromSettingsAsync();
                await fetchTimelineData(apiKey, observer);
            }
        }

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

    private async onUpdateHandler(observer: WeatherObserver) {
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
                        addJob(new PrintJobService(observer.FormulaIn, arrayData, observer.Printer, observer.SheetColsCount!, observer.SheetRowsCount!, observer.Invocation));

                        const jobsProcessorService = Container.get<IJobsProcessorService>('service.jobs.processor');
                        //ToDo: Add print job
                        jobsProcessorService.add(formulaCaptureJob);
                        await jobsProcessorService.process();
                    }
                }
            }
        }
    }
}