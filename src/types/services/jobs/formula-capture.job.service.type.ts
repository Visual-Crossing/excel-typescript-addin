import { IJobService } from "./job.service.type";

export interface IFormulaCaptureJobService<T> extends IJobService {
    Observer: T;
    Invocation: CustomFunctions.Invocation;

    create(): IFormulaCaptureJobService<T>;
    onFormulaCaptured: (observer: T, initialFormula: any, sheetColsCount: number, sheetRowsCount: number) => {};
}