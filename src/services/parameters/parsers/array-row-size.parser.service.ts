import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { IOptionalArgParser } from "src/types/parameters/parser.type";

export class ArrayRowSizeOptionalArgParserService implements IOptionalArgParser {
    private getErrorMessage(value: string): string {
        return `#Invalid parameter: '${value}'!`;
    }

    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.includes('rows=')) {
            const args: string[] = value.split('=');

            if (args.length !== 2) {
                throw new Error(this.getErrorMessage(value));
            }

            try {
                weatherObserver.Rows = parseInt(args[1], 10);
            }
            catch {
                throw new Error(this.getErrorMessage(value));
            }

            return true;
        } else {
            return false;
        }
    }
}