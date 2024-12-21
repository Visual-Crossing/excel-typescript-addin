import { IArrayDataPrinterWithCaller } from "../types/printers/printer.type";
import { generateCacheId } from "../cache/cache";
import { DEFAULT_UNIT, getUnitFromSettingsAsync } from "../settings/settings";
import { ArrayDataVerticalPrinterService } from "src/services/printers/vertical.printer.service";
import { ArrayDataHorizontalPrinterService } from "src/services/printers/horizontal.printer.service";
import { getService } from "src/services/container";
import { IParameterProcessor } from "src/types/parameters/parameter-processor.type";

const INVALID_DATE: string = "Invalid date.";

export enum PrintDirections {
    Horizontal,
    Vertical
}  
export class WeatherObserver {
    CacheId: string;
    OriginalFormula?: any;
    Columns: number = 1;
    Rows: number = 1;
    SheetColumnCount?: number;
    SheetRowCount?: number;
    Location: string;
    Date: Date;
    Unit: string;
    Invocation: CustomFunctions.Invocation;
    Printer: IArrayDataPrinterWithCaller = new ArrayDataVerticalPrinterService();
    OptionalArg1?: any | null | undefined;
    OptionalArg2?: any | null | undefined;

    public constructor(
        location: any, 
        date: any, unit: string, 
        optionalArg1: any | null | undefined,
        optionalArg2: any | null | undefined,
        optionalArg3: any | null | undefined,
        optionalArg4: any | null | undefined, 
        invocation: CustomFunctions.Invocation) {
        
        const dateConverted = this.toDate(date);

        if (!this.isValidDate(dateConverted)) {
            throw new Error(INVALID_DATE);
        }

        this.Location = location as string;
        this.Date = dateConverted;
        this.Unit = unit;
        this.OptionalArg1 = optionalArg1;
        this.OptionalArg2 = optionalArg2;
        this.Invocation = invocation;

        this.CacheId = generateCacheId(this.Location, this.Date.toDateString(), this.Unit)
    }

    public isFormulaUpdateRequired(cols: number, rows: number): boolean {
        return this.Invocation && this.Invocation.address && (rows !== this.Rows) || (cols !== this.Columns);
    }

    public isArrayDataCleanUpRequired(): boolean {
        return this.Invocation && this.Invocation.address && this.Rows !== 1 || this.Columns !== 1;
    }

    toDate(date: any) : Date {
        if (!date) {
            throw new Error(INVALID_DATE);
        }

        if (date instanceof Date) {
            return date as Date;
        } else if (typeof date === 'number') {
            return new Date(Date.UTC(0, 0, (date as number) - 1));
        } else if (typeof date === 'string') {
            return new Date(date as string);
        }

        throw new Error(INVALID_DATE);
    }

    isValidDate(date: number | string | Date) : boolean {
        return !isNaN(new Date(date).getDate());
    }
}

export async function extractWeatherArgs(
    location: any, 
    date: any, 
    optionalArg1: any | null | undefined, 
    optionalArg2: any | null | undefined,
    optionalArg3: any | null | undefined,
    optionalArg4: any | null | undefined, 
    invocation: CustomFunctions.Invocation): Promise<WeatherObserver> {
    
    const INVALID_PARAMETERS: string = "Invalid parameters.";

    if ((optionalArg1 && typeof optionalArg1 !== 'string') ||
        (optionalArg2 && typeof optionalArg2 !== 'string')) {
        throw new Error(INVALID_PARAMETERS);
    }

    let unit: string | null | undefined = await getUnitFromSettingsAsync();

    if (!unit) {
        unit = DEFAULT_UNIT;
    }

    const weatherObserver: WeatherObserver = new WeatherObserver(location, date, unit, optionalArg1, optionalArg2, optionalArg3, optionalArg4, invocation);
    
    if (!weatherObserver.OptionalArg1 && !weatherObserver.OptionalArg2) {
        return weatherObserver;
    }

    const INVALID_PARAMETER_NAME: string = "Invalid parameter name";
    const INVALID_PARAMETER_VALUE: string = "Invalid parameter value";

    const argsArray: string[] = weatherObserver.OptionalArg1.split(";");

    if (argsArray && argsArray.length > 0) {
        argsArray.forEach(element => {
            if (!element) {
                return;
            }

            const arg: string[] = element.split("=");

            if (!arg || arg.length !== 2 || !arg[0] || !arg[1]) {
                throw new Error(INVALID_PARAMETERS);
            }

            const argName = arg[0].trim().toLowerCase();
            const argValue = arg[1].trim().toLowerCase();

            const parameterProcessor: IParameterProcessor = getService(argName);

            if (!parameterProcessor) {
                throw new Error(`${INVALID_PARAMETER_NAME} '${arg[0]}'.`);
            }

            parameterProcessor.process(argValue, weatherObserver);

            // if (argName === "dir") {
            //     if (argValue === "v") {
            //         weatherObserver.Printer = new ArrayDataVerticalPrinterService();
            //     }
            //     else if (argValue === "h") {
            //         weatherObserver.Printer = new ArrayDataHorizontalPrinterService();
            //     }
            //     else {
            //         throw new Error(`${INVALID_PARAMETER_VALUE} '${arg[1]}' for parameter name '${arg[0]}'. Valid values are 'v' or 'h' only.`);
            //     }
            // }
            // else if (argName === "cols") {
            //     weatherObserver.Columns = parseInt(arg[1], 10);
            // }
            // else if (argName === "rows") {
            //     weatherObserver.Rows = parseInt(arg[1], 10);
            // }
            // else {
            //     throw new Error(`${INVALID_PARAMETER_NAME} '${arg[0]}'.`);
            // }
        });
    }
    else {
        throw new Error(INVALID_PARAMETERS);
    }

    return weatherObserver;
}