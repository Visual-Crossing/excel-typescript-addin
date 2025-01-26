import { PrintDirections } from "./helpers.args";

export function getArrayDataCols(arrayData: any[][], printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return arrayData.length;
    }
    else {
        return 1;
    }
}

export function getArrayDataRows(arrayData: any[][], printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return 1;
    }
    else {
        return arrayData.length;
    }
}