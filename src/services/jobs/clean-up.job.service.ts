import { ICleanUpJobService } from '../../types/jobs/clean-up.job.service.type';
import { getCell } from '../../helpers/helpers.excel';
import { Service } from 'typedi';

@Service({ transient: true })
export class CleanUpJobService implements ICleanUpJobService {
    public CallerCellOriginalFormula: any;
    public ArrayDataColsCount: number;
    public ArrayDataRowsCount: number;
    public Invocation: CustomFunctions.Invocation;

    public getId(): string {
        if (this.Invocation && this.Invocation.address) {
            return `CleanUp_${this.Invocation.address}`;
        } else {
            throw new Error();
        }
    }

    public getAddress(): string {
        if (this.Invocation && this.Invocation.address) {
            return this.Invocation.address;
        } else {
            throw new Error();
        }
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

                if (!callerCell) {
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