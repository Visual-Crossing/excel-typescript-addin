import { IArrayDataPrinter } from './printers/printer.type';
import { IFieldService } from './services/field.service.type';

export type WeatherObserver = {
    CacheId: string;
    
    ArrayDataColumnsIn: number;
    ArrayDataRowsIn: number;

    Location: string;
    Date: Date;
    Unit: string;
    Invocation: CustomFunctions.Invocation;

    ArrayDataPrinter: IArrayDataPrinter;
    Fields: IFieldService[];
    IncludeTitle: boolean;

    OptionalArg1?: any | null | undefined;
    OptionalArg2?: any | null | undefined;
    OptionalArg3?: any | null | undefined;
    OptionalArg4?: any | null | undefined;
    OptionalArg5?: any | null | undefined;

    InitialFormula?: any;
    Error?: any;
}