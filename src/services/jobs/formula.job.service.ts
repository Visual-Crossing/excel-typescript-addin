import { getCell, getSheetColumnCount, getSheetRowCount } from "src/helpers/helpers.excel";
import { IJob } from "src/types/jobs/job.type";

export class FormulaJobService implements IJob {
    private Callback: (callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => {};
    private Invocation: CustomFunctions.Invocation;

    public constructor(callback: (callerCellFormula: any, sheetColsCount: number, sheetRowsCount: number) => {}, invocation: CustomFunctions.Invocation) {
        this.Callback = callback;
        this.Invocation = invocation;
    }

    public getId(): string {
        return `Formula_${this.Invocation.address}`;
    }

    public getAddress(): string {
        return this.Invocation.address!;
    }

    public getIsCallerAffected() : boolean {
        return false;
    }
    
    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            if (context && this.Invocation && this.Invocation.address && this.Callback) {
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

                const sheetColumnCount: number = await getSheetColumnCount(this.Invocation.address, context);
                const sheetRowCount: number = await getSheetRowCount(this.Invocation.address, context);

                this.Callback(callerCell.formulas[0][0], sheetColumnCount, sheetRowCount);
            }

            return true;
        }
        catch (error: any) {
            return false;
        }
    }
}