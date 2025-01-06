import { WeatherObserver } from "../../../../types/observers/weather.observer.type";
import { IOptionalArgParserService } from "../../../../types/parsers/parser.service.type";
import { OptionalArgParserService } from "../../parser.service";

export class ArrayRowSizeOptionalArgParserService extends OptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.startsWith('rows=')) {
            const args: string[] = value.split('=');

            if (args.length !== 2) {
                throw new Error(this.getErrorMessage(value));
            }

            try {
                weatherObserver.RowsIn = parseInt(args[1], 10);
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