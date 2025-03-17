import { PrintDirections } from './helpers.args';

export function getArrayDataCols(arrayData: any[][], printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return arrayData ? arrayData.length : 1;
    }
    else {
        return arrayData && arrayData[0] ? arrayData[0].length : 1;
    }
}

export function getArrayDataRows(arrayData: any[][], printDirection: PrintDirections): number {
    if (printDirection === PrintDirections.Horizontal) {
        return arrayData && arrayData[0] ? arrayData[0].length : 1;
    }
    else {
        return arrayData ? arrayData.length : 1;
    }
}