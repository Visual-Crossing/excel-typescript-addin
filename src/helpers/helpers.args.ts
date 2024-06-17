import { ArrayDataHorizontalPrinter, ArrayDataVerticalPrinter, IArrayDataPrinterWithCaller } from "../types/printer";
import { generateCacheId } from "../cache/cache";
import { getUnitFromSettingsAsync } from "../settings/settings";

export enum PrintDirections {
    Horizontal,
    Vertical
}  

export class WeatherArgs {
    CacheId: string;
    OriginalFormula?: any;
    Args: any | null | undefined;
    Columns: number = 1;
    Rows: number = 1;
    Location: string;
    Date: string;
    Unit: string;
    Invocation: CustomFunctions.Invocation;
    Printer: IArrayDataPrinterWithCaller = new ArrayDataVerticalPrinter();

    public constructor(location: any, date: any, unit: string, args: any | null | undefined, invocation: CustomFunctions.Invocation) {
        this.Location = location as string;
        this.Date = date as string;
        this.Unit = unit;
        this.Args = args;
        this.Invocation = invocation;

        this.CacheId = generateCacheId(this.Location, this.Date, this.Unit)
    }

    public isFormulaUpdateRequired(cols: number, rows: number): boolean {
        return this.Invocation && this.Invocation.address && (rows !== this.Rows) || (cols !== this.Columns);
    }

    public isArrayDataCleanUpRequired(): boolean {
        return this.Invocation && this.Invocation.address && this.Rows !== 1 || this.Columns !== 1;
    }
}

export async function extractWeatherArgs(location: any, date: any, args: any | null | undefined, invocation: CustomFunctions.Invocation): Promise<WeatherArgs> {
    const INVALID_PARAMETERS: string = "Invalid parameters.";

    if (args && typeof args !== 'string') {
        throw new Error(INVALID_PARAMETERS);
    }

    let unit: string | null | undefined = await getUnitFromSettingsAsync();

    if (!unit) {
        //Default unit = us
        unit = "us";
    }

    const weatherArgs: WeatherArgs = new WeatherArgs(location, date, unit, args, invocation);
    
    if (!weatherArgs.Args) {
        return weatherArgs;
    }

    const INVALID_PARAMETER_NAME: string = "Invalid parameter name";
    const INVALID_PARAMETER_VALUE: string = "Invalid parameter value";

    const argsArray: string[] = weatherArgs.Args.split(";");

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

            if (argName === "dir") {
                if (argValue === "v") {
                    weatherArgs.Printer = new ArrayDataVerticalPrinter();
                }
                else if (argValue === "h") {
                    weatherArgs.Printer = new ArrayDataHorizontalPrinter();
                }
                else {
                    throw new Error(`${INVALID_PARAMETER_VALUE} '${arg[1]}' for parameter name '${arg[0]}'. Valid values are 'v' or 'h' only.`);
                }
            }
            else if (argName === "cols") {
                // if (typeof arg[1] !== 'number'){
                //     throw new Error(`${INVALID_PARAMETER_VALUE} '${arg[1]}' for parameter name '${arg[0]}'. This value is set automatically and should not be altered manually.`);
                // }

                weatherArgs.Columns = parseInt(arg[1], 10);
            }
            else if (argName === "rows") {
                // if (typeof arg[1] !== 'number'){
                //     throw new Error(`${INVALID_PARAMETER_VALUE} '${arg[1]}' for parameter name '${arg[0]}'. This value is set automatically and should not be altered manually.`);
                // }

                weatherArgs.Rows = parseInt(arg[1], 10);
            }
            else {
                throw new Error(`${INVALID_PARAMETER_NAME} '${arg[0]}'.`);
            }
        });
    }
    else {
        throw new Error(INVALID_PARAMETERS);
    }

    return weatherArgs;
}