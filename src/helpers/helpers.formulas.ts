import { PrintDirections, WeatherArgs } from "./helpers.args";

export function getFormulaWithoutColsRows(formula: string, weatherArgs: WeatherArgs | null): string {
    if (!formula) {
        throw new Error("Invalid formula!");
    }

    return formula.replace(`cols=${weatherArgs?.Columns};rows=${weatherArgs?.Rows}`, "");
}

export function getDataCols(cacheItemJson: any, printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return Object.keys(cacheItemJson).length - 1;
    }
    else {
        return 1;
    }
}

export function getDataRows(cacheItemJson: any, printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return 1;
    }
    else {
        return Object.keys(cacheItemJson).length - 1;
    }
}