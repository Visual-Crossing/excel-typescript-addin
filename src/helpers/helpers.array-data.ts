import { getArrayDataCols, getArrayDataRows, getUpdatedFormula } from "./helpers.formulas";
import { WeatherArgs } from "./helpers.args";
import { getCell, getSheet } from "./helpers.excel";

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

export async function clearArrayData(cols: number, rows: number, originalFormula: any, invocation: CustomFunctions.Invocation): Promise<void> {
    if (originalFormula && invocation && invocation.address && (cols > 1 || rows > 1)) {
        try {
            return await Excel.run(async (context: Excel.RequestContext) => {
                try {
                    if (originalFormula && invocation && invocation.address && (cols > 1 || rows > 1)) {
                        const caller = getCell(invocation.address, context);

                        caller.load();
                        await context.sync();

                        if (caller.formulas[0][0] === originalFormula) {
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
                }
                catch {
                    // Retry
                    const timeout: NodeJS.Timeout = setTimeout(() => {
                        try {
                            clearTimeout(timeout);
                            clearArrayData(cols, rows, originalFormula, invocation);
                        }
                        catch {
                            
                        }
                    }, 250);
                }
            });
        }
        catch {
            // Retry
            const timeout: NodeJS.Timeout = setTimeout(() => {
                try {
                    clearTimeout(timeout);
                    clearArrayData(cols, rows, originalFormula, invocation);
                }
                catch {
                    
                }
            }, 250);
        }
    }
}