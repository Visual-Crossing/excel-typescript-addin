import { getCell } from '../../helpers/helpers.excel';
import { IArrayDataPrinter } from '../../types/printers/printer.type';
import { ArrayDataExcludeCallerVerticalPrinterService } from '../printers/vertical.printer.service';
import { ArrayDataExcludeCallerHorizontalPrinterService } from '../printers/horizontal.printer.service';
import { IPrintJobService } from '../../types/jobs/print.job.service.type';
import { Service } from 'typedi';

@Service({ transient: true })
export class PrintJobService implements IPrintJobService {
    public CallerCellOriginalFormula: any;
    public ArrayData: any[];
    public ArrayDataPrinter: IArrayDataPrinter;
    public Invocation: CustomFunctions.Invocation;

    public getId(): string {
        if (this.Invocation && this.Invocation.address) {
            return `Print_${this.Invocation.address}`;
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
        return !(this.ArrayDataPrinter instanceof ArrayDataExcludeCallerVerticalPrinterService) && !(this.ArrayDataPrinter instanceof ArrayDataExcludeCallerHorizontalPrinterService);
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

                if (!callerCell) {
                    return true;
                }

                callerCell.load();
                await context.sync();
                
                // ToDo: Implement case insensitive and whitespace free comparison
                if (callerCell.formulas[0][0] === this.CallerCellOriginalFormula) {
                    if (this.ArrayDataPrinter.print(callerCell, this.SheetColumnCount, this.SheetRowCount, this.ArrayData)) {
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