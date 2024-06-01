export enum PrintDirections {
    Horizontal,
    Vertical
}  

export class WeatherArgs {
    Columns: number | null = null;
    Rows: number | null = null;
    PrintDirection: PrintDirections = PrintDirections.Vertical;
}

export function extractWeatherArgs(args: string | null, colsRows: string | null): WeatherArgs | null {
    if (!args && !colsRows) {
        return new WeatherArgs();
    }

    const weatherArgs: WeatherArgs = new WeatherArgs();

    if (args) {
        const argsArray: string[] = args.split(";");

        argsArray.forEach(element => {
            const arg: string[] = element.split("=");

            if (arg[0].toLowerCase() === "dir") {
                if (arg[1].toLowerCase() === "h") {
                    weatherArgs.PrintDirection = PrintDirections.Horizontal;
                }
                else {
                    weatherArgs.PrintDirection = PrintDirections.Vertical;
                }
            }
            else if (arg[0].toLowerCase() === "cols") {
                weatherArgs.Columns = parseInt(arg[1], 10);
            }
            else if (arg[0].toLowerCase() === "rows") {
                weatherArgs.Rows = parseInt(arg[1], 10);
            }
        });
    }

    if (colsRows) {
        const colsRowsArray: string[] = colsRows.split(";");

        colsRowsArray.forEach(element => {
            const arg: string[] = element.split("=");
    
            if (arg[0].toLowerCase() === "cols") {
                weatherArgs.Columns = parseInt(arg[1], 10);
            }
            else if (arg[0].toLowerCase() === "rows") {
                weatherArgs.Rows = parseInt(arg[1], 10);
            }
        });
    }

    return weatherArgs;
}