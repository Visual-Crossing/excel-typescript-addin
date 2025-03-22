import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { HumidityFieldService } from '../../../../services/fields/humidity.field.service';

export class HumidityFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'humidity') {

            weatherObserver.Fields.push(new HumidityFieldService());

            return true;
        } else {
            return false;
        }
    }
}