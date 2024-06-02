export enum PrintDirections {
    Horizontal,
    Vertical
}  

export class WeatherArgs {
    Args: any | null = null;
    Columns: number | null = null;
    Rows: number | null = null;
    PrintDirection: PrintDirections = PrintDirections.Vertical;
}

export function extractWeatherArgs(args: any | null): WeatherArgs {
    const INVALID_PARAMETERS: string = "Invalid parameters.";

    if (args && typeof args !== 'string') {
        throw new Error(INVALID_PARAMETERS);
    }

    const weatherArgs: WeatherArgs = new WeatherArgs();
    weatherArgs.Args = args;
    
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
                    weatherArgs.PrintDirection = PrintDirections.Vertical;
                }
                else if (argValue === "h") {
                    weatherArgs.PrintDirection = PrintDirections.Horizontal;
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