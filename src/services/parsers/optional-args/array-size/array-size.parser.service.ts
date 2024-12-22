import Container from "typedi";
import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { IOptionalArgParserService } from "src/types/parsers/parser.type";
import { OptionalArgParserService } from "../../parser.service";

export class ArraySizeOptionalArgParserService extends OptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.includes(';') && value.includes('cols=') && value.includes('rows=')) {
            const args: string[] = value.split(';');

            if (args.length !== 2) {
                throw new Error(this.getErrorMessage(value));
            }

            args.forEach(arg => {
                const sizeArgParsers = Container.getMany<IOptionalArgParserService>('service.parser.arg.size');

                let isSizeArgParseSuccess: boolean = false;
                let index: number = -1;

                let sizeArgParser: IOptionalArgParserService;

                do {
                    sizeArgParser = sizeArgParsers[++index];
                    isSizeArgParseSuccess = sizeArgParser.tryParse(arg, weatherObserver);
                } while (!isSizeArgParseSuccess && index < sizeArgParsers.length - 1);

                if (!isSizeArgParseSuccess) {
                    throw new Error(this.getErrorMessage(value));
                }
            });

            return true;
        } else {
            return false;
        }
    }
}