import { WeatherObserver } from '../../../../types/weather.observer.type';
import { IOptionalArgParserService } from '../../../../types/services/parsers/optional-arg.parser.service.type';
import { PressureFieldService } from '../../../../services/fields/pressure.field.service';

export class PressureFieldParserService implements IOptionalArgParserService {
    public tryParse(value: string, weatherObserver: WeatherObserver): boolean {
        if (value && value === 'pressure') {

            weatherObserver.Fields.push(new PressureFieldService());

            return true;
        } else {
            return false;
        }
    }
}