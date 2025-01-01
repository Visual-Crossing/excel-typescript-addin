import { IFormulaCaptureJobService } from '../../types/jobs/formula-capture.job.service.type';
import { getCell, getSheetColumnCount, getSheetRowCount } from '../../helpers/helpers.excel';
import { Service } from 'typedi';

@Service({ transient: true })
export class FormulaCaptureJobService<T> implements IFormulaCaptureJobService<T> {
    public Observer: T;
    public Invocation: CustomFunctions.Invocation;

    public OnFormulaCaptured: (observer: T, callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => {};

    public getId(): string {
        if (this.Invocation && this.Invocation.address) {
            return `Formula_${this.Invocation.address}`;
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
            if (context && this.Invocation && this.Invocation.address && this.Observer && this.OnFormulaCaptured) {
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

                const sheetColsCount: number = await getSheetColumnCount(this.Invocation.address, context);
                const sheetRowsCount: number = await getSheetRowCount(this.Invocation.address, context);

                this.OnFormulaCaptured(this.Observer, callerCell.formulas[0][0], sheetColsCount, sheetRowsCount);
            }

            return true;
        }
        catch {
            return false;
        }
    }
}