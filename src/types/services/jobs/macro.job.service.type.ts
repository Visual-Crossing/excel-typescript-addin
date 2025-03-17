import { IJobService } from './job.service.type';

export interface IMacroJobService<T, U> extends IJobService<U> {
    Observer: T;

    getCallerCellFormula(context: Excel.RequestContext): any;

    getMaxSheetRows(context: Excel.RequestContext): Promise<number>;
    getMaxSheetCols(context: Excel.RequestContext): Promise<number>;

    create(): IMacroJobService<T, U>;
    onCallback: (macroJobService: IMacroJobService<T, U>, context: Excel.RequestContext) => {};
}