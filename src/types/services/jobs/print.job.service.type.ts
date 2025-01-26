import { IArrayDataPrinter } from "../../printers/printer.type";
import { IJobService } from "./job.service.type";

export interface IPrintJobService extends IJobService {
    InitialFormula: any;
    OutputArrayData: any[];
    ArrayDataPrinter: IArrayDataPrinter;
    Invocation: CustomFunctions.Invocation;
}