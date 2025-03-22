import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { WindSpeedFieldService } from '../../../../services/fields/wind-speed.field.service';

export class WindSpeedFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'windspeed') {

            weatherObserver.Fields.push(new WindSpeedFieldService());

            return true;
        } else {
            return false;
        }
    }
}