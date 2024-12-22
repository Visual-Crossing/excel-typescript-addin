import 'reflect-metadata';
import { WeatherObserver } from '../../types/observers/weather.observer.type';
import { IOptionalArgParser } from '../../types/parameters/parser.type';
import { ArrayDataVerticalPrinterService } from '../printers/vertical.printer.service';
import Container, { Inject, Service } from 'typedi';
import { IDateParserService } from '../../types/dates/date.parser.type';
import { ISettingsService } from 'src/types/settings/settings.service.type';
import { ICacheService } from 'src/types/cache/cache.service.type';

@Service()
export class WeatherObserverService {
    // @Inject()
    private readonly SettingsService: ISettingsService;

    // @Inject()
    private readonly CacheService: ICacheService;

    // @Inject()
    private readonly DateService: IDateParserService;

    public constructor() {
        this.SettingsService = Container.get<ISettingsService>('service.settings');
        this.CacheService = Container.get<ICacheService>('service.cache');
        this.DateService = Container.get<IDateParserService>('service.parser.date');
    }

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

        const locationString = location as string;

        if (!locationString || locationString.length === 0) {
            throw new Error('#Invalid Location!');
        }

        const dateValue: Date = this.DateService.parseDate(date);
        const unit: string = await this.SettingsService.getUnitAsync();

        const cacheId = this.CacheService.generateId([ locationString, dateValue.toDateString(), unit ]);
        
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

        // const INVALID_PARAMETER_NAME: string = '#Invalid parameter name:';

        const optionalArgs: any[] | null[] | undefined[] = [weatherObserver.OptionalArg1, weatherObserver.OptionalArg2, weatherObserver.OptionalArg3, weatherObserver.OptionalArg4, weatherObserver.OptionalArg5];

        optionalArgs.forEach(optionalArg => {
            if (optionalArg) {
                let isOptionalArgParseSuccess: boolean = false;

                const optionalArgString = optionalArg as string;

                if (optionalArgString && optionalArgString.length > 0) {
                    const optionalArgStringLower = optionalArgString.toLowerCase().replace(' ', '');

                    if (optionalArgStringLower && optionalArgStringLower.length > 0) {
                        const optionalArgParsers = Container.getMany<IOptionalArgParser>('service.parser.arg');
                        
                        let index: number = -1;
                        let optionalArgParser: IOptionalArgParser;

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

        // const argsArray: string[] = weatherObserver.OptionalArg1.split(';');

        // if (argsArray && argsArray.length > 0) {
        //     argsArray.forEach(element => {
        //         if (!element) {
        //             return;
        //         }

        //         const arg: string[] = element.split('=');

        //         if (!arg || arg.length !== 2 || !arg[0] || !arg[1]) {
        //             throw new Error(INVALID_PARAMETERS);
        //         }

        //         const argName = arg[0].trim().toLowerCase();
        //         const argValue = arg[1].trim().toLowerCase();

        //         const parameterProcessor: IOptionalArgParser = Container.get(argName);

        //         if (!parameterProcessor) {
        //             throw new Error(`${INVALID_PARAMETER_NAME} '${arg[0]}'.`);
        //         }

        //         parameterProcessor.process(argValue, weatherObserver);
        //     });
        // }
        // else {
        //     throw new Error(INVALID_PARAMETERS);
        // }

        return weatherObserver;
    }
}