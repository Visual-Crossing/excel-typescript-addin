import { IArrayDataPrinter } from "../../printers/printer.type";
import { IJobService } from "./job.service.type";

export interface IPrintJobService<T> extends IJobService<T> {
    InitialFormula: any;
    OutputArrayData: any[];
    ArrayDataPrinter: IArrayDataPrinter;
    Invocation: T;

    create(): IPrintJobService<T>;
}