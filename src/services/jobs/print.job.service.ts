import { getCell } from '../../helpers/helpers.excel';
import { IJobService } from '../../types/jobs/job.service.type';
import { IArrayDataPrinter } from '../../types/printers/printer.type';
import { ArrayDataExcludeCallerVerticalPrinterService } from '../printers/vertical.printer.service';
import { ArrayDataExcludeCallerHorizontalPrinterService } from '../printers/horizontal.printer.service';
import { Service } from 'typedi';
import { IPrintJob } from 'src/types/jobs/print.job.type';

//@Service({ transient: true })
export class PrintJobService implements IPrintJob, IJobService {
    private readonly CallerCellOriginalFormula: any;
    private readonly ArrayData: any[];
    private readonly ArrayDataPrinter: IArrayDataPrinter;
    private readonly SheetColumnCount: number;
    private readonly SheetRowCount: number;
    private readonly Invocation: CustomFunctions.Invocation;

    public constructor(callerCellOriginalFormula: any, arrayData: any[], arrayDataPrinter: IArrayDataPrinter, sheetColumnCount: number, sheetRowCount: number, invocation: CustomFunctions.Invocation) {
        this.CallerCellOriginalFormula = callerCellOriginalFormula;
        this.ArrayData = arrayData;
        this.ArrayDataPrinter = arrayDataPrinter;
        this.SheetColumnCount = sheetColumnCount;
        this.SheetRowCount = sheetRowCount;
        this.Invocation = invocation;
    }

    public getId(): string {
        return `Print_${this.Invocation.address}`;
    }

    public getAddress(): string {
        return this.Invocation.address!;
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