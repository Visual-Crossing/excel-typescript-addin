import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { IOptionalArgParser } from "src/types/parameters/parser.type";
import Container from "typedi";

export class ArraySizeOptionalArgParserService implements IOptionalArgParser {
    private getErrorMessage(value: string): string {
        return `#Invalid parameter: '${value}'!`;
    }

    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.includes(';') && value.includes('cols=') && value.includes('rows=')) {
            const args: string[] = value.split(';');

            if (args.length !== 2) {
                throw new Error(this.getErrorMessage(value));
            }

            args.forEach(arg => {
                const sizeArgParsers = Container.getMany<IOptionalArgParser>('service.parser.arg.size');

                let isSizeArgParseSuccess: boolean = false;
                let index: number = -1;

                let sizeArgParser: IOptionalArgParser;

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