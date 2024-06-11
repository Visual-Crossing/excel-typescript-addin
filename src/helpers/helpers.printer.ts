import { PrintDirections } from "./helpers.args";
import { getCell, getSheet } from "./helpers.excel";

export async function printArrayData(values: any[] | null, originalFormula: any, printDirection: PrintDirections, invocation: CustomFunctions.Invocation): Promise<void> {
    if (values && values.length > 0 && invocation && invocation.address) {
        try {
            await Excel.run(async (context) => {
                try {
                    if (values && values.length > 0 && invocation && invocation.address) {
                        const caller = getCell(invocation.address, context);

                        caller.load();
                        await context.sync();

                        if (caller.formulas[0][0] === originalFormula) {
                            const sheet = getSheet(invocation.address, context);
                            let arrayData: any[] = [];

                            if (printDirection === PrintDirections.Horizontal) {
                                for (let i = 1; i < values.length; i++) {
                                    arrayData.push(values[i]);
                                }

                                sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex + 1, 1, arrayData.length).values = [arrayData];
                            }
                            else {
                                for (let i = 1; i < values.length; i++) {
                                    arrayData.push([values[i]]);
                                }

                                sheet.getRangeByIndexes(caller.rowIndex + 1, caller.columnIndex, arrayData.length, 1).values = arrayData;
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
                            printArrayData(values, originalFormula, printDirection, invocation);
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
                    printArrayData(values, originalFormula, printDirection, invocation);
                }
                catch {

                }
            }, 250);
        }
    }
}