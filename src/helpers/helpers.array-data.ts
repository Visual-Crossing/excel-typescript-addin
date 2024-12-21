import { getArrayDataCols, getArrayDataRows, getUpdatedFormula } from "./helpers.formulas";
import { WeatherObserver } from "./helpers.args";

export function generateArrayData(weatherObserver: WeatherObserver, values: any[], useFormulaForCaller: boolean = true): any[] | null {
    if (!weatherObserver) {
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

    const arrayDataCols = getArrayDataCols(values, weatherObserver.Printer.getPrintDirection());
    const arrayDataRows = getArrayDataRows(values, weatherObserver.Printer.getPrintDirection());

    if (useFormulaForCaller) {
        arrayData[0] = getUpdatedFormula(weatherObserver, arrayDataCols, arrayDataRows);
    }

    return arrayData
}