import { WeatherObserver } from '../../types/observers/weather.observer.type';
import { IOptionalArgParserService } from '../../types/parsers/parser.type';
import { ArrayDataVerticalPrinterService } from '../printers/vertical.printer.service';
import Container, { Service } from 'typedi';
import { IDateParserService } from '../../types/parsers/date.parser.type';
import { ISettingsService } from 'src/types/settings/settings.service.type';
import { ICacheService } from 'src/types/cache/cache.service.type';
import { IWeatherObserverService } from 'src/types/observers/weather.observer.service.type';

@Service()
export class WeatherObserverService implements IWeatherObserverService {
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
        const INVALID_PARAMETERS: string = '#Invalid parameters!';

        if ((optionalArg1 && typeof optionalArg1 !== 'string') ||
            (optionalArg2 && typeof optionalArg2 !== 'string') ||
            (optionalArg3 && typeof optionalArg3 !== 'string') ||
            (optionalArg4 && typeof optionalArg4 !== 'string') ||
            (optionalArg5 && typeof optionalArg5 !== 'string')) {
            throw new Error(INVALID_PARAMETERS);
        }

        const locationString = (location as string)?.trim();

        if (!locationString || locationString.length === 0) {
            throw new Error('#Invalid Location!');
        }

        const settingsService = Container.get<ISettingsService>('service.settings');
        const cacheService = Container.get<ICacheService>('service.cache');
        const dateService = Container.get<IDateParserService>('service.parser.date');

        const dateValue: Date = dateService.parse(date);
        const unit: string = await settingsService.getUnitAsync();

        const cacheId = cacheService.generateId([ locationString, dateValue.toDateString(), unit ]);
        
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
            OptionalArg4: optionalArg4,
            OptionalArg5: optionalArg5
        };
        
        if (!weatherObserver.OptionalArg1 && 
            !weatherObserver.OptionalArg2 && 
            !weatherObserver.OptionalArg3 && 
            !weatherObserver.OptionalArg4 && 
            !weatherObserver.OptionalArg5) {
            return weatherObserver;
        }

        const optionalArgs: any[] | null[] | undefined[] = [weatherObserver.OptionalArg1, weatherObserver.OptionalArg2, weatherObserver.OptionalArg3, weatherObserver.OptionalArg4, weatherObserver.OptionalArg5];

        this.processOptionalArgs(optionalArgs, weatherObserver);

        return weatherObserver;
    }

    private processOptionalArgs(optionalArgs: any[] | null[] | undefined[], weatherObserver: WeatherObserver): void {
        optionalArgs.forEach(optionalArg => {
            if (optionalArg) {
                let isOptionalArgParseSuccess: boolean = false;

                const optionalArgString = optionalArg as string;

                if (optionalArgString && optionalArgString.length > 0) {
                    const optionalArgStringLower = optionalArgString.toLowerCase().replace(' ', '');

                    if (optionalArgStringLower && optionalArgStringLower.length > 0) {
                        const optionalArgParsers = Container.getMany<IOptionalArgParserService>('service.parser.arg');
                        
                        let index: number = -1;
                        let optionalArgParser: IOptionalArgParserService;

                        do {
                            optionalArgParser = optionalArgParsers[++index];
                            isOptionalArgParseSuccess = optionalArgParser.tryParse(optionalArgStringLower, weatherObserver);
                        } while (!isOptionalArgParseSuccess && index < optionalArgParsers.length - 1);
                    }
                }

                if (!isOptionalArgParseSuccess) {
                    throw new Error(`#Invalid parameter: '${optionalArg as string}'!`);
                }
            }
        });
    }
}