import { extractFormulaArgsSection, getArrayDataCols, getArrayDataRows, replaceOrInsertArgs } from "./helpers.formulas";
import { WeatherArgs } from "./helpers.args";
import { getCell, getSheet } from "./helpers.excel";

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

export async function clearArrayData(cols: number, rows: number, invocation: CustomFunctions.Invocation): Promise<void> {
    if (invocation && invocation.address && (cols > 1 || rows > 1)) {
        await Excel.run(async (context: Excel.RequestContext) => {
            try {
                if (invocation && invocation.address && (cols > 1 || rows > 1)) {
                    const caller = getCell(invocation.address, context);

                    caller.load();
                    await context.sync();

                    const sheet = getSheet(invocation.address, context);

                    if (rows > 1) {
                        sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, rows - 1, cols).clear(Excel.ClearApplyTo.contents);
                    }

                    if (cols > 1) {
                        sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex + 1, rows, cols - 1).clear(Excel.ClearApplyTo.contents);
                    }

                    await context.sync();
                }
            }
            catch {
                //Nothing too important - it can be ignored (unless if it happens all the time). It just means that there was an error when trying to clear data.
            }
        });
    }
}