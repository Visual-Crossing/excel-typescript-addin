import { PrintDirections, WeatherArgs } from "./helpers.args";

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