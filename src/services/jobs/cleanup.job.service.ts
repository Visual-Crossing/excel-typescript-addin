import { Service } from 'typedi';
import { ICleanUpJobService } from '../../types/services/jobs/cleanup.job.service.type';
import { getCell } from '../../helpers/helpers.excel';
import { jobTypes } from '../../types/services/jobs/job.service.type';

@Service({ transient: true })
export class CleanUpJobService implements ICleanUpJobService<CustomFunctions.Invocation> {
    public InitialFormula: any;
    public ColumnsToClear: number;
    public RowsToClear: number;
    public Invocation: CustomFunctions.Invocation;

    public create(): ICleanUpJobService<CustomFunctions.Invocation> {
        return new CleanUpJobService();
    }

    public getType(): jobTypes {
        return jobTypes.cleanUp;
    }

    public getId(): CustomFunctions.Invocation {
        if (this.Invocation && this.Invocation.address) {
            return this.Invocation;
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
            if (context && this.Invocation && this.Invocation.address && this.InitialFormula && (this.ColumnsToClear > 1 || this.RowsToClear > 1)) {
                let callerCell: Excel.Range;
                
                try {
                    callerCell = await getCell(this.Invocation.address, context);
                }
                catch {
                    // Caller cell no longer exists
                    return true;
                }

                if (!callerCell) {
                    return true;
                }

                callerCell.load();
                await callerCell.context.sync();

                // ToDo: Consider implementing case insensitive and whitespace free comparison
                if (callerCell.formulas[0][0] === this.InitialFormula) {
                    if (this.RowsToClear > 1) {
                        callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex + 1, callerCell.columnIndex, this.RowsToClear - 1, this.ColumnsToClear).clear(Excel.ClearApplyTo.contents);
                    }

                    if (this.ColumnsToClear > 1) {
                        callerCell.worksheet.getRangeByIndexes(callerCell.rowIndex, callerCell.columnIndex + 1, this.RowsToClear, this.ColumnsToClear - 1).clear(Excel.ClearApplyTo.contents);
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