import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { OptionalArgParserService } from '../../parser.service';

export class FieldsOptionalArgParserService extends OptionalArgParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        const argPrefix: string = 'fields=';

        if (value && value.startsWith(argPrefix)) {
            const valueWithoutPrefix = value.replace(argPrefix, '');
            return this.isValidMultiArg(valueWithoutPrefix, weatherObserver, 'service.parser.arg.field');
        } else {
            return false;
        }
    }
}