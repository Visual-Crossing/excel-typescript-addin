import { Service } from 'typedi';
import { getCell } from '../../helpers/helpers.excel';
import { IPrintJobService } from '../../types/services/jobs/print.job.service.type';
import { JobTypes } from '../../types/services/jobs/job.service.type';
import { IWeatherResultService } from '../../types/services/weather.result.service.type';

@Service({ transient: true })
export class PrintJobService implements IPrintJobService<IWeatherResultService, CustomFunctions.Invocation> {
    public Result: IWeatherResultService;

    public create(): IPrintJobService<IWeatherResultService, CustomFunctions.Invocation> {
        return new PrintJobService();
    }

    public getType(): JobTypes {
        return JobTypes.print;
    }

    public getId(): CustomFunctions.Invocation {
        if (this.Result && this.Result.Observer && this.Result.Observer.Invocation && this.Result.Observer.Invocation.address) {
            return this.Result.Observer.Invocation;
        } else {
            throw new Error();
        }
    }

    public getAddress(): string {
        if (this.Result && this.Result.Observer && this.Result.Observer.Invocation && this.Result.Observer.Invocation.address) {
            return this.Result.Observer.Invocation.address;
        } else {
            throw new Error();
        }
    }
    
    public async run(context: Excel.RequestContext): Promise<boolean> {
        try {
            if (context && this.Result && this.Result.Observer && this.Result.Observer.Invocation && this.Result.Observer.Invocation.address && this.Result.Observer.InitialFormula && this.Result.Observer.ArrayDataPrinter) {
                let destination: Excel.Range;
                
                try {
                    destination = await getCell(this.Result.Observer.Invocation.address, context);
                }
                catch {
                    // Caller cell no longer exists etc.
                    return true;
                }

                if (!destination || !destination.context) {
                    return true;
                }

                await destination.context.sync();
                
                if (destination.formulas[0][0] === this.Result.Observer.InitialFormula) {
                    if (this.Result.Observer.ArrayDataPrinter.print(this.Result, destination)) {
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