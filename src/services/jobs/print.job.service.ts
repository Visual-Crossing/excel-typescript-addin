import { Service } from 'typedi';
import { getCell } from '../../helpers/helpers.excel';
import { IArrayDataPrinter } from '../../types/printers/printer.type';
import { IPrintJobService } from '../../types/services/jobs/print.job.service.type';
import { jobTypes } from '../../types/services/jobs/job.service.type';

@Service({ transient: true })
export class PrintJobService implements IPrintJobService<CustomFunctions.Invocation> {
    public InitialFormula: any;
    public OutputArrayData: any[];
    public ArrayDataPrinter: IArrayDataPrinter;
    // public SheetColumnCount: number;
    // public SheetRowCount: number;
    public Invocation: CustomFunctions.Invocation;

    public create(): IPrintJobService<CustomFunctions.Invocation> {
        return new PrintJobService();
    }

    public getType(): jobTypes {
        return jobTypes.print;
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
            if (context && this.Invocation && this.Invocation.address && this.InitialFormula && this.OutputArrayData && this.OutputArrayData.length > 0 && this.ArrayDataPrinter) {
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
                    if (this.ArrayDataPrinter.print(callerCell, this.OutputArrayData)) {
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