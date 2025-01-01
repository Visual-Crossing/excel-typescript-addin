import { IJobService } from "./job.service.type";

export interface ICleanUpJobService extends IJobService {
    CallerCellOriginalFormula: any;
    ArrayDataColsCount: number;
    ArrayDataRowsCount: number;
    Invocation: CustomFunctions.Invocation;
}