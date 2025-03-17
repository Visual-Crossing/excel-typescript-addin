import { Service } from 'typedi';
import { ICleanUpJobService } from '../../types/services/jobs/cleanup.job.service.type';
import { getCell } from '../../helpers/helpers.excel';
import { JobTypes } from '../../types/services/jobs/job.service.type';
import { IMetadataService } from '../../types/services/jobs/metadata.service.type';
import { WeatherObserver } from '../../types/weather.observer.type';
import { getMetadataService } from '../../helpers/helpers.services';

@Service({ transient: true })
export class CleanUpJobService implements ICleanUpJobService<WeatherObserver, CustomFunctions.Invocation> {
    public Observer: WeatherObserver;

    public create(): ICleanUpJobService<WeatherObserver, CustomFunctions.Invocation> {
        return new CleanUpJobService();
    }

    public getType(): JobTypes {
        return JobTypes.cleanUp;
    }

    public getId(): CustomFunctions.Invocation {
        if (this.Observer && this.Observer.Invocation && this.Observer.Invocation.address) {
            return this.Observer.Invocation;
        } else {
            throw new Error();
        }
    }

    public getAddress(): string {
        if (this.Observer.Invocation && this.Observer.Invocation.address) {
            return this.Observer.Invocation.address;
        } else {
            throw new Error();
        }
    }

    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            if (context && this.Observer && this.Observer.Invocation && this.Observer.Invocation.address && this.Observer.InitialFormula && (this.Observer.ArrayDataColumnsIn > 1 || this.Observer.ArrayDataRowsIn > 1)) {
                let destination: Excel.Range;
                
                try {
                    destination = await getCell(this.Observer.Invocation.address, context);
                }
                catch {
                    // Caller cell no longer exists etc.
                    return true;
                }

                if (!destination || !destination.context) {
                    return true;
                }

                await destination.context.sync();

                if (destination.formulas[0][0] === this.Observer.InitialFormula) {
                    const metadataService: IMetadataService = getMetadataService();
                    const maxSheetCols: number = metadataService.MaxSheetCols;
                    const maxSheetRows: number = metadataService.MaxSheetRows;

                    if (maxSheetCols === 0 || maxSheetRows === 0) {
                        throw new Error();
                    }

                    const colsToClearAdjusted = destination.columnIndex + this.Observer.ArrayDataColumnsIn >= maxSheetCols ? maxSheetCols - destination.columnIndex : this.Observer.ArrayDataColumnsIn;
                    const rowsToClearAdjusted = destination.rowIndex + this.Observer.ArrayDataRowsIn >= maxSheetRows ? maxSheetRows - destination.rowIndex : this.Observer.ArrayDataRowsIn;

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