import { getCell, getSheet } from "../helpers/helpers.excel";
import { IArrayDataPrinter } from "./printer";

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

                // ToDo: Implement case insensitive and whitespace free comparison
                if (callerCell.formulas[0][0] === this.CallerCellOriginalFormula) {
                    if (this.ArrayDataRowsCount > 1) {
                        callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex + 1, callerCell.columnIndex, this.ArrayDataRowsCount - 1, this.ArrayDataColsCount).clear(Excel.ClearApplyTo.contents);
                    }

                    if (this.ArrayDataColsCount > 1) {
                        callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex + 1, this.ArrayDataRowsCount, this.ArrayDataColsCount - 1).clear(Excel.ClearApplyTo.contents);
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

export class PrintJob implements IJob {
    private CallerCellOriginalFormula: any;
    private ArrayData: any[];
    private ArrayDataPrinter: IArrayDataPrinter;
    private Invocation: CustomFunctions.Invocation;


    public constructor(callerCellOriginalFormula: any, arrayData: any[], arrayDataPrinter: IArrayDataPrinter, invocation: CustomFunctions.Invocation) {
        this.CallerCellOriginalFormula = callerCellOriginalFormula;
        this.ArrayData = arrayData;
        this.ArrayDataPrinter = arrayDataPrinter;
        this.Invocation = invocation;
    }
    
    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            if (context && this.Invocation && this.Invocation.address && this.CallerCellOriginalFormula && this.ArrayData && this.ArrayData.length > 0 && this.ArrayDataPrinter) {
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

                // ToDo: Implement case insensitive and whitespace free comparison
                if (callerCell.formulas[0][0] === this.CallerCellOriginalFormula) {
                    if (await this.ArrayDataPrinter.print(callerCell, this.ArrayData)) {
                        await context.sync();
                    }
                }
            }

            return true;
        }
        catch (error: any) {
            return false;
        }
    }
}