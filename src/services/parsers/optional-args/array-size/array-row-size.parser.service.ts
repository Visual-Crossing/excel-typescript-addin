import { WeatherObserver } from "../../../../types/weather.observer.type";
import { IOptionalArgParserService } from "../../../../types/services/parsers/optional-arg.parser.service.type";
import { OptionalArgParserService } from "../../parser.service";

export class ArrayRowSizeOptionalArgParserService extends OptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value.startsWith('rows=')) {
            const args: string[] = value.split('=');

            if (args.length !== 2) {
                throw new Error(this.getErrorMessage(value));
            }

            try {
                weatherObserver.ArrayDataRowsIn = parseInt(args[1], 10);
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