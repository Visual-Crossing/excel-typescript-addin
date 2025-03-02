import { Service } from 'typedi';
import { IMacroJobService as IMacroJobService } from '../../types/services/jobs/macro.job.service.type';
import { getCell, getSheetColumnsMax as getMaxSheetCols, getSheetRowsMax as getMaxSheetRows } from '../../helpers/helpers.excel';
import { jobTypes } from '../../types/services/jobs/job.service.type';

@Service({ transient: true })
export class MacroJobService<T> implements IMacroJobService<T, CustomFunctions.Invocation> {
    public Observer: T;
    public Invocation: CustomFunctions.Invocation;

    public onCallback: (macroJobService: IMacroJobService<T, CustomFunctions.Invocation>, context: Excel.RequestContext) => {};

    public create(): IMacroJobService<T, CustomFunctions.Invocation> {
        return new MacroJobService<T>();
    }

    public getType(): jobTypes {
        return jobTypes.formulaCapture;
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

    public async getCallerCellFormula(context: Excel.RequestContext): Promise<any> {
        try {
            const callerCell: Excel.Range = await getCell(this.getAddress(), context);

            //callerCell.load();
            await callerCell.context.sync();

            if (callerCell && callerCell.formulas && callerCell.formulas.length > 0 && callerCell.formulas[0].length > 0) {
                return callerCell.formulas[0][0];
            }

            return null;
        }
        catch (error: any) {
            // Caller cell no longer exists
            return null;
        }
    }

    public async getMaxSheetRows(context: Excel.RequestContext): Promise<number> {
        const maxSheetRows: number = await getMaxSheetRows(this.getAddress(), context);
        return maxSheetRows;
    }

    public async getMaxSheetCols(context: Excel.RequestContext): Promise<number> {
        const maxSheetCols: number = await getMaxSheetCols(this.getAddress(), context);
        return maxSheetCols;
    }
    
    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            //if (context && this.Invocation && this.Invocation.address && this.Observer && this.onCallback) {
            if (context &&  this.onCallback) {
                //let callerCell: Excel.Range;
                
                // try {
                //     callerCell = getCell(this.Invocation.address, context);
                // }
                // catch {
                //     // Caller cell no longer exists
                //     return true;
                // }

                // if (!callerCell) {
                //     return true;
                // }

                // callerCell.load();
                // await context.sync();

                // const sheetColsCount: number = await getSheetColumnsMax(this.Invocation.address, context);
                // const sheetRowsCount: number = await getMaxSheetRows(this.Invocation.address, context);

                //this.onCallback(this.Observer, callerCell.formulas[0][0], sheetColsCount, sheetRowsCount);
                this.onCallback(this, context);
            }

            return true;
        }
        catch {
            return false;
        }
    }
}