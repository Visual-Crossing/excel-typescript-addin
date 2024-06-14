import { getArrayDataCols, getArrayDataRows, getUpdatedFormula } from "./helpers.formulas";
import { WeatherArgs } from "./helpers.args";

export function generateArrayData(weatherArgs: WeatherArgs, values: any[], useFormulaForCaller: boolean = true): any[] | null {
    if (!weatherArgs) {
        throw new Error();
    }

    if (!values || values.length === 0) {
        return null;
    }

    const arrayData: any[] = [];

    values.forEach((item) => arrayData.push(item.value));

    if (arrayData.length === 0) {
        throw new Error();
    }

    const arrayDataCols = getArrayDataCols(values, weatherArgs.PrintDirection);
    const arrayDataRows = getArrayDataRows(values, weatherArgs.PrintDirection);

    if (useFormulaForCaller) {
        arrayData[0] = getUpdatedFormula(weatherArgs, arrayDataCols, arrayDataRows);
    }

    return arrayData
}