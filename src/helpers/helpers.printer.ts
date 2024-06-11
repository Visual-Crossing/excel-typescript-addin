import { PrintDirections } from "./helpers.args";
import { getCell, getSheet } from "./helpers.excel";

export async function printArrayDataWithFormula(values: any[] | null, invocation: CustomFunctions.Invocation, printDirection: PrintDirections): Promise<void> {
    if (values && values.length > 0 && invocation && invocation.address) {
        await Excel.run(async (context) => {
            if (values && values.length > 0 && invocation && invocation.address) {
                const caller = getCell(invocation.address, context);

                caller.load();
                await context.sync();

                const sheet = getSheet(invocation.address, context);
                let arrayData: any[] = [];

                if (printDirection === PrintDirections.Horizontal) {
                    values.forEach((value) => {
                        arrayData.push(value);
                    });

                    sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex, 1, arrayData.length).values = [arrayData];
                }
                else {
                    values.forEach((value) => {
                        arrayData.push([value]);
                    });

                    sheet.getRangeByIndexes(caller.rowIndex, caller.columnIndex, arrayData.length, 1).values = arrayData;
                }

                await context.sync();
            }
        });
    }
}

export async function printArrayDataWithoutFormula(values: any[] | null, invocation: CustomFunctions.Invocation, printDirection: PrintDirections): Promise<void> {
    if (values && values.length > 0 && invocation && invocation.address) {
        await Excel.run(async (context) => {
            if (values && values.length > 0 && invocation && invocation.address) {
                const caller = getCell(invocation.address, context);

                caller.load();
                await context.sync();

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
        });
    }
}