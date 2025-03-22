import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { TemperatureMinimumFieldService } from '../../../../services/fields/temp-min.field.service';

export class TemperatureMinimumFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'tempmin') {

            weatherObserver.Fields.push(new TemperatureMinimumFieldService());

            return true;
        } else {
            return false;
        }
    }
}