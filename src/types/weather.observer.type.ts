import { IArrayDataPrinter } from './printers/printer.type';
import { IFieldService } from './services/field.service.type';

export type WeatherObserver = {
    CacheId: string;
    
    ArrayDataColumnsIn: number;
    ArrayDataRowsIn: number;

    Location: string;
    Date: Date;
    Unit: string;
    Printer: IArrayDataPrinter;
    Invocation: CustomFunctions.Invocation;

    Fields: IFieldService[];
    IncludeTitle: boolean;

    OptionalArg1?: any | null | undefined;
    OptionalArg2?: any | null | undefined;
    OptionalArg3?: any | null | undefined;
    OptionalArg4?: any | null | undefined;
    OptionalArg5?: any | null | undefined;

    InitialFormula?: any;
    error?: any;
}