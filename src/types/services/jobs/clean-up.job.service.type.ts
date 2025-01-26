import { IJobService } from "./job.service.type";

export interface ICleanUpJobService extends IJobService {
    InitialFormula: any;
    ColumnsToClear: number;
    RowsToClear: number;
    Invocation: CustomFunctions.Invocation;
}