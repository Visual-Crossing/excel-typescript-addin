import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { WindDirFieldService } from '../../../..//services/fields/winddir.field.service';

export class WindDirFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'winddir') {

            weatherObserver.Fields.push(new WindDirFieldService());

            return true;
        } else {
            return false;
        }
    }
}