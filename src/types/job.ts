import { getCell, getSheet } from "../helpers/helpers.excel";

export interface IJob {
    run(context: Excel.RequestContext): Promise<boolean>;
}

export class CleanUpJob implements IJob {
    private CallerCellOriginalFormula: any;
    private ArrayDataColsCount: number;
    private ArrayDataRowsCount: number;
    private Invocation: CustomFunctions.Invocation;


    public constructor(callerCellOriginalFormula: any, arrayDataColsCount: number, arrayDataRowsCount: number, invocation: CustomFunctions.Invocation) {
        this.CallerCellOriginalFormula = callerCellOriginalFormula;
        this.ArrayDataColsCount = arrayDataColsCount;
        this.ArrayDataRowsCount = arrayDataRowsCount;
        this.Invocation = invocation;
    }

    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            if (context && this.Invocation && this.Invocation.address && this.CallerCellOriginalFormula && (this.ArrayDataColsCount > 1 || this.ArrayDataRowsCount > 1)) {
                let callerCell: Excel.Range;
                
                try {
                    callerCell = getCell(this.Invocation.address, context);
                }
                catch {
                    // Caller cell no longer exists
                    return true;
                }

                callerCell.load();
                await context.sync();

                // ToDo: Do ignore case and whitespace comparison
                if (callerCell.formulas[0][0] === this.CallerCellOriginalFormula) {
                    let sheet: Excel.Worksheet;

                    try {
                        sheet = getSheet(this.Invocation.address, context);
                    }
                    catch {
                        // Sheet no longer exists
                        return true;
                    }

                    if (this.ArrayDataRowsCount > 1) {
                        sheet.getRangeByIndexes(callerCell.rowIndex + 1, callerCell.columnIndex, this.ArrayDataRowsCount - 1, this.ArrayDataColsCount).clear(Excel.ClearApplyTo.contents);
                    }

                    if (this.ArrayDataColsCount > 1) {
                        sheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex + 1, this.ArrayDataRowsCount, this.ArrayDataColsCount - 1).clear(Excel.ClearApplyTo.contents);
                    }

                    await context.sync();
                }
            }

            return true;
        }
        catch {
            return false;
        }
    }
}

// export class PrintJob implements IJob {
//     public run(context: Excel.RequestContext): Promise<boolean> {
        
//     }
// }