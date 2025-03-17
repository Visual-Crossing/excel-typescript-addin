import { Service } from 'typedi';
import { IMacroJobService } from '../../types/services/jobs/macro.job.service.type';
import { getCell, getSheetColumnsMax, getSheetRowsMax } from '../../helpers/helpers.excel';
import { JobTypes } from '../../types/services/jobs/job.service.type';
import { WeatherObserver } from '../../types/weather.observer.type';

@Service({ transient: true })
export class MacroJobService implements IMacroJobService<WeatherObserver, CustomFunctions.Invocation> {
    public Observer: WeatherObserver;

    public onCallback: (macroJobService: IMacroJobService<WeatherObserver, CustomFunctions.Invocation>, context: Excel.RequestContext) => {};

    public create(): IMacroJobService<WeatherObserver, CustomFunctions.Invocation> {
        return new MacroJobService();
    }

    public getType(): JobTypes {
        return JobTypes.macro;
    }

    public getId(): CustomFunctions.Invocation {
        if (this.Observer && this.Observer.Invocation && this.Observer.Invocation.address) {
            return this.Observer.Invocation;
        } else {
            throw new Error();
        }
    }

    public getAddress(): string {
        if (this.Observer && this.Observer.Invocation && this.Observer.Invocation.address) {
            return this.Observer.Invocation.address;
        } else {
            throw new Error();
        }
    }

    public async getCallerCellFormula(context: Excel.RequestContext): Promise<any> {
        try {
            const destination: Excel.Range = await getCell(this.getAddress(), context);

            if (!destination || !destination.context) {
                return null;
            }

            await destination.context.sync();

            if (destination.formulas && destination.formulas.length > 0 && destination.formulas[0].length > 0) {
                return destination.formulas[0][0];
            }

            return null;
        }
        catch (error: any) {
            // Caller cell no longer exists etc.
            return null;
        }
    }

    public async getMaxSheetRows(context: Excel.RequestContext): Promise<number> {
        const maxSheetRows: number = await getSheetRowsMax(this.getAddress(), context);
        return maxSheetRows;
    }

    public async getMaxSheetCols(context: Excel.RequestContext): Promise<number> {
        const maxSheetCols: number = await getSheetColumnsMax(this.getAddress(), context);
        return maxSheetCols;
    }
    
    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            if (context && this.onCallback) {
                this.onCallback(this, context);
            }

            return true;
        }
        catch {
            return false;
        }
    }
}