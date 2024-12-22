import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { IOptionalArgParser } from "src/types/parameters/parser.type";

export class ArrayColSizeOptionalArgParserService implements IOptionalArgParser {
    private getErrorMessage(value: string): string {
        return `#Invalid parameter: '${value}'!`;
    }

    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.includes('cols=')) {
            const args: string[] = value.split('=');

            if (args.length !== 2) {
                throw new Error(this.getErrorMessage(value));
            }

            try {
                weatherObserver.Columns = parseInt(args[1], 10);
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