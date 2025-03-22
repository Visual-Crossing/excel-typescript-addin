import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { DewFieldService } from '../../../../services/fields/dew.field.service';

export class DewFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'dew') {

            weatherObserver.Fields.push(new DewFieldService());

            return true;
        } else {
            return false;
        }
    }
}