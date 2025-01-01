import { IJobService } from "./job.service.type";

export interface IFormulaCaptureJobService<T> extends IJobService {
    Observer: T;
    Invocation: CustomFunctions.Invocation;

    OnFormulaCaptured: (observer: T, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => {};
}