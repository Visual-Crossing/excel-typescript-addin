import { IFormulaCaptureJobService } from '../../types/services/jobs/formula-capture.job.service.type';
import { getCell, getSheetColumnsMax, getSheetRowsMax } from '../../helpers/helpers.excel';
import { Service } from 'typedi';
import { jobTypes } from '../../types/services/jobs/job.service.type';

@Service({ transient: true })
export class FormulaCaptureJobService<T> implements IFormulaCaptureJobService<T, CustomFunctions.Invocation> {
    public Observer: T;
    public Invocation: CustomFunctions.Invocation;

    public onFormulaCaptured: (observer: T, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => {};

    public create(): IFormulaCaptureJobService<T, CustomFunctions.Invocation> {
        return new FormulaCaptureJobService<T>();
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

    public getIsCallerAffected() : boolean {
        return false;
    }
    
    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            if (context && this.Invocation && this.Invocation.address && this.Observer && this.onFormulaCaptured) {
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

                const sheetColsCount: number = await getSheetColumnsMax(this.Invocation.address, context);
                const sheetRowsCount: number = await getSheetRowsMax(this.Invocation.address, context);

                this.onFormulaCaptured(this.Observer, callerCell.formulas[0][0], sheetColsCount, sheetRowsCount);
            }

            return true;
        }
        catch {
            return false;
        }
    }
}