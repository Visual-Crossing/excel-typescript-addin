import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { getUnitFromSettingsAsync } from "../settings/settings";
import { IOptionalArgParser } from "src/types/optional-args/parser.type";
import Container from "typedi";

const INVALID_DATE: string = "Invalid date.";

export enum PrintDirections {
    Horizontal,
    Vertical
}  
// export class WeatherObserver {
//     CacheId: string;
//     OriginalFormula?: any;
//     Columns: number = 1;
//     Rows: number = 1;
//     SheetColumnCount?: number;
//     SheetRowCount?: number;
//     Location: string;
//     Date: Date;
//     Unit: string;
//     Invocation: CustomFunctions.Invocation;
//     Printer: IArrayDataPrinterWithCaller = new ArrayDataVerticalPrinterService();
//     OptionalArg1?: any | null | undefined;
//     OptionalArg2?: any | null | undefined;
//     OptionalArg3?: any | null | undefined;
//     OptionalArg4?: any | null | undefined;

//     public constructor(
//         location: any, 
//         date: any, unit: string, 
//         optionalArg1: any | null | undefined,
//         optionalArg2: any | null | undefined,
//         optionalArg3: any | null | undefined,
//         optionalArg4: any | null | undefined, 
//         invocation: CustomFunctions.Invocation) {
        
//         const dateConverted = this.toDate(date);

//         if (!this.isValidDate(dateConverted)) {
//             throw new Error(INVALID_DATE);
//         }

//         this.Location = location as string;
//         this.Date = dateConverted;
//         this.Unit = unit;
//         this.OptionalArg1 = optionalArg1;
//         this.OptionalArg2 = optionalArg2;
//         this.OptionalArg3 = optionalArg3;
//         this.OptionalArg4 = optionalArg4;
//         this.Invocation = invocation;

//         this.CacheId = generateCacheId(this.Location, this.Date.toDateString(), this.Unit)
//     }

//     public isFormulaUpdateRequired(cols: number, rows: number): boolean {
//         return this.Invocation && this.Invocation.address && (rows !== this.Rows) || (cols !== this.Columns);
//     }

//     public isArrayDataCleanUpRequired(): boolean {
//         return this.Invocation && this.Invocation.address && this.Rows !== 1 || this.Columns !== 1;
//     }

//     toDate(date: any) : Date {
//         if (!date) {
//             throw new Error(INVALID_DATE);
//         }

//         if (date instanceof Date) {
//             return date as Date;
//         } else if (typeof date === 'number') {
//             return new Date(Date.UTC(0, 0, (date as number) - 1));
//         } else if (typeof date === 'string') {
//             return new Date(date as string);
//         }

//         throw new Error(INVALID_DATE);
//     }

//     isValidDate(date: number | string | Date) : boolean {
//         return !isNaN(new Date(date).getDate());
//     }
// }

// export async function extractWeatherArgs(
//     location: any, 
//     date: any, 
//     optionalArg1: any | null | undefined, 
//     optionalArg2: any | null | undefined,
//     optionalArg3: any | null | undefined,
//     optionalArg4: any | null | undefined, 
//     invocation: CustomFunctions.Invocation): Promise<WeatherObserver> {
    
//     const INVALID_PARAMETERS: string = "Invalid parameters.";

//     if ((optionalArg1 && typeof optionalArg1 !== 'string') ||
//         (optionalArg2 && typeof optionalArg2 !== 'string') ||
//         (optionalArg3 && typeof optionalArg3 !== 'string') ||
//         (optionalArg4 && typeof optionalArg4 !== 'string')) {
//         throw new Error(INVALID_PARAMETERS);
//     }

//     const unit: string | null | undefined = await getUnitFromSettingsAsync();
//     const weatherObserver: WeatherObserver = new WeatherObserver(location, date, unit, optionalArg1, optionalArg2, optionalArg3, optionalArg4, invocation);
    
//     if (!weatherObserver.OptionalArg1 && !weatherObserver.OptionalArg2 && !weatherObserver.OptionalArg3 && !weatherObserver.OptionalArg4) {
//         return weatherObserver;
//     }

//     const INVALID_PARAMETER_NAME: string = "Invalid parameter name";
//     const argsArray: string[] = weatherObserver.OptionalArg1.split(";");

//     if (argsArray && argsArray.length > 0) {
//         argsArray.forEach(element => {
//             if (!element) {
//                 return;
//             }

//             const arg: string[] = element.split("=");

//             if (!arg || arg.length !== 2 || !arg[0] || !arg[1]) {
//                 throw new Error(INVALID_PARAMETERS);
//             }

//             const argName = arg[0].trim().toLowerCase();
//             const argValue = arg[1].trim().toLowerCase();

//             const parameterProcessor: IParameterProcessor = Container.get(argName);

//             if (!parameterProcessor) {
//                 throw new Error(`${INVALID_PARAMETER_NAME} '${arg[0]}'.`);
//             }

//             parameterProcessor.process(argValue, weatherObserver);
//         });
//     }
//     else {
//         throw new Error(INVALID_PARAMETERS);
//     }

//     return weatherObserver;
// }