import Container from 'typedi';
import { IOptionalArgParserService } from '../../types/services/parsers/optional-arg.parser.service.type';
import { WeatherObserver } from '../../types/weather.observer.type';
import { NA_ERROR } from '../../shared/constants';

export abstract class OptionalArgParserService {
    public getErrorMessage(value: string): string {
        return `${NA_ERROR} - Invalid parameter: '${value}'!`;
    }

    public isValidMultiArg(value: string, weatherObserver: WeatherObserver, multiServiceName: string, expectedLength: number = -1, separator: string = ';'): boolean {
        const args: string[] = value.split(separator);

        if ((expectedLength !== -1 && args.length !== expectedLength) || (expectedLength === -1 && args.length < 1)) {
            throw new Error(this.getErrorMessage(value));
        }

        args.forEach(arg => {
            if (arg && arg.length > 0) {
                const argParsers = Container.getMany<IOptionalArgParserService>(multiServiceName);

                let isArgParseSuccess: boolean = false;
                let index: number = -1;

                let argParser: IOptionalArgParserService;

                do {
                    argParser = argParsers[++index];
                    isArgParseSuccess = argParser.tryParse(arg, weatherObserver);
                } while (!isArgParseSuccess && index < argParsers.length - 1);

                if (!isArgParseSuccess) {
                    throw new Error(this.getErrorMessage(value));
                }
            }
        });

        return true;
    }
}