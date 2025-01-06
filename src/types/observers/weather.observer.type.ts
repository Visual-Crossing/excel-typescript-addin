import { IArrayDataPrinterWithCaller } from '../printers/printer.type';

export type WeatherObserver = {
    CacheId: string;
    
    ColumnsIn: number;
    ColumnsOut: number;

    RowsIn: number;
    RowsOut: number;

    Location: string;
    Date: Date;
    Unit: string;
    Printer: IArrayDataPrinterWithCaller;
    Invocation: CustomFunctions.Invocation;

    OptionalArg1?: any | null | undefined;
    OptionalArg2?: any | null | undefined;
    OptionalArg3?: any | null | undefined;
    OptionalArg4?: any | null | undefined;
    OptionalArg5?: any | null | undefined;

    SheetColsCount?: number;
    SheetRowsCount?: number;

    FormulaIn?: any;
}