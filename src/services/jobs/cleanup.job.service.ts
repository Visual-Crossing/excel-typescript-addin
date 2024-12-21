import { getCell } from "src/helpers/helpers.excel";
import { IJob } from "src/types/jobs/job.type";
import { Service } from "typedi";

@Service({ transient: true })
export class CleanUpJobService implements IJob {
    private readonly CallerCellOriginalFormula: any;
    private readonly ArrayDataColsCount: number;
    private readonly ArrayDataRowsCount: number;
    private readonly Invocation: CustomFunctions.Invocation;

    public constructor(callerCellOriginalFormula: any, arrayDataColsCount: number, arrayDataRowsCount: number, invocation: CustomFunctions.Invocation) {
        this.CallerCellOriginalFormula = callerCellOriginalFormula;
        this.ArrayDataColsCount = arrayDataColsCount;
        this.ArrayDataRowsCount = arrayDataRowsCount;
        this.Invocation = invocation;
    }

    public getId(): string {
        return `CleanUp_${this.Invocation.address}`;
    }

    public getAddress(): string {
        return this.Invocation.address!;
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