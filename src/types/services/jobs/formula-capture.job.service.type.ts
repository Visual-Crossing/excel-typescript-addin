import { IJobService } from "./job.service.type";

export interface IFormulaCaptureJobService<T, U> extends IJobService<U> {
    Observer: T;
    Invocation: CustomFunctions.Invocation;

    create(): IFormulaCaptureJobService<T, U>;
    onFormulaCaptured: (observer: T, initialFormula: any, sheetColsCount: number, sheetRowsCount: number) => {};
}