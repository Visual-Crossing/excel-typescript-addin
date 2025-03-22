import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { TemperatureMaximumFieldService } from '../../../../services/fields/temp-max.field.service';

export class TemperatureMaximumFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'tempmax') {

            weatherObserver.Fields.push(new TemperatureMaximumFieldService());

            return true;
        } else {
            return false;
        }
    }
}