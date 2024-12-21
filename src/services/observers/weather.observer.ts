
import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { IParameterProcessor } from "src/types/parameters/parameter-processor.type";
import { ISettings } from "src/types/settings/settings.type";
import { ArrayDataVerticalPrinterService } from "../printers/vertical.printer.service";
import { ICache } from "src/types/cache/cache.type";
import Container, { Inject, Service } from "typedi";
import { IDateService } from "src/types/dates/date-service.type";

@Service({ global: true })
export class WeatherObserverService {
    @Inject()
    Settings: ISettings;

    @Inject()
    Cache: ICache;

    @Inject()
    DateService: IDateService;

    public async process(
        location: any, 
        date: any,
        invocation: CustomFunctions.Invocation, 
        optionalArg1?: any | null | undefined, 
        optionalArg2?: any | null | undefined,
        optionalArg3?: any | null | undefined,
        optionalArg4?: any | null | undefined,
        optionalArg5?: any | null | undefined
    ): Promise<WeatherObserver> {
        const INVALID_PARAMETERS: string = 'Invalid parameters.';

        if ((optionalArg1 && typeof optionalArg1 !== 'string') ||
            (optionalArg2 && typeof optionalArg2 !== 'string') ||
            (optionalArg3 && typeof optionalArg3 !== 'string') ||
            (optionalArg4 && typeof optionalArg4 !== 'string') ||
            (optionalArg5 && typeof optionalArg5 !== 'string')) {
            throw new Error(INVALID_PARAMETERS);
        }

        const locationString = location as string;
        const dateValue: Date = this.DateService.toDate(date);
        const unit: string = await this.Settings.getUnitAsync();

        const cacheId = this.Cache.generateId([ locationString, dateValue.toDateString(), unit ]);
        
        const weatherObserver: WeatherObserver = { 
            CacheId: cacheId,
            Location: locationString, 
            Date: dateValue, 
            Unit: unit, 
            Columns: 1,
            Rows: 1,
            Printer: new ArrayDataVerticalPrinterService(),
            Invocation: invocation,
            OptionalArg1: optionalArg1, 
            OptionalArg2: optionalArg2, 
            OptionalArg3: optionalArg3, 
            OptionalArg4: optionalArg4
        };
        
        if (!weatherObserver.OptionalArg1 && !weatherObserver.OptionalArg2 && !weatherObserver.OptionalArg3 && !weatherObserver.OptionalArg4) {
            return weatherObserver;
        }

        const INVALID_PARAMETER_NAME: string = "Invalid parameter name";
        const argsArray: string[] = weatherObserver.OptionalArg1.split(";");

        if (argsArray && argsArray.length > 0) {
            argsArray.forEach(element => {
                if (!element) {
                    return;
                }

                const arg: string[] = element.split("=");

                if (!arg || arg.length !== 2 || !arg[0] || !arg[1]) {
                    throw new Error(INVALID_PARAMETERS);
                }

                const argName = arg[0].trim().toLowerCase();
                const argValue = arg[1].trim().toLowerCase();

                const parameterProcessor: IParameterProcessor = Container.get(argName);

                if (!parameterProcessor) {
                    throw new Error(`${INVALID_PARAMETER_NAME} '${arg[0]}'.`);
                }

                parameterProcessor.process(argValue, weatherObserver);
            });
        }
        else {
            throw new Error(INVALID_PARAMETERS);
        }

        return weatherObserver;
    }
}