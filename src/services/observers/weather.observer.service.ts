import Container, { Service } from 'typedi';
import { WeatherObserver } from '../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../types/services/parsers/optional-arg.parser.service.type';
import { ArrayDataVerticalPrinterService } from '../printers/vertical.printer.service';
import { IDateParserService } from '../../types/services/parsers/date.parser.service.type';
import { ISettingsService } from '../../types/services/settings.service.type';
import { ICacheService } from '../../types/services/cache.service.type';
import { IWeatherObserverService } from '../../types/services/weather.observer.service.type';
import { IErrorParserService } from '../../types/services/parsers/error.parser.service.type';
import { getCacheService, getDateParserService, getSettingsService } from '../../helpers/helpers.services';

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
        const INVALID_PARAMETERS: string = 'Invalid parameters!';
        let errorMsg: string | undefined = undefined;

        if ((optionalArg1 && typeof optionalArg1 !== 'string') ||
            (optionalArg2 && typeof optionalArg2 !== 'string') ||
            (optionalArg3 && typeof optionalArg3 !== 'string') ||
            (optionalArg4 && typeof optionalArg4 !== 'string') ||
            (optionalArg5 && typeof optionalArg5 !== 'string')) {
            errorMsg = INVALID_PARAMETERS;
        }

        const locationString = (location as string)?.trim();

        if (!locationString || locationString.length === 0) {
            errorMsg = 'Invalid Location!';
        }

        const settingsService: ISettingsService = getSettingsService();
        const cacheService: ICacheService = getCacheService();
        const dateParserService: IDateParserService = getDateParserService();

        let dateValue: Date | undefined = undefined;

        try {
            dateValue = dateParserService.parse(date);
        } catch (error: any) {
            const errorParserService = Container.get<IErrorParserService>('service.parser.error');
            errorMsg = errorParserService.getErrorInfo(error);
        }

        const unit: string = await settingsService.getUnitAsync();

        const cacheId = cacheService.generateId([ locationString, dateValue ? dateValue.toDateString() : date, unit ]);
        
        const weatherObserver: WeatherObserver = { 
            CacheId: cacheId,
            Location: locationString, 
            Date: dateValue ?? date, 
            Unit: unit, 
            ArrayDataColumnsIn: 1,
            ArrayDataRowsIn: 1,
            Fields: [],
            IncludeTitle: true,
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

        this.processOptionalArgs(optionalArgs, weatherObserver, errorMsg);

        if (errorMsg) {
            weatherObserver.error = errorMsg;
        }

        return weatherObserver;
    }

    private processOptionalArgs(optionalArgs: any[] | null[] | undefined[], weatherObserver: WeatherObserver, errorMsg: string | undefined): void {
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

                            try {
                                isOptionalArgParseSuccess = optionalArgParser.tryParse(optionalArgStringLower, weatherObserver);
                            } catch (error: any) {
                                const errorParserService = Container.get<IErrorParserService>('service.parser.error');
                                errorMsg = errorParserService.getErrorInfo(error);
                            }
                        } while (!isOptionalArgParseSuccess && index < optionalArgParsers.length - 1);
                    }
                }

                if (!isOptionalArgParseSuccess) {
                    errorMsg = `Invalid parameter: '${optionalArg as string}'!`;
                }
            }
        });
    }
}