import { WeatherObserver } from "src/types/observers/weather.observer.type";
import { IOptionalArgParserService } from "src/types/parsers/parser.type";
import { OptionalArgParserService } from "../../parser.service";

export class ArrayColSizeOptionalArgParserService extends OptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.startsWith('cols=')) {
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