import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { TemperatureFieldService } from '../../../../services/fields/temp.field.service';

export class TemperatureFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'temp') {

            weatherObserver.Fields.push(new TemperatureFieldService());

            return true;
        } else {
            return false;
        }
    }
}