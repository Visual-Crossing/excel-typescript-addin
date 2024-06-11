import { extractFormulaArgsSection, getArrayDataCols, getArrayDataRows, replaceOrInsertArgs } from "./helpers.formulas";
import { WeatherArgs } from "./helpers.args";

export function getUpdatedFormula(weatherArgs: WeatherArgs, arrayCols: number, arrayRows: number): string {
    if (weatherArgs && weatherArgs.Args && weatherArgs.OriginalFormula) {
        const formulaArgsSection: string | null = extractFormulaArgsSection(weatherArgs.OriginalFormula);

        if (!formulaArgsSection) {
            throw new Error("Unexpected formula error.");
        }

        let updatedArgs = replaceOrInsertArgs(formulaArgsSection, "cols", `cols=${arrayCols};`);
        updatedArgs = replaceOrInsertArgs(updatedArgs, "rows", `rows=${arrayRows};`);

        const updatedFormula = weatherArgs.OriginalFormula.replace(formulaArgsSection, updatedArgs);
        return updatedFormula;
    }
    else if (weatherArgs && weatherArgs.OriginalFormula) {
        const originalFormulaTrimmed = weatherArgs.OriginalFormula.trim();
        const updatedFormula = `${originalFormulaTrimmed.substring(0, originalFormulaTrimmed.length - 1)}, "cols=${arrayCols};rows=${arrayRows};")`;

        return updatedFormula;
    }
    else {
        throw new Error("Unexpected error.");
    }
}

export function generateArrayData(weatherArgs: WeatherArgs, values: any[]): any[] | null {
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

    arrayData[0] = getUpdatedFormula(weatherArgs, arrayDataCols, arrayDataRows);

    return arrayData
}