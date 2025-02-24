import { IArrayDataPrinter } from './printers/printer.type';

export type WeatherObserver = {
    CacheId: string;
    
    ArrayDataColumnsIn: number;
    ArrayDataColumnsOut: number;

    ArrayDataRowsIn: number;
    ArrayDataRowsOut: number;

    Location: string;
    Date: Date;
    Unit: string;
    Printer: IArrayDataPrinter;
    Invocation: CustomFunctions.Invocation;

    OptionalArg1?: any | null | undefined;
    OptionalArg2?: any | null | undefined;
    OptionalArg3?: any | null | undefined;
    OptionalArg4?: any | null | undefined;
    OptionalArg5?: any | null | undefined;

    SheetColumnsMax?: number;
    SheetRowsMax?: number;

    InitialFormula?: any;
}