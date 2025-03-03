import Container, { Service } from 'typedi';
import { ICleanUpJobService } from '../../types/services/jobs/cleanup.job.service.type';
import { getCell } from '../../helpers/helpers.excel';
import { jobTypes } from '../../types/services/jobs/job.service.type';
import { IMetadataService } from '../../types/services/jobs/metadata.service.type';

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
                let destination: Excel.Range;
                
                try {
                    destination = await getCell(this.Invocation.address, context);
                }
                catch {
                    // Caller cell no longer exists
                    return true;
                }

                if (!destination) {
                    return true;
                }

                // destination.load();
                await destination.context.sync();

                // ToDo: Consider implementing case insensitive and whitespace free comparison
                if (destination.formulas[0][0] === this.InitialFormula) {
                    const metadataService = Container.get<IMetadataService>('service.metadata');
                    const maxSheetCols: number = metadataService.MaxSheetCols;
                    const maxSheetRows: number = metadataService.MaxSheetRows;

                    if (maxSheetCols === 0 || maxSheetRows === 0) {
                        throw new Error();
                    }

                    const colsToClearAdjusted = destination.columnIndex + this.ColumnsToClear >= maxSheetCols ? maxSheetCols - destination.columnIndex : this.ColumnsToClear;
                    const rowsToClearAdjusted = destination.rowIndex + this.RowsToClear >= maxSheetRows ? maxSheetRows - destination.rowIndex : this.RowsToClear;

                    if (colsToClearAdjusted > 1 && destination.columnIndex < maxSheetCols - 1) {
                        destination.worksheet.getRangeByIndexes(destination.rowIndex, destination.columnIndex + 1, rowsToClearAdjusted, colsToClearAdjusted - 1).clear(Excel.ClearApplyTo.contents);
                    }

                    if (rowsToClearAdjusted > 1 && destination.rowIndex < maxSheetRows - 1) {
                        destination.worksheet.getRangeByIndexes(destination.rowIndex + 1, destination.columnIndex, rowsToClearAdjusted - 1, colsToClearAdjusted).clear(Excel.ClearApplyTo.contents);
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