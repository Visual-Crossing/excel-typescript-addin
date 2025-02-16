import { IJobService } from "./job.service.type";

export interface ICleanUpJobService<T> extends IJobService<T> {
    InitialFormula: any;
    ColumnsToClear: number;
    RowsToClear: number;
    Invocation: CustomFunctions.Invocation;

    create(): ICleanUpJobService<T>;
}